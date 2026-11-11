# NOTES: VIS-P3

**Assumptions**
- Layer order, bottom up: OA, OB, rhombus links, crank QC; pins on top. Trail above links, below P marker.
- "40% of width" is met by the base plate (680 units); the linkage alone is about 20% because coordinates are binding.
- ±60 labels sit past the arc ends, never covered.

**Verified** (headless Chrome, `file://`, 49 frames, DOM pin centres): link lengths within 0.001; P.x = 588; P.y within 0.0005 of the formula; `?t=0` equals `?t=6`; no console output, requests, or scrollbars at 640x360.

**Not verified**: static-server hosting; laptop GPU (143 fps, desktop RTX 2080 Ti only); 100 ms first-frame timing.

**Known defects**
- Near ±60° the pointer tip and end tick hide under AC/CB.
- A real build needs a bridge at Q; long links sweep across it.
- Long links pass under the Q label.
- Composition is left-weighted.
