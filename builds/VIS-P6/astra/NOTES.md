# Ripple Rail notes

Assumptions: the toy starts at rest. Velocity colour runs from blue (negative) through slate (zero) to amber (positive), saturating at 2.5 rad/s. The curve follows bob index order even when bobs cross. Nearest-centre selection resolves overlapping hit areas.

Implementation: fixed 1/240-second RK4 integration, real-time accumulator with a 0.1-second frame clamp, prescribed drag angle at every integration stage, and zero release velocity.

Verified in headless Chrome: file loading; no network requests, console errors or warnings; mouse drag while paused; keyboard controls; clickable damping and ends; reset preserving settings; HUD fit without overlap or scrollbars at 1024×576. Thirty simulated undamped seconds produced maximum relative energy drift of 0.000413% (Fixed) and 0.000164% (Free). A 120-frame sample at 1600×900 averaged 6.95 ms, maximum 7.1 ms.

Not verified: physical touch/pen devices, hosted root/sub-path URLs, or performance on the review GPU. No known functional defects; bobs naturally overlap during dense waves.
