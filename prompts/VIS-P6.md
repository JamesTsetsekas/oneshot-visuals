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