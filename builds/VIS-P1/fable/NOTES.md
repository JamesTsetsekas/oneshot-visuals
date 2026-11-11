# NOTES

**Assumptions**
- Pond radius 1.0 is the water; rim spans 1.0–1.12 as a kerb raised 0.06.
- Tree crown tops out near z = 2.6 above the floor; its pot is a 0.6 square planter, 0.5 high.
- Lantern cage centred at z = 1.6; lamp is 1.9 tall.
- Shadows: `#0b1446`, 0.5 opacity, slight blur. Plants are viewer-facing billboards with sheared shadows.
- Added a crescent moon and an edge vignette fading to `#060b22`.

**Verified** (headless Chrome; 1600x1000, 640x360, 700x1100)
- No console output, 148 KB, no script.
- Structural edges within 0.03 degrees (own script).
- Fronds cover 8.3%; brightest blurred region is interior.

**Not verified**
- Static-server and sub-path serving; reviewer GPU.

**Known defects**
- Fronds are low contrast.
- Plants do not shadow each other; glass casts no shadow.
- Warm face glows are not plane-correct.
- Outside ground is plain.
