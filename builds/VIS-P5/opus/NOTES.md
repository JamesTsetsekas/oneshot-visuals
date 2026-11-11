# NOTES — Clear Skies Ledger

**Assumptions**
- The page is a heatmap with a printed number in every cell. A fixed 1600×900 stage is scaled to fit the viewport. The smallest design text is 15 px, so it is 12 px at 1280×720.
- Annual and month totals always count clear nights, including in Deviation mode. Month bars are scaled to the largest month currently shown.
- A deviation that rounds to zero prints as "0.0". The deviation scale runs from −14 to +14. A dashed outline marks cells 10 or more nights below the site's mean.
- If filtering hides the focused row, focus moves to the first visible row in the same month. Pins stay listed in the compare panel. Escape does not clear the row selection.

**Verified** (headless Chrome via CDP, file://): no console errors or network requests, no scrollbars at 1280×720, 1366×768, 1600×900 and 1920×1080, arrow/Enter/Escape/0–3/D/B, hover, month highlight, site selection.

**Not verified:** fps, the 150/600 ms timing, served-from-subpath, screen readers.
