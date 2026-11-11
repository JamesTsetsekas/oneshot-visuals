# Ripple Rail notes

**Assumptions**
- Integrator: Strang-split velocity Verlet (exact exponential damping half-steps), fixed dt = 1/480 s, accumulator driven by real time, clamped to 0.1 s.
- Starts at rest (E = 0.00); a pulsing ring and "Drag a bob" invite the first grab. The hint disappears after the first grab.
- Reset also ends any drag in progress.
- Velocity tint scale: blue/orange (colour-blind safe), saturating around ±4 rad/s; legend drawn on stage.
- `window.rippleRail` exposes live theta/omega for inspection.

**Verified (headless Chrome, my own CDP script)**
- Energy drift 0.0005 % over 31 s (damping 1, after a drag release).
- Drag angle matches atan2; keys 1/F/Space/R work; paused state freezes dynamics.
- No console errors or warnings; no scrollbars at 640x360, 1024x576 and 1600x900; file is about 25 KB.

**Not verified**
- Real GPU frame rate (headless average ~14 ms/frame at 1600x900, one 28 ms frame).
- Touch and pen input, keys 2 and 3, and Free-mode energy are untested.
- Contrast ratios were not measured.
- Sub-path static-server rendering was not tested; the page has no external references.

**Known defects**
- Adjacent bobs overlap at large amplitudes.
- HUD text becomes small below about 800 px width.
