// Browser-local ratings and blind-pair picks. Everything is keyed to source hashes.
// Pure logic: storage is injected, no DOM access.
import { normHash } from './data.js';

export const FORMAT = 'oneshot-visuals-ratings';
export const VERSION = 1;
export const STORAGE_KEY = 'oneshot-visuals:ratings:v1';
export const NOTE_MAX = 280;
export const IMPORT_MAX_BYTES = 1_000_000;
const MAX_ENTRIES = 5000;

export const ratingKey = (runId, hash) => `${runId}@${hash}`;

function parseTime(v) {
  const t = typeof v === 'string' ? Date.parse(v) : NaN;
  if (!Number.isFinite(t)) return null;
  const y = new Date(t).getUTCFullYear();
  return y >= 2020 && y <= 2100 ? new Date(t).toISOString() : null;
}

const cleanNote = (v) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, NOTE_MAX) : '');
const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);

// Canonical order (a.runId < b.runId) so the same pair always yields the same key.
export function canonPick({ promptId, a, b, winner, at }) {
  if (a.runId > b.runId) {
    return { promptId, a: b, b: a, winner: winner === 'a' ? 'b' : winner === 'b' ? 'a' : 'tie', at };
  }
  return { promptId, a, b, winner, at };
}
export const pickKey = (p) => `${ratingKey(p.a.runId, p.a.sourceHash)}|${ratingKey(p.b.runId, p.b.sourceHash)}`;

function putNewer(map, key, entry) {
  const prev = map.get(key);
  if (prev && prev.at > entry.at) return true; // duplicate, keep the newer one
  map.set(key, entry);
  return Boolean(prev);
}

// Validate a ratings document. runsById (Map id -> run) may be null for structural-only checks.
export function validateDocument(doc, runsById) {
  if (!isObj(doc)) return { fatal: 'The file is not a ratings object.' };
  if (doc.format !== FORMAT) return { fatal: `Unrecognised format (expected "${FORMAT}").` };
  if (doc.version !== VERSION) return { fatal: `Unsupported version (expected ${VERSION}).` };
  const rs = doc.ratings === undefined ? [] : doc.ratings;
  const ps = doc.picks === undefined ? [] : doc.picks;
  if (!Array.isArray(rs) || !Array.isArray(ps)) return { fatal: '"ratings" and "picks" must be arrays.' };
  if (rs.length + ps.length > MAX_ENTRIES) return { fatal: `Too many entries (limit ${MAX_ENTRIES}).` };

  const ratings = new Map();
  const picks = new Map();
  const issues = [];
  let duplicates = 0;

  rs.forEach((r, i) => {
    const at = `ratings[${i}]`;
    if (!isObj(r) || typeof r.runId !== 'string') return issues.push(`${at}: missing runId`);
    const run = runsById ? runsById.get(r.runId) : null;
    if (runsById && !run) return issues.push(`${at}: unknown run "${r.runId.slice(0, 40)}"`);
    if (run && r.promptId !== undefined && r.promptId !== run.promptId) return issues.push(`${at}: prompt does not match run`);
    const hash = normHash(r.sourceHash);
    if (!hash) return issues.push(`${at}: sourceHash must be 64 hex characters`);
    if (!Number.isInteger(r.score) || r.score < 1 || r.score > 5) return issues.push(`${at}: score must be an integer 1–5`);
    const time = parseTime(r.updatedAt);
    if (!time) return issues.push(`${at}: updatedAt is not a valid date`);
    const entry = { runId: r.runId, sourceHash: hash, score: r.score, note: cleanNote(r.note), at: time };
    if (putNewer(ratings, ratingKey(entry.runId, hash), entry)) duplicates++;
  });

  ps.forEach((p, i) => {
    const at = `picks[${i}]`;
    if (!isObj(p) || !isObj(p.a) || !isObj(p.b)) return issues.push(`${at}: malformed pick`);
    if (typeof p.a.runId !== 'string' || typeof p.b.runId !== 'string' || p.a.runId === p.b.runId) return issues.push(`${at}: needs two different runs`);
    const ha = normHash(p.a.sourceHash);
    const hb = normHash(p.b.sourceHash);
    if (!ha || !hb) return issues.push(`${at}: sourceHash must be 64 hex characters`);
    if (!['a', 'b', 'tie'].includes(p.winner)) return issues.push(`${at}: winner must be "a", "b" or "tie"`);
    const time = parseTime(p.at);
    if (!time) return issues.push(`${at}: "at" is not a valid date`);
    let promptId = typeof p.promptId === 'string' ? p.promptId : null;
    if (runsById) {
      const ra = runsById.get(p.a.runId);
      const rb = runsById.get(p.b.runId);
      if (!ra || !rb) return issues.push(`${at}: unknown run`);
      if (ra.promptId !== rb.promptId) return issues.push(`${at}: runs belong to different prompts`);
      if (promptId !== null && promptId !== ra.promptId) return issues.push(`${at}: prompt does not match runs`);
      promptId = ra.promptId;
    }
    if (!promptId) return issues.push(`${at}: missing promptId`);
    const entry = canonPick({ promptId, a: { runId: p.a.runId, sourceHash: ha }, b: { runId: p.b.runId, sourceHash: hb }, winner: p.winner, at: time });
    if (putNewer(picks, pickKey(entry), entry)) duplicates++;
  });

  return { fatal: null, ratings, picks, issues, duplicates };
}

export function parseImport(text, runsById) {
  if (typeof text !== 'string' || text.length > IMPORT_MAX_BYTES) {
    return { fatal: `File is larger than ${Math.round(IMPORT_MAX_BYTES / 1000)} KB.` };
  }
  let doc;
  try {
    doc = JSON.parse(text);
  } catch {
    return { fatal: 'The file is not valid JSON.' };
  }
  return validateDocument(doc, runsById);
}

export function createStore(storage) {
  let ratings = new Map();
  let picks = new Map();
  let persistent = true;
  const subs = new Set();

  function load() {
    ratings = new Map();
    picks = new Map();
    try {
      const raw = storage ? storage.getItem(STORAGE_KEY) : null;
      if (storage == null) persistent = false;
      if (raw) {
        const v = validateDocument(JSON.parse(raw), null);
        if (!v.fatal) {
          ratings = v.ratings;
          picks = v.picks;
        }
      }
    } catch {
      persistent = false;
    }
  }

  function serialise() {
    return {
      format: FORMAT,
      version: VERSION,
      ratings: [...ratings.values()].map((r) => ({ runId: r.runId, sourceHash: r.sourceHash, score: r.score, note: r.note, updatedAt: r.at })),
      picks: [...picks.values()].map((p) => ({ promptId: p.promptId, a: p.a, b: p.b, winner: p.winner, at: p.at }))
    };
  }

  function commit() {
    try {
      if (!storage) throw new Error('no storage');
      storage.setItem(STORAGE_KEY, JSON.stringify(serialise()));
    } catch {
      persistent = false;
    }
    subs.forEach((fn) => fn());
  }

  load();

  return {
    get persistent() {
      return persistent;
    },
    reload() {
      load();
      subs.forEach((fn) => fn());
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    // Active rating = same run AND same source hash as the current catalog entry.
    getRating(run) {
      return run && run.sourceHash ? ratings.get(ratingKey(run.id, run.sourceHash)) || null : null;
    },
    hasStaleRating(run) {
      if (!run) return false;
      for (const r of ratings.values()) if (r.runId === run.id && r.sourceHash !== run.sourceHash) return true;
      return false;
    },
    setRating(run, score, note) {
      if (!run || !run.sourceHash) return false;
      const key = ratingKey(run.id, run.sourceHash);
      if (score == null) {
        ratings.delete(key);
      } else if (Number.isInteger(score) && score >= 1 && score <= 5) {
        const prev = ratings.get(key);
        ratings.set(key, {
          runId: run.id,
          sourceHash: run.sourceHash,
          score,
          note: note === undefined ? (prev ? prev.note : '') : cleanNote(note),
          at: new Date().toISOString()
        });
      } else {
        return false;
      }
      commit();
      return true;
    },
    setNote(run, note) {
      const prev = this.getRating(run);
      if (!prev) return false;
      return this.setRating(run, prev.score, note);
    },
    addPick(promptId, runA, runB, winnerRunId) {
      if (!runA.sourceHash || !runB.sourceHash || runA.id === runB.id) return false;
      const winner = winnerRunId == null ? 'tie' : winnerRunId === runA.id ? 'a' : winnerRunId === runB.id ? 'b' : null;
      if (!winner) return false;
      const entry = canonPick({
        promptId,
        a: { runId: runA.id, sourceHash: runA.sourceHash },
        b: { runId: runB.id, sourceHash: runB.sourceHash },
        winner,
        at: new Date().toISOString()
      });
      picks.set(pickKey(entry), entry);
      commit();
      return true;
    },
    allRatings: () => [...ratings.values()],
    allPicks: () => [...picks.values()],
    isActivePick(p, runsById) {
      const a = runsById.get(p.a.runId);
      const b = runsById.get(p.b.runId);
      return Boolean(a && b && a.sourceHash === p.a.sourceHash && b.sourceHash === p.b.sourceHash);
    },
    pickTallies(runsById) {
      const t = new Map();
      const bump = (id, k) => {
        const e = t.get(id) || { w: 0, l: 0, t: 0 };
        e[k]++;
        t.set(id, e);
      };
      for (const p of picks.values()) {
        if (!this.isActivePick(p, runsById)) continue;
        if (p.winner === 'tie') {
          bump(p.a.runId, 't');
          bump(p.b.runId, 't');
        } else {
          bump(p[p.winner].runId, 'w');
          bump(p[p.winner === 'a' ? 'b' : 'a'].runId, 'l');
        }
      }
      return t;
    },
    exportDocument(runsById) {
      const doc = serialise();
      doc.exportedAt = new Date().toISOString();
      doc.ratings = doc.ratings.map((r) => {
        const run = runsById.get(r.runId);
        return run ? { ...r, promptId: run.promptId, modelId: run.modelId } : r;
      });
      return doc;
    },
    applyImport(valid, mode) {
      if (mode === 'replace') {
        ratings = new Map();
        picks = new Map();
      }
      for (const [k, v] of valid.ratings) putNewer(ratings, k, v);
      for (const [k, v] of valid.picks) putNewer(picks, k, v);
      commit();
    },
    clearAll() {
      ratings = new Map();
      picks = new Map();
      commit();
    }
  };
}

// ---- blind pair selection (pure) ----
export function isReviewable(run) {
  return Boolean(run && run.sourceHash && (run.poster || run.clip || run.source));
}

// Returns { promptId, left, right, repeat, remaining, total } or null.
export function nextPair({ runs, promptIds, store, runsById, rng = Math.random, avoidKey = null }) {
  const byPrompt = new Map();
  for (const r of runs) {
    if (!isReviewable(r) || (promptIds && !promptIds.includes(r.promptId))) continue;
    if (!byPrompt.has(r.promptId)) byPrompt.set(r.promptId, []);
    byPrompt.get(r.promptId).push(r);
  }
  const judged = new Set();
  for (const p of store.allPicks()) if (store.isActivePick(p, runsById)) judged.add(pickKey(p));

  const all = [];
  for (const [promptId, list] of byPrompt) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const [a, b] = list[i].id < list[j].id ? [list[i], list[j]] : [list[j], list[i]];
        const key = pickKey({ a: { runId: a.id, sourceHash: a.sourceHash }, b: { runId: b.id, sourceHash: b.sourceHash } });
        all.push({ promptId, a, b, key, done: judged.has(key) });
      }
    }
  }
  if (!all.length) return null;
  const fresh = all.filter((p) => !p.done);
  let pool = fresh.length ? fresh : all;
  if (avoidKey && pool.length > 1) pool = pool.filter((p) => p.key !== avoidKey);
  const pick = pool[Math.floor(rng() * pool.length)];
  const flip = rng() < 0.5;
  return {
    promptId: pick.promptId,
    key: pick.key,
    left: flip ? pick.b : pick.a,
    right: flip ? pick.a : pick.b,
    repeat: !fresh.length,
    remaining: fresh.length,
    total: all.length
  };
}
