SHARED OUTPUT CONTRACT (VIS-CONTRACT v0.1)

This contract applies to every Oneshot Canvas prompt. The prompt that follows it names the exact artwork to build. Where the two disagree, the prompt wins.

1. DELIVERABLE
1.1 Produce one file, `index.html`, at the root of your workspace. It is the only file that is scored.
1.2 Also write `NOTES.md` (150 words or fewer): the assumptions you made, what you could not verify, and the defects you know about. It is read by reviewers and is not scored for style. "Not verified" is an acceptable answer. Unverified claims count against you.
1.3 You may use any scripts, generators or test pages while you work, but `index.html` must not depend on them or on any other file.

2. SELF-CONTAINED AND OFFLINE
2.1 `index.html` must render identically when opened from disk (`file://`), from a static server at the site root, and from a static server at a sub-path.
2.2 It must make zero network requests. Forbidden: any `http:`, `https:` or protocol-relative URL used as a resource (namespace declarations such as `xmlns` are fine), external scripts, stylesheets, fonts, images, audio or video, `@import`, `fetch`, `XMLHttpRequest`, `WebSocket`, `import()`, iframes, workers, service workers, cookies, `localStorage`, `sessionStorage` and IndexedDB.
2.3 Size limit: 300,000 bytes.
2.4 Fonts: system font stacks only (for example `system-ui, "Segoe UI", Arial, sans-serif`, or `ui-monospace, Consolas, monospace`, or `Georgia, serif`). The review machine runs Chrome on Windows 11. Leave at least 15% slack in text boxes so a slightly wider fallback font cannot cause overlap.

3. VECTOR ONLY
3.1 Artwork is drawn as inline SVG. HTML and CSS are allowed for page chrome and controls only where the prompt asks for them.
3.2 Forbidden: `<canvas>`, WebGL, `<img>`, SVG `<image>`, `data:` URIs that carry raster images, `foreignObject` used for artwork, and any pre-rendered bitmap.
3.3 Allowed and encouraged: gradients, patterns, masks, clip paths, `<use>` and `<symbol>`, filters (including `feGaussianBlur`, `feTurbulence`, `feDisplacementMap` and lighting filters), and CSS or JavaScript used to compute geometry.

4. DOCUMENT AND FIT
4.1 Valid HTML5: `<!doctype html>`, `<html lang="en">`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, and a non-empty `<title>` of 2 to 6 words.
4.2 The artboard is a root `<svg>` with exactly the `viewBox` given in the prompt, `preserveAspectRatio="xMidYMid meet"`, sized to fill the viewport. `body` has margin 0 and `overflow: hidden`. The page background outside the artboard is one solid colour that matches the artwork's edge. There are no scrollbars at any viewport of at least 640x360 (at least 1024x576 for the interactive prompts that add HTML controls).
4.3 No console errors, no console warnings and no uncaught exceptions while the page loads or while any interaction in the prompt is performed.
4.4 Accessibility minimum. Static and animated prompts: the artboard `<svg>` has `role="img"` and contains a `<title>` and a `<desc>`, the `<desc>` at least 25 words describing the artwork. Interactive prompts: keyboard operable exactly as the prompt specifies, a visible focus indicator, and text at 4.5:1 contrast or better.

5. DETERMINISM
5.1 `Math.random()` and `Date` are forbidden. `performance.now()` may be used for clocks only.
5.2 Anything that looks random (stars, grain, plants, dust) must come from a fixed seed, so every load produces the same picture.

6. TIME CONTROL (animated prompts only)
6.1 Every frame is a pure function of loop time `t` in seconds. No state may accumulate between frames.
6.2 With no query string the page plays continuously: `t = ((performance.now() - tStart) / 1000) mod D`, where D is the loop duration the prompt gives.
6.3 With `?t=<number>` the page renders exactly the frame at that time, once, and does not animate. `t` accepts decimals and is wrapped modulo D, so `?t=D` equals `?t=0`. The frame must be on screen within 100 ms of the `load` event.
6.4 No visible controls, timecodes or captions unless the prompt asks for them.

7. STATIC PROMPTS ONLY
7.1 No `<script>`, no CSS animation or transition, no SMIL. The file at rest is the artwork.

8. PERFORMANCE (animated and interactive prompts)
8.1 Average at least 55 frames per second, with no frame over 50 ms in steady state, at 1600x900 on a mid-range laptop-class GPU.

9. ORIGINALITY AND NUMBERS
9.1 The artwork is your own. Do not trace, vectorize or imitate a specific existing illustration, diagram, logo, character or brand. Do not embed trademarks or watermarks.
9.2 Numbers in a prompt are binding. Where the prompt is silent, choose well and say so in `NOTES.md`.

10. RUN RULES
10.1 This is a one-shot. You get this contract, the prompt and nothing else. No human will answer questions or give feedback. When something is ambiguous, choose sensibly, note the assumption in `NOTES.md` and keep going.
10.2 Work only inside your workspace. Do not look in its parent directories, at other runs, or at any `oneshot-*` repository, locally or on GitHub. Looking at another model's attempt invalidates the run.
10.3 You may read public documentation. Do not download art or code from anywhere.
10.4 You may open your own page in a headless browser to check your work, and you are encouraged to. Do not claim a check you did not run.
10.5 Your run ends when your turn ends. Run long commands in the foreground. Finish with a three-line reply: what you built, what you verified, what is still wrong.