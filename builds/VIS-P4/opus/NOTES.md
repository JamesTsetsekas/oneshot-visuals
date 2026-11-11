# The Last Ferry — notes

**Assumptions**
- The sea plane runs from the horizon (420) down. Near water starts at the 640 waterline.
- The passenger follows the same x(t) line from t=4.6. Until about 5.0 they are hidden behind the cabin wall, and they appear through the doorway. The clip edge is the doorway's left jamb.
- The swell is 3·sin(2πt/4), scaled down to zero while the ramp is down, so the deck sits at exactly 610 during disembarkation.
- The wake is forced to fade between 11.0 and 11.5 so the closing frames are empty.
- The lantern glow appears on the passenger as a warm masked rim facing the lamp, plus a haze and a shadow.

**Verified (headless Chrome)**
- Frames at many ?t values, viewed by eye.
- ?t=0 and ?t=12 produce byte-identical PNGs.
- No page errors.
- A harness check found a planted toe slides at most 0.03 units, and the ankle moves at most 3.5 during heel lift. The IK leg never clamped.
- The JS render step takes about 0.25 ms per frame.

**Not verified**
- Real frame rate and GPU paint cost.
- Letterbox colour match at non-16:9 viewports. The background is the edge navy, and the horizon side will differ.
- Behaviour when served over HTTP.
