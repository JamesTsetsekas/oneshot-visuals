# NOTES — VIS-P1

A Node generator (`_work/gen.mjs`) builds `index.html`, a static SVG with no script. All geometry uses the binding projection, and shadows are computed as projections of 3D primitives along (0.8, 0, −1).

**Assumptions:** lanterns are centred at z = 1.6. Shadows that pass the plinth edge drop to the ground at z = −0.3. A small moon is drawn upper-left, matching the key light. The page background is #080d22, and the artwork's edges fade into it.

**Verified (headless Chrome 157):**
- Renders at 1600×1000, 1920×1080 and 640×360.
- Edge pixels match the background.
- File is 222,792 bytes; the only URL is the SVG xmlns.
- Fronds cover 6.7% and stay clear of the plinth.
- After blurring, the brightest spot is inside the glasshouse (lantern pool), not the sky.
- No console messages captured.

**Not verified:** rendering in other browsers, and the 0.5° edge tolerance. Rounding to 0.1 px should keep edges within it.

**Known defects:** plant shadows don't fall on other plants. Only the tree and lamp 1 reflect in the pond. Bed side faces only spot-checked for face-shading order.
