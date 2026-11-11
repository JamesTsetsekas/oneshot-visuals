Historical planning proposal: the user subsequently selected direct T3 one-shot sessions through Codex and Claude. No custom execution runner, enforced time limit, or infrastructure isolation was implemented. README.md and the shipped code describe the actual pilot. 

# Oneshot Visuals — stage-one integration

Status: stage-one planning pack complete; prompts remain candidates pending harness validation. This document takes precedence over conflicting proposals in the specialist drafts. No benchmark outputs or dashboard have been built yet.

## Product

A separate sibling to Oneshot Arcade: compare the visual coding work of five configured agents on six identical original briefs. Start with two static SVGs, two SVG-based animations, and two interactive graphics. Keep the first release small enough to inspect every result.

The first collection is a descriptive pilot: six tasks × five entrants × one attempt = 30 entries. It cannot establish a reliable universal ranking. Later register three independent trials per task, preserving all outcomes. Do not present the pilot as the repeated-trial study in methodology.md.

## Defaults to carry into implementation

- Working repository name: `oneshot-visuals`; separate from the arcade.
- Entrants: Codex `gpt-6-astra` high and `gpt-6.1-sol` high; Claude `claude-fable-5-2`, `claude-opus-5-5`, and `claude-sonnet-5-5`, high. These IDs and effort options were available in the T3 capability catalog on 2026-11-11. Record effective runtime settings for every attempt.
- One initial brief per fresh session, autonomous editing and self-testing allowed; no human hints, other models, or subagents inside scored attempts.
- Proposed equal wall-clock limit: 20 minutes per attempt, including verification. Pilot maximum: ten agent-hours, excluding harness preparation and evaluation. Record actual usage; do not invent cost when subscription usage is unavailable.
- Deliver one offline `index.html` (maximum 300,000 bytes) with inline SVG/CSS/JS plus `NOTES.md` (150 words maximum), following prompts.md. No standalone SVG is required. Use 1600×900 reference capture unless a task specifies otherwise, DPR 1, with task-defined artboards and `?t=` hooks for loops.
- Freeze prompts, rubric, tool permissions, capture scripts, limits, and source hashes before collection. Planning agents may collaborate; entrant sessions must receive only the frozen harness and their brief.
- Use evaluator-owned captures and checks. Keep render/runtime validity, requirement correctness, and human visual preference visible separately. Self-scores are never official scores.
- Retain every failed or incomplete attempt. Infrastructure retries must preserve and link the original record. No improving an entry after judging it.

## Dashboard

Ship a static GitHub Pages site with a 6×5 matrix, prompt comparison, model portfolio, artifact details, and blind same-prompt pair review. Show all entries and failures. Ratings are browser-local with validated JSON import/export; no implied community leaderboard. Include prompt text, source, settings, timing, capture evidence, and limitations.

Recorded clips and posters are the default comparison surface. Live artifacts are opt-in and isolated from dashboard storage; never publish generated HTML as directly navigable same-origin pages. Validate the sandbox/loading design with hostile fixtures before importing model outputs. Avoid promising perfect synchronization of arbitrary JavaScript; recorded comparison uses the same capture timeline.

Use the dashboard draft for architecture and acceptance cases, but replace its Canvas/WebGL/CSS slot mix and vendored-library proposal with the six-task SVG suite. Use the methodology draft for provenance and failure rules, but replace its nine-task/135-attempt schedule and mandatory repeated-trial launch with this 30-entry pilot. Approval gates in specialist drafts are proposals, not additional user restrictions.

## Delivery sequence

1. Consolidate the three drafts, exact candidate prompts, rubrics, and a reusable project planning prompt. Resolve capture and artifact-contract conflicts in writing.
2. Build the harness and minimal dashboard using handwritten fixtures. Verify nested GitHub Pages paths, offline loading, failure statuses, rating round-trip, sandbox restrictions, deterministic capture, and keyboard review.
3. Freeze the suite. Run a separate unscored development fixture through each adapter to confirm settings, tools, isolation, timing, and evidence capture. If the available runtime cannot isolate attempts, disclose the limitation and label the collection accordingly.
4. Collect 30 entries from the five named configurations, with no cross-entry context. Capture and validate unchanged submissions. Do not delegate generation before the harness exists.
5. Populate the dashboard, review real evidence, validate the production build, and publish through GitHub Pages. Report the actual URL only after deployment succeeds.

Use Sol high for harness/schema implementation, Sonnet high for routine dashboard work, Astra high for experimental-design decisions, and Opus high for targeted design review. Fable belongs in the entrant lineup; using it for routine scaffolding adds little value. No extra agents solely to fill the model roster.

## Reusable project-planning prompt

> Plan and design a new repository named Oneshot Visuals, a non-game sibling to https://github.com/JamesTsetsekas/oneshot-arcade. Review that repository's harness, catalog, dashboard, and deployment conventions. Review the original pelican-bicycle experiment, SVGBench, VGBench, svgbench.ai, and jdmnk/design-benchmark; cite primary sources and identify what is borrowed versus original. Produce an implementation-ready plan before running benchmark entrants.
>
> Define six original frozen prompts: two static SVGs, two deterministic SVG animations, and two interactive visual graphics. For each supply exact prompt text, observable requirements, scoring anchors, fixed capture times or interaction sequence, reset behavior, and failure criteria. Specify a common offline artifact format and equivalent tools. Keep prompts manageable in one autonomous session and avoid famous benchmark scenes.
>
> Compare GPT-6 Astra high and GPT-6.1 Sol high through Codex, and Fable 5.2, Opus 5.5, and Sonnet 5.5 through Claude at recorded high effort. Verify actual identifiers and options. Plan a 30-entry single-trial pilot; distinguish this from a later repeated-trial study. Define equal run limits, immutable provenance, retained failures, retry classification, and independent evaluation. State that cross-agent results measure configured agent systems.
>
> Design a GitHub Pages dashboard with a matrix, by-prompt comparison, by-model portfolio, artifact details, recorded motion comparison, and blind pair review. Keep personal ratings local with import/export. Specify safe handling of untrusted generated code, static deployment under a repository subpath, schemas, useful tests, and delivery milestones. Do not fabricate scores, votes, screenshots, costs, or model availability. Use appropriately sized delegated agents for bounded planning work, but prohibit assistance inside benchmark entrant sessions. Deliver a concise integrated plan, exact prompts, run protocol, dashboard contract, and explicit remaining assumptions.

## Integration review — 2026-11-11

All three planning drafts are available. prompts.md supplies the six exact candidate briefs and task-specific rubrics; those weights supersede the generic methodology weights. Use three blind human ratings where available; until ratings exist show unscored, never invent scores. High effort for Claude is the selected default. Missing time hooks lose reproducibility points, with real-time footage available for partial review. Retain the SVG-only scope. External documentation access must be resolved uniformly in the harness: use a frozen local documentation bundle instead of unrestricted browsing. The 20-minute budget is a pilot proposal to validate against an unscored development brief before freezing.

Integration corrected a damaged prompt-pack heading and regenerated all seven manifest hashes; node verify-prompts.mjs passes. The prompt author's temporary numerical verification scripts were not retained, so answer-key mathematics, especially the linkage and pendulum reference, still needs independent verification during harness preparation. Do not call the candidate pack experimentally validated. All rubric/capture changes must be versioned before scored collection, not merely changes to prompt blocks. Preserve and average every repeat; no best-of selection.


