VIS-P5  "Clear Skies Ledger"  (interactive data visualization)
Applies: contract sections 1 to 5, 8 and 9. Contract 4.2 is replaced for this prompt by: the page fills the viewport and is designed for 1600x900; it keeps its layout with no scrollbars from 1280x720 to 1920x1080. You may mix HTML and SVG.

BRIEF
Build a single-page interactive visualization of the dataset below. A first-time viewer, with no instructions beyond what is on the page, must be able to answer the five questions at the end in about 30 seconds each. It is judged on whether people can answer those questions, on honest encoding, on the interaction behaviour listed, and on craft.

DATA (use exactly)
Clear nights per month at eight observing sites. A clear night is one with under 20 percent cloud cover. Bortle class runs from 1 (darkest sky) to 9 (brightest). Days per month: 31 28 31 30 31 30 31 31 30 31 30 31.
Site              | Elev (m) | Bortle | Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec
Kestrel Ridge     | 1840     | 2      | 12 11 14 17 20 24 25 24 23 21 15 11
Saltmarsh Point   | 6        | 6      | 8 9 11 12 10 9 12 13 15 14 10 8
Quarry Hollow     | 230      | 5      | 9 10 12 14 15 17 18 17 16 14 10 8
Ninefold Mesa     | 2410     | 1      | 24 23 26 27 25 18 9 8 17 26 25 24
Larch Basin       | 1180     | 3      | 5 6 11 16 21 25 27 27 24 18 9 5
Brightwater Pier  | 14       | 8      | 7 8 9 10 11 12 13 12 12 11 8 7
Ember Dunes       | 420      | 2      | 26 24 27 28 29 27 20 14 22 28 27 26
Foxglove Fell     | 690      | 4      | 10 11 13 15 18 19 20 18 11 7 6 8

REQUIRED CONTENT
1. On load the page shows a title, a one-sentence takeaway that is true of the data, the definition of a clear night, a credit line reading "Synthetic data prepared for this benchmark", and the visualization.
2. All 96 values are visible at the same time, with no paging or scrolling, and each is individually readable (printed, or shown as an exact number on hover or focus). The chart type is your choice. Next to each site's name show its elevation, Bortle class and annual total. Along the month axis show each month's total across the sites currently displayed. Every axis, unit and the legend is labelled.
3. Every number shown is exact. Totals are sums of the displayed values. Percent of month = value / days in that month, rounded to a whole percent. Deviation = value minus that site's own 12-month mean, one decimal place, signed.
4. Hover or keyboard focus on any value shows: site, month, clear nights, percent of the month's nights, and deviation from the site mean. The readout appears within 150 ms, never covers the value being read, and stays inside the viewport.
5. Keys (each also available as a visible clickable control with its key shown on it):
   0  original order, as in the table.
   1  sort by annual total, high to low.
   2  sort by elevation, high to low.
   3  sort by Bortle class, dark to bright.
   Ties in any sort break by annual total (high to low) and then by name (A to Z).
   D  toggles Deviation mode. Every value is re-encoded as its difference from its own site's monthly mean, on a diverging scale centred on 0 that is readable with red-green colour blindness (avoid red and green). The legend changes with the mode and a label says which mode is on. Absolute mode uses a sequential scale.
   B  cycles the Bortle filter: All, then 1-3, then 4-6, then 7-9, then All. Rows outside the filter leave the display and totals update.
   Arrow keys move a visible focus ring between values. Nothing is focused at load. The first arrow press focuses the first visible site's January value and does not move it further. The focus stops at the edges.
   Enter pins or unpins the focused value (at most two pins; a third pin replaces the oldest). Two pins show a comparison panel with both values and their difference.
   Escape clears focus and pins, but not sort, filter or mode.
6. Pointer: hovering a value does what focus does. Clicking a value pins it. Clicking a site name selects that site (its row stays at full strength and the other rows fade to 35 percent opacity); clicking the same name again, or empty background, clears the selection. Hovering a month label highlights that month.
7. A state label always says, in words, the current sort, filter and mode.
8. Motion: a re-sort, a filter change or a mode change animates in at most 400 ms and is finished 600 ms after the key press.
9. Smallest text is 12 px. Initial state: original order, absolute mode, filter All.

THE FIVE QUESTIONS (the page must make each answerable without instructions)
Q1. Which site had the most clear nights in March?
Q2. Which month has the fewest clear nights summed across all eight sites, and which has the most?
Q3. Which sites have at least one month that is 10 or more clear nights below that site's own monthly average?
Q4. Which site has the most clear nights over the year, and is it also the highest-elevation site?
Q5. Among the dark sites (Bortle 1 to 3), which has the fewest clear nights in January?