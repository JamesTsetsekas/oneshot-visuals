// Catalog loading, validation/normalisation, and bounded text fetching.
import { safeRelPath, sha256Hex } from './sandbox.js';

const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const HASH_RE = /^[0-9a-f]{64}$/;

export function normHash(x) {
  if (typeof x !== 'string') return null;
  const s = x.trim().toLowerCase().replace(/^sha-?256[:=]/, '');
  return HASH_RE.test(s) ? s : null;
}

const str = (x, max = 4000) => (typeof x === 'string' ? x.slice(0, max) : '');
const arr = (x) => (Array.isArray(x) ? x : []);
const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);

export function normalizeCatalog(raw) {
  if (!isObj(raw)) throw new Error('catalog.json is not an object');
  const warnings = [];

  const models = [];
  const modelIds = new Set();
  for (const m of arr(raw.models)) {
    if (!isObj(m) || !ID_RE.test(m.id || '')) {
      warnings.push('Skipped a model with a missing or invalid id.');
      continue;
    }
    if (modelIds.has(m.id)) {
      warnings.push(`Duplicate model ${m.id} ignored.`);
      continue;
    }
    modelIds.add(m.id);
    models.push({
      id: m.id,
      label: str(m.label, 80) || m.id,
      provider: str(m.provider, 40),
      model: str(m.model, 80),
      effort: str(m.effort, 20)
    });
  }

  const prompts = [];
  const promptIds = new Set();
  for (const p of arr(raw.prompts)) {
    if (!isObj(p) || !ID_RE.test(p.id || '')) {
      warnings.push('Skipped a prompt with a missing or invalid id.');
      continue;
    }
    if (promptIds.has(p.id)) {
      warnings.push(`Duplicate prompt ${p.id} ignored.`);
      continue;
    }
    promptIds.add(p.id);
    prompts.push({
      id: p.id,
      title: str(p.title, 120) || p.id,
      kind: str(p.kind, 24) || 'unknown',
      duration: Number.isFinite(p.duration) && p.duration > 0 ? p.duration : null,
      path: safeRelPath(p.path),
      text: typeof p.text === 'string' ? p.text.slice(0, 40000) : null,
      sha256: normHash(p.sha256)
    });
  }

  const runs = [];
  const byId = new Map();
  const byKey = new Map();
  for (const r of arr(raw.runs)) {
    if (!isObj(r) || !promptIds.has(r.promptId) || !modelIds.has(r.modelId)) {
      warnings.push('Skipped a run that references an unknown prompt or model.');
      continue;
    }
    const id = ID_RE.test(r.id || '') ? r.id : `${r.promptId}-${r.modelId}`;
    const key = `${r.promptId}|${r.modelId}`;
    if (byId.has(id) || byKey.has(key)) {
      warnings.push(`Duplicate run ${id} ignored.`);
      continue;
    }
    const rawNotes = str(r.notes, 4000);
    const notesPath = /^[^\r\n]{1,300}\.(txt|md)$/i.test(rawNotes) ? safeRelPath(rawNotes) : null;
    const rawValidation = typeof r.validation === 'string' ? r.validation.slice(0, 4000) : '';
    const validationPath = /^[^\r\n]{1,300}\.json$/i.test(rawValidation) ? safeRelPath(rawValidation) : null;
    const run = {
      id,
      promptId: r.promptId,
      modelId: r.modelId,
      status: str(r.status, 40).toLowerCase() || 'pending',
      sourceHash: normHash(r.sourceHash),
      poster: safeRelPath(r.poster),
      clip: safeRelPath(r.clip),
      source: safeRelPath(r.source),
      captureStatus: str(r.captureStatus, 40).toLowerCase(),
      // notes / validation may be inline values or paths to published text/JSON files.
      notes: notesPath ? '' : rawNotes,
      notesPath,
      validation: validationPath ? null : isObj(r.validation) || Array.isArray(r.validation) ? r.validation : rawValidation || null,
      validationPath,
      elapsedSeconds: Number.isFinite(r.elapsedSeconds) && r.elapsedSeconds >= 0 ? r.elapsedSeconds : null,
      score: typeof r.score === 'number' && Number.isFinite(r.score) ? r.score : null,
      requestedModel: str(r.requestedModel, 80),
      effort: str(r.effort, 20)
    };
    runs.push(run);
    byId.set(id, run);
    byKey.set(key, run);
  }

  return { models, prompts, runs, byId, byKey, warnings };
}

export async function loadCatalog(url = './data/catalog.json') {
  const res = await fetch(url, { cache: 'no-cache', credentials: 'omit' });
  if (!res.ok) throw new Error(`Could not load ${url} (HTTP ${res.status})`);
  let raw;
  try {
    raw = await res.json();
  } catch {
    throw new Error(`${url} is not valid JSON`);
  }
  return normalizeCatalog(raw);
}

const OK = new Set(['captured', 'complete', 'completed', 'ok', 'passed', 'pass', 'valid', 'success', 'succeeded']);
const WAIT = new Set(['pending', 'queued', 'running', 'scheduled']);
const STALE = 'stale';
const BAD = new Set(['failed', 'fail', 'error', 'timeout', 'timed-out', 'timed_out', 'invalid', 'crashed', 'incomplete', 'blank', 'rejected']);

export function statusInfo(status) {
  const s = String(status || 'pending').toLowerCase();
  const label = s.replace(/[-_]+/g, ' ').replace(/^./, (c) => c.toUpperCase());
  const tone = OK.has(s) ? 'ok' : BAD.has(s) ? 'bad' : WAIT.has(s) ? 'wait' : 'neutral';
  return { label, tone };
}

// One coarse bucket per run for counts: captured | failed | stale | pending | other.
export function classify(run) {
  const st = statusInfo(run.status).tone;
  const cap = run.captureStatus ? statusInfo(run.captureStatus).tone : null;
  if (run.captureStatus === STALE) return 'stale';
  if (st === 'bad' || cap === 'bad') return 'failed';
  if (cap === 'ok' || (!cap && st === 'ok')) return 'captured';
  if (st === 'wait' || (st === 'neutral' && !cap)) return 'pending';
  return 'other';
}

export function hasArtifact(run) {
  return Boolean(run && (run.poster || run.clip || run.source));
}

export function fmtElapsed(sec) {
  if (sec == null) return 'not recorded';
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  return m ? `${m}m ${String(s % 60).padStart(2, '0')}s` : `${s}s`;
}

export function shortHash(hash) {
  return hash ? hash.slice(0, 10) : '—';
}

// Bounded, cached text fetch. Returns { text, bytes, sha256 } (sha256 null if SubtleCrypto is unavailable).
const textCache = new Map();
export function fetchText(path, { max = 1_500_000 } = {}) {
  if (textCache.has(path)) return textCache.get(path);
  const p = (async () => {
    const res = await fetch(path, { credentials: 'omit' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const len = Number(res.headers.get('content-length'));
    if (Number.isFinite(len) && len > max) throw new Error('File is too large to display');
    const buf = await res.arrayBuffer();
    if (buf.byteLength > max) throw new Error('File is too large to display');
    const text = new TextDecoder('utf-8').decode(buf);
    let sha256 = null;
    try {
      sha256 = await sha256Hex(buf);
    } catch {
      sha256 = null;
    }
    return { text, bytes: buf.byteLength, sha256 };
  })();
  textCache.set(path, p);
  p.catch(() => textCache.delete(path));
  return p;
}
