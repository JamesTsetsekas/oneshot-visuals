# Ripple Rail: notes

**Assumptions**
- RK4 with dt = 1/240 s, using a real-time accumulator clamped to 0.1 s. Rendering does not interpolate between steps.
- Starts at rest. A held bob has zero acceleration inside every RK4 stage.
- Bob colour shows ω: blue moving left, white still, amber moving right. Glow strength follows |ω|.
- Rail segments glow with strain. A band at y 662–762 plots compressed θ.
- The HUD is HTML, scaled to stage y 780–880.

**Verified (headless Chrome, 1600x900)**
- Hover and grab cursors.
- Energy drift below 0.01% over 32 s at damping level 1.
- Keys 1/3, F, Space (also on a focused button) and R.
- Dragging while paused.
- No scrollbars from 640x360 to 1920x1080.
- No console errors.

**Not verified**
- Touch and pen input.
- Frame rate on the reference GPU (headless: ~110 fps, max frame 21 ms).
- Contrast ratios were not measured.
