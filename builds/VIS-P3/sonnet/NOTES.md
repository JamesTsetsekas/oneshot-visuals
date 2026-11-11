# VIS-P3 notes

**Assumptions**
- Pins are drawn on top of all links; link stacking is OA/OB < PA/CB < AC/BP < crank.
- Straightedge ticks only on the right of the rule, so the dial's "0" label stays clear. A faint centre hairline sits at x=588.
- Bounding box of the six pins alone is only about 19% of the width. The "40% span" is met by the sub-plate (x 130-840, 44%).
- Dial labels sit beneath the links, so a bar can briefly cover one.
- Q's label sits below the pedestal and can be crossed by OB.

**Verified (headless Chrome, my own script)**
- Over 1,201 samples across the loop: link-length error ≤0.002, P at x=588 (≤0.001), P's y within 0.001 of 450−288·tan(ψ/2).
- Frame at t=0 equals frame at t=6.
- No console errors in the screenshot runs.
- File is 21 KB.
- ?t= frames viewed at 0, 0.4, 1.5, 3 and 4.5.

**Not verified**
- Real-GPU frame rate. Only the JS cost (~0.3 ms/frame) was measured.
- Rendering in other browsers.

**Known defects**
- The right 45% of the artboard is plain breadboard, because the geometry is fixed on the left.
- The shadow blur is a filter re-run each frame.
