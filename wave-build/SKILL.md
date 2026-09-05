---
name: wave-build
description: Build ONE wave of an approved, contract-first proposal with parallel agents so that no agent ever holds the whole tree — disjoint builders, pairwise seam-closers, a verify runner that reads only failure output, rule-citing reviewers, one fix agent. Use when the user says "build wave N", "run the next wave", "/wave-build <change> <wave>", or asks to implement a proposal whose agent plan lists several builders.
argument-hint: <change> <wave>
---

# wave-build

One idea, applied five times: **context budgeting**. A feature slice too big for one context is
built by many agents, each holding only the lines it needs, and the results are joined by agents
that each hold only two of them. The wave-2 integrator that held the whole tree plus five reports
died three times in six hours; this skill exists so that never happens again.

## Preconditions

1. An **approved contract** (an OpenSpec proposal or equivalent) that fixes file names, export
   names, props and emits per builder, has an **agent-plan table** for this wave (one row per
   builder, a DISJOINT file set each), a **decision list** (numbered, cited decisions the reviewers and
   the fixer judge against) and a **task checklist** for the wave.
2. A **bindings section** in the project's rules file (AGENTS.md / CLAUDE.md) headed
   `## wave-build`, giving: repo root, app dir, rules file, the gate command, the release gate,
   the tier→model map (see `references/roles.md`), the load-sensitive specs list, review lenses,
   read restrictions. If it is missing, ask for these once and write the section; do not guess.
3. The previous wave is **committed**, so every agent's `git diff` is only its own wave.

## Procedure

1. **Locate, do not read.** Find the LINE RANGES of: this wave's contract sections, the
   extension-points table, the decision list, the agent-plan row table, the task checklist, the
   delta spec(s), the source-of-truth sections this wave needs (a legacy extraction when rebuilding, a PRD or design doc when greenfield, an API contract when integrating).
   Read only what you need to write prompts. Use `grep -n '^#' file` and `sed -n 'a,bp'`.
2. **Check drift** between the contract and the tree it was written against (a menu rebuilt since,
   a helper renamed). Put every such fact in the COMMON prompt in one sentence each; the contract
   text stays as written, the prompt says how to read it.
3. **Derive the seams.** A pair of builders touches when one consumes the other's exports, hosts
   the other's component, or their tests import each other's files. One seam-closer per pair.
   Prefer 3–5 pairs; a builder in no pair needs none.
4. **Write the script** from `references/workflow.template.js`: fill `BUILDERS`, `PAIRS`,
   `LENSES`, the paths and ranges, the drift sentences. Prompts come from
   `references/prompts.md`. Models and efforts come from the bindings, per `agent()` call —
   never one model for the whole workflow.
5. **Launch** with the Workflow tool (inline `script`), note the run id, and return to the user
   with what is running and what the phases are. Do not poll; the notification comes.
6. **On completion:** read the fix agent's return first, then the findings count, then the
   verify tail. Run the RELEASE gate yourself (`verify:release` or the project's equivalent). Do
   the real-browser / manual check the checklist names, leaving live data as found. Tick the
   gate and verification boxes. Commit the wave as ONE `feat:` commit with the required trailers.
   Write a memory note: what shipped, what was flagged, what is next.
7. **One review round.** A second round is the human's call, never the script's default.

## Invariants (binding for every prompt you write)

- Prompts cite LINE RANGES, never "read the whole file" (files under ~200 lines excepted).
- A builder edits ONLY its row's files plus their tests; another agent's missing file is coded
  to by its CONTRACT and reported as a seam; nobody reads another agent's transcript or waits.
- A builder runs ONLY its own specs and lints ONLY its own files; no full suite, no typecheck,
  no gate, no git operations.
- Every return is a COMPACT report: files, what tests assert (one line each), deviations with
  the § / D cited, seams. No code, no test output, no narration. Cap it in the prompt.
- Integration is SPLIT: seam-closers see two reports and the shared files; the verify runner
  sees NO reports, redirects each gate stage to a file and reads only the failing part, re-runs
  a listed load-sensitive spec alone before calling it red, stops at green.
- Reviewers read the uncommitted DIFF, not reports, and return a structured findings list with
  a `rule` id (ADR / § / D) so the fixer looks the rule up instead of receiving reasoning.
- The fixer verifies each finding against the CITED RULE, applies blockers/majors/cheap minors,
  rejects anything the decision list forbids, and gets the inner gate green. It never commits.
- The main session commits waves; agents never do.

## Sizing

`agents = builders + pairs + 1 verify + lenses + 1 fix`. Six builders, four pairs and four lenses
is sixteen; that is the ceiling for one wave. More builders → split the wave.

## What to tell the human

At launch: run id, phase list, agent count. At the end: what shipped (screens, behaviours),
gates (each stage, coverage figure), what the browser check proved and what it could NOT prove
(flags off on the test tenant, missing data), findings applied / rejected with reasons, the
follow-ups the fixer flagged, and whether the branch is merged.

## References

- `references/roles.md` — tiers and the example model binding; read when writing `model`/`effort` per call.
- `references/prompts.md` — the COMMON and five role prompts; read before writing any prompt.
- `references/workflow.template.js` — the script skeleton; copy and fill.
- `references/example-wave-3.js` — the last real script that ran (2026-09-05, entity names anonymised); read once for the level of detail a builder prompt needs.

## What the source of truth is

The loop does not care where the truth comes from; the fidelity lens compares code to it and the
decision list says where the two are allowed to differ. Three shapes:

| Situation | Source of truth | Decision list holds |
| --- | --- | --- |
| Rebuilding a legacy system | the extraction doc (labels, rules, endpoints verbatim) | deliberate deviations from legacy, each with its reason |
| Greenfield feature | the PRD / design doc / kernel spec | design decisions taken since the doc, open questions closed |
| Integration / migration | the API contract, the target's docs | mappings and gaps, each with its reason |

Whichever it is, the contract names it, the prompts cite its line ranges, and a fidelity finding
is "the code differs from the source and no decision says so".
