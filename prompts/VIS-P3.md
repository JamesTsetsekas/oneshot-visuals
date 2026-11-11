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