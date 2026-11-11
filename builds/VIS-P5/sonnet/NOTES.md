# NOTES (VIS-P5 Clear Skies Ledger)

**Assumptions**
- Heat table (sites × months), numbers printed in every cell. Absolute scale is fixed 0–30 nights, cividis-like; deviation scale is orange↔blue, fixed ±14.
- Month totals stay absolute sums of displayed rows in both modes. Ties for "most/fewest" are all tagged.
- Deviation ties/rounding: signed, one decimal, ASCII "-"; computed with exact integers.
- Filter change drops focus, pins and selection that sit on hidden rows. Escape does not clear site selection.
- Hover and focus both drive one readout; hover wins while the pointer is on a cell.
- Pin labels 1/2 are stable; a third pin takes the oldest pin's label.

**Verified (headless Chrome, CDP script)**
- No scrollbars at 1280×720, 1600×900, 1920×1080; min font 12 px; no console output.
- Totals (1528; 97 min, 151 max), all four sorts, all four filters, D flags, arrows, pins, Esc, selection, month hover, tooltip inside viewport at corners.

**Not verified**
- Animation timing and 55 fps (CSS transitions 350 ms, not measured).
- Readout latency (event-driven, not timed).
- Screen-reader behaviour.
- Tooltip may cover neighbouring cells (never the read cell).
