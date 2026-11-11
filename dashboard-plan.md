Historical planning proposal: the user subsequently selected direct T3 one-shot sessions through Codex and Claude. No custom execution runner, enforced time limit, or infrastructure isolation was implemented. README.md and the shipped code describe the actual pilot. 

# Visual One-Shot Benchmark: Dashboard Plan (Stage One)

Status: planning only. Nothing here is built yet, no entrants have been generated, and no prompt briefs have been written. This document specifies the static dashboard, the data contracts, the isolation model for untrusted model output, and the milestones and acceptance tests that later stages build against.

Working name: **Oneshot Canvas** (repo `oneshot-canvas`), a sibling to [oneshot-arcade](https://github.com/JamesTsetsekas/oneshot-arcade). The name is a placeholder; see [Open decisions](#13-open-decisions).

---

## 1. Goal and non-goals

**Goal.** A GitHub Pages site that shows how five AI coding models handle six original visual coding briefs: one prompt, one take, every model. Visitors browse the 6 × 5 = 30 artifacts, watch them side by side in sync, review them blind in pairs, and keep their own ratings locally, exporting and importing them as files.

**Non-goals**

- **No public voting, leaderboard, or vote counters.** There is no backend. Every rating lives in the viewer's browser or in a file they export. The UI never shows aggregate numbers it doesn't have.
- No automated "design quality" score. Render validity (did it paint?) is measured; quality is judged by humans.
- No VLM judge, no repair loop, no second take (matches the sibling's one-shot purity rule).
- No server-side code, no third-party CDN, no analytics, no external fonts.

---

## 2. Research takeaways

### Sibling: `JamesTsetsekas/oneshot-arcade` (reuse its conventions)

- Plain HTML/CSS/JS dashboard (`arcade/app.js`, about 19 KB) with no build step. State lives in the URL hash (`#view=game&game=…&hide=…`), and DOM is built with an `h()` helper that only uses `append` and attributes, never `innerHTML`. **Keep all three.**
- `catalog/models.json` (id = folder name, plus label, vendor, model, harness, effort, color) and `catalog/games.json`. Per-build `oneshot.json` carries schema, status, harnessVersion, timestamps, durationMinutes, tests, stack, summary, selfScore, report, notes, and purity. **Mirror these field names** so tooling and readers carry over.
- Views: Matrix, By game ("the fairest comparison"), By model, plus a detail panel. **Same three views here, with the prompt taking the game's place.**
- `scripts/check.mjs` validates the catalog. `scripts/build-site.mjs` assembles `site/` and generates `data/catalog.json`.
- Deploys by force-pushing an orphan `gh-pages` branch with `contents: write`. **Deviate:** use `actions/upload-pages-artifact` plus `actions/deploy-pages` with least privilege (see §10).
- The model lineup and colors are already defined there. Reuse the same ids so both dashboards can cross-link.

### `jdmnk/design-benchmark` (borrow the render pipeline ideas)

- One brief, many models, one self-contained HTML page each. Pages are rendered in headless Chromium with fixed-viewport screenshots and tiled into a grid. Animated briefs produce per-model `clip.mp4` plus a composed `grid.mp4`.
- **Determinism:** a seeded `Math.random` plus a frozen virtual clock driving `requestAnimationFrame`, `performance.now`, and `Date.now`, stepped one frame at a time, so a 2 fps software-WebGL scene still yields a smooth 24 fps clip. **Adopt this for capture and for live sync.**
- **"Did it render" is separate from quality.** A `render` verdict per result, blank detection (luminance stddev under about 2), truncation as a first-class signal, and `pageerror` capture. The headline is a render rate, not a score. **Adopt.**
- Libraries come through a local importmap pointing at pinned, vendored copies (offline and deterministic). **Adopt with an allowlist.**
- Its design guide gives the isolation baseline: `<iframe sandbox="allow-scripts">` from a distinct origin, never `allow-scripts` together with `allow-same-origin`, CSP with `connect-src 'none'`, and the warning that synchronous JS can't be interrupted from outside its thread. **Adopt, adapted to GitHub Pages limits (§8).**
- Recommended reporting: (1) render rate, (2) quality conditioned on rendering, (3) pairwise ranking. Don't collapse these into one number.

### `svgbench.ai/best` (borrow the review UX, not the public voting)

- An arena with blind side-by-side pairs where the model is revealed only after voting, a "both bad" outcome, a per-prompt "best" gallery (one winner per prompt rather than one model's portfolio), a leaderboard, and a non-voting "sandbox" compare mode.
- Its "best" selection weighs support, so a lucky early win doesn't count as much as a result that survived many comparisons. **Adopt as the "Your picks" view, computed from local votes with a minimum-support rule.**
- It shows live global counters (models, prompts, generations, votes). **Do not copy.** Our only counts are catalog facts (6 prompts, 5 models, 30 artifacts, render rate) and "your N local votes".

---

## 3. Lineup and prompt slots

### Models (5): ids reused from the sibling

| Column | id (folder) | Label | Harness | Effort |
| --- | --- | --- | --- | --- |
| 1 | `gpt-6-astra-high` | GPT-6 Astra | Codex | high |
| 2 | `gpt-6.1-sol-high` | GPT-6.1 Sol | Codex | high |
| 3 | `claude-fable-5.2-high` | Fable 5.2 | Claude Code | high* |
| 4 | `claude-opus-5.5-high` | Opus 5.5 | Claude Code | high* |
| 5 | `claude-sonnet-5.5-high` | Sonnet 5.5 | Claude Code | high* |

\* The request names effort only for Astra and Sol. "high" for the Claude models matches the sibling and needs confirmation.

### Prompt slots (6): briefs are written in stage two

The briefs themselves are out of scope here. The slots are fixed now because the dashboard's playback, sync, and capture requirements depend on the type of media each one produces. Each brief must be original: no recreations of existing brands, characters, games, or artworks.

| # | Slot id (provisional) | Media type | Motion | Sync source | Interaction |
| --- | --- | --- | --- | --- | --- |
| 01 | `vector-illustration` | Static SVG-in-HTML scene | none | n/a (poster) | no |
| 02 | `generative-loop` | Canvas 2D generative loop | rAF | virtual clock | no |
| 03 | `css-scene` | Pure HTML/CSS animated scene | CSS animations | Web Animations API | no |
| 04 | `shader-world` | WebGL / three.js 3D scene | rAF | virtual clock | no |
| 05 | `interactive-toy` | Pointer-driven toy | rAF + input | scripted input during capture | **yes** |
| 06 | `kinetic-type` | Kinetic typography / motion poster (SVG + CSS/SMIL/WAAPI) | mixed | WAAPI + SMIL + clock | no |

**Artifact contract** (enforced by the harness prompt in stage two and by `check.mjs` here):

- A single self-contained `artifact.html` of at most 512 KB, with a fixed logical viewport of 1280×800.
- No network access. The only library bare specifiers allowed are those on the vendored allowlist (proposed: `three` and `three/addons/*`, pinned).
- No external fonts, images, or audio. Assets are procedural or inline `data:`.
- No self-identification: the artifact must not name the model or vendor, because that would break blind review.

---

## 4. Information architecture and views

There is one page (`index.html`) with hash routing in the style of the sibling, for example `#view=prompt&prompt=css-scene&sync=1`. Every view is deep-linkable.

### 4.1 Header (all views)

- Title, a short "one prompt, one take, every model" line, and a link to the sibling arcade.
- Catalog stats: `6 PROMPTS · 5 MODELS · 30 ARTIFACTS · RENDERED 28/30`. Render rate comes from capture verdicts.
- A local-ratings chip, `Your ratings: 37 votes (local only)`, that opens the Ratings panel.
- Nav: **Matrix · By prompt · By model · Blind review · Your picks · Ratings**.
- Model visibility toggles (`hide=` in the hash, like the sibling) and a theme toggle. `prefers-reduced-motion` defaults all playback to paused posters.

### 4.2 Matrix (default)

- A 6-row (prompt) × 5-column (model) grid. Column order and model colors come from `catalog/models.json`.
- Each cell shows the poster (`poster.webp`, lazy-loaded), a status pill (`complete / partial / failed / missing`), a render badge (`ok / blank / error / timeout / truncated`), and, when present, your local standing for that artifact (for example `W 4 · L 1`).
- Hovering or focusing a cell plays its muted clip in place. Only one clip plays at a time in the matrix.
- Clicking a row header opens By prompt. Clicking a column header opens By model. Clicking a cell opens Artifact detail.
- **No live iframes in the matrix**, only posters and clips (§8.5).

### 4.3 By prompt: the fairest comparison

- Shows the full brief text (rendered as text, see §8.6) and five panes, one per visible model, at the same scaled 1280×800 logical size.
- **Synchronized playback bar:** play/pause, a scrubber, speed (0.25×, 0.5×, 1×), frame step (±1 frame), loop, and a mode switch between **Clips** (default, pre-captured video) and **Live** (sandboxed execution, opt-in).
- Layout options: a 5-up row, a 2+3 grid, or a "focus + strip" layout (one large pane, four small). The arrangement persists per viewer in `localStorage`.
- Prompt 05 (`interactive-toy`) defaults to Live with sync off. Each pane receives its own pointer input and a "replay scripted input" clip is offered.

### 4.4 By model

One model's six artifacts as a grid of posters and clips, with per-artifact render verdicts, durations, and sizes. It reuses the same synchronized playback bar. Sync across different prompts is purely temporal: all clips share the same t.

### 4.5 Artifact detail (modal route `#…&artifact=<aid>`)

- **Stage:** a large pane with Clip / Live / Poster tabs. Live is a sandboxed frame (§8). Until the viewer clicks "Run live", the stage shows the poster with a play overlay. Artifacts whose capture verdict was `timeout` require an extra confirmation ("This artifact hung during capture and may freeze this tab").
- **Facts:** model, harness, effort, run date, duration, artifact bytes, sha256 prefix, libraries used, render verdict, console error count with the first three messages (as text), capture seed, viewport, and fps.
- **Prompt:** the brief text, plus a link to the harness version.
- **Model report:** the model's `REPORT.md`, rendered as pre-escaped text (§8.6). No self-score is displayed (see §13).
- **Source:** a read-only source viewer built with `textContent` inside `<pre>` with line numbers, plus a "Download source" link (`download` attribute on the `.txt` file). **There is never an "open raw in new tab" link** (§8.2).
- **Your notes:** a free-text local note per artifact, included in exports.

### 4.6 Blind review (pair arena, local only)

- **Pair selection:** only artifacts of the same prompt are compared. There are 6 prompts × C(5,2) = **60 unique pairs**. The scheduler covers all 60 once in shuffled order before repeating anything, then prioritizes the pairs with the fewest local judgments. Left/right placement is randomized per presentation, and the scheduler balances sides over time.
- **What is hidden:** model names, colors, folder ids, file sizes, durations, and render verdict wording. Panes are labelled only **A** and **B**. Media URLs use opaque artifact ids (§5.4). Artifacts that failed (`missing`/`failed`) are excluded, and `blank` ones are included, because a blank render is a legitimate loss.
- **Playback:** clips synced by default with the same controls as By prompt. Live is optional, and prompt 05 uses Live.
- **Outcomes:** `A better`, `B better`, `Tie`, `Both bad`, `Skip`. Optional 1–5 sub-scores can be expanded but are never required: *Prompt fidelity*, *Visual craft*, *Motion* (hidden for prompt 01).
- **Keyboard:** `←` A, `→` B, `↓` tie, `X` both bad, `S` skip, `Space` play/pause, `,`/`.` frame step.
- **After the vote:** the identities are revealed ("A was Opus 5.5, B was GPT-6.1 Sol"), with "next pair" and "undo last vote".
- **Progress:** `37 / 60 pairs judged`, plus a per-prompt coverage bar.
- **Copy rule:** the page says "Your ratings are stored only in this browser. Export them to keep them." It never says "submit" or "vote count".

### 4.7 Your picks (local "best" gallery)

- One card per prompt showing your current top artifact, computed from local votes (§6.3). A card is shown only when that artifact has at least 3 judged comparisons; otherwise it reads "Not enough of your votes yet (n/3)".
- Below the cards is a per-model local standing table: wins, losses, ties, both-bad, win rate, and a Bradley–Terry strength with a low-confidence marker. It is always captioned "Based on N votes from this browser and M imported files."

### 4.8 Ratings panel

- Counts: votes, notes, imported sources, and stale votes (those tied to an artifact hash that has since changed).
- **Export** downloads `oneshot-canvas-ratings-YYYYMMDD.json` as a client-side Blob.
- **Import** takes one or more files through a file picker (or drag and drop), validates each one, and shows a dry-run summary (`+21 new, 4 duplicates, 2 stale, 0 invalid`) before merging.
- **Reviewer label:** optional and free text, stored only locally and in exports.
- **Clear local ratings:** asks for typed confirmation and offers an export first.
- **Source filter:** standings can use mine only, imported only, or all.

---

## 5. Data schemas

All schemas are JSON Schema 2020-12 files in `schemas/`, validated by `scripts/check.mjs` in CI. Ids are `^[a-z0-9][a-z0-9.-]{1,47}$`.

### 5.1 `catalog/models.json`

The sibling's format, unchanged: `{ "models": [ { id, label, vendor, model, harness, effort, color } ] }`. Order controls column order.

### 5.2 `catalog/prompts.json`

```jsonc
{
  "schema": 1,
  "harnessVersion": "v1",                 // prompts/VISUAL-HARNESS.md version
  "prompts": [
    {
      "id": "css-scene",
      "order": 3,
      "name": "…",                          // set in stage two
      "slot": "css-scene",
      "brief": "prompts/visual/03-css-scene.md",
      "pitch": "…",
      "media": "css",                       // static | canvas | css | webgl | interactive | mixed
      "motion": true,
      "interactive": false,
      "capture": { "durationMs": 8000, "fps": 30, "preRollMs": 1000, "posterAtMs": 4000,
                   "viewport": [1280, 800], "seed": 7,
                   "input": null }          // prompt 05: path to a scripted input track
    }
  ]
}
```

### 5.3 `entries/<model>/<prompt>/entry.json` (mirrors the sibling's `oneshot.json`)

```jsonc
{
  "schema": 1,
  "prompt": "css-scene",
  "model": "claude-opus-5.5-high",
  "status": "complete",                     // complete | partial | failed | missing
  "purity": "one-shot",
  "harnessVersion": "v1",
  "date": "2026-11-20",
  "startedAt": "…Z", "finishedAt": "…Z", "durationMinutes": 14,
  "artifact": { "file": "artifact.html", "bytes": 48213,
                "sha256": "…", "libraries": ["three@0.170.0"] },
  "summary": "…",                           // plain text, ≤ 400 chars
  "report": "REPORT.md",
  "notes": "…",                             // plain text
  "render": {                               // written by scripts/capture.mjs, never by the model
    "verdict": "ok",                        // ok | blank | error | timeout | truncated
    "consoleErrors": 0, "firstErrors": [],
    "lumaStdDev": 41.7,
    "capturedAt": "…Z", "captureVersion": "c1",
    "poster": "capture/poster.webp", "clip": "capture/clip.mp4",
    "durationMs": 8000, "fps": 30, "seed": 7, "viewport": [1280, 800]
  }
}
```

### 5.4 Generated `site/data/catalog.json` (the dashboard's only data input)

```jsonc
{
  "schema": 1,
  "catalogHash": "sha256:…",                // hash of everything below; exports record it
  "builtAt": "…Z",
  "models":  [ /* from 5.1 */ ],
  "prompts": [ /* from 5.2, plus "briefText": "…" (plain text) */ ],
  "artifacts": [
    {
      "aid": "a7f3c91e2b",                  // opaque id = first 10 hex of sha256(salt|prompt|model)
      "prompt": "css-scene", "model": "claude-opus-5.5-high",
      "status": "complete", "sha256": "…",
      "src": "a/a7f3c91e2b/src.txt",        // artifact source, served as text/plain
      "poster": "a/a7f3c91e2b/poster.webp",
      "clip": "a/a7f3c91e2b/clip.mp4",
      "render": { /* verdict, errors, fps, durationMs, seed */ },
      "facts":  { /* bytes, durationMinutes, libraries, date */ },
      "summary": "…", "reportText": "…"     // plain text
    }
  ]
}
```

Blind review needs the `aid` and the media paths without the model, so blind-mode code reads artifacts through a `blindView(aid)` accessor that returns only `{aid, prompt, src, poster, clip}`. Blindness protects against casual identification only. The catalog is public and a determined viewer can de-anonymize; the UI says so in a footnote.

### 5.5 Local storage (per browser)

The keys are namespaced because every `jamestsetsekas.github.io/*` project site, including the arcade, shares one origin and one `localStorage`.

- `oneshot-canvas:v1:ratings`: `{ votes: Vote[], notes: {aid: string}, reviewer: string|null, imports: ImportRecord[] }`
- `oneshot-canvas:v1:prefs`: layout, theme, hidden models, playback mode

Every access is wrapped in try/catch. If storage is unavailable, the app runs from memory and shows a persistent "Storage unavailable: export before leaving" banner.

### 5.6 Ratings export file

```jsonc
{
  "format": "oneshot-canvas-ratings",
  "version": 1,
  "exportedAt": "2026-11-21T18:02:11Z",
  "catalogHash": "sha256:…",
  "reviewer": null,                          // optional free text, ≤ 80 chars
  "votes": [
    {
      "id": "3f1c…",                         // crypto.randomUUID()
      "createdAt": "…Z",
      "prompt": "css-scene",
      "left":  { "aid": "a7f3c91e2b", "sha256": "…" },
      "right": { "aid": "19be04d7aa", "sha256": "…" },
      "outcome": "left",                     // left | right | tie | both_bad
      "criteria": { "fidelity": [4, 3], "craft": [5, 3], "motion": [4, 2] },  // optional, [left, right]
      "mode": "blind",                       // blind | open
      "playback": "clip",                    // clip | live
      "elapsedMs": 21400
    }
  ],
  "notes": { "a7f3c91e2b": "…" }
}
```

- Votes reference `aid` plus `sha256`, never the model. Model attribution is resolved at aggregation time. If an artifact's hash no longer matches the catalog, the vote is **stale**: it is kept, but excluded from standings by default.
- Skips are not stored.
- Exports are deterministic (stable key order, votes sorted by `createdAt`, then `id`) so diffs stay readable.

---

## 6. Rating logic (client-side, pure functions)

### 6.1 Merge on import

- Dedupe by `vote.id`. If two votes share an id but have different content, keep the first and count a conflict.
- Validate against `schemas/ratings-export.schema.json`. The file must be at most 5 MB, contain at most 50,000 votes, and pass `catalogHash` / unknown-`aid` checks. Votes for unknown aids are rejected; votes with a hash mismatch become stale.
- Parse with `JSON.parse` and copy into null-prototype objects using only known keys. `__proto__`, `constructor`, and `prototype` keys are dropped.
- The import record `{fileName, importedAt, reviewer, counts}` is stored. Imported votes are tagged `source: importId`.

### 6.2 Standings

For each pair of models within a prompt, and in aggregate:

- W/L/T/both_bad counts. Win rate = (W + 0.5·T) / (W + L + T). `both_bad` is reported separately and doesn't enter the win rate.
- Bradley–Terry strengths are fit by MM iterations with a weak symmetric prior (one virtual tie against every opponent) so sparse data stays finite. The result is shown as a relative scale, not an Elo number.
- The low-confidence marker appears when a model has fewer than 10 judged comparisons, or when any of its pairs has none. Non-transitive cycles among the top three are noted as "inconsistent preferences".

### 6.3 Your picks

Per prompt, the artifact with the highest local win rate that has at least 3 judged comparisons. Ties are broken by more comparisons, then by fewer both-bad outcomes.

---

## 7. Synchronized animation

### 7.1 Clips mode (default and authoritative)

- All clips for a prompt share an identical duration, fps, and seed (from `prompts.json` capture settings), all captured by the same deterministic pipeline.
- **Master clock:** `t = (performance.now() − t0) · rate`, looped at `durationMs`. On each rAF, for every visible `<video>`:
  - drift above 120 ms: hard seek with `currentTime = t`
  - drift of 20–120 ms: nudge `playbackRate` within 0.95–1.05 to converge
  - drift under 20 ms: keep `rate`
- **Start gate:** the clock starts only after every pane fires `canplaythrough` (shown as a "Buffering 3/5" state), then all panes play in the same frame.
- **Frame step:** pause, then `t ± 1/fps`, applied to all panes.
- **Hidden tab:** pause on `visibilitychange` and resume in sync.

### 7.2 Live mode (best effort)

The frame shim (§8.3) replaces timing sources before any artifact code runs:

- **rAF / `performance.now` / `Date.now`:** a virtual clock. rAF callbacks get the virtual timestamp, and pausing stops dispatch.
- **`Math.random`:** seeded PRNG (mulberry32 with the prompt's seed).
- **CSS animations/transitions and WAAPI:** `document.getAnimations()`, each paused, with `currentTime = t` on seek.
- **SVG SMIL:** `svg.pauseAnimations()` / `setCurrentTime(t/1000)` on every `<svg>`.

Protocol over a dedicated `MessageChannel` port per frame:

| Direction | Message | Fields |
| --- | --- | --- |
| parent → frame | `load` (initial `postMessage`, carries the port) | `html`, `seed`, `viewport` |
| parent → frame | `clock` | `playing`, `t`, `rate`, `seq` |
| frame → parent | `ready` | `seq` |
| frame → parent | `heartbeat` | `t` (every 500 ms) |
| frame → parent | `error` | `message` (≤ 300 chars) |

- The parent re-sends `clock` every 500 ms while playing, which corrects drift. Artifact code can defeat the shim; that only breaks its own sync, never isolation.
- **Fallback:** an artifact that ignores the clock (for example a raw `setInterval` animation) gets an "unsynced" badge, which the parent sets when heartbeat `t` diverges from the master clock by more than 1 s.

---

## 8. Security: isolating untrusted model output

### 8.1 Threat model

Model-written HTML/JS is untrusted. It may, by accident or on purpose:

- read or modify the dashboard DOM or `localStorage` (ratings, prefs, and also the sibling arcade's storage on the shared `jamestsetsekas.github.io` origin)
- exfiltrate data over the network
- navigate the top window, open popups, or show modal dialogs
- spoof dashboard messages
- self-identify to break blindness
- hang the tab

GitHub Pages **cannot set response headers** (no CSP header, no `Content-Security-Policy: sandbox`, no COOP/COEP), and every project site under the account shares one origin. The design has to work within those limits.

### 8.2 Rule 1: entrant HTML is never served as `text/html`

- The build publishes each artifact only as `a/<aid>/src.txt`, which Pages serves as `text/plain`. No entrant `.html`, `.svg`, or `.xml` file exists anywhere in `site/`, so no URL can make untrusted code run as a top-level document on the shared origin.
- The source viewer and "Download source" use this `.txt` file. There is no "open in new tab" path.

### 8.3 Rule 2: execution happens only inside the trusted frame host, in an opaque origin

`site/frame.html` is our own small page with all script inline. Its meta CSP is written for untrusted content:

```
default-src 'none'; script-src 'unsafe-inline' <VENDOR_BASE>; style-src 'unsafe-inline';
img-src data: blob:; font-src data:; media-src data: blob:; worker-src blob:;
connect-src 'none'; frame-src 'none'; child-src blob:; form-action 'none'; base-uri 'none'; object-src 'none'
```

`<VENDOR_BASE>` is the absolute vendored-library URL for the deploy target, injected at build time.

The dashboard embeds it as:

```html
<iframe src="frame.html" sandbox="allow-scripts" allow="" referrerpolicy="no-referrer"
        loading="lazy" title="Artifact A"></iframe>
```

- **`sandbox="allow-scripts"` only.** No `allow-same-origin`, which gives the frame an opaque origin with no access to parent DOM, storage, or cookies. Also no `allow-top-navigation*`, `allow-popups`, `allow-modals`, `allow-forms`, `allow-downloads`, or `allow-pointer-lock`.
- An empty `allow=""` denies camera, microphone, geolocation, and other powerful features.
- **Load sequence:**
  1. The parent fetches `src.txt` (same-origin).
  2. It creates a `MessageChannel` and posts `{type:"load", html, seed}` with port2 to `iframe.contentWindow` (targetOrigin `"*"`, which is required for an opaque origin; the window reference is what targets the message).
  3. The frame host accepts exactly one `load`, only when `event.source === window.parent`.
  4. It then calls `document.open()`, writes the **shim script** followed by the artifact HTML, and calls `document.close()`. The CSP meta from `frame.html` stays in force for the written document.
- **Self-check:** the frame host refuses to render, showing a static "This page only runs inside the dashboard sandbox" message, unless `self.origin === "null"` **and** `window.top !== window`. This proves it is sandboxed without same-origin, so a third-party page that frames `frame.html` without a sandbox can't use it to run code on our origin.
- **Shim insertion and doctype:** the artifact's leading `<!doctype html>` must stay the first token, or the document drops into quirks mode. The shim is therefore inserted as the first child of `<head>` with a real HTML parser (parse5) **at build time**. `src.txt` holds the final shim-injected document, and its `sha256` is recorded for both the original and the injected form.

### 8.4 Rule 3: the parent trusts nothing from the frame

- The parent only listens on the per-frame port, never on `window` `message` events. Every message is validated against the §7.2 schema, and unknown types are dropped.
- Port messages are rate-limited to 30 per second per frame, and excess messages are dropped.
- Messages never cause DOM insertion beyond `textContent`, never navigate, and never touch ratings. Votes come only from parent UI events.
- One port per frame means one frame cannot impersonate another.

### 8.5 Rule 4: contain hangs and resource abuse

Synchronous infinite loops can't be interrupted from outside, and a sandboxed frame may share a process with the dashboard depending on browser and version. Mitigations:

- Clips and posters are the default everywhere, and they execute no untrusted code. Live mode is always an explicit click.
- At most 5 live frames at once (By prompt) or 2 (Blind review), and none in the matrix. Frames that scroll offscreen are unmounted by IntersectionObserver.
- **Watchdog:** if no heartbeat arrives for 3 s, the parent removes the iframe and shows "Stopped: unresponsive". This works whenever the browser isolated the frame's process. Where it didn't, the capture-time `timeout` verdict gates live runs behind a warning (§4.5).
- Capture records peak JS heap and frame time. Artifacts over budget (heap > 512 MB, or any single frame > 2 s) are flagged `heavy`, and their Live mode shows a warning.

### 8.6 Rule 5: trusted chrome renders untrusted text as text

- Model-written metadata (`summary`, `notes`, `REPORT.md`, console error strings) and imported data (reviewer labels, notes) are inserted only with `textContent` or attribute setters via the sibling-style `h()` helper.
- `innerHTML`, `insertAdjacentHTML`, `outerHTML`, `document.write` in the parent, `eval`, and `new Function` are banned in dashboard code and enforced by a grep test.
- `REPORT.md` is converted at build time to plain text with minimal structure (headings and lists as text lines). No markdown-to-HTML conversion happens in the browser.

### 8.7 Rule 6: the dashboard's own CSP

`index.html` carries a meta CSP. Because the frame is a real URL navigation, not `srcdoc`, the frame doesn't inherit this policy.

```
default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self';
connect-src 'self'; frame-src 'self'; font-src 'self'; form-action 'none'; base-uri 'none'; object-src 'none'
```

There are no inline scripts or styles in the dashboard, and no third-party origins.

### 8.8 Blindness hygiene

- `check.mjs` scans each artifact (case-insensitive) for model and vendor names (`gpt`, `openai`, `astra`, `sol`, `claude`, `anthropic`, `fable`, `opus`, `sonnet`, `codex`) inside visible text, `<title>`, comments, and metadata. Matches are flagged `self-identifies` and surfaced in Artifact detail. In stage two, the harness prompt forbids self-identification.
- Opaque `aid`s use a salt fixed per catalog version, so paths don't reveal the model.

### 8.9 Optional hardening

Serving the site from a custom domain, or from a separate account's Pages origin, would separate it from the arcade's origin. This removes the shared-`localStorage` concern (arcade builds run top-level on the shared origin and could in principle read or alter our ratings). This is recommended but not required, and it's listed in §13. Exported files are the durable record either way, and the UI encourages exporting.

---

## 9. Repository layout

```
catalog/models.json            lineup (ids shared with oneshot-arcade)
catalog/prompts.json           six prompt slots + capture settings
prompts/VISUAL-HARNESS.md      one-shot wrapper every model receives (stage two)
prompts/visual/0N-*.md         briefs, given verbatim (stage two)
entries/<model>/<prompt>/      entry.json, artifact.html, REPORT.md, capture/{poster.webp,clip.mp4}
fixtures/                      synthetic test artifacts (benign + hostile), never shipped in prod builds
schemas/                       models, prompts, entry, catalog, ratings-export (.schema.json)
dashboard/                     index.html, app.js (+ modules), style.css, frame.html, shim.js
vendor/                        pinned three.js (allowlisted libraries only)
scripts/check.mjs              validate schemas, ids, budgets, banned patterns, blindness scan
scripts/capture.mjs            Playwright deterministic posters/clips + render verdicts
scripts/build-site.mjs         parse5 shim injection, opaque ids, catalog.json, assemble site/
scripts/serve.mjs              local static server (127.0.0.1:4170)
tests/unit/                    node:test – merge, standings, scheduler, schemas, sync math
tests/e2e/                     @playwright/test – views, sync, blind flow, ratings, security
.github/workflows/pages.yml    check → test → build → deploy-pages
```

Tooling follows the sibling: Node 22.12+, npm, and vanilla ES modules with no framework or build step for the dashboard. Dev dependencies are `@playwright/test`, `parse5`, `ajv`, `sharp` (blank detection, poster encoding), and `ffmpeg-static` (clips), all pinned.

---

## 10. Offline static deployment

- **Static only:** `site/` contains HTML, JS, CSS, JSON, `.txt`, `.webp`, `.mp4`, and vendored libraries, plus `.nojekyll`. Hash routing means no 404 rewrites are needed. All URLs are relative, so the site works under `/oneshot-canvas/` and at a local root.
- **No external requests:** no CDNs, fonts, analytics, or beacons. A build check fails on any `http(s)://` reference in shipped dashboard files other than the injected `VENDOR_BASE`.
- **Local use:** `npm start` serves `site/` on 127.0.0.1 and works with networking disabled. `file://` is not supported because `fetch` of local files is blocked; the README says so.
- **Capture is committed, not run in CI:** posters and clips are produced locally by `npm run capture` and committed with the entry. CI only validates them (present, hashes, durations). This keeps CI deterministic and fast, unlike the sibling's 120-minute build job.
- **Workflow:** on push to `main`, run `npm ci`, then `npm run check`, then unit tests and e2e against fixtures, then `npm run build`, then `actions/upload-pages-artifact` and `actions/deploy-pages`. Permissions are `contents: read`, `pages: write`, `id-token: write`. There is no force-pushing of branches and no `contents: write`.
- **Budgets:** about 100 KB per poster, 3 MB or less per clip (H.264 MP4, 1280×800 downscaled to 960×600, 8 s), and 150 MB or less for the whole site, well under the Pages 1 GB limit.

---

## 11. Milestones

Each milestone ends green on its acceptance tests (§12). The fixtures are hand-written synthetic pages, clearly labelled as fixtures. They are not entrants.

| M | Name | Scope | Exit criteria |
| --- | --- | --- | --- |
| **M0** | Contracts and scaffold | Repo layout, `models.json` (sibling ids), `prompts.json` with six slots, all schemas, `check.mjs`, fixtures: `fx-static`, `fx-canvas-loop`, `fx-css-anim`, `fx-smil`, `fx-three` (vendored import), `fx-interactive`, `fx-blank`, `fx-throws`, `fx-hang`, `fx-hostile`, `fx-selfid`, `fx-quirks-bait` | AT-01…AT-04 |
| **M1** | Isolation spike (go/no-go) | `frame.html` host, opaque-origin self-check, `document.write` path, CSP meta persistence, parse5 shim injection, vendored ES-module loading from an opaque origin (needs CORS from Pages; **fallback:** inline the vendored module into `src.txt` at build time), tested on Chromium, Firefox, and WebKit | AT-20…AT-31 pass in all three engines; decision on vendor loading recorded in `docs/decisions/0001-isolation.md` |
| **M2** | Capture pipeline | `capture.mjs`: Playwright, network routed to deny-all except the local server, virtual clock + seed, poster at `posterAtMs`, clip at fixed fps, scripted input for interactive prompts, verdicts (blank by luma stddev < 2 calibrated on fixtures, error, timeout at 20 s, truncated by missing closing tag) | AT-05…AT-08 |
| **M3** | Build and site assembly | `build-site.mjs`: opaque aids, `src.txt` emission, brief/report to text, `catalog.json` + `catalogHash`, budget and external-URL checks, `.nojekyll`; `serve.mjs` | AT-09…AT-12 |
| **M4** | Dashboard shell and browse views | Header, stats, nav, hash routing, model toggles, Matrix, By prompt, By model (posters + hover clips), reduced-motion default, responsive layout down to 360 px | AT-13…AT-16 |
| **M5** | Synchronized playback | Master clock, drift correction, start gate, scrubber, speed, frame step, loop, visibility pause; Live mode with clock protocol, watchdog, unsynced badge, live-frame caps | AT-17…AT-19, AT-32, AT-33 |
| **M6** | Artifact detail | Stage tabs, facts, prompt, report text, source viewer, download, local notes, timeout/heavy gating | AT-34…AT-36 |
| **M7** | Blind review and local ratings | Pair scheduler, blind accessor, outcomes, sub-scores, keyboard, reveal, undo, progress; storage layer with fallback banner; export, import with dry-run and merge; standings, Bradley–Terry, Your picks | AT-37…AT-48 |
| **M8** | Deploy and hardening | Pages workflow, offline run, a11y pass (axe, keyboard-only blind review), performance budget, banned-API lint, README with "how ratings work" and "how isolation works" | AT-49…AT-55 |

Stage two (not in this plan): write `VISUAL-HARNESS.md` and the six briefs, run 30 one-shots, capture them, and commit the entries. The dashboard must already render correctly with any subset of entries missing.

---

## 12. Acceptance tests

Unit tests use `node:test`. E2E tests use `@playwright/test` against `npm start` on fixtures, in Chromium, Firefox, and WebKit unless noted.

### Contracts and build

- **AT-01:** `npm run check` passes on the scaffold. A catalog with a duplicate id, a bad id pattern, an unknown model/prompt in an entry, or an artifact over 512 KB fails, with a message naming the file.
- **AT-02:** Every schema rejects unknown top-level keys and accepts the documented examples in §5.
- **AT-03:** The blindness scan flags `fx-selfid` (contains "made by Claude" in a comment and in the `<title>`) and doesn't flag other fixtures.
- **AT-04:** The banned-API grep fails if `dashboard/**/*.js` contains `innerHTML`, `insertAdjacentHTML`, `outerHTML`, `eval(`, `new Function`, or `document.write` (the last is allowed only in `frame.html`).
- **AT-05:** Capturing `fx-canvas-loop` twice yields a byte-identical poster and frame-identical clip (per-frame pixel hash).
- **AT-06:** Capture verdicts: `fx-blank` → `blank`, `fx-throws` → `error` with `firstErrors[0]` populated, `fx-hang` → `timeout` within 25 s with the runner still alive, a truncated copy of `fx-static` → `truncated`.
- **AT-07:** During capture, Playwright's request log shows zero requests to any host other than the local server, and `fx-hostile`'s `fetch('https://example.com')` attempt is recorded as blocked.
- **AT-08:** `fx-interactive` replays its scripted input track deterministically (two captures identical).
- **AT-09:** `site/` contains no files with extension `.html`, `.htm`, `.svg`, `.xhtml`, or `.xml` under `site/a/`. The only `.html` files in `site/` are `index.html` and `frame.html`.
- **AT-10:** Every `aid` is 10 hex characters, unique, and not derivable without the salt, and no site path contains a model id string.
- **AT-11:** The parse5 injection keeps `<!doctype html>` first. Inside the live frame, `document.compatMode === "CSS1Compat"` for every fixture that declares a doctype, including `fx-quirks-bait` (leading comment + doctype).
- **AT-12:** The external-URL check fails the build when `dashboard/style.css` references `https://fonts.googleapis.com`.

### Browse views

- **AT-13:** The Matrix renders 6 × 5 cells from a catalog with only 12 entries. The missing ones show "Not run yet", and none error.
- **AT-14:** Hash routes round-trip: loading `#view=prompt&prompt=css-scene&hide=gpt-6-astra-high` renders By prompt with 4 panes, and navigation updates the hash without adding history entries (matches the sibling).
- **AT-15:** With `prefers-reduced-motion: reduce` emulated, no `<video>` is playing after load and every pane shows its poster.
- **AT-16:** At a 360 px viewport there is no horizontal page scroll, and the matrix becomes a horizontally scrollable region with sticky prompt labels.

### Synchronized playback

- **AT-17 (Clips sync):** In By prompt with 5 clips at 1×, after 10 s of playback every `video.currentTime` is within 50 ms of the master clock (sampled 20 times). After a scrub to 5.000 s, all panes are within 1 frame (33 ms) of it.
- **AT-18:** Frame step with `.` advances every pane by exactly 1/fps. Speed 0.5× halves the progression rate (±5%).
- **AT-19:** Playback doesn't start until all panes report `canplaythrough`. With one clip artificially delayed by 2 s, no pane advances during the delay.
- **AT-32 (Live sync):** In Live mode, `fx-canvas-loop`, `fx-css-anim`, and `fx-smil` report heartbeat `t` within 100 ms of the master clock while playing. On pause, a pixel hash of each frame (via the capture harness) is stable across 1 s.
- **AT-33:** A frame using `setInterval` animation gets the "unsynced" badge within 2 s.

### Isolation (run in all three engines, using `fx-hostile`)

`fx-hostile` attempts every attack below and reports each outcome through its own port. Tests assert the dashboard-side ground truth, not the frame's claims.

- **AT-20:** Accessing `parent.document` / `top.document` throws; the dashboard DOM checksum is unchanged.
- **AT-21:** `localStorage`, `sessionStorage`, `indexedDB.open`, and `document.cookie` throw or are unavailable in the frame. A canary key set in the dashboard's `localStorage` is unchanged and unread.
- **AT-22:** `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `navigator.sendBeacon`, `new Image().src = 'https://…'`, and `<link rel=prefetch>` to external hosts produce zero network requests (Playwright request log) and fire `securitypolicyviolation` in the frame.
- **AT-23:** `top.location = …`, `window.open(…)`, `<a target=_top>` click, and `<form action=… target=_top>` submit leave the dashboard URL unchanged and open no pages.
- **AT-24:** `alert`, `confirm`, and `prompt` produce no dialog (Playwright `dialog` event never fires).
- **AT-25:** Requests for camera, mic, and geolocation are denied without a permission prompt.
- **AT-26:** Port messages with an unknown `type`, oversized payloads (> 4 KB), or a fake `vote` are dropped. A 1,000-message burst is rate-limited, the vote count stays unchanged, and the dashboard stays responsive (input latency < 100 ms).
- **AT-27:** `window.postMessage` from the frame to the parent's window (not the port) has no effect.
- **AT-28:** Loading `frame.html` top-level shows the refusal message and executes nothing. Loading it inside an iframe **without** `sandbox` on a test page shows the refusal (origin not `"null"`).
- **AT-29:** A test page on the same origin posting a malicious `load` to an unsandboxed `frame.html` doesn't execute the payload.
- **AT-30:** Requesting `site/a/<aid>/src.txt` returns `Content-Type: text/plain` locally, and on the deployed Pages URL (smoke test in M8). Navigating to it renders source text, not a page.
- **AT-31:** `fx-hostile`'s attempt to inject a more permissive `<meta http-equiv=Content-Security-Policy>` doesn't loosen the policy (fetch still blocked).

### Artifact detail

- **AT-34:** Detail never auto-runs live code. The poster shows until "Run live" is clicked. For a `timeout` artifact, a confirmation step precedes execution.
- **AT-35:** An entry whose `summary` is `<img src=x onerror=alert(1)>` and whose report contains `<script>` displays both as literal text, and no dialog fires.
- **AT-36:** "Download source" downloads `src.txt` content byte-identical to the shipped file. No link anywhere opens artifact content top-level (DOM scan for `href`s into `a/` that lack `download`).

### Blind review and ratings

- **AT-37:** Over 60 consecutive pair presentations, every unique same-prompt pair appears exactly once, and each artifact appears on the left 40–60% of the time across 600 presentations (seeded scheduler, unit test).
- **AT-38:** In blind mode, before voting, the DOM, accessibility tree, `title` attributes, and media URLs of the review panel contain no model label, model id, vendor, or color value (scan against `models.json`).
- **AT-39:** Each outcome key stores exactly one vote with the correct `outcome`, `left/right aid + sha256`, and `mode: "blind"`, then reveals the identities. `S` stores nothing. Undo removes the last vote.
- **AT-40:** Ratings persist across reload. With storage blocked (Playwright context with storage disabled), voting still works in memory and the warning banner is visible.
- **AT-41:** Export produces a file valid against `ratings-export.schema.json`, with `catalogHash` matching, deterministic byte output for the same state, and zero network requests during export.
- **AT-42:** Export → clear → import restores the identical state. Importing the same file twice adds 0 votes and reports N duplicates.
- **AT-43:** Import rejects: non-JSON, wrong `format`, `version: 2`, a file over 5 MB, and votes referencing unknown aids. Each rejection produces a specific message, and existing state is unchanged.
- **AT-44:** An import containing `"__proto__": {"polluted": true}` at the top level and inside votes leaves `({}).polluted === undefined`. A reviewer label `<b onmouseover=…>` renders as text.
- **AT-45:** Votes whose `sha256` mismatches the current catalog are counted as stale and excluded from standings by default, with a toggle to include them.
- **AT-46 (Standings math, unit):** For a fixture vote set with known W/L/T, the win rates match hand-computed values. Bradley–Terry converges (Δ < 1e-6 within 500 iterations) and orders a clear A > B > C chain correctly. A 3-cycle is detected and flagged.
- **AT-47:** Your picks shows "Not enough of your votes yet (n/3)" for prompts below the threshold and the correct artifact otherwise.
- **AT-48:** No element anywhere contains the words "community", "global", "public votes", or a vote count not derived from local state (copy lint, plus DOM assertion that every displayed count equals the local store).

### Deploy and quality

- **AT-49:** The workflow uses `actions/deploy-pages` with only `contents: read`, `pages: write`, and `id-token: write`, and fails when `check` or any test fails.
- **AT-50 (Offline):** With `site/` served by `npm start` on a machine with outbound networking blocked, and a Playwright route that aborts every non-localhost request, every view, clip playback, live fixture, blind review, export, and import works. The request log contains only same-origin URLs and no aborted requests.
- **AT-51:** The deployed site works under the `/oneshot-canvas/` sub-path (served locally from a sub-path in CI, as the sibling's notes do).
- **AT-52:** axe-core finds no serious or critical violations on Matrix, By prompt, Detail, and Blind review. The full blind review flow is completable keyboard-only, and focus is visible.
- **AT-53 (Performance):** Matrix with 30 posters loads in under 2.5 s LCP on a throttled "Fast 3G / 4× CPU" profile, with transfer under 4 MB before interaction. No iframes are mounted on the Matrix.
- **AT-54:** The By prompt view never mounts more than 5 live frames, and Blind review never more than 2 (DOM assertion while toggling modes rapidly).
- **AT-55:** The `fx-hang` live run: in Chromium, the watchdog removes the frame within 4 s and the dashboard stays interactive. In all engines, the pre-run warning is shown because the capture verdict is `timeout`.

---

## 13. Open decisions

Each has a recommended default; flip any before M0.

1. **Name/repo:** `oneshot-canvas` (placeholder).
2. **Effort for Claude models:** `high`, matching the sibling.
3. **Library allowlist:** vanilla plus pinned three.js only, which keeps the WebGL slot fair without opening a dependency zoo. The alternative is vanilla only.
4. **Self-score:** collect it in `entry.json` for parity with the sibling, but **don't display it**, because it primes reviewers.
5. **Curator ratings:** don't publish any by default. If ever published, ship them as an importable file labelled "1 reviewer (curator)", never merged into a headline number.
6. **Custom domain:** recommended (§8.9) to separate storage from the arcade's origin, but optional.
7. **Clip spec:** 8 s at 30 fps, 960×600 H.264. Prompt 01 (static) gets a poster only.

