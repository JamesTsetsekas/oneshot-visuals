# VIS-P3 notes

**Assumptions**
- Layers, bottom to top: OA/OB, crank, AC/CB, PA/BP, then pins. The crank sits above OB, so the Q pin stays visible.
- "Mechanism spans 40%" counts the base plate (x 90–800, 44%). The moving links span about 23%; the geometry is fixed.
- Trail: 72 segments sampled over t−1.5…t. They overlap and look brighter where P reverses.
- Dial labels sit inside the arc so that "0" does not hit the straightedge.

**Verified** (headless Chrome 157)
- DOM pin readback at 13 times: lengths within 0.001, P.x = 588, P.y matches the formula, the pointer equals psi, and ?t=6 equals ?t=0.
- No console messages or exceptions (CDP).
- About 144 fps headless, no frame over 20 ms.

**Not verified**: real-GPU performance.

**Known defects**: the composition is left-heavy with an empty right side. The pointer's shadow offset rotates with the pointer.
