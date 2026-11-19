# Glasshouse at Blue Hour

I treated the pond’s radius as its outer edge, with the rim extending inward. Shadow length is measured in world units along +x. Leaf shadows use simplified silhouettes. Amber pools and water reflections are drawn with gradients.

Chrome produced byte-identical screenshots from disk, a local server root, and a nested path at 1600 × 1000. The page made no subresource requests and emitted no console warnings or errors. I checked four viewport sizes for overflow, sampled foreground frond coverage before blur, and found that peak brightness stayed inside the glasshouse at blur radii from 12 to 64 pixels. I did not check other browser engines or measure every edge and shadow independently.
