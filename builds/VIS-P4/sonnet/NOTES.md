# Notes: The Last Ferry

**Assumptions**
- Sea is drawn from the horizon (y=420) down. A translucent water layer starts at the y=640 waterline and veils the submerged hull.
- Passenger "emerges" from the doorway by fading in as a dark silhouette against the lit door, then taking colour and lantern light. The doorway clip only trims the left jamb.
- Foam is gated by current speed, so it is absent at rest. The wake fades as the ferry leaves the screen.
- The lantern reflection sits at x≈935 beside the quay edge. The lantern itself is over land.
- Ferry bob is ±2.5 units; the ramp and feet follow it.

**Verified** (headless Chrome, `?t=` stills at 0, 2, 4.4, 5.3, 6.5, 7.6, 7.7, 9.3, 10, 11.9, 12): frames render. t=0 and t=12 are pixel-identical. No console output appeared in the headless log. File is about 36 KB.

**Not verified**
- Live 55 fps and the 50 ms frame cap.
- Subpixel foot planting. It is exact by construction; I did not measure it.
- Sub-path hosting.

**Known defects**
- Foam is stylised.
- The passenger's face is simple.
- The steam plume is a column of soft puffs.
