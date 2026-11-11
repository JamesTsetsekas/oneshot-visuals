# Oneshot Visuals

Six briefs. Five coding agents. One take each.

[Browse the dashboard](https://jamestsetsekas.github.io/oneshot-visuals/)

A visual coding companion to [Oneshot Arcade](https://github.com/JamesTsetsekas/oneshot-arcade): original SVG illustrations, deterministic animations, and interactive graphics. Each entry is made in a fresh T3 delegated session through Codex or Claude at high effort. Autonomous self-testing is allowed; human corrections and cross-entry assistance are not.

This is a 30-entry, single-trial exploratory collection, not a statistically reliable ranking of raw models. Agent defaults and tool access differ. Isolation is instruction-based, not a security boundary; elapsed times include scheduling and tool delays. No custom model runner is used. Source files are preserved unchanged after the initial attempt. Technical capture results are separate from personal visual ratings.

The dashboard offers browsing, comparison, blind pair review, and browser-local ratings with JSON export/import. No ratings are sent to a server and no community voting is implied. Entries remain unscored until a viewer rates them.

Operational intervention: after an entrant reported broadly terminating Chrome processes during self-testing, still-running Claude sessions received a safety-only instruction to clean up only processes they started. No visual feedback, code corrections, or task hints were supplied. Timing and performance observations may be affected by concurrent sessions and browser cleanup; they are not controlled speed benchmarks.

See `prompts/` for exact briefs and `prompts.md` for draft rubrics and capture plans. The specialist planning drafts describe a larger possible methodology; this README and the implemented catalog describe the actual pilot. The candidate mathematical answer keys have not been independently certified and do not produce automatic correctness scores.

Generated output is served as text and loaded only on request inside sandboxed frames without same-origin permission. Posters are the default browsing surface. Source and preview availability do not imply that an entry meets its brief.

## Development

Use Node.js 22+. Run `npm install`, `npm run capture`, `npm run build`, and `npm test`. GitHub Actions deploys the assembled `site/` directory to GitHub Pages. All dashboard assets use relative paths.

## Inspiration

[Pelican bicycle](https://github.com/simonw/pelican-bicycle), [SVGBench](https://github.com/johnbean393/SVGBench), [VGBench](https://vgbench.github.io/), [SVGbench arena](https://svgbench.ai/best), and [Design Benchmark](https://github.com/jdmnk/design-benchmark). Briefs and code here are original; results are not comparable to those benchmarks' published scores.
