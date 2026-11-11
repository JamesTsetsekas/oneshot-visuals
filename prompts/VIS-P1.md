VIS-P1  "Glasshouse at Blue Hour"  (static SVG, spatial composition)
Applies: contract sections 1 to 5, 7, 8 and 9. Artboard viewBox: 0 0 1600 1000.

BRIEF
Draw an original true-isometric cutaway of a small glasshouse standing on a stone plinth at dusk. The two rear walls are glazed and standing. The two front walls and the roof are absent, so the interior is visible. Lamps and the last moonlight make the interior the brightest part of the picture. The picture is judged on spatial correctness, consistent light, depth and craft.

PROJECTION (binding)
World axes: x runs down-right on screen, y runs down-left, z is up. A world point (x, y, z), in grid units, lands at screen
  sx = 800 + 86.6 * (x - y)
  sy = 330 + 50 * (x + y) - 100 * z
Every structural edge you draw (floor, plinth, walls, bed boxes, mullions, pots, lamp bases) is parallel to one of three screen directions: vertical, +30 degrees (the x axis) or -30 degrees (the y axis), within 0.5 degrees. A circle lying on a floor or bed plane is an ellipse with a horizontal major axis and a minor-to-major ratio of 0.577 (+/- 0.03). Its centre is the projection of the circle's centre.

REQUIRED CONTENT (positions are world coordinates)
1. Plinth and floor. The floor covers 0 <= x <= 6, 0 <= y <= 6 at z = 0, with a 6 x 6 checkerboard of two stone tones. The plinth is a box under the floor, 0.3 high (z from -0.3 to 0), with both visible side faces drawn. The floor diamond's corners therefore land at (800,330), (1319.6,630), (800,930) and (280.4,630).
2. Rear walls. The rear-left wall lies on the plane x = 0 (y from 0 to 6). The rear-right wall lies on the plane y = 0 (x from 0 to 6). Both are 2.8 high. Each is glazed in an iron frame: mullions every 1.0 along the wall and one transom at z = 1.4, frame stock at least 5 screen units wide. The glass is tinted and reads as glass (reflection, edge highlight) without hiding what is behind it.
3. Outside. Through the glass and around the whole structure the viewer sees one continuous dusk sky: at least four colour stops from deep blue at the top to warm amber-rose at a horizon at y = 300, two layers of distant hills (the farther layer lighter and bluer), and sparse stars in the upper 40 percent of the artboard. The horizon must be continuous across panes, not repainted per pane.
4. Pond. A round pond centred at (3, 3), radius 1.0, with a stone rim 0.12 wide, still water that reflects the sky tone, and three lily pads lying on the ellipse-correct ground plane.
5. Planting. Raised bed A covers x 1.6 to 5.6, y 0.3 to 1.2. Raised bed B covers x 0.3 to 1.2, y 1.6 to 5.6. Both are 0.4 high. Together they hold plants of at least three clearly different species (for example spiky, fan-leaved and feathery) at varied heights. A specimen tree 2.6 high stands in a pot centred at (0.9, 0.9).
6. Lamps. Three cast-iron lamp standards, each with a lantern on top at z = 1.6, stand at floor positions (1.8, 2.0), (4.9, 2.0) and (3.0, 5.2). Each lantern throws a warm pool of light on the floor. The pool is an ellipse of the correct ratio, about 1.3 grid units in radius, centred exactly under its lantern (same screen x as the lantern).
7. Moonlight and shadows. The cool key light comes from the rear-left. Every cast shadow lies along the +x direction on screen (30 degrees below horizontal, down-right), is 0.8 times the casting object's height long, and is a deep blue at 35 to 60 percent opacity. Round objects cast the correct skewed shape. Shadows fall only on surfaces they could reach.
8. Face shading. Every box-like object follows one rule: the top face is lightest, the face whose normal is +y (the left-visible face) is mid-tone, and the face whose normal is +x (the right-visible face) is darkest. Lamp light may add warmth near the lanterns but may not reverse this order.
9. Foreground. Two large blurred frond silhouettes frame the bottom corners (bottom-left inside x 0 to 420, y 700 to 1000, and bottom-right mirrored). Together they cover at least 3 percent of the artboard, use a Gaussian blur of at least 4 units, and do not overlap the glasshouse.
10. Hierarchy. After the picture is blurred, its brightest region must sit inside the glasshouse interior (lanterns, their pools or the pond), not in the sky.
11. No text, logos, people or animals.