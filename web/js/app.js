import { h, frag } from './dom.js';
import { loadCatalog, statusInfo, classify, hasArtifact, fmtElapsed, shortHash, fetchText } from './data.js';
import { createPreviewFrame } from './sandbox.js';
import { createStore, parseImport, nextPair, NOTE_MAX, IMPORT_MAX_BYTES } from './ratings.js';

const main = document.getElementById('main');
const live = document.getElementById('live');
const announce = (msg) => {
  live.textContent = '';
  setTimeout(() => (live.textContent = msg), 30);
};

let storage = null;
try {
  storage = window.localStorage;
  storage.getItem('oneshot-visuals:probe');
} catch {
  storage = null;
}
const store = createStore(storage);

let catalog = null;
let cleanup = null;

const modelOf = (id) => catalog.models.find((m) => m.id === id);
const promptOf = (id) => catalog.prompts.find((p) => p.id === id);
const runFor = (promptId, modelId) => catalog.byKey.get(`${promptId}|${modelId}`) || null;
const runsOfPrompt = (id) => catalog.models.map((m) => runFor(id, m.id));
const runsOfModel = (id) => catalog.prompts.map((p) => runFor(p.id, id));

// ------------------------------------------------------------------ small parts

function chip(run) {
  if (!run) return h('span', { class: 'chip neutral' }, 'No record');
  const s = statusInfo(run.status);
  const out = h('span', { class: 'chips' }, h('span', { class: `chip ${s.tone}` }, s.label));
  if (run.captureStatus && run.captureStatus !== run.status) {
    const c = statusInfo(run.captureStatus);
    out.append(h('span', { class: `chip ${c.tone}` }, `Capture: ${c.label}`));
  }
  return out;
}

function kindChip(prompt) {
  const dur = prompt.duration ? ` · ${prompt.duration}s loop` : '';
  return h('span', { class: 'chip kind' }, prompt.kind + dur);
}

function placeholder(run, override) {
  const info = run ? statusInfo(run.status) : null;
  const pending = info && info.tone === 'wait';
  return h(
    'div',
    { class: 'ph' },
    h('b', null, run ? info.label : 'No record'),
    h('span', null, override || (pending ? 'Awaiting artifact' : run ? 'No poster captured' : 'Not in catalog'))
  );
}

function posterFrame(run, alt, big = false) {
  const f = h('div', { class: big ? 'frame big' : 'frame' });
  if (run && run.poster) {
    const img = h('img', { src: run.poster, alt, loading: 'lazy', decoding: 'async' });
    img.addEventListener('error', () => img.replaceWith(placeholder(run, 'Poster failed to load')));
    f.append(img);
  } else {
    f.append(placeholder(run));
  }
  return f;
}

function mineText(run) {
  if (!run) return { text: '', rated: false };
  if (!run.sourceHash) return { text: 'Not rateable yet', rated: false };
  const r = store.getRating(run);
  if (r) return { text: `Your rating ${r.score}/5`, rated: true };
  if (store.hasStaleRating(run)) return { text: 'Unscored (older rating was for a different source)', rated: false };
  return { text: 'Unscored', rated: false };
}

function mineBadge(run) {
  const el = h('span', { class: 'mine', dataset: { mine: run ? run.id : '' } });
  paintMine(el, run);
  return el;
}
function paintMine(el, run) {
  const m = mineText(run);
  el.textContent = m.text;
  el.classList.toggle('rated', m.rated);
}
function refreshMine() {
  document.querySelectorAll('[data-mine]').forEach((el) => paintMine(el, catalog.byId.get(el.dataset.mine)));
  document.querySelectorAll('[data-count]').forEach((el) => (el.textContent = String(computeCounts()[el.dataset.count] ?? '')));
}

function computeCounts() {
  const runs = catalog.runs;
  return {
    entries: runs.length,
    artifacts: runs.filter(hasArtifact).length,
    captured: runs.filter((r) => classify(r) === 'captured').length,
    failed: runs.filter((r) => classify(r) === 'failed').length,
    pending: runs.filter((r) => classify(r) === 'pending').length,
    rated: runs.filter((r) => store.getRating(r)).length
  };
}

// --------------------------------------------------------- media (poster/clip/live)

function mediaPanel(run, { blind = false, label = 'entry' } = {}) {
  const stage = h('div', { class: 'frame big' });
  const note = h('p', { class: 'media-note' });
  let mode = 'poster';
  let previewObserver = null;
  const btns = {};

  const alt = blind ? `Poster of ${label}` : `Poster of ${modelOf(run.modelId)?.label || run.modelId} for ${promptOf(run.promptId)?.title || run.promptId}`;
  function setMode(next, node, msg = '', warn = false) {
    previewObserver?.disconnect();
    previewObserver = null;
    mode = next;
    for (const [k, b] of Object.entries(btns)) b.setAttribute('aria-pressed', String(k === mode));
    stage.querySelectorAll('video').forEach((v) => v.pause());
    stage.replaceChildren(node);
    note.textContent = msg;
    note.classList.toggle('warn', warn);
  }

  const toPoster = () => {
    const f = posterFrame(run, alt);
    setMode('poster', f.firstChild, '');
  };

  function toClip() {
    const v = h('video', { src: run.clip, controls: true, muted: true, loop: true, playsinline: true, preload: 'metadata', 'aria-label': `Clip of ${label}` });
    if (run.poster) v.setAttribute('poster', run.poster);
    v.muted = true;
    v.addEventListener('error', () => setMode('poster', placeholder(run, 'Clip failed to load'), 'The clip could not be loaded.', true));
    setMode('clip', v, 'Recorded clip. Captured on the same timeline for every entry.');
  }

  async function toLive() {
    setMode('live', h('div', { class: 'ph' }, h('b', null, 'Loading source…')), '');
    try {
      const file = await fetchText(run.source);
      if (run.sourceHash && file.sha256 && file.sha256 !== run.sourceHash) {
        setMode('poster', placeholder(run, 'Live preview blocked'), 'The source file does not match its recorded hash, so it was not run.', true);
        stage.replaceChildren(placeholder(run, 'Live preview blocked'));
        return;
      }
      const frame = createPreviewFrame(file.text, `Live preview of ${label} (sandboxed)`);
      const unverified = run.sourceHash && !file.sha256 ? ' Hash could not be checked in this context.' : '';
      setMode('live', frame, 'Running in a sandbox: scripts only, opaque origin, no network, no storage.' + unverified);
      // Preserve the capture viewport. Scaling the iframe changes its display size,
      // not the viewport seen by the unchanged entry or its pointer coordinates.
      frame.classList.add('live-preview');
      frame.style.width = '1600px';
      frame.style.height = '900px';
      const fit = () => {
        const scale = Math.min(stage.clientWidth / 1600, stage.clientHeight / 900);
        frame.style.transform = `scale(${scale})`;
        frame.style.left = `${(stage.clientWidth - 1600 * scale) / 2}px`;
        frame.style.top = `${(stage.clientHeight - 900 * scale) / 2}px`;
      };
      previewObserver = new ResizeObserver(fit);
      previewObserver.observe(stage);
      fit();
    } catch (e) {
      setMode('poster', placeholder(run, 'Source unavailable'), `Could not load the source (${e.message}).`, true);
      stage.replaceChildren(placeholder(run, 'Source unavailable'));
    }
  }

  const mk = (key, text, enabled, reason, fn) => {
    const b = h('button', { type: 'button', 'aria-pressed': String(key === 'poster'), title: enabled ? null : reason, onclick: fn }, text);
    if (!enabled) b.disabled = true;
    btns[key] = b;
    return b;
  };

  const seg = h(
    'div',
    { class: 'seg', role: 'group', 'aria-label': 'Preview mode' },
    mk('poster', 'Poster', true, '', toPoster),
    mk('clip', 'Clip', Boolean(run.clip), 'No clip captured', toClip),
    mk('live', 'Run live', Boolean(run.source), 'No source available', () => toLive())
  );

  const first = posterFrame(run, alt);
  stage.append(...first.childNodes);
  const fullscreen = h('button', {
    type: 'button', class: 'btn small',
    onclick: async () => {
      try {
        if (document.fullscreenElement === root) await document.exitFullscreen();
        else await root.requestFullscreen();
      } catch {
        note.textContent = 'Fullscreen is unavailable in this browser. The preview still uses its original 1600 × 900 viewport.';
      }
    }
  }, 'Fullscreen');
  fullscreen.disabled = !document.fullscreenEnabled;
  const root = h('div', { class: 'media' }, stage, h('div', { class: 'row', style: null }, seg, fullscreen), note);
  root.addEventListener('fullscreenchange', () => {
    fullscreen.textContent = document.fullscreenElement === root ? 'Exit fullscreen' : 'Fullscreen';
  });
  root.dispose = () => previewObserver?.disconnect();
  root.querySelector('.row').style.marginTop = '8px';
  root.pauseAll = () => stage.querySelectorAll('video').forEach((v) => v.pause());
  root.showClip = () => run.clip && mode !== 'clip' && btns.clip.click();
  root.playClip = () => {
    const v = stage.querySelector('video');
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };
  return root;
}

// ------------------------------------------------------------------ rating widget

function ratingControl(run, { withNote = false } = {}) {
  const id = `rate-${run.id}-${Math.random().toString(36).slice(2, 7)}`;
  const rateable = Boolean(run.sourceHash);
  const cur = store.getRating(run);
  const fs = h('fieldset', { class: 'rate' }, h('legend', null, 'Your rating (1 low – 5 high)'));
  const row = h('div', { class: 'rate-row' });
  const note = h('input', { class: 'note-in', type: 'text', maxlength: NOTE_MAX, placeholder: 'Optional private note', 'aria-label': 'Private note for this entry', value: cur ? cur.note : '' });
  const help = h('p', { class: 'rate-help' });

  const sync = () => {
    const r = store.getRating(run);
    row.querySelectorAll('input[type=radio]').forEach((i) => (i.checked = r != null && Number(i.value) === r.score));
    note.disabled = !r;
    if (document.activeElement !== note) note.value = r ? r.note : '';
    help.textContent = !rateable
      ? 'Rating unlocks once this entry has a recorded source hash.'
      : r
        ? `Saved in this browser for source ${shortHash(run.sourceHash)}.`
        : store.hasStaleRating(run)
          ? 'An earlier rating was for a different source version and is not counted.'
          : 'Unscored. Ratings stay in this browser.';
  };

  for (let n = 1; n <= 5; n++) {
    const input = h('input', { type: 'radio', name: id, value: n, 'aria-label': `${n} out of 5` });
    if (!rateable) input.disabled = true;
    input.addEventListener('change', () => {
      store.setRating(run, n);
      announce(`Rated ${n} out of 5`);
    });
    row.append(h('label', { class: 'rate-opt' }, input, h('span', { 'aria-hidden': 'true' }, String(n))));
  }
  const clear = h(
    'button',
    {
      type: 'button',
      class: 'btn small',
      onclick: () => {
        store.setRating(run, null);
        announce('Rating cleared');
      }
    },
    'Clear'
  );
  if (!rateable) clear.disabled = true;
  row.append(clear);
  fs.append(row);
  if (withNote) {
    note.addEventListener('change', () => store.setNote(run, note.value));
    fs.append(note);
  }
  fs.append(help);
  sync();
  const off = store.subscribe(sync);
  fs.dispose = off;
  disposers.push(off);
  return fs;
}

let disposers = [];

// -------------------------------------------------------------------------- views

function pageHead({ eyebrow, title, lede, extra }) {
  return h('div', { class: 'page-head' }, eyebrow ? h('p', { class: 'eyebrow' }, eyebrow) : null, h('h1', { tabindex: '-1' }, title), lede ? h('p', { class: 'lede' }, lede) : null, extra);
}

function runCell(run, { by = 'model', prompt, model }) {
  const p = prompt || promptOf(run.promptId);
  const m = model || modelOf(run.modelId);
  const who = by === 'model' ? m.label : p.title;
  const alt = `Poster of ${m.label} for ${p.title}`;
  if (!run) return h('div', { class: 'cell', role: 'gridcell' }, posterFrame(null, alt), h('div', { class: 'cell-cap' }, h('span', { class: 'who' }, who), chip(null)));
  return h(
    'div',
    { role: 'gridcell' },
    h(
      'a',
      { class: 'cell', href: `#/run/${encodeURIComponent(run.id)}`, 'aria-label': `${who}, ${statusInfo(run.status).label}. Open details.` },
      posterFrame(run, alt),
      h('div', { class: 'cell-cap' }, h('span', { class: 'who' }, who), chip(run)),
      mineBadge(run)
    )
  );
}

function gridKeys(grid) {
  grid.addEventListener('keydown', (e) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!keys.includes(e.key) || e.altKey || e.ctrlKey || e.metaKey) return;
    const links = [...grid.querySelectorAll('a.cell')];
    const i = links.indexOf(document.activeElement);
    if (i < 0) return;
    // Derive the column count from rendered geometry so wrapping layouts work too.
    const top = links[0].getBoundingClientRect().top;
    const step = Math.max(1, links.filter((l) => Math.abs(l.getBoundingClientRect().top - top) < 4).length);
    let n = i;
    if (e.key === 'ArrowLeft') n = i - 1;
    else if (e.key === 'ArrowRight') n = i + 1;
    else if (e.key === 'ArrowUp') n = i - step;
    else if (e.key === 'ArrowDown') n = i + step;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = links.length - 1;
    if (n >= 0 && n < links.length) {
      e.preventDefault();
      links[n].focus();
    }
  });
}

function viewMatrix() {
  const c = computeCounts();
  const grid = h('div', { class: 'matrix', role: 'grid', 'aria-label': 'Six briefs by five agents' });
  grid.style.setProperty('--cols', `minmax(8.5rem, 11rem) repeat(${catalog.models.length}, minmax(0, 1fr))`);
  grid.append(
    h(
      'div',
      { class: 'mx-head', role: 'row' },
      h('div', { role: 'columnheader' }, h('span', { class: 'sr-only' }, 'Brief')),
      catalog.models.map((m) => h('div', { class: 'mx-col', role: 'columnheader' }, h('a', { href: `#/model/${encodeURIComponent(m.id)}` }, m.label), h('small', null, `${m.provider} · ${m.effort} effort`)))
    )
  );
  for (const p of catalog.prompts) {
    const cells = catalog.models.map((m) => runCell(runFor(p.id, m.id), { by: 'model', prompt: p, model: m }));
    grid.append(
      h(
        'div',
        { class: 'mx-row', role: 'row' },
        h('div', { class: 'mx-rowhead', role: 'rowheader' }, h('h2', null, h('a', { href: `#/prompt/${encodeURIComponent(p.id)}` }, p.title)), kindChip(p)),
        cells
      )
    );
  }
  gridKeys(grid);

  const stat = (label, key) => h('div', null, h('dt', null, label), h('dd', { dataset: { count: key } }, String(c[key])));
  return {
    title: 'Matrix',
    node: frag(
      pageHead({
        eyebrow: 'Six briefs · five agents · one take each',
        title: 'The matrix',
        lede: 'Every entry is shown, including failures. Open a cell for the brief, the source and capture status. Arrow keys move between cells.'
      }),
      c.artifacts === 0
        ? h('div', { class: 'notice' }, h('p', null, h('strong', null, 'No artifacts have arrived yet. '), 'Cells show a placeholder until a catalog with posters, clips and sources is published. Nothing here is scored.'))
        : null,
      h('dl', { class: 'stats' }, stat('Entries', 'entries'), stat('With artifacts', 'artifacts'), stat('Captured', 'captured'), stat('Failed', 'failed'), stat('Pending', 'pending'), stat('Rated by you', 'rated')),
      grid
    )
  };
}

function tabs(items, currentId, hrefFor, label) {
  return h('nav', { 'aria-label': label }, h('ul', { class: 'tabs' }, items.map((it) => h('li', null, h('a', { href: hrefFor(it), 'aria-current': it.id === currentId ? 'page' : null }, it.label || it.title)))));
}

function promptTextBlock(prompt) {
  const pre = h('pre', { class: 'text', tabindex: '0' }, 'Loading…');
  let loaded = false;
  const d = h('details', { class: 'src' }, h('summary', null, 'Exact brief text'), pre);
  d.addEventListener('toggle', async () => {
    if (!d.open || loaded) return;
    loaded = true;
    if (prompt.text) {
      pre.textContent = prompt.text;
      return;
    }
    if (!prompt.path) {
      pre.textContent = 'The brief text is not available in this catalog.';
      return;
    }
    try {
      pre.textContent = (await fetchText(prompt.path)).text;
    } catch (e) {
      loaded = false;
      pre.textContent = `Could not load the brief (${e.message}).`;
    }
  });
  return d;
}

function viewPrompt(id) {
  const prompt = promptOf(id) || catalog.prompts[0];
  if (!prompt) return viewEmpty('No briefs in the catalog.');
  const tallies = store.pickTallies(catalog.byId);
  const cards = catalog.models.map((m) => {
    const run = runFor(prompt.id, m.id);
    const t = run && tallies.get(run.id);
    return h(
      'article',
      { class: 'card' },
      h('header', null, h('h3', null, run ? h('a', { href: `#/run/${encodeURIComponent(run.id)}` }, m.label) : m.label), chip(run)),
      run ? mediaPanel(run, { label: `${m.label} · ${prompt.title}` }) : h('div', { class: 'frame big' }, placeholder(null)),
      h('div', { class: 'row small muted' }, run ? mineBadge(run) : null, t ? h('span', null, `Blind picks: ${t.w}W ${t.l}L ${t.t}T`) : null, run ? h('span', null, fmtElapsed(run.elapsedSeconds)) : null),
      run ? ratingControl(run) : null
    );
  });
  const clipBtn = h(
    'button',
    {
      type: 'button',
      class: 'btn small',
      onclick: () => {
        const panels = [...document.querySelectorAll('.media')].filter((p) => p.showClip);
        panels.forEach((p) => p.showClip());
        panels.forEach((p) => p.playClip());
        announce('Started available clips together (best effort, not frame-synchronised).');
      }
    },
    'Play all clips together'
  );
  const hasClips = catalog.runs.some((r) => r.promptId === prompt.id && r.clip);
  return {
    title: prompt.title,
    node: frag(
      pageHead({
        eyebrow: 'By brief',
        title: prompt.title,
        lede: 'Five outputs for the same brief. Posters are the default view; clips and live previews are opt-in.',
        extra: h('div', { class: 'row' }, kindChip(prompt), h('a', { class: 'btn small', href: `#/review/${encodeURIComponent(prompt.id)}` }, 'Blind review this brief'), hasClips ? clipBtn : null)
      }),
      tabs(catalog.prompts, prompt.id, (p) => `#/prompt/${encodeURIComponent(p.id)}`, 'Choose a brief'),
      promptTextBlock(prompt),
      h('div', { class: 'cards' }, cards)
    )
  };
}

function viewModel(id) {
  const model = modelOf(id) || catalog.models[0];
  if (!model) return viewEmpty('No agents in the catalog.');
  const runs = runsOfModel(model.id).filter(Boolean);
  const tone = (t) => runs.filter((r) => classify(r) === t).length;
  const rated = runs.map((r) => store.getRating(r)).filter(Boolean);
  const mean = rated.length ? (rated.reduce((a, r) => a + r.score, 0) / rated.length).toFixed(1) : null;
  const cells = catalog.prompts.map((p) => runCell(runFor(p.id, model.id), { by: 'prompt', prompt: p, model }));
  const grid = h('div', { class: 'cards', role: 'grid', 'aria-label': `${model.label} portfolio` });
  cells.forEach((c) => grid.append(h('div', { role: 'row' }, c)));
  gridKeys(grid);
  return {
    title: model.label,
    node: frag(
      pageHead({ eyebrow: 'By agent', title: model.label, lede: 'All six briefs from this configured agent. These are single-attempt results; the configuration, not just the model, is what is being compared.' }),
      tabs(catalog.models, model.id, (m) => `#/model/${encodeURIComponent(m.id)}`, 'Choose an agent'),
      h(
        'dl',
        { class: 'facts panel', style: null },
        h('dt', null, 'Provider'), h('dd', null, model.provider || 'unknown'),
        h('dt', null, 'Model id'), h('dd', { class: 'mono' }, model.model || 'unknown'),
        h('dt', null, 'Effort'), h('dd', null, model.effort || 'unknown'),
        h('dt', null, 'Capture status'), h('dd', null, `${tone('captured')} captured · ${tone('failed')} failed · ${tone('stale')} stale · ${tone('pending')} pending · ${tone('other')} other`),
        h('dt', null, 'Your ratings'), h('dd', null, rated.length ? `${rated.length} of ${runs.length} rated, mean ${mean}/5 (rated entries only; unrated entries are not counted as zero)` : 'None yet. All entries unscored.')
      ),
      grid
    )
  };
}

function factsFrom(v) {
  const fmt = (x) => String(typeof x === 'string' ? x : (JSON.stringify(x) ?? '')).slice(0, 300);
  const entries = Array.isArray(v) ? v.map((x, i) => [String(i + 1), x]) : Object.entries(v);
  if (!entries.length) return h('p', { class: 'muted small' }, 'Empty validation record.');
  const dl = h('dl', { class: 'facts' });
  entries.slice(0, 40).forEach(([k, x]) => dl.append(h('dt', null, k), h('dd', null, fmt(x))));
  return dl;
}

function validationBlock(run) {
  const v = run.validation;
  if (run.validationPath) {
    const box = h('div', null, h('p', { class: 'muted small' }, 'Loading capture record…'));
    fetchText(run.validationPath, { max: 200000 })
      .then((f) => {
        let parsed;
        try {
          parsed = JSON.parse(f.text);
        } catch {
          return box.replaceChildren(h('pre', { class: 'text' }, f.text));
        }
        box.replaceChildren(parsed && typeof parsed === 'object' ? factsFrom(parsed) : h('p', null, String(parsed)));
      })
      .catch((e) => box.replaceChildren(h('p', { class: 'media-note warn' }, `Could not load the capture record (${e.message}).`)));
    return box;
  }
  if (v == null || v === '') return h('p', { class: 'muted small' }, 'No capture or validation record yet.');
  if (typeof v === 'string') return h('p', null, v);
  return factsFrom(v);
}

function notesBlock(run) {
  if (run.notesPath) {
    const pre = h('pre', { class: 'text', tabindex: '0' }, 'Loading notes…');
    fetchText(run.notesPath, { max: 50000 }).then((f) => (pre.textContent = f.text)).catch((e) => (pre.textContent = `Could not load the notes (${e.message}).`));
    return h('div', null, h('h3', null, 'Agent notes (unmodified)'), pre);
  }
  return run.notes ? h('p', { class: 'small' }, run.notes) : null;
}

function sourceBlock(run) {
  const verdict = h('p', { class: 'small' });
  const pre = h('pre', { class: 'text', tabindex: '0' }, 'Loading…');
  const raw = h('p', { class: 'small' }, run.source ? h('a', { href: run.source, target: '_blank', rel: 'noopener noreferrer' }, 'Open raw .txt') : null);
  const d = h('details', { class: 'src' }, h('summary', null, 'Source (shown as plain text)'), raw, verdict, pre);
  if (!run.source) {
    pre.textContent = 'No source file is available for this entry.';
    return d;
  }
  let loaded = false;
  d.addEventListener('toggle', async () => {
    if (!d.open || loaded) return;
    loaded = true;
    try {
      const f = await fetchText(run.source);
      pre.textContent = f.text;
      const bytes = `${f.bytes.toLocaleString()} bytes. `;
      if (!run.sourceHash) verdict.replaceChildren(bytes, 'No recorded hash to verify against.');
      else if (!f.sha256) verdict.replaceChildren(bytes, 'Hash could not be computed in this context (SubtleCrypto needs HTTPS or localhost).');
      else if (f.sha256 === run.sourceHash) verdict.replaceChildren(bytes, h('span', { class: 'verify ok' }, 'SHA-256 matches the recorded hash.'));
      else verdict.replaceChildren(bytes, h('span', { class: 'verify bad' }, 'SHA-256 does not match the recorded hash. Treat this file with suspicion.'));
    } catch (e) {
      loaded = false;
      pre.textContent = `Could not load the source (${e.message}).`;
    }
  });
  return d;
}

function viewRun(id) {
  const run = catalog.byId.get(id);
  if (!run) return viewEmpty('That entry is not in the catalog.');
  const prompt = promptOf(run.promptId);
  const model = modelOf(run.modelId);
  const siblings = runsOfPrompt(prompt.id).filter(Boolean);
  const i = siblings.findIndex((r) => r.id === run.id);
  const prev = siblings[i - 1];
  const next = siblings[i + 1];
  const tally = store.pickTallies(catalog.byId).get(run.id);
  const score = run.score;
  const pagerLink = (r, dir) => (r ? h('a', { class: 'btn small', href: `#/run/${encodeURIComponent(r.id)}` }, dir === 'prev' ? `← ${modelOf(r.modelId).label}` : `${modelOf(r.modelId).label} →`) : h('span'));
  return {
    title: `${model.label} · ${prompt.title}`,
    node: frag(
      pageHead({
        eyebrow: h('span', null, h('a', { href: `#/prompt/${encodeURIComponent(prompt.id)}` }, prompt.title), ' · ', h('a', { href: `#/model/${encodeURIComponent(model.id)}` }, model.label)),
        title: `${model.label} on “${prompt.title}”`,
        extra: h('div', { class: 'row' }, chip(run), kindChip(prompt))
      }),
      h(
        'div',
        { class: 'detail' },
        h('div', null, mediaPanel(run, { label: `${model.label} · ${prompt.title}` }), h('div', { class: 'pager' }, pagerLink(prev, 'prev'), pagerLink(next, 'next')), promptTextBlock(prompt), sourceBlock(run)),
        h(
          'aside',
          null,
          h('section', { class: 'panel' }, h('h2', null, 'Your rating'), ratingControl(run, { withNote: true }), tally ? h('p', { class: 'small muted' }, `Blind picks: ${tally.w} won, ${tally.l} lost, ${tally.t} tied.`) : null),
          h(
            'section',
            { class: 'panel' },
            h('h2', null, 'Record'),
            h(
              'dl',
              { class: 'facts' },
              h('dt', null, 'Run status'), h('dd', null, statusInfo(run.status).label),
              h('dt', null, 'Capture status'), h('dd', null, run.captureStatus ? statusInfo(run.captureStatus).label : 'Not captured'),
              h('dt', null, 'Evaluator score'), h('dd', null, score == null ? 'Unscored' : String(score)),
              h('dt', null, 'Elapsed'), h('dd', null, fmtElapsed(run.elapsedSeconds)),
              h('dt', null, 'Provider'), h('dd', null, model.provider || 'unknown'),
              h('dt', null, 'Requested model'), h('dd', { class: 'mono' }, run.requestedModel || model.model || 'unknown'),
              h('dt', null, 'Effort'), h('dd', null, run.effort || model.effort || 'unknown'),
              h('dt', null, 'Source hash'), h('dd', { class: 'hash', title: run.sourceHash || '' }, run.sourceHash || 'none recorded')
            )
          ),
          h('section', { class: 'panel' }, h('h2', null, 'Capture and validation'), validationBlock(run), notesBlock(run))
        )
      )
    )
  };
}

function viewEmpty(msg) {
  return { title: 'Not found', node: h('div', { class: 'empty' }, h('h1', { tabindex: '-1' }, msg), h('p', null, h('a', { class: 'btn', href: '#/' }, 'Back to the matrix'))) };
}

// ------------------------------------------------------------------ blind review

function viewReview(promptFilter) {
  const filter = promptFilter && promptOf(promptFilter) ? [promptFilter] : null;
  const root = h('div');
  const state = { pair: null, revealed: false, last: null, nodes: null };

  const opts = () => ({ runs: catalog.runs, promptIds: filter, store, runsById: catalog.byId, avoidKey: state.last });

  function draw() {
    const pair = state.pair;
    if (!pair) {
      root.replaceChildren(
        pageHead({ eyebrow: 'Blind review', title: 'Nothing to review yet', lede: 'A pair needs two entries for the same brief, each with a recorded source hash and a poster, clip or source.' }),
        h('p', null, h('a', { class: 'btn', href: '#/' }, 'Back to the matrix'))
      );
      return;
    }
    const prompt = promptOf(pair.promptId);
    const panels = [pair.left, pair.right].map((r, i) => {
      const letter = i === 0 ? 'A' : 'B';
      const reveal = h('p', { class: 'reveal small', hidden: true });
      const side = h('section', { class: 'side', 'aria-label': `Option ${letter}` }, h('div', { class: 'side-label' }, h('span', { class: 'big', 'aria-hidden': 'true' }, letter), h('span', { class: 'sr-only' }, `Option ${letter}`)), mediaPanel(r, { blind: true, label: `option ${letter}` }), reveal);
      return { run: r, letter, side, reveal };
    });
    const choose = (which) => {
      if (state.revealed) return;
      const [A, B] = panels;
      const winner = which === 'a' ? A.run.id : which === 'b' ? B.run.id : null;
      if (which === 'skip') return next();
      store.addPick(pair.promptId, A.run, B.run, winner);
      state.revealed = true;
      panels.forEach((p) => {
        const m = modelOf(p.run.modelId);
        p.reveal.hidden = false;
        p.reveal.replaceChildren(h('strong', null, m.label), ' · ', h('a', { href: `#/run/${encodeURIComponent(p.run.id)}` }, 'details'));
        if ((which === 'a' && p === A) || (which === 'b' && p === B)) p.side.classList.add('won');
      });
      buttons.forEach((b) => b.id !== 'next' && (b.disabled = true));
      nextBtn.disabled = false;
      nextBtn.focus();
      const msg = which === 'tie' ? 'Recorded a tie.' : `Picked ${which === 'a' ? 'A' : 'B'}.`;
      announce(`${msg} Revealed: A is ${modelOf(A.run.modelId).label}, B is ${modelOf(B.run.modelId).label}.`);
    };
    const mkBtn = (text, key, fn, cls = 'btn') => h('button', { type: 'button', class: cls, 'aria-keyshortcuts': key, onclick: fn }, text, ' ', h('kbd', { 'aria-hidden': 'true' }, key));
    const buttons = [mkBtn('Prefer A', 'A', () => choose('a'), 'btn primary'), mkBtn('Tie', 'T', () => choose('tie')), mkBtn('Prefer B', 'B', () => choose('b'), 'btn primary'), mkBtn('Skip', 'S', () => choose('skip'))];
    const nextBtn = h('button', { type: 'button', id: 'next', class: 'btn', disabled: true, 'aria-keyshortcuts': 'N', onclick: () => next() }, 'Next pair ', h('kbd', { 'aria-hidden': 'true' }, 'N'));
    buttons.push(nextBtn);
    state.choose = choose;
    state.nextBtn = nextBtn;

    root.querySelectorAll('.media').forEach((panel) => panel.dispose?.());
    root.replaceChildren(
      pageHead({
        eyebrow: 'Blind review',
        title: prompt.title,
        lede: 'Which output better answers the brief? Model names stay hidden until you choose. Posters can hide interactive behaviour, so run live previews if you need them. Source files may name their author, so avoid opening them before you pick.'
      }),
      h('div', { class: 'review-bar' }, h('p', { class: 'muted small', style: null }, `${pair.remaining} unjudged pair${pair.remaining === 1 ? '' : 's'} left of ${pair.total}${pair.repeat ? ' (all judged; a new pick replaces the old one)' : ''}${filter ? '' : ' across all briefs'}.`), h('a', { class: 'small', href: filter ? '#/review' : '#/' }, filter ? 'Review all briefs' : 'Back to matrix')),
      h('div', { class: 'pair' }, panels.map((p) => p.side)),
      h('div', { class: 'choices' }, buttons),
      h('p', { class: 'muted small' }, 'Keys: ', h('kbd', null, 'A'), ' or ', h('kbd', null, '←'), ' prefers A · ', h('kbd', null, 'B'), ' or ', h('kbd', null, '→'), ' prefers B · ', h('kbd', null, 'T'), ' tie · ', h('kbd', null, 'S'), ' skip · ', h('kbd', null, 'N'), ' next after reveal')
    );
  }

  function next() {
    if (state.pair) state.last = state.pair.key;
    state.pair = nextPair(opts());
    state.revealed = false;
    draw();
    const h1 = root.querySelector('h1');
    if (h1) h1.focus({ preventScroll: true });
  }

  function onKey(e) {
    if (e.altKey || e.ctrlKey || e.metaKey || !state.pair) return;
    const t = e.target;
    if (t && (t.tagName === 'VIDEO' || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    const k = e.key.toLowerCase();
    if (state.revealed) {
      if (k === 'n' || k === 'enter') {
        if (k === 'enter' && t && t.tagName === 'BUTTON') return;
        e.preventDefault();
        next();
      }
      return;
    }
    const map = { a: 'a', arrowleft: 'a', b: 'b', arrowright: 'b', t: 'tie', s: 'skip' };
    if (map[k]) {
      e.preventDefault();
      state.choose(map[k]);
    }
  }
  document.addEventListener('keydown', onKey);

  state.pair = nextPair(opts());
  draw();
  return { title: 'Blind review', node: root, cleanup: () => document.removeEventListener('keydown', onKey) };
}

// ---------------------------------------------------------------- ratings page

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = h('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function viewRatings() {
  const ratings = store.allRatings();
  const picks = store.allPicks();
  const activeRatings = ratings.filter((r) => catalog.byId.get(r.runId)?.sourceHash === r.sourceHash);
  const activePicks = picks.filter((p) => store.isActivePick(p, catalog.byId));
  const results = h('div', { 'aria-live': 'polite' });
  let pending = null;

  const fileInput = h('input', { class: 'filein', type: 'file', accept: 'application/json,.json', 'aria-label': 'Ratings JSON file to import' });
  fileInput.addEventListener('change', async () => {
    results.replaceChildren();
    pending = null;
    const f = fileInput.files && fileInput.files[0];
    if (!f) return;
    if (f.size > IMPORT_MAX_BYTES) return results.append(h('div', { class: 'notice error' }, h('p', null, 'That file is too large to be a ratings export.')));
    const v = parseImport(await f.text(), catalog.byId);
    if (v.fatal) return results.append(h('div', { class: 'notice error' }, h('p', null, h('strong', null, 'Import rejected. '), v.fatal)));
    pending = v;
    const shownIssues = v.issues.slice(0, 8);
    results.append(
      h(
        'div',
        { class: 'notice' },
        h('p', null, h('strong', null, 'Ready to import: '), `${v.ratings.size} rating${v.ratings.size === 1 ? '' : 's'}, ${v.picks.size} pick${v.picks.size === 1 ? '' : 's'}. ${v.duplicates} duplicate${v.duplicates === 1 ? '' : 's'} merged, ${v.issues.length} entr${v.issues.length === 1 ? 'y' : 'ies'} skipped.`),
        shownIssues.length ? h('ul', { class: 'plain' }, shownIssues.map((s) => h('li', null, s)), v.issues.length > 8 ? h('li', null, `…and ${v.issues.length - 8} more`) : null) : null,
        h(
          'div',
          { class: 'row' },
          h('button', { type: 'button', class: 'btn primary small', onclick: () => apply('merge') }, 'Merge (newer wins)'),
          h('button', { type: 'button', class: 'btn small danger', onclick: () => apply('replace') }, 'Replace everything')
        )
      )
    );
  });
  function apply(mode) {
    if (!pending) return;
    if (mode === 'replace' && !window.confirm('Replace all ratings and picks stored in this browser with the imported file?')) return;
    store.applyImport(pending, mode);
    pending = null;
    fileInput.value = '';
    announce('Import applied.');
    router();
  }

  const label = (id) => {
    const r = catalog.byId.get(id);
    return r ? `${promptOf(r.promptId).title} · ${modelOf(r.modelId).label}` : `${id} (not in catalog)`;
  };
  const stateCell = (active) => h('span', { class: `chip ${active ? 'ok' : 'wait'}` }, active ? 'Counts' : 'Stale');

  const rTable = ratings.length
    ? h(
        'div',
        { class: 'tablewrap' },
        h(
          'table',
          null,
          h('thead', null, h('tr', null, ['Entry', 'Score', 'Source', 'State', 'Note'].map((t) => h('th', { scope: 'col' }, t)))),
          h(
            'tbody',
            null,
            ratings
              .slice()
              .sort((a, b) => label(a.runId).localeCompare(label(b.runId)))
              .map((r) => h('tr', null, h('td', null, catalog.byId.has(r.runId) ? h('a', { href: `#/run/${encodeURIComponent(r.runId)}` }, label(r.runId)) : label(r.runId)), h('td', null, `${r.score}/5`), h('td', { class: 'hash' }, shortHash(r.sourceHash)), h('td', null, stateCell(catalog.byId.get(r.runId)?.sourceHash === r.sourceHash)), h('td', null, r.note || '')))
          )
        )
      )
    : h('p', { class: 'muted' }, 'No ratings yet. Open an entry and score it 1–5, or try blind review.');

  const pTable = picks.length
    ? h(
        'div',
        { class: 'tablewrap' },
        h(
          'table',
          null,
          h('thead', null, h('tr', null, ['Brief', 'Result', 'State'].map((t) => h('th', { scope: 'col' }, t)))),
          h(
            'tbody',
            null,
            picks.map((p) => {
              const a = catalog.byId.get(p.a.runId);
              const b = catalog.byId.get(p.b.runId);
              const nm = (r) => (r ? modelOf(r.modelId).label : '?');
              const res = p.winner === 'tie' ? `${nm(a)} tied ${nm(b)}` : `${nm(p.winner === 'a' ? a : b)} beat ${nm(p.winner === 'a' ? b : a)}`;
              return h('tr', null, h('td', null, promptOf(p.promptId)?.title || p.promptId), h('td', null, res), h('td', null, stateCell(store.isActivePick(p, catalog.byId))));
            })
          )
        )
      )
    : h('p', { class: 'muted' }, 'No blind picks yet.');

  return {
    title: 'My ratings',
    node: frag(
      pageHead({ eyebrow: 'Local only', title: 'My ratings', lede: 'Ratings and blind picks live in this browser and are tied to each entry’s source hash. If a source changes, the old rating stays in your file but stops counting. Nothing is uploaded.' }),
      store.persistent ? null : h('div', { class: 'notice error' }, h('p', null, h('strong', null, 'Browser storage is unavailable. '), 'Ratings last only for this tab. Export before leaving.')),
      h('dl', { class: 'stats' }, h('div', null, h('dt', null, 'Ratings counted'), h('dd', null, String(activeRatings.length))), h('div', null, h('dt', null, 'Stale ratings'), h('dd', null, String(ratings.length - activeRatings.length))), h('div', null, h('dt', null, 'Blind picks counted'), h('dd', null, String(activePicks.length)))),
      h(
        'div',
        { class: 'two', style: null },
        h(
          'section',
          { class: 'panel' },
          h('h2', null, 'Export'),
          h('p', { class: 'small muted' }, 'Downloads a JSON file with every rating and pick, including stale ones.'),
          h('button', { type: 'button', class: 'btn primary', onclick: () => download(`oneshot-visuals-ratings-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(store.exportDocument(catalog.byId), null, 2)) }, 'Export JSON')
        ),
        h(
          'section',
          { class: 'panel' },
          h('h2', null, 'Import'),
          h('p', { class: 'small muted' }, 'Entries are validated, matched to catalog entries and de-duplicated before anything is saved.'),
          fileInput,
          results
        )
      ),
      h('h2', { style: null }, 'Ratings'),
      rTable,
      h('h2', null, 'Blind picks'),
      pTable,
      h(
        'p',
        null,
        h(
          'button',
          {
            type: 'button',
            class: 'btn small danger',
            onclick: () => {
              if (window.confirm('Delete all ratings and picks stored in this browser? Export first if you want a copy.')) {
                store.clearAll();
                router();
              }
            }
          },
          'Delete all local ratings'
        )
      )
    )
  };
}

// ---------------------------------------------------------------------- router

function parseRoute() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  return { name: parts[0] || 'matrix', id: parts[1] || null };
}

function router() {
  if (cleanup) cleanup();
  main.querySelectorAll('.media').forEach((panel) => panel.dispose?.());
  cleanup = null;
  disposers.forEach((d) => d());
  disposers = [];
  const r = parseRoute();
  let view;
  try {
    view =
      r.name === 'matrix' ? viewMatrix()
      : r.name === 'prompt' ? viewPrompt(r.id)
      : r.name === 'model' ? viewModel(r.id)
      : r.name === 'run' ? viewRun(r.id)
      : r.name === 'review' ? viewReview(r.id)
      : r.name === 'ratings' ? viewRatings()
      : viewEmpty('Page not found');
  } catch (e) {
    console.error(e);
    view = { title: 'Error', node: h('div', { class: 'notice error' }, h('p', null, 'Something went wrong rendering this page.')) };
  }
  cleanup = view.cleanup || null;
  main.replaceChildren(view.node);
  document.title = `${view.title} · Oneshot Visuals`;
  const navKey = r.name === 'run' ? 'matrix' : r.name;
  document.querySelectorAll('#nav a').forEach((a) => (a.getAttribute('data-nav') === navKey ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  const heading = main.querySelector('h1');
  if (heading) heading.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

async function start() {
  try {
    catalog = await loadCatalog();
  } catch (e) {
    main.replaceChildren(
      h('div', { class: 'empty' }, h('h1', { tabindex: '-1' }, 'Catalog not available'), h('div', { class: 'notice error' }, h('p', null, `The gallery could not load ./data/catalog.json: ${e.message}.`), h('p', null, 'Build the site so data/catalog.json is published next to index.html, then reload.')))
    );
    return;
  }
  store.subscribe(refreshMine);
  window.addEventListener('hashchange', router);
  window.addEventListener('storage', (e) => {
    if (e.key === null || e.key.startsWith('oneshot-visuals:')) {
      store.reload();
      router();
    }
  });
  router();
}

start();
