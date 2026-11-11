# NOTES: VIS-P4

**Assumptions**
- Sea shows from the horizon down; y=640 is the ferry's waterline.
- From t=4.3 the passenger walks inside the cabin (clipped by window and doorway), reaching the door centre at exactly 5.0.
- Passenger passes in front of the lantern post; lit side is a masked warm overlay.
- Wake foam is force-faded 11.14 to 11.44 so 11.5 to 12 is empty.
- Swell at most 3 units peak-to-peak, damped while docked.
- Unrequested extras: hut, crates, bollards, village lights, edge vignette.

**Verified (headless Chrome, 1600x900, software rendering)**
- t=12 frame equals t=0; `?t=` frame does not animate.
- No console output, one request, no scrollbars from 640x360 to 2400x700.
- Planted-foot drift at most 0.31 units.
- 60 fps average, worst frame 19 ms.

**Not verified / defects**
- Real-GPU frame rate.
- Toy-like ferry proportions; head overlaps the lantern near t=7.25.
