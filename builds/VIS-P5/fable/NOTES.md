**Assumptions**
- A 1600x900 stage scales uniformly to the viewport; smallest text is 12 px at 1280x720.
- Colour scales: absolute 0–31 nights; deviation ±15. Corner mark = 10+ nights from site mean.
- Month totals always show clear nights; Deviation mode adds a row summing the displayed deviations.
- Negative numbers use an ASCII hyphen; zero deviation prints "0.0".
- Clicking a pinned value unpins it; pointer clicks do not move keyboard focus.
- Filtering a row out drops its pins, focus and selection. Escape keeps site selection.

**Verified** (headless Chrome, 1280x720 to 1920x1080): no scrollbars, console output or network requests; sorts, filter totals, deviations, arrows, pins, Escape, selection, month hover; tooltip placement for every cell; cell text contrast ≥ 4.5; transitions finished within 450 ms.

**Not verified / known defects**
- Real-GPU frame rate, screen readers, real viewers.
- Tooltip covers neighbouring cells in the same row.
