# Roles and tiers

Tiers are named by the KIND of work, not by a model. The project's `## wave-build` section binds
each tier to a model + effort; the example column is one project's binding of 2026-09-05.

| Role | Needs | Tier | Example binding | Why |
| --- | --- | --- | --- | --- |
| Scout (source of truth → verbatim doc) | volume, fidelity | transcriber | sonnet / medium | Verbatim copying; reviewed downstream |
| Specify (kernel, proposal, contract, agent plan) | judgement | judge | fable / high | Every ambiguity here costs a builder-hour later |
| Builder (one disjoint file set, TDD) | volume with rules | worker | opus / medium | The review net catches rule slips |
| Seam-closer (one per touching pair) | bounded context | worker | opus / medium | Two reports and the shared files |
| Verify runner (gate → green, failure text only) | diagnosis | judge | fable / high | Reads reds across the tree from failure text alone |
| Checklist reviewer (ADR / a11y / budget) | thoroughness | worker | opus / medium | Evidenced findings against a checklist |
| Fidelity reviewer (code vs source, judged with the decision list) | judgement | judge | fable / high | Holds source + spec + decisions and judges |
| Fix agent | judgement | judge | fable / high | A wrong reject ships silently |
| Mechanical (ports, renames, fixtures) | none | cheap | sonnet or haiku / low | No judgement involved |
| Main session (orchestrates, verifies live, commits) | judgement | judge | fable / high | Writes the contract and the script; decides |

Rules of thumb:

- Judgement sits where a wrong call is silent: specify, verify, fidelity, fix, the main session.
- Volume sits where the review net catches slips: build, seams, checklist reviews.
- Effort is a per-call knob. `high` only on judge roles; `medium` on workers; `low` on mechanical.
- Never one model for a whole workflow; pass `model` and `effort` per `agent()` call.
