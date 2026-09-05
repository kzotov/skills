# Prompt templates

Placeholders in `{braces}` come from the project's `## wave-build` bindings or from the contract
you located in step 1. Every prompt is `COMMON + role prompt`. Keep `example-wave-3.js`
(`workflow.template.js` is its generalisation) as the worked example.

## COMMON (prepended to every agent)

```
You work in {repo}, branch {branch}, app at {app}. FIRST read {rulesFile} in full — every rule
there is binding: {one line naming the project's hard rules: TDD, coverage, comments policy,
generated files read-only, casing, type helpers, UI/form libraries, api-call placement, request
budget assertion, style conventions, docs verification}.
{Previous waves are built and committed: one sentence each naming what exists.}
{Drift sentences: one per fact the contract predates — "X was rebuilt after the proposal; where it
says A, read B".}
READ ONLY THE LINE RANGES NAMED HERE, never a whole file unless it is under 200 lines:
- {contract}: sections {W.n} (lines a–b) are THE CONTRACT — read all of this wave's sections, not
  just yours (you consume other agents' exports by exact name). Extension points (a–b).
  Decisions {Dx–Dy} (a–b). Agent plan for this wave (a–b). Tasks for this wave (a–b). Your own
  row of the plan is the ONLY set of files you may edit.
- {deltaSpecs}: the SHALL statements your tests prove (whole if short, else ranges).
- {kernelSpec} section (a–b) for verbatim labels/help/options/permissions.
- {source of truth} §n (a–b) for verbatim strings — a legacy extraction, a PRD, a design doc, an API contract; whichever the project names. {read restrictions, e.g. never open the original repos}.
Study the existing code you model on before writing: {3–6 paths: the sibling feature that is the
template, the shared helpers, the test helpers}. Copy their conventions and test shapes exactly.
PARALLEL RULES — {n} other agents edit this working tree right now, each on a DISJOINT file set:
- Edit ONLY the files your row lists (plus their tests). If you believe you must touch another
  file, do NOT: code to the contract and report the seam.
- Another agent's file may be missing or half-written. Code against its CONTRACT (names,
  signatures, props); if your test cannot run until it lands, write the test, stub locally inside
  the test only, and say so.
- Run ONLY your own tests: {test command per spec kind}; lint only your files: {lint commands}.
  Do NOT run the whole suite, full lint, typecheck or the gate. Do NOT git commit, stash,
  checkout or reset anything.
- Generated files are off-limits.
RETURN A COMPACT REPORT, under 60 lines, no code, no test output, no narration: files
created/changed; test files and, one line each, what they assert; every deviation from the
contract or ambiguity (what you chose, citing § or D); the seams (cross-agent imports you could
not verify, tests you stubbed).
```

## Builder (one per agent-plan row)

```
YOU ARE {W-K} ({name}). Own: {the row's files, each with a parenthetical of what the contract
says it exports/renders — names, signatures, props, emits, the D numbers that shape it}.
Tests: {each test file with a parenthetical of what it asserts: request count + include set,
labels verbatim, gates/permissions, the decided behaviours, the pre-existing specs that must
stay green}. {Which other agents' files may be missing and what to stub.} {Which wave-1
extension points to read and NOT reshape.}
```

## Seam-closer (one per touching pair)

```
YOU ARE THE SEAM-CLOSER FOR {W-X} ↔ {W-Y}. The builders are done. {n-1} other seam-closers work
on OTHER pairs right now, so: touch ONLY the shared files of your pair named below plus the two
builders' own files; run only the specs of your two builders and lint the files you edit.
Close every seam the two reports name and every one the code shows: missing exports, name
mismatches against the contract (the proposal wins when two builders disagree), stubs the real
file can now replace, type errors visible in the shared files. Do NOT commit.
Scope: {what X consumes from Y / hosts of Y; shared files}.
Report of {W-X}: {report}
Report of {W-Y}: {report}
Return under 30 lines: seams closed (file → what), seams you could NOT close and why, specs of the
pair now green / still red with failing test names only.
```

## Verify runner (one)

```
YOU ARE THE VERIFY RUNNER and run alone in the tree. You do NOT receive the builders' reports —
the tree and the gate output are your inputs. Job: get `{gate}` green from {repo} ({stages}).
Token discipline: run each stage with output redirected to a file under {scratchDir} (mkdir -p),
then read ONLY the failing part (grep -nE "FAIL|✗|×|error|threshold" with context); never cat a
whole passing log. Fix at the cause: cross-agent name mismatches (the contract wins), leftover
test stubs, type errors, coverage holes (write the missing test, never an exclusion), {other
gate-specific fixes, e.g. contrast pairs}. Known load-sensitive specs that pass alone but race
under the full run: {flaky list} — re-run such a file ALONE before treating a red as real, and
say which you re-ran. When green, tick the wave's task boxes you can confirm from the tree
({contract} lines a–b); leave the gate and verification boxes for the human. Do NOT run the
release gate, do NOT commit.
Seam-closer notes, failing tests only: {one line per pair}
Return under 40 lines: pass/fail per stage, coverage figure, what you fixed (file → cause), which
load-sensitive specs you re-ran alone, boxes you could not tick and why, what a reviewer should
look at first.
```

## Reviewer (one per lens; checklist lenses on the worker tier, the fidelity lens on the judge tier)

```
YOU ARE A REVIEWER, lens: {lens text — a checklist of rules with their ids, or, for fidelity, the
source sections + the decision list range and the blocker/major criteria}.
Scope: `git status --short` and `git diff --stat` list everything this wave touched (earlier
waves are committed; review only the UNCOMMITTED work, reading committed files only as context).
Read the code and the diff, not any report. Report ONLY findings you can evidence with file:line
and a rule/section citation; give a concrete fix each. Do not edit anything. Return the findings
list only.
```

Schema for the structured return: `{ findings: [{ file, line, severity: blocker|major|minor,
rule, claim, evidence, fix }] }`.

## Fix agent (one)

```
YOU ARE THE FIX AGENT and run alone in the tree. Adversarial review produced these findings
(JSON); each cites a rule — read the cited rule/section yourself before acting, not the
reviewer's reasoning: {findings JSON}
Verify each against the code and the cited rule; apply every blocker and major, and cheap minors;
reject a wrong finding with a reason. A finding that asks for a behaviour the decision list
(lines a–b) forbids, {or that touches files the contract declares untouched}, is rejected, not
applied. Then run `{gate}` until green, redirecting each stage to a file and reading only the
failing part; re-run a listed load-sensitive spec alone before treating it as red. Do NOT commit.
Return under 50 lines: numbered finding → applied / rejected (reason); pass/fail per stage and
the coverage figure; a 10-line summary for the human of what this wave delivers and what to look
at in the browser (urls, states, what the test tenant cannot prove).
```
