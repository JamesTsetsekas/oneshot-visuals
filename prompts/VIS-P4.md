VIS-P4  "The Last Ferry"  (deterministic loop animation, narrative scene)
Applies: contract sections 1 to 6, 8 and 9. Artboard viewBox: 0 0 1600 900 (1 user unit = 1 pixel at 1600x900). Loop duration D = 12.000 seconds.

BRIEF
Animate one short story as a seamless loop. At dusk the last ferry arrives at a small harbour quay and lowers its bow ramp. One passenger walks off into the evening. The ferry backs away. The quay lantern lights when the ramp touches down and goes out after the ferry has gone. The scene is seen from the side. It is judged on staging, timing, animation craft, atmosphere and loop integrity. No dialogue and no text.

STAGE (binding coordinates in user units; y grows downward)
- Horizon at y = 420. The water surface is at y = 640 across x 0 to 1000 and extends to the bottom edge. The quay is land at x 1000 to 1600, with its walking surface at y = 610 and its front face dropping to the bottom edge, and a stone edge at x = 1000.
- Ferry: a double-ended passenger ferry 520 long, centred at x_f(t), deck at y = 610, hull sitting in the water at y = 640. It has a cabin with a doorway whose centre is 100 units left of the ferry's centre, a funnel and horn 20 units left of centre, and a bow ramp hinged at deck level at the ferry's right end (x_f + 260). The ramp is 140 long, and its far end rests on the quay when it is flat.
- Lantern: on the quay at x = 1180, a post from y = 610 up to y = 450 and a lantern housing at about (1180, 440).
- Headland and lighthouse: a far headland silhouette at the left horizon, with a lighthouse whose lantern room is at (260, 330).
- Passenger: one adult figure about 170 tall, carrying a small case, in a style of your choice.

TIMELINE (binding; t in seconds; s(u) = u * u * (3 - 2 * u) is smoothstep)
- 0.0 to 0.5: empty scene. No ferry, no passenger, lantern dark, ramp raised at 65 degrees above flat.
- 0.5 to 4.0: the ferry arrives from the left. x_f(t) = -400 + 1140 * (1 - (1 - u)^3), where u = (t - 0.5) / 3.5. At t = 4.0 it stops with its bow touching the quay edge (x_f = 740). A bow wave and a wake of foam follow its speed: strong while it moves, absent when it is at rest.
- 3.8 to 5.0: the horn lets out a steam plume from the funnel. It starts at 3.8, rises at least 120 units, spreads and has faded out by 5.0.
- 4.2 to 5.0: the ramp lowers. angle = 65 * (1 - s(u)) degrees above flat, where u = (t - 4.2) / 0.8. At 5.0 it lies flat on the quay.
- 5.0 to 5.6: the lantern comes up as the ramp touches. glow = s((t - 5.0) / 0.6). Warm light falls on the quay, the ramp, the water reflection and anything standing in it. The lantern stays at full glow until 9.0.
- From 5.0: the passenger steps out through the cabin doorway at x = 640 and walks right at a constant 240 units per second: x(t) = 640 + 240 * (t - 5.0). They emerge through the doorway (clipped by it); they must not pop into view. They leave the artboard at about t = 9.4. Their feet do not slide: a planted foot stays within 4 units of the same world position during its stance phase. As they cross the lantern's light, the lit side of the figure changes to match.
- 7.3 to 8.1: once the passenger has stepped off the ramp (about t = 7.1), they glance back at the ferry: the head turns back between 7.3 and 7.7 and returns forward by 8.1, while the body keeps walking.
- 7.4 to 8.2: the ramp rises. angle = 65 * s((t - 7.4) / 0.8) degrees above flat.
- 8.5 to 11.5: the ferry backs away to the left. x_f(t) = 740 - 1140 * ((t - 8.5) / 3.0)^3. At t = 11.5 it is at x_f = -400 and fully off-screen. Wake and bow wave follow its speed.
- 9.0 to 9.6: the lantern fades out. glow = 1 - s((t - 9.0) / 0.6).
- 11.5 to 12.0: empty scene, identical to 0.0 to 0.5.

AMBIENT (loops continuously; every period divides 12 so the loop closes)
- Lighthouse beam: one soft beam from the lantern room that rotates once per 12.000 s, starting at t = 0 and pointing right. Seen side-on, a beam at rotation angle theta = 30 * t degrees has an on-screen length of 700 * |cos theta| and points right for cos theta > 0 and left for cos theta < 0. Near theta = 90 it points at the viewer and the lantern room flares brightest with almost no beam. Near theta = 270 it points away and there is no flare.
- Water: shimmer and gentle ripples on a 4.000 s period, reflecting sky, lantern and lighthouse flare.
- Stars: at least 30, at fixed positions above the horizon, each twinkling with a period of 3, 4 or 6 seconds.
- Swell: while it is on the water the ferry bobs at most 3 units vertically, period 4.000 s.

ART DIRECTION
Dusk, blue hour. Warm lantern and window light against cool sky and water. Keep the story readable: the eye must always be able to find the thing that is changing. No text anywhere in the picture.