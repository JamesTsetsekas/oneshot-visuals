Historical planning proposal: the user subsequently selected direct T3 one-shot sessions through Codex and Claude. No custom execution runner, enforced time limit, or infrastructure isolation was implemented. README.md and the shipped code describe the actual pilot. 

# Visual coding benchmark methodology

Stage-one proposal • 2026-11-11 • Planning draft; entrant execution and publication have not started.

## Scope and claims

Build a non-game sibling to Oneshot Arcade: original SVG illustrations, animations, and interactive explanatory graphics, generated from one initial brief. Exclude games, scores, win states, backend services, and image-generation tools. Primary question: **what quality does each configured coding-agent system deliver autonomously within the same elapsed-time budget?**

An entrant is the tuple `(model, provider, agent/version, effort, tools, environment, budget)`. Codex and Claude differ in orchestration, internal prompts, context management, and tool use. Results compare these complete systems, not isolated model intelligence. Equal time and tool access do not imply equal inference compute. A future raw-model track would require a separate single-response API protocol without tools, revisions, or agent scaffolding; never pool its scores here.

## Research basis

Reviewed the following primary sources on 2026-11-11. Repository revisions below were resolved from GitHub during research; freeze source copies and hashes before implementation.

- **[Oneshot Arcade README](https://github.com/JamesTsetsekas/oneshot-arcade/blob/1fb964814e1d6971d1dfa8232a4d20e789cc6930/README.md)**, **[harness v1.1](https://github.com/JamesTsetsekas/oneshot-arcade/blob/1fb964814e1d6971d1dfa8232a4d20e789cc6930/prompts/ONESHOT-HARNESS.md)**, and **[workspace creator](https://github.com/JamesTsetsekas/oneshot-arcade/blob/1fb964814e1d6971d1dfa8232a4d20e789cc6930/scripts/new-run.mjs)**: retain versioned common instructions, blind workspaces, immutable submissions, static sub-path delivery, and evidence reports. Its README explicitly describes instruction-only isolation, self-reported scores, and some historical iterated builds. Its harness allows autonomous tool work but ends the attempt at the final turn; it does not set a common elapsed-time cap. This proposal adds enforced isolation, fixed budgets, evaluator-owned evidence, and repeated trials. Do not import arcade outcomes into the new comparison.
- **[Pelican bicycle](https://github.com/simonw/pelican-bicycle/blob/a0cfd51f5838613d486f93c24ee77ec2690f3400/README.md)**: demonstrates a memorable common SVG prompt with inspectable outputs. Borrow relational visual challenges, not the famous prompt itself: familiarity and possible training exposure make it unsuitable as the main test.
- **[SVGBench README](https://github.com/johnbean393/SVGBench/blob/55c1cde8bf03b63d385c931e95bd7f728cde8fde/README.md)** and **[evaluation implementation](https://github.com/johnbean393/SVGBench/blob/55c1cde8bf03b63d385c931e95bd7f728cde8fde/src/benchmark/benchmark.py)**: detailed requirements cover spatial, physical, and instruction-following constraints. The inspected implementation grades rendered PNGs using a model judge and contains retries and cached results. Borrow explicit criteria; use independent human ratings and distinguish evaluation retries from generation retries.
- **[VGBench project page](https://vgbench.github.io/)**: separates understanding from generation across SVG, TikZ, and Graphviz; generation uses rasterized outputs with CLIP and FID metrics. Borrow rendering-based assessment and task diversity. This new benchmark measures generation only. CLIP similarity and FID are not primary scores for a small, heterogeneous animation/interaction suite: they do not directly verify temporal behavior or controls. This is a methodological choice, not a claim of score comparability with VGBench.

## Entrants and settings

| Requested entrant | Agent | Effort policy |
| --- | --- | --- |
| GPT-6 Astra | Codex | high, required |
| GPT-6.1 Sol | Codex | high, required |
| Fable 5.2 | Claude Code | proposed high, matching arcade |
| Opus 5.5 | Claude Code | proposed high, matching arcade |
| Sonnet 5.5 | Claude Code | proposed high, matching arcade |

These are requested labels, not verified runtime model identifiers or availability claims. Before any run, resolve exact provider model IDs and record requested versus effective settings. Verify Claude effort support; if unsupported, block that entrant pending an explicit configuration decision, never substitute silently. Record CLI/agent versions, provider endpoint, service tier, reasoning settings, temperature/top-p/seed if exposed, context limits, output limits, compaction behavior, and retry policy. For inaccessible settings use `unexposed`, not an invented value. Freeze versions during a cohort; provider changes create a separately labeled cohort. Disable personal skills, memories, project instructions, plugins, and MCP connections except the frozen benchmark tool set. Record unavoidable agent defaults.

## Task suite and artifact contract

Proposed v1: nine original briefs, three per track, balanced across easy/medium/hard within each track. Freeze prompts, criteria, weights, evaluator scripts, and randomized run order before entrants see them. Write three additional development briefs, one per track, excluded from scored results.

| Track | Three candidate task families | Required evidence |
| --- | --- | --- |
| Static SVG | occluded multi-object scene; labeled mechanism; quantitative infographic | standalone `artifact.svg`, rendered at desktop/mobile sizes |
| Animation | coordinated linkage; staged process explanation; seamless geometric transformation | live SVG-based page, fixed-time frames and a full-cycle recording |
| Interactive graphics | draggable geometry construction; parameter-controlled wave explanation; linked data views | live SVG-based page, scripted pointer/keyboard/reset sequences |

These are families, not final prompts. Each brief must define exact relationships, numeric truths, required states, motion period or transitions, and observable acceptance criteria. Avoid taste-only instructions, external knowledge lookups, undisclosed requirements, and benchmark-famous scenes. Keep scoring rules public to entrants; hold evaluator implementation and randomized test inputs separately. Inputs must remain inside the published domain.

Use one pinned scaffold for all tracks: HTML, CSS, JavaScript/TypeScript, inline SVG, and a fixed local build/test toolchain. The primary graphic must be SVG; no raster image substitution, Canvas/WebGL substitute, remote assets, network calls, or additional package installation. Provide identical local documentation and licensed fonts. Preinstall dependencies before timing. Publish exact package versions and permitted APIs with the eventual protocol.

Every submission provides `index.html` through a static `dist/` build, relative asset paths, source, lockfile, `README.md`, `REPORT.md`, and `ASSETS.md`; static tasks also provide the standalone SVG. Reports describe coverage, assumptions, tests actually run, and limitations. Missing reports affect delivery criteria but do not erase a working visual. Author tests and self-scores are supporting information, never official evidence. Target pinned Chromium, 1280×720 and 390×844, device-pixel ratio 1, fixed fonts/locale/timezone. All interactive tasks require keyboard operation and reset; motion tasks require pause and reduced-motion handling.

## One-shot agent protocol and budgets

1. Create a fresh ephemeral environment and conversation for every `(entrant, brief, trial)`. Mount only the common scaffold, brief, local docs, and writable workspace. Enforce filesystem/network isolation; the agent may reach its inference endpoint through the host but artifact code and tools cannot access the internet, other attempts, hidden evaluation files, credentials, or personal directories. Do not rely on a prompt prohibition alone.
2. Give byte-identical common instructions and task text, except neutral run identifiers, paths, and ports. Do not add model-specific advice or exemplar solutions. Hash both the template and rendered prompt. Give all entrants the same shell, file editing, test, local-browser, and screenshot capabilities with equivalent semantics; record adapter differences.
3. One-shot means **one uninterrupted autonomous session from one initial user instruction**. Self-testing, viewing one's own screenshots, and editing are allowed within that session. Human clarification, continuation nudges, external model calls, subagents, and feedback from judges are prohibited. Normal tool-result turns and automatic harness compaction remain part of the session and must be logged.
4. Proposed primary budget: **30 minutes per attempt**, from initial dispatch to final response or enforced deadline, whichever comes first. Include inference, tool execution, retries, and self-verification; exclude preflight provisioning and subsequent evaluator work. Use the same reserved hardware class, no competing entrant on the host, and no manual clock pauses. At termination stop the process tree and snapshot the workspace. A final answer ends the attempt even when background work remains.
5. Token counts and cost are measured outcomes, not assumed equivalent budgets across providers. Record input, output, cached, and reasoning usage when available; missing values remain unknown. Set the monetary campaign ceiling from verified prices or subscription accounting before launch. A ceiling stop leaves the cohort incomplete, not a shortened-budget leaderboard. No invented dollar estimate or unlimited execution.
6. Nine briefs × five entrants × three independent trials = **135 scored attempts**, at most **67.5 agent-hours**. A later development pilot of three briefs × five entrants adds at most 7.5 hours; it needs separate execution authorization. Evaluator work is outside these totals. Reduce suite size uniformly before registration if unaffordable, never drop poor outcomes afterward.

## Provenance and failure handling

Evaluator-owned `run.json` must include: schema/cohort/run/task/trial IDs; requested and actual model/agent/settings; prompt/scaffold/environment/tool/rubric hashes; source-reference revisions; UTC start/end and monotonic elapsed time; stop reason; usage/cost availability; tool and observable conversation logs; interventions; immutable source archive hash; build logs; screenshots/recordings; evaluator version, criterion results, rater IDs, and rerun links. Record exposed messages and tool activity, not hidden chain-of-thought. Keep credentials out of logs. Hash originals, retain restricted originals when redaction is necessary, and publish only reviewed redacted evidence in a later authorized phase.

| Event | Treatment |
| --- | --- |
| Refusal, early final, clarification request with no progress, timeout, missing artifact, build/runtime defect | Valid observed outcome. Preserve it; evaluate frozen usable output, or score zero if nothing renders. No replacement attempt. |
| Observable access to another attempt, unauthorized assistance, prohibited artifact substitution | `protocol-invalid`; retain record and assign zero in the primary scheduled-run aggregate. No quiet exclusion. |
| Host crash, evaluator defect, or evidenced provider outage | `infrastructure-invalid`, without assigning a capability score. Preserve evidence; at most one fresh replacement under unchanged settings, linked to the original. Repeated failure leaves the cell missing and prevents a complete-cohort claim. |
| Human code repair, restart after artifact feedback, or continuation nudge | Mark `assisted`; exclude from primary one-shot cohort, retain original outcome. Any demonstration repair is a separate artifact. |
| Evaluator capture/build infrastructure failure | Retry evaluation of the same frozen source; never regenerate. Log every retry. A source build error is an entrant failure, not infrastructure failure. |

Predeclare transport retry settings and include retry time in the clock. Classify ambiguous failures before seeing scores; disclose ambiguous cases and sensitivity analyses. Final status fields separate execution, artifact validity, protocol validity, and evaluation completeness rather than relying on a single self-reported `complete` flag.

## Evaluation and scoring

The evaluator rebuilds unchanged source in a clean isolated environment, verifies offline and nested-path loading, records console errors, and captures real production output. It owns screenshots and interaction scripts. Replay from reset with fixed input data and time controls; sample animations at preregistered times across a complete cycle and record real-time motion too. Test interaction at initial, changed, boundary, and reset states, including keyboard and reduced-motion modes. Never infer animation or interaction success from a still image.

Each task scores 0–100 using the following fixed weights. Enumerate task-specific subcriteria and their points before launch; one defect should not be penalized repeatedly under indistinguishable criteria.

| Dimension | Points | Evidence |
| --- | ---: | --- |
| Brief fidelity and correctness | 40 | required visual relations, labels, quantities, and semantic truth |
| Visual quality | 25 | composition, legibility, craft, coherent visual hierarchy |
| Track-specific execution | 25 | static: geometry/scalability; motion: timing/continuity/coordination; interactive: state behavior/control feedback |
| Delivery and accessibility | 10 | reproducible/offline build, responsive framing, semantics, keyboard/reduced-motion requirements where applicable |

For subjective criteria use anchored 0–4 ratings: absent/wrong; major defects; partial; correct with minor defects; fully realized. Convert to preregistered point weights. Objective assertions use pass/fail or predefined partial-credit bands. An unbuildable, blank, or unsafe-to-execute artifact receives zero overall; an otherwise working partial artifact earns criterion-level credit. A timeout alone is not an automatic zero. Preserve diagnostic subresults.

Two independent human raters score anonymized, randomly ordered outputs without model names, reports, elapsed time, or self-scores. Mask metadata outside the rendered artifact without editing its visual content. Resolve any criterion disagreement greater than one anchor level through a third blinded rater; use its median with the two original ratings. Otherwise average the two ratings. Calibrate on development artifacts before launch and report agreement and adjudication frequency. Automated visual-model judging may be a separately labeled exploratory analysis, never the primary judge or feedback to entrants.

## Repeated trials and reporting

Three independently initialized trials per task are mandatory; no best-of selection or early stopping. Randomize entrant order within task/trial blocks using a recorded scheduling seed. Provider generation seeds may be unexposed and are not promised reproducible. Keep artifact simulation seeds deterministic where the brief requires randomness.

Average all three trials per task, then tasks within each track, then the three track means equally. Include valid failed and protocol-invalid attempts as zero; infrastructure gaps remain missing. Require a complete cohort for the headline aggregate. Report all attempts, completion/failure rates, per-track and per-task scores, median/range across repeats, elapsed time, and usage/cost availability. Estimate paired score differences with a seeded hierarchical bootstrap over task blocks within tracks and trials, retaining paired entrant comparisons; label 95% intervals exploratory given only three tasks per track. Do not declare a universal winner from tiny gaps or this narrow task set. Adding trials after inspecting scores requires a new preregistered cohort, not selective retries.

## Phases and acceptance gates

1. **Stage one — this document only.** Research sources, proposed settings/budgets, scoring, failure rules, and unresolved decisions documented. No entrants, deployment, or publication.
2. **Harness preparation, after approval to implement.** Freeze nine scored and three development briefs with point-level rubrics; verify actual model IDs/settings; pin dependencies/environment; implement manifests, isolation, timer, capture, and scoring. Human-authored fixtures must demonstrate correct handling of blank SVG, broken build, missing files, forbidden network access, timeout, background-process termination, reduced motion, reset, and repeated evaluator capture. Isolation escape tests must fail closed.
3. **Development pilot, after approval to run.** Run all five systems only on development briefs. Confirm equivalent tools, enforceable timing, trace completeness, reproducible capture, and usable rating anchors. Revise once as needed, then freeze a new protocol hash. Pilot results never enter scored totals.
4. **Scored collection.** Execute the frozen 135-attempt schedule. Every cell has either a preserved scored attempt or documented infrastructure gap; every retry has provenance. No entrant-specific fixes or prompt edits. Configuration drift pauses the cohort for classification.
5. **Audit and optional release.** Complete independent scoring and uncertainty analysis; inspect redactions/licenses; reproduce source-to-evidence hashes and aggregate calculations. Show every trial and failure. Publication requires a separate explicit instruction.

### Decisions to close before execution

- Confirm Claude effort settings and all exact model identifiers in the available runtimes.
- Accept or revise the proposed 30-minute budget, nine-brief suite, and three-trial minimum before freezing.
- Select isolation host and common browser/tool adapters; prove parity rather than assuming it.
- Set the campaign spending ceiling and choose two raters plus an adjudicator.

All other choices above are proposed v1 defaults. Any change to prompts, tool access, budgets, scoring, or effective settings must be versioned before the affected cohort starts.


