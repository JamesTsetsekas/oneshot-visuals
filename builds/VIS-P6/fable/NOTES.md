# VIS-P6 Ripple Rail: notes

**Assumptions**
- RK4, dt = 1/480 s, accumulator, 0.1 s frame clamp; rendering interpolates between steps.
- Colour scale is ±1.5 rad/s (blue–steel–orange), clamped. The angle-profile strip (y 650–774), coupling thread, ghost ribbons and title are my additions; the profile flattens beyond ±63°.
- Space always pauses, even with a button focused (Enter activates it). Multi-touch grabs several bobs.
- The stage has `aria-label` and `<desc>` but no `<title>` (avoids a hover tooltip). `window.rippleRail` is a test hook.

**Verified (headless Chrome, Windows)**
- Matches an independent fine-step reference to under 1e-8 rad after 10 s (all damping levels, both ends).
- Level 1 energy drift 0.0000 % over 32 s after a pointer release.
- Keys, buttons, hover, drag, paused drag; no console output, no requests, no scrollbars at 1024x576 to 1920x700.
- Sim time tracks wall time at 48, 84 and 126 fps.

**Not verified**
- Touch and pen input; 55 fps on the review GPU; contrast ratios measured by tool.
