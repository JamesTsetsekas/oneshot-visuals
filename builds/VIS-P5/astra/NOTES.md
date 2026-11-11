# Implementation notes

Assumptions: month lengths describe a non-leap year. The absolute scale stays fixed at 0–31 nights; deviation stays fixed at −18 to +18 nights. Annual totals always sum each site's twelve months. Pins remain available when their rows are filtered out. Comparison reports B minus A in clear nights, regardless of encoding mode. Small bars identify deviations at or below −10 nights.

Verified in local headless Chrome using Playwright: all 96 tiles, month and annual totals, initial focus, arrow edge behavior, hover readout, selection toggle, sorting, all filter groups, deviation encoding, pin replacement, comparison, and Escape persistence. Checked no page overflow at 1280×720, 1600×900 and 1920×1080. Minimum rendered chart text was 12.6 px; tile text contrast exceeded 4.62:1 in both modes. No console errors/warnings or external requests occurred. File is under 300,000 bytes.

Not verified: GPU frame-rate targets, static-server routes, screen readers, alternate fonts. No known remaining functional defects.
