# Notes

Assumptions: pond radius 1.0 describes the water opening; its 0.12-wide rim extends outward. Tree height includes its square pot. Lantern caps end at z=1.6. Organic leaves and distant hills are exempt from the structural-edge direction rule. Reflections are stylized.

Built all structural geometry with the specified world projection. Seeded plant/star geometry is baked into the static SVG; there is no runtime JavaScript.

Verified: headless Chrome file rendering at 1600×1000 and 640×360, visually inspected both captures; SVG XML parsing; required metadata; forbidden-element/resource-reference scan; ground ellipse ratios; file size of 245,274 bytes.

Not verified: console instrumentation, live network interception, root/subpath server rendering, GPU performance, quantitative blurred-brightness and foreground-area measurements.

Known limitations: shadow occlusion at bed edges is approximated; lantern glow is a radial overlay rather than physical illumination. Glass uses restrained tint and edge reflections without optical refraction.
