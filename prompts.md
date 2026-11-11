# Oneshot Canvas: Candidate Prompt Pack (Stage 1)

**Working name:** Oneshot Canvas, a sibling of `oneshot-arcade`. Same idea (one prompt, one take, every model), but the artifact is a self-contained piece of visual work instead of a game.
**Status:** Stage 1 planning. Six candidate prompts, drafted and number-checked, **not yet run**. No entries have been generated.
**Pack version:** `canvas-pack v0.1-candidate` (see [Freeze manifest](#8-freeze-manifest-and-change-control)).
**Author's note on method:** every numeric claim in a rubric answer key was computed with a throwaway script before it was written down (linkage geometry, dataset answers, ferry timeline, pendulum-chain reference run). Nothing below depends on a score produced by counting DOM nodes.

---

## 1. What this benchmark measures and why these six

`oneshot-arcade` tests whole-project engineering. Oneshot Canvas tests the part that benchmark underweights: **can the model make something look right, move right and behave right, in one self-contained file, with nobody to correct it.**

| ID | Kind | Subject | Skill under test |
| --- | --- | --- | --- |
| VIS-P1 | Static SVG, spatial composition | Isometric glasshouse at dusk | Projection math, consistent light and shadow, depth layering |
| VIS-P2 | Static SVG, technical diagram | Exploded view and section of a hand pump | Drafting discipline, mechanism logic, annotation layout |
| VIS-P3 | Loop animation, mechanical linkage | Straight-line inversor linkage | Kinematics that can be measured on a frame, motion polish |
| VIS-P4 | Loop animation, narrative scene | The last ferry docks at dusk | Timing, staging, easing, atmosphere, seamless loop |
| VIS-P5 | Interactive, data visualization | Night-sky clarity ledger (96 values) | Information design, honest encoding, task success |
| VIS-P6 | Interactive, kinetic toy | Chain of 25 coupled pendulums | Physics fidelity, direct-manipulation feel, stability |

Design rules the six share:

- **Original.** None is a game. None copies a known test image, and none uses a famous benchmark scene. Every subject, name and dataset is invented for this pack.
- **Numbers are binding, taste is open.** Each prompt fixes the geometry, timing or data that makes correctness checkable, and leaves the art direction to the model.
- **Correctness is judged from pixels, by people.** Scripts produce captures and overlays. People score them. See [section 6](#6-scoring-and-review-protocol).
- **Everything a reviewer needs is reproducible.** Static prompts are captured at fixed times, animations through a `?t=` time hook, and interactive prompts through scripted keys and a fixed pointer protocol.

---

## 2. Lineup

Same five entrants and run-folder ids as `oneshot-arcade` (`catalog/models.json`), so the two dashboards can be joined later. **No entry exists yet.** Do not create any in stage 1.

| Entrant | Run id | Harness | Effort |
| --- | --- | --- | --- |
| GPT-6 Astra | `gpt-6-astra-high` | Codex | high |
| GPT-6.1 Sol | `gpt-6.1-sol-high` | Codex | high |
| Fable 5.2 | `claude-fable-5.2-high` | Claude Code | high (assumed, see open question 1) |
| Opus 5.5 | `claude-opus-5.5-high` | Claude Code | high (assumed) |
| Sonnet 5.5 | `claude-sonnet-5.5-high` | Claude Code | high (assumed) |

6 prompts x 5 entrants = **30 cells**, one run per cell, no retries, as in the arcade.

Suggested layout for the future repo (stage 2, for orientation only):

```
oneshot-canvas/
  prompts/CONTRACT.md, p1-...md ... p6-...md   (extracted verbatim from the frozen blocks below)
  prompts/CANVAS-HARNESS.md                    (run-rule wrapper, derived from ONESHOT-HARNESS v1.1)
  builds/<run-id>/<prompt-id>/index.html + NOTES.md
  captures/<run-id>/<prompt-id>/*.png          (made by the capture tooling, never by the entrant)
  scoring/<prompt-id>.csv                      (blind rater sheets)
```

---

## 3. How one run is assembled

The model receives, in this order, with nothing added or removed:

1. `CANVAS-HARNESS` wrapper (stage 2). Run rules only: one-shot, stay in the workspace, no peeking at other runs, be honest, the run ends when the turn ends. It is derived from the arcade harness rules 1 to 7 with the game and `npm` parts removed. Only `{{MODEL_LABEL}}`, `{{WORKSPACE}}` and `{{PROMPT_ID}}` change between runs.
2. **VIS-CONTRACT** (the frozen block in [section 4](#4-shared-output-contract-frozen)).
3. **One prompt block** (`VIS-P1` to `VIS-P6`, section 5). The prompt wins where it disagrees with the contract.

Each frozen block is given verbatim. The text between the 4-backtick fences is the exact string, with LF line endings and no trailing newline.

---

## 4. Shared output contract (frozen)

One deliverable, `index.html`, plus a short `NOTES.md`. Vector only. Offline. Deterministic. The contract is deliberately strict so that the five entrants cannot win through a bigger toolchain, an external asset or a hidden bitmap.

````frozen-VIS-CONTRACT
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
````

---

## 5. The six frozen prompts

Conventions used in every section below:

- Viewports are CSS pixels, device pixel ratio 1 unless stated. "Settled" means 1.0 s after the `load` event.
- Capture ids look like `P3-C04`. `U` means user units of the artboard `viewBox`.
- A **rubric score** is 0 to 4 per criterion (anchors in [section 6](#6-scoring-and-review-protocol)). Every criterion lists the capture ids that count as its evidence; a reviewer may not score from anything else.
- "Overlay" means a transparent reference SVG (grid, crosshairs, expected positions) laid over a capture by the capture tooling. Overlays are derived from the numbers in the prompt, never from an entrant's file.

---

### 5.1 VIS-P1: Glasshouse at Blue Hour

*Static SVG, spatial composition. Artboard `0 0 1600 1000`.*

````frozen-VIS-P1
VIS-P1  "Glasshouse at Blue Hour"  (static SVG, spatial composition)
Applies: contract sections 1 to 5, 7, 8 and 9. Artboard viewBox: 0 0 1600 1000.

BRIEF
Draw an original true-isometric cutaway of a small glasshouse standing on a stone plinth at dusk. The two rear walls are glazed and standing. The two front walls and the roof are absent, so the interior is visible. Lamps and the last moonlight make the interior the brightest part of the picture. The picture is judged on spatial correctness, consistent light, depth and craft.

PROJECTION (binding)
World axes: x runs down-right on screen, y runs down-left, z is up. A world point (x, y, z), in grid units, lands at screen
  sx = 800 + 86.6 * (x - y)
  sy = 330 + 50 * (x + y) - 100 * z
Every structural edge you draw (floor, plinth, walls, bed boxes, mullions, pots, lamp bases) is parallel to one of three screen directions: vertical, +30 degrees (the x axis) or -30 degrees (the y axis), within 0.5 degrees. A circle lying on a floor or bed plane is an ellipse with a horizontal major axis and a minor-to-major ratio of 0.577 (+/- 0.03). Its centre is the projection of the circle's centre.

REQUIRED CONTENT (positions are world coordinates)
1. Plinth and floor. The floor covers 0 <= x <= 6, 0 <= y <= 6 at z = 0, with a 6 x 6 checkerboard of two stone tones. The plinth is a box under the floor, 0.3 high (z from -0.3 to 0), with both visible side faces drawn. The floor diamond's corners therefore land at (800,330), (1319.6,630), (800,930) and (280.4,630).
2. Rear walls. The rear-left wall lies on the plane x = 0 (y from 0 to 6). The rear-right wall lies on the plane y = 0 (x from 0 to 6). Both are 2.8 high. Each is glazed in an iron frame: mullions every 1.0 along the wall and one transom at z = 1.4, frame stock at least 5 screen units wide. The glass is tinted and reads as glass (reflection, edge highlight) without hiding what is behind it.
3. Outside. Through the glass and around the whole structure the viewer sees one continuous dusk sky: at least four colour stops from deep blue at the top to warm amber-rose at a horizon at y = 300, two layers of distant hills (the farther layer lighter and bluer), and sparse stars in the upper 40 percent of the artboard. The horizon must be continuous across panes, not repainted per pane.
4. Pond. A round pond centred at (3, 3), radius 1.0, with a stone rim 0.12 wide, still water that reflects the sky tone, and three lily pads lying on the ellipse-correct ground plane.
5. Planting. Raised bed A covers x 1.6 to 5.6, y 0.3 to 1.2. Raised bed B covers x 0.3 to 1.2, y 1.6 to 5.6. Both are 0.4 high. Together they hold plants of at least three clearly different species (for example spiky, fan-leaved and feathery) at varied heights. A specimen tree 2.6 high stands in a pot centred at (0.9, 0.9).
6. Lamps. Three cast-iron lamp standards, each with a lantern on top at z = 1.6, stand at floor positions (1.8, 2.0), (4.9, 2.0) and (3.0, 5.2). Each lantern throws a warm pool of light on the floor. The pool is an ellipse of the correct ratio, about 1.3 grid units in radius, centred exactly under its lantern (same screen x as the lantern).
7. Moonlight and shadows. The cool key light comes from the rear-left. Every cast shadow lies along the +x direction on screen (30 degrees below horizontal, down-right), is 0.8 times the casting object's height long, and is a deep blue at 35 to 60 percent opacity. Round objects cast the correct skewed shape. Shadows fall only on surfaces they could reach.
8. Face shading. Every box-like object follows one rule: the top face is lightest, the face whose normal is +y (the left-visible face) is mid-tone, and the face whose normal is +x (the right-visible face) is darkest. Lamp light may add warmth near the lanterns but may not reverse this order.
9. Foreground. Two large blurred frond silhouettes frame the bottom corners (bottom-left inside x 0 to 420, y 700 to 1000, and bottom-right mirrored). Together they cover at least 3 percent of the artboard, use a Gaussian blur of at least 4 units, and do not overlap the glasshouse.
10. Hierarchy. After the picture is blurred, its brightest region must sit inside the glasshouse interior (lanterns, their pools or the pond), not in the sky.
11. No text, logos, people or animals.
````

**Capture plan (P1)**

| ID | When | Viewport | Purpose |
| --- | --- | --- | --- |
| P1-C01 | settled (T+1.0 s) | 1600x1000 | Primary. Overlay checks: iso axes, floor corners, pond ellipse, lamp pools, shadow direction. |
| P1-C02 | T+5.0 s | 1600x1000 | Must be pixel-identical to C01. A difference means something animates (contract 7.1 breach). |
| P1-C03 | settled | 1024x640 | Fit check: artboard letterboxed, no scrollbars, nothing clipped. |
| P1-C04 | settled | 600x900 (portrait) | Fit check at an awkward aspect ratio. |
| P1-C05 | settled, DPR 2 | 1600x1000 | Source for zoom crops Z1 to Z3. |
| P1-Z1 | crop of C05 | x 520..1080, y 430..830 U | Pond, lamp L1, pool ellipse, shadows, rim. |
| P1-Z2 | crop of C05 | x 600..1000, y 30..500 U | Rear corner glazing, specimen tree, horizon continuity. |
| P1-Z3 | crop of C05 | x 0..420, y 700..1000 U | Foreground frond blur and overlap. |
| P1-G | derived from C01 | n/a | 8 px blur + greyscale luminance map, for the squint check (criterion 5). |

**Interaction script (P1):** none beyond load. Resize script for C03 and C04: open at 1600x1000, capture C01; resize to 1024x640 and wait 500 ms; resize to 600x900 and wait 500 ms.

**Human rubric (P1)**

| # | Criterion | Wt | Evidence | A 4 looks like | Caps at 1 when |
| --- | --- | --- | --- | --- | --- |
| 1 | Projection and geometric rigor (Projection section, items 1, 2, 4) | 20 | C01 + overlay, Z1 | Every checked edge within 0.5 degrees of an iso axis; floor corners within 4 U of the stated points; pond ellipse ratio 0.577 +/- 0.03; checker rows align with walls. | Edges drift or wobble; the pond is a circle or a wrong ellipse; the floor is not a true diamond. |
| 2 | Light, shadow and face-shading consistency (items 6 to 8) | 20 | C01, Z1, G | One key light is obvious. Every shadow is along +x at about 0.8 of object height. Top > left > right tone order holds on every box. Lantern pools are under their lanterns. | Shadows point in more than one direction, or two box faces share a tone, or pools are offset from their lanterns. |
| 3 | Depth and layering (items 3, 9; glass) | 15 | C01, Z2, Z3 | Foreground, interior and distant sky read as three distinct depths. Horizon is continuous across all panes. Foreground blur is clean. Atmospheric perspective in the hills. | Flat; sky repainted per pane; foreground fronds overlap the structure or are sharp. |
| 4 | Placement fidelity to the spec (items 4, 5, 6) | 15 | C01 + overlay | Beds, pond, tree and three lamp standards at the stated coordinates (within 6 U); three visibly different plant species; the tree is 2.6 high. | Objects missing or displaced by more than 25 U; only one plant species. |
| 5 | Focal hierarchy and composition (item 10) | 10 | G, C01 | In the blurred map the brightest area is inside the glasshouse. The eye goes lamps, pond, plants, sky in a deliberate order. | The sky or a pane reflection is the brightest thing. |
| 6 | Material and colour craft | 10 | C01, Z1, Z2 | Convincing glass, stone and foliage. A limited, harmonious palette where warm lamp light against cool moonlight is a considered contrast. | Muddy or garish colour; glass is just a transparent rectangle. |
| 7 | Vector craft and cleanliness | 10 | C05, Z1 to Z3, C02 | Crisp at 2x; no gaps or sliver seams between faces; no stray fragments; nothing animates; no text. | Visible seams, leaking fills, or anything that violates the contract's no-raster, no-script rules. |

**Reference notes (P1):** floor corners are (800,330), (1319.6,630), (800,930), (280.4,630). Pond ellipse centre is (800,630); rim-inner semi-axes are about (122.5, 70.7) U. Lamp pool ellipses have semi-axes about (159, 92) U. Lantern tops (z = 1.6) land at (782.7, 360.0), (1051.1, 515.0) and (609.5, 580.0); their floor feet are 160 U lower on the same screen x. The capture tooling generates the overlay from the stated projection.

---

### 5.2 VIS-P2: Sheet KHP-100, Kestrel Hand Pump

*Static SVG, technical diagram. Artboard `0 0 1680 1188` (A3 landscape, 4 U = 1 mm of paper).*

````frozen-VIS-P2
VIS-P2  "Sheet KHP-100: Kestrel Hand Pump"  (static SVG, technical diagram)
Applies: contract sections 1 to 5, 7, 8 and 9. Artboard viewBox: 0 0 1680 1188 (A3 landscape; 4 user units = 1 mm of paper).

BRIEF
Draw a one-sheet engineering drawing of an original hand-operated force pump, the Kestrel. A reader should be able to name every part, read the key sizes, and follow the liquid through the pump on the upstroke and on the downstroke. The drawing is judged on correctness of the mechanism, drafting discipline and legibility.

SCALES
Main views are at 1:4, so 1 mm of real size is 1 user unit. Detail B is at 1:2, so 1 mm is 2 user units. Every dimension you print must measure that many units (+/- 3 percent) on the sheet.

THE PUMP (binding facts)
The pump is single-acting, with a vertical cylinder on a base plate. A lever pivots on a fulcrum bracket and a link rod joins the lever to the piston rod. Pushing the lever handle DOWN raises the piston. Liquid enters through the inlet check valve on the upstroke and leaves through the outlet check valve on the downstroke.
Parts list (print exactly this, in this order):
  1  Lever handle, 1 off. Flat bar, 320 mm from pivot to grip end, 80 mm from pivot to link pin (4:1).
  2  Fulcrum bracket, 1 off. Pivot pin diameter 12.
  3  Link rod, 1 off. 140 mm pin to pin.
  4  Piston rod, 1 off. Diameter 14, length 210.
  5  Gland nut with wiper, 1 off. 20 thick.
  6  Cylinder barrel, 1 off. Outer diameter 72, bore diameter 60, bore depth 180, with an integral valve block 60 mm tall at the bottom (overall length 240).
  7  Piston with cup seal, 1 off. Diameter 60, 30 thick, cup lips facing down (toward the pressure side).
  8  Inlet check valve, 1 off. Ball diameter 16.
  9  Outlet check valve, 1 off. Spring-loaded ball, diameter 16.
  10 Inlet strainer, 1 off. Screws into the left side of the valve block.
  11 Outlet hose barb, 1 off. Screws into the right side of the valve block.
  12 Base plate, 1 off. 140 x 100 x 12 with four holes of diameter 9 on a 110 x 70 grid.
Piston stroke is 100 mm. With the piston at the bottom of its stroke its underside is 4 mm above the chamber floor.
Valve layout inside the valve block:
  Inlet valve (left, 18 mm left of the cylinder axis): the seat is in the chamber floor, the ball rests ABOVE the seat, a small cage keeps the ball in the chamber, and liquid from the strainer rises through the seat and lifts the ball.
  Outlet valve (right, 18 mm right of the axis): the seat is in the chamber floor, the ball sits BELOW the seat and is pressed up against it by a spring. Liquid from the chamber pushes the ball down, compressing the spring, and leaves through a side passage to the hose barb.

SHEET LAYOUT (binding regions, in user units)
- Border: a rectangle inset 24 from each edge, stroke 3.
- Parts list: a table at x 1176 to 1656, y 56 to 472, with a header row and 12 rows of 32, columns ITEM, QTY and DESCRIPTION.
- Title block: x 1176 to 1656, y 1004 to 1164, with the fields TITLE, DWG NO (KHP-100), SCALE (1:4, DETAIL B 1:2), UNITS (mm), PROJECTION (FRONT ELEVATION), SHEET (1 OF 1) and REV (A).
- View 1, EXPLODED VIEW (front elevation): x 56 to 620, y 56 to 980. All 12 parts are separated along explosion lines. The pump column (items 4, 5, 7, 6 and 12, with 8 and 9 shown in the valve block) separates along the vertical axis, the lever group (1, 2 and 3) along its own line, and 10 and 11 are pulled out sideways. Explosion lines use the chain line style. Parts are separated by at least 24 units.
- View 2, SECTION A-A (UPSTROKE): x 660 to 1140, y 56 to 980. A full-height centre section of the assembled pump. The upper rod and the lever may be cut off with a break line. The piston is drawn at the bottom of its stroke in solid line and at the top of its stroke in thin double-dash phantom line, with the stroke of 100 dimensioned. The inlet ball is lifted at least 4 mm clear of its seat; the outlet ball is seated.
- View 3, DETAIL B (DOWNSTROKE VALVES) at 1:2: x 1176 to 1656, y 500 to 980. Inlet and outlet valves side by side in the downstroke state: inlet ball seated, outlet ball pushed at least 4 mm off its seat with the spring visibly compressed.
- Mark the SECTION A-A cut line with arrowed letters A and A on the exploded view or on a small key view.

DRAFTING RULES (binding)
- Line weights in user units: visible outlines 2.0; hidden detail 1.0 dashed (8 on, 4 off); centre lines and explosion lines 1.0 chain (16 on, 3 off, 3 on, 3 off); dimension, extension and leader lines 1.0 continuous; cut-plane line 3.0 chain; border 3.0.
- Cut surfaces in the section are hatched at 45 degrees with 8-unit spacing. Adjacent cut parts hatch in opposite directions (45 and 135 degrees). The balls and the spring are not hatched.
- Item balloons: each of the 12 parts has exactly one numbered balloon (circle of diameter 28, number text 16) on the exploded view, joined by a leader that ends on the part in a dot. Leaders do not cross each other or any dimension line. Balloons never touch part outlines.
- Dimensions to print, exactly: bore diameter 60; stroke 100; bore depth 180; overall length 240; rod diameter 14 and rod length 210; link rod 140; lever arms 320 and 80; base plate 140, 100 and 12; hole spacing 110 and 70; hole diameter 9; ball diameter 16 (on Detail B). Dimension lines have arrowheads and extension lines with a 2-unit gap from the part, and the text sits above the line and never crosses it.
- Text: nothing smaller than 12 units; balloon numbers 16; view titles 20, each with its scale; sheet title 28. Use a single sans-serif stack throughout.
- Flow: liquid on the intake path is drawn with blue arrows labelled IN, and liquid on the discharge path with orange arrows labelled OUT, both with arrowheads. Intake and discharge must also differ without colour (solid shafts for IN, dashed shafts for OUT), and a small legend on the sheet explains the encoding. Put the word UPSTROKE or DOWNSTROKE beside the piston-motion arrow in each view that shows one.
- The sheet is mostly black linework on a light paper tone. The only strong colours are the two flow colours.
````

**Capture plan (P2)**

| ID | When | Viewport | Purpose |
| --- | --- | --- | --- |
| P2-C01 | settled | 1680x1188 | Primary. Layout regions, scale check by overlay, line-weight survey. |
| P2-C02 | T+5.0 s | 1680x1188 | Pixel-identical to C01 (no animation). |
| P2-C03 | settled | 1024x724 | Fit check and legibility at reduced size. |
| P2-C04 | settled, DPR 2 | 1680x1188 | Source for crops Z1 to Z3. |
| P2-Z1 | crop of C04 | x 1176..1656, y 56..472 U and y 1004..1164 U | Parts list and title block: exact wording, order, grid. |
| P2-Z2 | crop of C04 | x 660..1140, y 56..980 U | Section A-A: valve states, hatching, flow, stroke dimension. |
| P2-Z3 | crop of C04 | x 1176..1656, y 500..980 U | Detail B: downstroke valve states at 1:2. |
| P2-Z4 | crop of C04 | x 56..620, y 56..980 U | Exploded view: balloons, leaders, explosion lines. |
| P2-G | derived from C01 | n/a | Greyscale conversion; the IN/OUT distinction must survive it. |

**Interaction script (P2):** load only; resize as in P1 (1680x1188, then 1024x724).

**Human rubric (P2)**

| # | Criterion | Wt | Evidence | A 4 looks like | Caps at 1 when |
| --- | --- | --- | --- | --- | --- |
| 1 | Spec fidelity: parts, numbers, proportions | 20 | C01 + scale overlay, Z1 | All 12 parts present with the exact list text; every printed dimension equals the stated value and measures that many units (+/- 3%); bore : stroke : rod ratios are right. | Parts missing, or numbers contradict the spec, or dimension values do not match what is drawn. |
| 2 | Mechanism and flow logic | 20 | Z2, Z3 | Upstroke: piston arrow up, inlet ball lifted and caged, outlet ball seated, IN arrows from strainer through seat into the chamber. Downstroke: inlet ball seated, outlet ball below its seat pushed down with a compressed spring, OUT arrows through the side passage to the barb. Cup seal lips down. Pushing the handle down raises the piston. | Ball above/below-seat arrangement is wrong, flow runs backwards, or both valves are open at once. |
| 3 | Drafting conventions | 15 | C01, Z2, Z4 | Three distinct line weights used as specified; hidden, centre and chain styles correct; 45/135 degree hatching with opposite directions on adjacent parts; A-A cut line marked; break line used where the section is cut off. | One line weight for everything; no hatching; no cut line. |
| 4 | Annotation craft | 15 | Z1, Z4, C01 | One balloon per part, leaders end on the part with dots and never cross, no balloon touches an outline, dimension text never struck through by a line, nothing under 12 U. | Balloons or text overlap parts or each other in more than two places. |
| 5 | Sheet layout and hierarchy | 15 | C01 | Regions exactly as specified; reading order is clear (title block, parts list, views); balanced white space; border and title block neat. | Views overlap regions or one another; title block fields missing. |
| 6 | Legibility at reduced size and in greyscale | 10 | C03, G | At 1024x724 text is still readable and IN versus OUT is still distinguishable in greyscale by dash style and labels. | IN/OUT distinguishable by colour only. |
| 7 | Visual finish within the constraints | 5 | C01, C04 | Restrained palette, line weights give a clear rhythm, paper tone is pleasant, no clutter. | Looks like an unfinished sketch. |

**Reference notes (P2):** stroke 100 mm means the phantom and solid piston positions are 100 U apart (at 1:4). Section A-A has the barrel 72 U wide, the bore 60 U wide, the bore 180 U deep above a 60 U block. The valve centrelines sit 18 U either side of the cylinder axis. Detail B at 1:2 draws the balls 32 U across.

---

### 5.3 VIS-P3: Straight-Line Linkage

*Deterministic loop animation, mechanical linkage. Artboard `0 0 1600 900`, D = 6.000 s.*

````frozen-VIS-P3
VIS-P3  "Straight-Line Linkage"  (deterministic loop animation, mechanical linkage)
Applies: contract sections 1 to 6, 8 and 9. Artboard viewBox: 0 0 1600 900 (1 user unit = 1 pixel at 1600x900). Loop duration D = 6.000 seconds.

BRIEF
Animate a planar inversor linkage (of the Peaucellier-Lipkin family) that turns a swinging crank into a perfectly straight stroke. The geometry is fixed by the numbers below. The animation is judged first on kinematic correctness, which must be measurable on a captured frame, and then on motion quality, mechanical legibility and craft.

GEOMETRY (binding; screen coordinates, y grows downward)
- Ground pivots: O = (300, 450) and Q = (400, 450). Both are fixed to a visible base.
- Long links OA and OB, each 260 long, pinned at O.
- A rhombus A-C-B-P of four short links, each 100 long: AC, CB, BP and PA.
- Crank QC, 100 long, pinned at Q, with its free end pinned at C.
- Crank angle: psi(t) = 60 degrees * sin(2 * pi * t / 6), measured at Q from the +x direction, positive meaning counter-clockwise on screen (the crank tip C swings up for positive psi). C = Q + 100 * (cos psi, -sin psi).
- A is the intersection of circle(O, 260) and circle(C, 100) that has the smaller y. B is the other intersection. P is the rhombus vertex opposite C, so P = A + B - C.
- Consequence you must reproduce: P stays on the vertical line x = 588 for the whole loop, at y = 450 - 288 * tan(psi / 2).

REQUIRED ELEMENTS
1. Links are solid bars at least 14 units wide, with round or properly bossed ends. A pin (a circle of at least 9 units radius) is centred on each joint at its exact computed coordinates. Link lengths never change: every pin-to-pin distance stays within 0.5 units of its nominal value in every frame. Layer the links so crossings read correctly and no pin is covered by a link that should lie below it.
2. A visible base: a plate or block with ground symbols (bolts or hatching) at O and Q.
3. A straightedge: a thin vertical rule centred exactly on x = 588, from y = 210 to y = 690, with ticks every 40 units starting at y = 210, drawn beneath the linkage.
4. Output marker: P is marked by a ring-and-dot at least 12 units across, in the single strongest accent colour in the picture.
5. Trail: the path P has taken during the previous 1.5 seconds, drawn as a line fading from opaque at P to transparent. It is computed from the formulas for the times t - 1.5 to t (wrapped modulo 6), not stored.
6. Angle dial: an arc scale of radius 150 around Q covering -60 to +60 degrees with a tick every 15 degrees (labels -60, 0 and +60 only), drawn beneath the linkage, with a pointer that follows the crank angle exactly.
7. Labels: only the letters O, Q and P (at least 14 units tall) beside their points, plus the three dial labels. No other text.
8. Depth and finish: gradients or lighting that read as machined metal or an equivalent material, a soft cast shadow of the linkage on the base surface with a fixed offset, and a background that keeps the mechanism the hero. The mechanism spans at least 40 percent of the artboard width.
9. Loop: frame(t) equals frame(t + 6). Position and speed are continuous across the seam.
````

**Capture plan (P3)**

All at 1600x900 using `?t=<value>` unless noted. Positions below are in screen user units (= pixels at this viewport); tolerance for a joint centre is **+/- 3 px**, and for P's x coordinate **+/- 1.5 px**.

| ID | `?t=` | psi | C (x,y) | P (x,y) | A (x,y) | B (x,y) |
| --- | --- | --- | --- | --- | --- | --- |
| P3-C01 | 0 | 0.00 | (500.0, 450.0) | (588.0, 450.0) | (544.0, 360.2) | (544.0, 539.8) |
| P3-C02 | 0.75 | +42.43 | (473.8, 382.5) | (588.0, 338.2) | (502.3, 286.7) | (559.5, 434.1) |
| P3-C03 | 1.5 | +60.00 | (450.0, 363.4) | (588.0, 283.7) | (488.8, 271.2) | (549.2, 375.9) |
| P3-C04 | 2.25 | +42.43 | (473.8, 382.5) | (588.0, 338.2) | (502.3, 286.7) | (559.5, 434.1) |
| P3-C05 | 3.0 | 0.00 | (500.0, 450.0) | (588.0, 450.0) | (544.0, 360.2) | (544.0, 539.8) |
| P3-C06 | 4.5 | -60.00 | (450.0, 536.6) | (588.0, 616.3) | (549.2, 524.1) | (488.8, 628.8) |
| P3-C07 | 5.25 | -42.43 | (473.8, 517.5) | (588.0, 561.8) | (559.5, 465.9) | (502.3, 613.3) |
| P3-C08 | 6.0 | 0.00 | identical to C01 | identical to C01 | identical to C01 | identical to C01 |

The numbers above come from a script that solved the rhombus directly. The OC distance runs between 173.2 (at psi = +/-60) and 200.0 (at psi = 0), so the rhombus never reaches a singular position and A and B never swap.

Other captures:

| ID | When | Viewport | Purpose |
| --- | --- | --- | --- |
| P3-C09 | `?t=1.5` | 1024x576 | Fit check. |
| P3-C10 | `?t=0` and `?t=6` | 1600x900 | Pixel diff must be zero (wrap rule 6.3). |
| P3-V1 | frame dump, `?t=k/60`, k = 0..359 | 1600x900 | Deterministic 60 fps reference video (360 frames, one loop). Reviewers scrub it, and may step it frame by frame. |
| P3-S1 | `?t=5.9833`, `?t=0`, `?t=0.0167` | 1600x900 | Seam trio: motion must continue smoothly across the loop point. |
| P3-RT | real-time, no `?t=`, 10 s | 1600x900 | Frame-time trace for contract 8.1. Capture tooling measures `requestAnimationFrame` deltas. |

**Interaction script (P3):** none. Optional: a resize during real-time play (1600x900 to 1280x720 to 1024x576 at 2 s intervals) must keep the mechanism undistorted and the animation running.

**Human rubric (P3)**

| # | Criterion | Wt | Evidence | A 4 looks like | Caps at 1 when |
| --- | --- | --- | --- | --- | --- |
| 1 | Kinematic accuracy | 30 | C01 to C08 + crosshair overlay | Every joint of every capture is within 3 px of the table; P is within 1.5 px of x = 588 in all eight; link lengths measured from pin centres agree with nominal (260, 100, 100) within 0.5%. | P wanders off the line by more than 6 px, or links visibly stretch, or the rhombus flips. |
| 2 | Motion quality and loop continuity | 20 | V1, S1, C10 | Smooth sinusoidal motion at the right pace; zero velocity discontinuity at the seam (S1 trio is evenly spaced); no popping, jitter or sub-pixel crawl. | A visible jump at the seam, or stepwise motion, or the wrong period. |
| 3 | Mechanical legibility and rendering | 15 | C03, C06, V1 | Links read as bars with clear ends; pins read as pins; layering is believable; the base grounds the mechanism; the material and shadow look like one light. | Links merge into a single blob or pins vanish behind bars. |
| 4 | Instrumentation: straightedge, dial, trail | 15 | C03, C06, C02 | Rule is on x = 588 with ticks on 40 U spacing starting at y = 210; the dial is exact (the pointer at C03 reads +60); the trail is a faithful fading arc of the last 1.5 s and works at the seam (frames just after t = 0). | Missing, misplaced or inaccurate instruments; trail breaks when t < 1.5. |
| 5 | Composition and art direction | 10 | C01, C03 | The mechanism is the hero. Restrained palette, strong accent on P, balanced use of the 1600x900 field, a coherent finish. | Cluttered or flat; accent colour competes with other elements. |
| 6 | Runtime robustness | 10 | RT, C09, C10 | 55+ fps average; `?t=` frames arrive within 100 ms; fit at 1024x576 holds; no console messages. | Under 30 fps, `?t=` ignored, or errors. |

---

### 5.4 VIS-P4: The Last Ferry

*Deterministic loop animation, narrative scene. Artboard `0 0 1600 900`, D = 12.000 s.*

````frozen-VIS-P4
VIS-P4  "The Last Ferry"  (deterministic loop animation, narrative scene)
Applies: contract sections 1 to 6, 8 and 9. Artboard viewBox: 0 0 1600 900 (1 user unit = 1 pixel at 1600x900). Loop duration D = 12.000 seconds.

BRIEF
Animate one short story as a seamless loop. At dusk the last ferry arrives at a small harbour quay and lowers its bow ramp. One passenger walks off into the evening. The ferry backs away. The quay lantern lights when the ramp touches down and goes out after the ferry has gone. The scene is seen from the side. It is judged on staging, timing, animation craft, atmosphere and loop integrity. No dialogue and no text.

STAGE (binding coordinates in user units; y grows downward)
- Horizon at y = 420. The water surface is at y = 640 across x 0 to 1000 and extends to the bottom edge. The quay is land at x 1000 to 1600, with its walking surface at y = 610 and its front face dropping to the bottom edge, and a stone edge at x = 1000.
- Ferry: a double-ended passenger ferry 520 long, centred at x_f(t), deck at y = 610, hull sitting in the water at y = 640. It has a cabin with a doorway whose centre is 100 units left of the ferry's centre, a funnel and horn 20 units left of centre, and a bow ramp hinged at deck level at the ferry's right end (x_f + 260). The ramp is 140 long, and its far end rests on the quay when it is flat.
- Lantern: on the quay at x = 1180, a post from y = 610 up to y = 450 and a lantern housing at about (1180, 440).
- Headland and lighthouse: a far headland silhouette at the left horizon, with a lighthouse whose lantern room is at (260, 330).
- Passenger: one adult figure about 170 tall, carrying a small case, in a style of your choice.

TIMELINE (binding; t in seconds; s(u) = u * u * (3 - 2 * u) is smoothstep)
- 0.0 to 0.5: empty scene. No ferry, no passenger, lantern dark, ramp raised at 65 degrees above flat.
- 0.5 to 4.0: the ferry arrives from the left. x_f(t) = -400 + 1140 * (1 - (1 - u)^3), where u = (t - 0.5) / 3.5. At t = 4.0 it stops with its bow touching the quay edge (x_f = 740). A bow wave and a wake of foam follow its speed: strong while it moves, absent when it is at rest.
- 3.8 to 5.0: the horn lets out a steam plume from the funnel. It starts at 3.8, rises at least 120 units, spreads and has faded out by 5.0.
- 4.2 to 5.0: the ramp lowers. angle = 65 * (1 - s(u)) degrees above flat, where u = (t - 4.2) / 0.8. At 5.0 it lies flat on the quay.
- 5.0 to 5.6: the lantern comes up as the ramp touches. glow = s((t - 5.0) / 0.6). Warm light falls on the quay, the ramp, the water reflection and anything standing in it. The lantern stays at full glow until 9.0.
- From 5.0: the passenger steps out through the cabin doorway at x = 640 and walks right at a constant 240 units per second: x(t) = 640 + 240 * (t - 5.0). They emerge through the doorway (clipped by it); they must not pop into view. They leave the artboard at about t = 9.4. Their feet do not slide: a planted foot stays within 4 units of the same world position during its stance phase. As they cross the lantern's light, the lit side of the figure changes to match.
- 7.3 to 8.1: once the passenger has stepped off the ramp (about t = 7.1), they glance back at the ferry: the head turns back between 7.3 and 7.7 and returns forward by 8.1, while the body keeps walking.
- 7.4 to 8.2: the ramp rises. angle = 65 * s((t - 7.4) / 0.8) degrees above flat.
- 8.5 to 11.5: the ferry backs away to the left. x_f(t) = 740 - 1140 * ((t - 8.5) / 3.0)^3. At t = 11.5 it is at x_f = -400 and fully off-screen. Wake and bow wave follow its speed.
- 9.0 to 9.6: the lantern fades out. glow = 1 - s((t - 9.0) / 0.6).
- 11.5 to 12.0: empty scene, identical to 0.0 to 0.5.

AMBIENT (loops continuously; every period divides 12 so the loop closes)
- Lighthouse beam: one soft beam from the lantern room that rotates once per 12.000 s, starting at t = 0 and pointing right. Seen side-on, a beam at rotation angle theta = 30 * t degrees has an on-screen length of 700 * |cos theta| and points right for cos theta > 0 and left for cos theta < 0. Near theta = 90 it points at the viewer and the lantern room flares brightest with almost no beam. Near theta = 270 it points away and there is no flare.
- Water: shimmer and gentle ripples on a 4.000 s period, reflecting sky, lantern and lighthouse flare.
- Stars: at least 30, at fixed positions above the horizon, each twinkling with a period of 3, 4 or 6 seconds.
- Swell: while it is on the water the ferry bobs at most 3 units vertically, period 4.000 s.

ART DIRECTION
Dusk, blue hour. Warm lantern and window light against cool sky and water. Keep the story readable: the eye must always be able to find the thing that is changing. No text anywhere in the picture.
````

**Capture plan (P4)**

All at 1600x900 via `?t=`. Position tolerance **+/- 12 px** for the passenger, **+/- 8 px** for the ferry centre, **+/- 5 degrees** for the ramp angle (and +/- 3 px bow-to-quay contact at t = 4).

| ID | `?t=` | Expected state |
| --- | --- | --- |
| P4-C01 | 0 | Empty scene. Ramp raised 65 degrees. Lantern dark. No ferry visible (centre at -400). Beam pointing right at full length. |
| P4-C02 | 2.0 | Ferry centre 527.3, moving; bow wave and wake visible. No steam. Passenger absent. Lantern dark. |
| P4-C03 | 4.0 | Ferry centre 740, bow touching the quay at x = 1000. No wake (speed zero). Steam plume just starting. Ramp still 65 degrees. Beam pointing left (theta = 120 degrees) at 350 length. |
| P4-C04 | 4.6 | Ramp at 32.5 degrees, lowering. Steam plume rising. Lantern dark. Passenger not yet visible. |
| P4-C05 | 5.0 | Ramp flat. Lantern glow at 0 and starting. Passenger at the doorway (x = 640), partly clipped by the door. |
| P4-C06 | 6.0 | Passenger at x = 880, mid-stride on the deck side of the ramp. Lantern at full glow. Ramp flat. |
| P4-C07 | 7.0 | Passenger at x = 1120, on the ramp's far end. Warm light on the figure. |
| P4-C08 | 7.5 | Passenger at x = 1240 with the head turned back toward the ferry. Ramp has only just started to rise (it starts at 7.4: expect about 2.8 degrees above flat, effectively flat). |
| P4-C09 | 7.8 | Ramp at 32.5 degrees, rising. Passenger at x = 1312. |
| P4-C10 | 8.6 | Ferry centre 740.0 (it has hardly begun to move). Ramp fully up. Lantern at full glow. Passenger at x = 1504. |
| P4-C11 | 10.0 | Ferry centre 597.5, moving left, wake visible. Lantern dark. No passenger visible (x = 1840). Ramp up. |
| P4-C12 | 12.0 | Identical to C01. |

Other captures:

| ID | When | Viewport | Purpose |
| --- | --- | --- | --- |
| P4-C13 | `?t=7` | 1024x576 | Fit check. |
| P4-C14 | `?t=0` and `?t=12` | 1600x900 | Pixel diff must be zero. |
| P4-V1 | frame dump, `?t=k/60`, k = 0..719 | 1600x900 | 60 fps reference video, one loop (720 frames). Review at 1x and at 0.25x. |
| P4-S1 | `?t=11.9833`, `?t=0`, `?t=0.0167` | 1600x900 | Seam trio. Because the scene is empty at the seam, the ambient layers must also match across it: stars, water, beam. |
| P4-F1 | `?t=` 5.00, 5.05, ..., 5.60 | crop x 560..1200, y 400..700 | Lantern glow ramp, 13 frames. |
| P4-F2 | `?t=` 5.2, 5.3, ..., 6.0 | crop around the passenger | Walk cycle, foot-slide check, door clipping. |
| P4-RT | real time, no `?t=` | 1600x900 | Frame-time trace (contract 8.1). |

Expected values (derived from the formulas, script-checked): at t = 6.0 the lantern glow is 1.0; at 5.3 it is s(0.5) = 0.5; the passenger reaches the ramp's far end (x = 1140) at t = 7.083; and leaves the 1600 px frame at t = 9.42.

**Interaction script (P4):** none. Optional resize during real-time play, as P3.

**Human rubric (P4)**

| # | Criterion | Wt | Evidence | A 4 looks like | Caps at 1 when |
| --- | --- | --- | --- | --- | --- |
| 1 | Timeline fidelity | 25 | C01 to C12 + overlay | Every state table row met within tolerance: ferry centres, ramp angles, passenger x, lantern states, steam timing, bow-to-quay contact at t = 4.0. | Three or more rows are clearly off, or the sequence of events is changed. |
| 2 | Story clarity and cause-and-effect staging | 20 | V1, C03 to C09 | The eye can follow the story with no explanation: ferry arrives, ramp lands, lantern comes on because of it, a person leaves, the glance back reads as a human beat, the ferry backs away, the lantern goes out. Nothing important happens off-focus. | Events are ambiguous or the lantern comes on for no visible reason. |
| 3 | Animation craft | 20 | V1, F2 | Convincing arrival and departure easing, ramp smoothstep, believable walk cycle with no foot slide (stance foot within 4 U), clean doorway emergence, wake proportional to speed, subtle swell. | Pops, sliding feet, rigid cardboard figure, or wake present at rest. |
| 4 | Atmosphere and lighting | 15 | C06, C07, F1, V1 | Blue-hour mood. Lantern light interacts with passenger, quay, ramp and water. The lighthouse beam behaves as specified (full length right at t = 0, flare near t = 3, left at t = 6, hidden at t = 9). | Lantern glow is a flat sticker; no change on the passenger; beam is wrong. |
| 5 | Loop integrity | 10 | S1, C12, C14, V1 | No visible seam: scene empty, ambient layers continue smoothly across t = 12 to 0. | A pop or restart at the seam. |
| 6 | Runtime robustness | 10 | RT, C13, C14 | 55+ fps average, `?t=` frames arrive in under 100 ms, fit at 1024x576, no console messages. | Under 30 fps or `?t=` ignored. |

---

### 5.5 VIS-P5: Clear Skies Ledger

*Interactive data visualization. Full-viewport page designed for 1600x900, holds from 1280x720 to 1920x1080.*

````frozen-VIS-P5
VIS-P5  "Clear Skies Ledger"  (interactive data visualization)
Applies: contract sections 1 to 5, 8 and 9. Contract 4.2 is replaced for this prompt by: the page fills the viewport and is designed for 1600x900; it keeps its layout with no scrollbars from 1280x720 to 1920x1080. You may mix HTML and SVG.

BRIEF
Build a single-page interactive visualization of the dataset below. A first-time viewer, with no instructions beyond what is on the page, must be able to answer the five questions at the end in about 30 seconds each. It is judged on whether people can answer those questions, on honest encoding, on the interaction behaviour listed, and on craft.

DATA (use exactly)
Clear nights per month at eight observing sites. A clear night is one with under 20 percent cloud cover. Bortle class runs from 1 (darkest sky) to 9 (brightest). Days per month: 31 28 31 30 31 30 31 31 30 31 30 31.
Site              | Elev (m) | Bortle | Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec
Kestrel Ridge     | 1840     | 2      | 12 11 14 17 20 24 25 24 23 21 15 11
Saltmarsh Point   | 6        | 6      | 8 9 11 12 10 9 12 13 15 14 10 8
Quarry Hollow     | 230      | 5      | 9 10 12 14 15 17 18 17 16 14 10 8
Ninefold Mesa     | 2410     | 1      | 24 23 26 27 25 18 9 8 17 26 25 24
Larch Basin       | 1180     | 3      | 5 6 11 16 21 25 27 27 24 18 9 5
Brightwater Pier  | 14       | 8      | 7 8 9 10 11 12 13 12 12 11 8 7
Ember Dunes       | 420      | 2      | 26 24 27 28 29 27 20 14 22 28 27 26
Foxglove Fell     | 690      | 4      | 10 11 13 15 18 19 20 18 11 7 6 8

REQUIRED CONTENT
1. On load the page shows a title, a one-sentence takeaway that is true of the data, the definition of a clear night, a credit line reading "Synthetic data prepared for this benchmark", and the visualization.
2. All 96 values are visible at the same time, with no paging or scrolling, and each is individually readable (printed, or shown as an exact number on hover or focus). The chart type is your choice. Next to each site's name show its elevation, Bortle class and annual total. Along the month axis show each month's total across the sites currently displayed. Every axis, unit and the legend is labelled.
3. Every number shown is exact. Totals are sums of the displayed values. Percent of month = value / days in that month, rounded to a whole percent. Deviation = value minus that site's own 12-month mean, one decimal place, signed.
4. Hover or keyboard focus on any value shows: site, month, clear nights, percent of the month's nights, and deviation from the site mean. The readout appears within 150 ms, never covers the value being read, and stays inside the viewport.
5. Keys (each also available as a visible clickable control with its key shown on it):
   0  original order, as in the table.
   1  sort by annual total, high to low.
   2  sort by elevation, high to low.
   3  sort by Bortle class, dark to bright.
   Ties in any sort break by annual total (high to low) and then by name (A to Z).
   D  toggles Deviation mode. Every value is re-encoded as its difference from its own site's monthly mean, on a diverging scale centred on 0 that is readable with red-green colour blindness (avoid red and green). The legend changes with the mode and a label says which mode is on. Absolute mode uses a sequential scale.
   B  cycles the Bortle filter: All, then 1-3, then 4-6, then 7-9, then All. Rows outside the filter leave the display and totals update.
   Arrow keys move a visible focus ring between values. Nothing is focused at load. The first arrow press focuses the first visible site's January value and does not move it further. The focus stops at the edges.
   Enter pins or unpins the focused value (at most two pins; a third pin replaces the oldest). Two pins show a comparison panel with both values and their difference.
   Escape clears focus and pins, but not sort, filter or mode.
6. Pointer: hovering a value does what focus does. Clicking a value pins it. Clicking a site name selects that site (its row stays at full strength and the other rows fade to 35 percent opacity); clicking the same name again, or empty background, clears the selection. Hovering a month label highlights that month.
7. A state label always says, in words, the current sort, filter and mode.
8. Motion: a re-sort, a filter change or a mode change animates in at most 400 ms and is finished 600 ms after the key press.
9. Smallest text is 12 px. Initial state: original order, absolute mode, filter All.

THE FIVE QUESTIONS (the page must make each answerable without instructions)
Q1. Which site had the most clear nights in March?
Q2. Which month has the fewest clear nights summed across all eight sites, and which has the most?
Q3. Which sites have at least one month that is 10 or more clear nights below that site's own monthly average?
Q4. Which site has the most clear nights over the year, and is it also the highest-elevation site?
Q5. Among the dark sites (Bortle 1 to 3), which has the fewest clear nights in January?
````

**Answer key (P5, grader-only, script-verified):**

| Q | Answer | Notes |
| --- | --- | --- |
| Q1 | **Ember Dunes**, 27 | Runner-up Ninefold Mesa, 26. The one-night gap is deliberate: it rewards exact values. |
| Q2 | Fewest **December** (97); most **June** (151) | Month totals Jan to Dec: 101, 102, 123, 139, 149, 151, 144, 133, 140, 139, 110, 97. |
| Q3 | **Ninefold Mesa** (Jul -12.0, Aug -13.0), **Larch Basin** (Jan -11.2, Feb -10.2, Dec -11.2), **Ember Dunes** (Aug -10.8) | No other site has a month 10 or more below its own mean. Deviation mode is the intended route. |
| Q4 | **Ember Dunes** (298 nights). **No**, Ninefold Mesa (2410 m) is the highest-elevation site (252 nights). | Annual totals: Ember 298, Ninefold 252, Kestrel 217, Larch 194, Quarry 160, Foxglove 156, Saltmarsh 131, Brightwater 120. |
| Q5 | **Larch Basin**, 5 | Bortle 1-3 sites: Ember 26, Ninefold 24, Kestrel 12, Larch 5 (January). |

Other exact figures to check: site means are Kestrel 18.08, Saltmarsh 10.92, Quarry 13.33, Ninefold 21.00, Larch 16.17, Brightwater 10.00, Ember 24.83, Foxglove 13.00. Ember Dunes / Aug reads 14 nights, 45% of 31, deviation -10.8.

**Capture plan and interaction scripts (P5)**

Viewport 1600x900 unless stated. **T0 = `load` event + 800 ms.** After each input, wait the stated settle time, then capture. Inputs are keyboard unless stated, so the same script runs against all five builds without knowing their DOM.

*Keyboard track (exact, automated input only):*

| Step | Input | Settle | Capture | Expected |
| --- | --- | --- | --- | --- |
| K0 | none | T0 | **P5-V00** | Initial state: original order, absolute mode, filter All; no focus ring; state label reads sort/filter/mode. |
| K1 | `1` | 700 ms | P5-V01 | Rows: Ember Dunes, Ninefold Mesa, Kestrel Ridge, Larch Basin, Quarry Hollow, Foxglove Fell, Saltmarsh Point, Brightwater Pier. |
| K2 | `D` | 700 ms | P5-V02 | Deviation mode on; legend and label changed; Ninefold Jul/Aug, Larch Dec/Jan/Feb and Ember Aug are the strongest negatives. |
| K3 | `D` | 700 ms | P5-V03 | Back to absolute; visually equal to V01. |
| K4 | `B` | 700 ms | P5-V04 | Filter 1-3: Ember Dunes, Ninefold Mesa, Kestrel Ridge, Larch Basin, in annual-total order; month totals recomputed over those four. |
| K5 | `ArrowRight` | 300 ms | P5-V05 | Focus ring on Ember Dunes / Jan (26). |
| K6 | `ArrowRight` x2 | 400 ms | P5-V06 | Focus on Ember Dunes / Mar; readout: 27 nights, 87% of 31, deviation +2.2. |
| K7 | `Enter`, `ArrowDown`, `Enter` | 600 ms | P5-V07 | Two pins: Ember Dunes / Mar (27) and Ninefold Mesa / Mar (26); comparison shows difference 1. |
| K8 | `Escape` | 400 ms | P5-V08 | Focus and pins cleared. Sort, filter and mode still applied. |
| K9 | `B` x3 | 700 ms | P5-V09 | Cycle 4-6, 7-9, All: all eight rows visible again. |
| K10 | `2` | 700 ms | P5-V10 | Elevation order: Ninefold, Kestrel, Larch, Foxglove, Ember, Quarry, Brightwater, Saltmarsh. |
| K11 | `3` | 700 ms | P5-V11 | Bortle order: Ninefold (1), Ember (2), Kestrel (2), Larch (3), Foxglove (4), Quarry (5), Saltmarsh (6), Brightwater (8). |
| K12 | `0` | 700 ms | P5-V12 | Original order again. |
| K13 | `ArrowLeft` x2 | 300 ms | P5-V13 | The first press focuses the first visible site's January value; the second must leave the focus on January (the left edge). |

*Pointer track (an operator, human or scripted, locates targets by their visible labels; coordinates are not fixed):*

| Step | Action | Capture | Expected |
| --- | --- | --- | --- |
| M1 | Hover Ember Dunes / Aug | P5-M01 (after 300 ms) | Readout: Ember Dunes, Aug, 14 nights, 45% of 31, deviation -10.8. Readout does not cover the cell. |
| M2 | Hover the Dec month label | P5-M02 | The Dec column is highlighted. |
| M3 | Click the "Larch Basin" site name | P5-M03 | Larch row at full strength, the other seven at about 35%. |
| M4 | Click empty background | P5-M04 | Selection cleared; visually equals V12. |
| M5 | Click Ember Dunes / Mar, then Ninefold Mesa / Mar | P5-M05 | Same comparison as V07. |
| M6 | Resize the viewport to 1280x720 and wait 600 ms | P5-M06 | Layout intact, no scrollbars, text at least 12 px. |
| M7 | Resize to 1920x1080 | P5-M07 | Layout intact, no scrollbars. |

*Question trial (human, blind):* three evaluators who have not seen the data. Each gets the page cold, with no key hints from the evaluator. Each answers Q1 to Q5 within 120 s, with a stopwatch.

**Human rubric (P5)**

| # | Criterion | Wt | Evidence | A 4 looks like | Caps at 1 when |
| --- | --- | --- | --- | --- | --- |
| 1a | Task success Q1 | 6 | Question trial | Correct in 30 s or less, unaided: 4. Correct in 31 to 60 s: 3. Correct in 61 to 120 s: 2. Correct only after a hint: 1. Wrong or none: 0. | (scale at left) |
| 1b | Task success Q2 | 6 | Question trial | As above. Both the fewest and the most month must be right. | |
| 1c | Task success Q3 | 6 | Question trial | As above. All three sites must be named. | |
| 1d | Task success Q4 | 6 | Question trial | As above. Both parts must be right. | |
| 1e | Task success Q5 | 6 | Question trial | As above. | |
| 2 | Encoding and graphical integrity | 20 | V00, V02, M01 | Sequential single-hue scale for absolute and a diverging non-red/green scale for deviation; legend and units accurate; no misleading truncation; every shown figure exact (spot-check 10 values); takeaway sentence is true; colour-blind safe. | Colours mislead, a number is wrong, or the takeaway is false. |
| 3 | Interaction behaviour as specified (items 4 to 8) | 20 | V01 to V13, M01 to M05 | Every key and pointer behaviour in the script works exactly; readout is inside the viewport and uncovered; transitions are done within 600 ms; focus ring visible; the arrow edge rule holds. | Three or more specified behaviours missing or wrong. |
| 4 | Layout, hierarchy and typography | 15 | V00, M06, M07 | A clear reading order; the chart dominates; annotations sit beside what they describe; type scale is sensible; nothing under 12 px; layout survives 1280x720 and 1920x1080. | Cramped or clipped; the chart is secondary; scrollbars at a required size. |
| 5 | Aesthetic craft and motion | 10 | V00, V01, V02 | A deliberate, restrained design; sorting animations are smooth and readable; hover and focus states feel designed. | Default-looking or noisy; transitions jarring or over 400 ms. |
| 6 | Runtime robustness | 5 | all | No console output, works from `file://`, nothing external, keyboard reaches every function. | Errors, or a function that needs the pointer only. |

Sum of weights: 6 x 5 + 20 + 20 + 15 + 10 + 5 = **100**.

---

### 5.6 VIS-P6: Ripple Rail

*Interactive kinetic toy. Stage `0 0 1600 900`.*

````frozen-VIS-P6
VIS-P6  "Ripple Rail"  (interactive kinetic toy)
Applies: contract sections 1 to 5, 8 and 9. The stage is an SVG `<svg id="stage" viewBox="0 0 1600 900">` that fills the viewport (1 user unit = 1 pixel at 1600x900). HTML may be used for the HUD only, in the band y 780 to 880. Contract 4.2 holds for the stage, with no scrollbars from 1024x576 up. Contract 4.4's keyboard rules apply.

BRIEF
Build a toy: a rail of 25 pendulums, each coupled to its neighbours, so that a disturbance travels along the row as a wave, reflects from the ends and slowly dies away. You can grab any pendulum and let it go. The physics must be right (it is checked against a reference), the touch must feel immediate, and the picture must make the wave beautiful. It is judged on physical fidelity, interaction feel, visual craft and stability.

PHYSICS (binding)
- N = 25 pendulums, indexed i = 0..24, left to right. Pendulum i hangs from a pivot at (x_i, 100) with x_i = 800 + 56 * (i - 12). Its rod is 520 long. Its angle theta_i is measured from straight down, positive toward +x. The bob is at (x_i + 520 * sin(theta_i), 100 + 520 * cos(theta_i)). At rest every bob is at y = 620.
- Equation of motion, in seconds and radians:
    theta_i'' = -w2 * sin(theta_i) + k * (theta_(i+1) - 2 * theta_i + theta_(i-1)) - g * theta_i'
  with w2 = 4.0 and k = 60.0.
- Damping g has three levels: level 1 is 0.0, level 2 is 0.25 (the default), level 3 is 1.2.
- Ends: Fixed (default) means theta_(-1) = theta_25 = 0. Free means theta_(-1) = theta_0 and theta_25 = theta_24.
- Integration: fixed time step dt of at most 1/240 s, with an accumulator driven by real elapsed time (clamped to 0.1 s per frame), using a symplectic or fourth-order method. Explicit Euler is not acceptable. The result must not depend on the display's frame rate.
- Energy readout: E = sum over i of [ 0.5 * theta_i'^2 + w2 * (1 - cos(theta_i)) ] + sum over i = 0..23 of [ 0.5 * k * (theta_(i+1) - theta_i)^2 ], plus, in Fixed mode only, 0.5 * k * (theta_0^2 + theta_24^2). With damping level 1 and no dragging, E must stay within 2 percent of its value at release over at least 30 seconds.
- Dragging: pointer-down within 30 units of a bob grabs it. While held, that pendulum's angle is set every step to atan2(px - x_i, py - 100), where (px, py) is the pointer position in stage units, clamped to +/- 80 degrees, with its angular velocity set to 0. The other 24 pendulums keep obeying the equation. On release the grabbed pendulum starts from rest at its current angle. Dragging works while paused (it sets the pose; dynamics resume when unpaused). Support pointer events (mouse, pen and touch).

CONTROLS (each also available as a visible clickable control with the key shown on it)
  1, 2, 3   damping level 1, 2, 3.
  F         toggles the ends between Fixed and Free.
  Space     pauses and resumes the dynamics.
  R         resets every pendulum to rest (angle 0, velocity 0) and keeps damping, ends and pause state.

HUD (in the band y 780 to 880; it must not cover the pendulum field)
Show: the damping level and its g; the ends (Fixed or Free); the energy as "E = 12.34" (rad^2/s^2, two decimals, refreshed at least 10 times a second); PAUSED when paused; and a short hint such as "Drag a bob" while nothing has been touched yet.

VISUALS
- A rail from x = 88 to x = 1512 at y = 100, with a pivot visible at each pendulum.
- Rods and bobs (bob radius 18). The bobs and rods must read clearly while moving. Show a smooth ribbon or curve through all 25 bob centres, so the wave profile is visible as a continuous line.
- Encode motion state in the picture beyond position: for example tint or glow bobs by angular velocity with a scale that is readable and not red-green. Hovering a bob shows a hover ring and the cursor changes to a grab cursor; holding it shows a held style.
- Nothing may flicker or alias badly at 1600x900 and the stage must stay crisp when the window is resized.
````

**Reference run (P6, grader-only).** A throwaway script integrated the stated system with a velocity-Verlet step of 1/2000 s. Initial condition: pendulum index 12 pinned at 30 degrees for 0.1 s, then released from rest, all others at rest. `T0` is the release moment.

| Condition | Result | Use |
| --- | --- | --- |
| Energy at release | **E0 = 16.99** | Energy readout check; the allowed band is 16.5 to 17.5 to absorb pointer rounding. |
| Damping 1 (g = 0), Fixed, from T0+1 s to T0+30 s | E stays at 16.99 (drift under 0.1%) | Integrator quality. Threshold is 2%. |
| Damping 1, Fixed | Pendulum index 2 first exceeds 2 degrees at **T0 + 1.03 s** | Wave speed. Accept T0 + 0.8 s to T0 + 1.3 s. |
| Damping 1, Fixed | End pendulum (index 0 or 24) is about 8.6 degrees at T0+1.6 s and about 4.8 degrees at T0+2.4 s | Informative only, +/- 3 degrees and timing jitter. |
| Damping 1, Free | End pendulum is about -12.7 degrees at T0+2.4 s | Free ends swing wider than fixed (4.8 degrees) at that time. Fixed-end swing must be under 8 degrees, free-end at least 8. |
| Damping 2 (g = 0.25), Fixed | E = 13.25 at T0+1, 1.38 at T0+10, 0.01 at T0+30 | Decay shape. |
| Damping 3 (g = 1.2), Fixed | E = 5.22 at T0+1, 1.53 at T0+2, 0.15 at T0+4, 0.01 at T0+6 | Heavy damping; the whole rail is within 0.5 degrees at T0+6. |

**Capture plan and interaction script (P6)**

Viewport 1600x900 unless stated. Stage unit = pixel here. **T0 = the moment of pointer-up.** The drag is **one** pointer-move event (a jump, not a slow drag) so the reference is exact: down at (800, 620), move to (1060, 550) in a single event, hold 100 ms, up. The target angle is atan2(260, 450), which is 30.0 degrees.

| Step | Input | Capture | Expected |
| --- | --- | --- | --- |
| S0 | load, wait 800 ms | **P6-K00** | Rest: all bobs at y = 620 on a straight ribbon; hint shown; E = 0.00; damping level 2, Fixed. |
| S1 | `1` | P6-K01 | HUD: damping level 1, g = 0.0. |
| S2 | pointer moves to (800, 620) | P6-K02 | Hover ring on pendulum 12; grab cursor. |
| S3 | pointer down, jump to (1060, 550), hold 100 ms | P6-K03 | Pendulum 12 at 30 degrees; held style; its neighbours begin to respond; E rising. |
| S4 | pointer up (T0) | none | |
| S5 | capture at T0 + 0.4, 0.8, 1.2, 1.6, 2.4, 4.0, 10.0, 30.0 s | P6-K04 to P6-K11 | Pulse spreads left and right, reaches the ends at about T0+1.0 s, reflects. E reads 16.99 (within 2%) in every one. |
| S6 | `R` | P6-K12 | Back to rest; E = 0.00; visually equal to K00. |
| S7 | `F` (Free), repeat S3 to S4, captures at T0 + 1.0, 2.4, 4.0 s | P6-K13 to P6-K15 | HUD says Free; the ends swing wider than under Fixed at T0 + 2.4 (at least 8 degrees against under 8). |
| S8 | `F` (Fixed), `3`, repeat S3 to S4, captures at T0 + 1, 2, 4, 6, 10 s | P6-K16 to P6-K20 | E near 5.2, 1.5, 0.15, 0.01, 0.00; rail visibly still by T0 + 6 s. |
| S9 | `1`, drag pendulum 0 hard: down at (128, 620), single jump to (700, 150) (an 85 degree pull, which must clamp to 80), hold 100 ms, up. Capture at T0 + 2 s and T0 + 10 s | P6-K21, P6-K22 | The held pendulum sits at 80 degrees, not 85; no NaN and no explosion afterwards; E finite and steady at damping 1. |
| S10 | `Space` during motion, capture; wait 3 s; capture; `Space` again | P6-K23, P6-K24 | PAUSED is shown; K24 equals K23 pixel for pixel (aside from the cursor); motion resumes after the second `Space`. |
| S11 | Resize to 1280x720, 1024x576 | P6-K25, P6-K26 | Stage scales uniformly; HUD stays in the viewport; no scrollbars. |
| S12 | Frame-rate independence: repeat S1 to S5 with CPU throttled 4x (capture tooling) | P6-K27 | E at T0 + 4.0 s reads 16.99 within 3%; pulse arrival is within 0.3 s of S5. |
| S13 | `Tab` once, then any control key | P6-K28 | A visible focus indicator on the HUD controls; the keys work. |

| ID | When | Viewport | Purpose |
| --- | --- | --- | --- |
| P6-RT | real time during S3 to S5 | 1600x900 | Frame-time trace for contract 8.1. |
| P6-V1 | screen recording of S1 to S5, 30 s | 1600x900 | The reviewers' motion reference. |

**Human rubric (P6)**

| # | Criterion | Wt | Evidence | A 4 looks like | Caps at 1 when |
| --- | --- | --- | --- | --- | --- |
| 1 | Physics fidelity | 25 | K03 to K22 + HUD readings | Energy readout matches the definition and stays within 2% over 30 s (K04 to K11 all in the 16.5 to 17.5 band); first arrival at pendulum 2 within the 0.8 to 1.3 s window; damping decay close to the reference table; free versus fixed end behaviour as in S7. | Energy drifts upward or collapses at damping 1, or the wave speed is off by a factor of 2, or the ends are wrong. |
| 2 | Interaction feel | 20 | K02, K03, V1 | Grab target is generous, hover and held states are clear, the pose follows the pointer instantly, release is from rest, dragging works while paused, touch/pen supported. | Laggy or sticky grabbing, or the angle clamp is missing. |
| 3 | Visual craft of the chain and its motion | 20 | K04 to K11, V1 | The ribbon makes the wave shape beautiful; bobs and rods stay crisp; the velocity encoding is readable and not red-green; a distinct hover and held style; the field is well composed. | Hard to read the wave, the aliasing is visible, or the encoding is red-green only. |
| 4 | Stability and time-step correctness | 10 | K21, K22, K27, RT | Large drags, 80-degree clamp, throttled CPU and a 0.1 s frame hitch all leave the system finite and consistent; no NaN, no explosion. | Blow-ups or frame-rate dependence beyond 5%. |
| 5 | HUD and controls | 10 | K00, K01, K12, K23, K28 | Every control and key works, the HUD is exact and stays out of the pendulum field, a visible focus indicator on controls. | Keys missing or the HUD covers the field. |
| 6 | Composition and polish | 10 | K00, K11 | A deliberate palette and background that serves the motion; a good rest state with a gentle invitation to act; consistent typography. | Looks like a debugging screen. |
| 7 | Runtime robustness | 5 | K25, K26, RT | 55+ fps average; no console messages; works from `file://`; fit at 1024x576. | Under 30 fps or errors. |

---

## 6. Scoring and review protocol

**Eligibility gates (pass or fail, done by a contract lint plus a load test).** These decide whether a cell is scored at all. They do not measure visual quality.

| Gate | Check | If failed |
| --- | --- | --- |
| G1 | `index.html` exists, loads, and renders something within 2 s | Cell scores 0; captures are still published. |
| G2 | The page makes zero network requests (capture tooling blocks all and logs attempts) | Cell scores 0. |
| G3 | No forbidden technology: `<canvas>`, WebGL, `<img>`, SVG `<image>`, raster `data:` URIs, external references (source text lint) | Cell scores 0. |
| G4 | File is at most 300,000 bytes | Cell scores 0. |

Other contract departures (console warnings, scrollbars at a fit-check size, `?t=` ignored, wrong title length) are scored inside each prompt's "robustness" criterion, not as gates.

**Rubric scale (every criterion).**

| Score | Meaning |
| --- | --- |
| 0 | Absent, or broken so that it cannot be judged. |
| 1 | Attempted, with a major fault (see the "Caps at 1 when" column). |
| 2 | Meets the minimum; visible defects. |
| 3 | Strong; only minor defects on close inspection. |
| 4 | Excellent; no defect found at 2x zoom or at 0.25x video speed. |

Prompt score = sum of (weight x score / 4), out of 100. Each prompt's weights sum to 100.

**Who reviews.**

- At least **three** reviewers per prompt, **blind**: captures are labelled with random codes, shuffled per reviewer, and file names and any text revealing the model are stripped. `NOTES.md` is withheld until after scoring.
- Reviewers score only from the listed evidence ids. Intentions stated in `NOTES.md` earn nothing.
- Final criterion score = the median of the three. If the raters differ by 2 or more on a criterion, they discuss it and re-score once. The final value is the median of the revised scores.
- The P5 question trial uses three separate evaluators who have never seen the dataset, and who do not score any other P5 criterion.
- Unblind only after all 30 cells are scored.

**What is never accepted as proof of visual correctness.** DOM node counts, element counts, attribute presence or "has a gradient" style checks. Scripts may extract numbers only to **draw overlays**, to **compute the squint map**, to **measure frame times**, and to **diff two captures that must be identical**. A person always makes the quality call.

**Aggregates.** Per entrant: mean of the six prompt scores (headline), plus a spread by category (static, animated, interactive). Publish the full per-criterion table so a reader can see where a model won.

---

## 7. Capture environment protocol (frozen for stage 2)

| Item | Setting |
| --- | --- |
| Browser | Chromium via Playwright, pinned version recorded in the capture log |
| OS and fonts | Windows 11, default system fonts, no font install |
| Display | DPR 1 (DPR 2 only where a capture says so), `colorScheme: light`, `reducedMotion: no-preference` |
| Network | All requests aborted and logged. Any attempt triggers G2. |
| Load path | Each capture is made twice, once from `file://` and once from a static server at a sub-path (`/play/<run-id>/<prompt-id>/`). The two must be pixel-identical for static and `?t=` captures. |
| Determinism check | Static captures are taken twice; they must match. Loop captures are taken after a reload each time. |
| Time | Loop prompts only through the `?t=` hook, plus one real-time run for frame timing. |
| Interaction clock | Interactive prompts: T0 = `load` event + 800 ms. All settle times in the scripts are wall-clock. |
| Evidence storage | PNG for stills, MP4 (assembled from frame dumps) for loops, a WebM screen recording for P6-V1, JSON for frame-time traces. |
| Hardware | One reference machine for every run. Its model is recorded so the fps statements in contract 8.1 mean one thing. |
| Who captures | The capture tooling. Entrants never supply screenshots. |

---

## 8. Freeze manifest and change control

Verification method: for each `frozen-<ID>` block, take the text between the opening and closing 4-backtick fences, normalise line endings to LF, strip the final newline, and take the SHA-256 of the UTF-8 bytes. A block is frozen when this table matches.

```js
// node verify.mjs prompts.md
import { readFileSync } from 'node:fs'; import { createHash } from 'node:crypto';
const t = readFileSync(process.argv[2], 'utf8').replace(/\r\n/g, '\n');
for (const m of t.matchAll(/^````frozen-([A-Za-z0-9-]+)\n([\s\S]*?)\n````$/gm))
  console.log(m[1], createHash('sha256').update(m[2]).digest('hex'));
```

| Block | Title | Kind | Artboard | SHA-256 (candidate) |
| --- | --- | --- | --- | --- |
| VIS-CONTRACT | Shared output contract v0.1 | shared | n/a | `a16853cdc63187f010304790e03b5f05131941361daeb905423d39481e8b47bf` |
| VIS-P1 | Glasshouse at Blue Hour | static, composition | 1600x1000 | `e60954c75ef9dd2ed31ead0c1d76751af6192d4a0fb09ae072a07d4f4d23e10e` |
| VIS-P2 | Sheet KHP-100: Kestrel Hand Pump | static, technical diagram | 1680x1188 | `1c5393f5add4335b85ab44ccf87546538c7450df6d505de8dd33fe2c555be7d5` |
| VIS-P3 | Straight-Line Linkage | loop, mechanical, D = 6 s | 1600x900 | `3e24503ab8f4f3e1f8f5bb384f17758f8638045ed1fa704a106a3d473c6b155e` |
| VIS-P4 | The Last Ferry | loop, narrative, D = 12 s | 1600x900 | `aef9f69310f1b9b013178c328791bdd9928e7328f67b50674aac1e4a34639933` |
| VIS-P5 | Clear Skies Ledger | interactive, data viz | viewport | `e5bc65c078154e7e68367d907edded325840b27ffce862759a2f438d4f446376` |
| VIS-P6 | Ripple Rail | interactive, kinetic toy | 1600x900 stage | `a5e2dc21faef68a3a37d3d66883c3f45fd2eac441bff4b47aac8ab129a3089a7` |

**Change control.**

- These are **candidates**. Nothing is frozen until the open questions below are answered and the table is re-computed on the final text.
- After freeze, any edit to a frozen block, even a typo, bumps the pack version and is recorded here, and **all** affected cells are re-run. Edits to the reference notes, answer keys, rubrics and capture plans do not touch the blocks, but must be dated here.
- Do not publish these prompts before the runs. The arcade shows the briefs next to the builds; do the same only after all 30 cells are done.

---

## 9. Open questions and known risks (for the reviewer of this plan)

1. **Claude effort levels.** The brief names the Claude models without an effort. I assumed `high`, to match the arcade (`catalog/models.json`). Confirm. The effort setting belongs in the run id.
2. **The `?t=` hook.** It makes loop captures exact, but it is an extra requirement that a model might miss, and then P3 and P4 lose their timed evidence. The alternative (virtual-time clocks in the capture tool) does not drive CSS or SMIL animation reliably. I chose the hook, and a missing hook is scored under "runtime robustness" rather than as a gate, so the entrant can still be judged from the real-time video. Decide whether to make it a gate.
3. **`<canvas>` and WebGL are banned.** That keeps the work inspectable and fair, but it caps P6's body count and rules out a whole style. If you want a "free-form renderer" prompt, it should be a seventh prompt with its own contract.
4. **Spec-following versus taste.** P3, P6 and P2 reward exactness heavily. That is on purpose (it is the measurable part) but a model that follows every number and draws ugly pins can still score about 70. The weights on craft are 25 to 45 percent per prompt. Review whether that split is right.
5. **P5 key bindings reduce discoverability.** The prompt spells the keys out, so Q-trial speed depends on how well the page shows them. This is intended, but the evaluators must not be told the keys.
6. **Mathematical traps.** P3 sits near a singular configuration (OC = 173.2 at the extremes against a limit of 160). The ferry timeline has the passenger leaving the frame at 9.42 s, before the lantern's last fade. Both were checked by script, but a human should look at the P3 table once.
7. **P6 drag protocol.** The reference needs a single-jump drag. A slow drag changes the initial condition because the neighbours respond while the pendulum is being held. The script says single-jump for that reason. If the capture tool cannot send one move event, use `page.mouse.move` with `steps: 1`.
8. **Variance.** One run per cell, as in the arcade, will be noisy. A later registered cohort should use three trials and average all attempts; never select the better attempt.
9. **Contamination.** All six subjects are invented for this pack, but the checks resemble standard exercises (isometric scene, inversor linkage, pendulum wave). A model may have seen similar ones. The binding numbers should limit this; no model should be able to pass criterion 1 of P3 or P6 by recall alone.
10. **Naming.** "Oneshot Canvas" is a placeholder. A rename costs nothing before freeze.
11. **Hardware and fps.** Contract 8.1 depends on one reference machine, so pick it and record it before the first capture.
12. **Not done in stage 1** (on purpose): the harness wrapper text, the capture tooling, the overlay generators, the rater sheets, and every entry.
