// wave-build workflow template. Copy, fill the CONSTANTS, BUILDERS, PAIRS and LENSES from the
// contract you located, and pass it inline to the Workflow tool. Plain JS, no TS, no Date.now().
// Models/efforts are per agent() call (references/roles.md); never one model for the whole run.

export const meta = {
  name: 'wave-build',
  description: 'One wave of a contract-first proposal: disjoint builders, pairwise seam-closers, one verify runner, rule-citing reviewers, one fix agent',
  phases: [
    { title: 'Build', detail: 'N builders, contract-first, TDD, disjoint files' },
    { title: 'Seams', detail: 'one seam-closer per pair of touching builders' },
    { title: 'Verify', detail: 'one runner reads only the failing output and gets the gate green' },
    { title: 'Review', detail: 'checklist lenses on the worker tier, the fidelity lens on the judge tier' },
    { title: 'Fix', detail: 'one judge-tier agent applies confirmed findings and re-runs the gate' },
  ],
}

// ---- CONSTANTS: from the project's `## wave-build` bindings and the located line ranges ----
const REPO = '/abs/path/to/repo'
const APP = `${REPO}/apps/<app>`
const CONTRACT = `${REPO}/openspec/changes/<change>/proposal.md`
const GATE = 'pnpm run verify'
const SCRATCH = `${REPO}/.claude-flow/data/<change>`
const FLAKY = ['tests/nuxt/a.test.ts (test name)', 'tests/nuxt/b.test.ts (test name)']
const MODEL = {
  worker: { model: 'opus', effort: 'medium' },
  judge: { model: 'fable', effort: 'high' },
}
const DECISIONS_RANGE = 'a–b'
const TASKS_RANGE = 'a–b'

const COMMON = `
<paste the filled COMMON template from references/prompts.md>
`

// ---- BUILDERS: one per row of the wave's agent-plan table, disjoint file sets ----
const BUILDERS = [
  { key: 'A', name: 'contracts', prompt: `YOU ARE W-A (...). Own: ... Tests: ...` },
  { key: 'B', name: 'list', prompt: `YOU ARE W-B (...). Own: ... Tests: ...` },
]

// ---- PAIRS: [x, y, scope] for every pair of builders whose files touch ----
const PAIRS = [
  ['A', 'B', 'W-B consumes W-A: <exports>. Shared files: <paths> and their specs.'],
]

// ---- LENSES: [key, tier, text]; fidelity is always judge-tier ----
const LENSES = [
  ['adr', 'worker', 'ADR COMPLIANCE over every file this wave touched: <rule ids and what to check>. Cite file:line and the rule.'],
  ['a11y', 'worker', 'A11Y, CONTRAST, MOBILE-FIRST over <the new screens>: <checks>.'],
  ['budget', 'worker', 'REQUEST BUDGET: for each new/changed screen count upstream requests on mount and per interaction, confirm the test asserts the exact count and include set; flag any request the user did not ask for.'],
  ['fidelity', 'judge', 'SOURCE FIDELITY: the code against <source-of-truth sections: legacy extraction, PRD, design doc or API contract> judged with the decision list (lines ' + DECISIONS_RANGE + ') in hand: <what to compare>. Every difference from the source must be a numbered decision; any that is not is a finding (blocker if a label/option/permission is wrong or a field/column/step is missing; major if a condition, order or default differs). Cite § or D in rule.'],
]

const FINDINGS = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          line: { type: 'integer' },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          rule: { type: 'string', description: 'The ADR, rule, § or D number the finding cites' },
          claim: { type: 'string' },
          evidence: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['file', 'severity', 'rule', 'claim', 'evidence', 'fix'],
      },
    },
  },
  required: ['findings'],
}

phase('Build')
const builds = await parallel(BUILDERS.map((b) => () =>
  agent(`${COMMON}\n${b.prompt}`, { label: `build:W-${b.key}-${b.name}`, phase: 'Build', ...MODEL.worker })))
const report = (key) => builds[BUILDERS.findIndex((b) => b.key === key)] ?? 'NO REPORT (agent failed)'
log(`builders done: ${builds.filter(Boolean).length}/${BUILDERS.length}`)

phase('Seams')
const seams = await parallel(PAIRS.map(([x, y, scope]) => () =>
  agent(`${COMMON}
YOU ARE THE SEAM-CLOSER FOR W-${x} ↔ W-${y}. The builders are done. ${PAIRS.length - 1} other seam-closers work on OTHER pairs right now, so: touch ONLY the shared files of your pair named below plus the two builders' own files; run only the specs of your two builders and lint the files you edit. Close every seam the two reports name and every one the code shows: missing exports, name mismatches against the contract (the proposal wins when two builders disagree), stubs the real file can now replace, type errors visible in the shared files. Do NOT commit.
Scope: ${scope}
Report of W-${x}:
${report(x)}
Report of W-${y}:
${report(y)}
Return under 30 lines: seams closed (file → what), seams you could NOT close and why, specs of the pair now green / still red with the failing test names only.`, { label: `seam:W-${x}-${y}`, phase: 'Seams', ...MODEL.worker })))
log(`seam-closers done: ${seams.filter(Boolean).length}/${PAIRS.length}`)

phase('Verify')
const verified = await agent(`${COMMON}
YOU ARE THE VERIFY RUNNER and run alone in the tree. You do NOT receive the builders' reports — the tree and the gate output are your inputs. Job: get \`${GATE}\` green from ${REPO}. Token discipline: run each stage with its output redirected to a file under ${SCRATCH} (mkdir -p), then read ONLY the failing part (grep -nE "FAIL|✗|×|error|Error|threshold|✖" with context); never cat a whole passing log. Fix at the cause: cross-agent name mismatches (the contract wins), leftover test stubs, type errors, coverage holes (write the missing test, never an exclusion). Known load-sensitive specs that pass alone but race under the full run: ${FLAKY.join('; ')} — re-run such a file ALONE before treating a red as real, and say which you re-ran. When green, tick the wave's task boxes you can confirm from the tree (${CONTRACT} lines ${TASKS_RANGE}); leave the gate and verification boxes for the human. Do NOT run the release gate, do NOT commit.
Seam-closer notes, failing tests only:
${seams.map((s, i) => `- W-${PAIRS[i][0]}↔${PAIRS[i][1]}: ${s ?? 'no report'}`).join('\n')}
Return under 40 lines: pass/fail per stage, the coverage figure, what you fixed (file → cause), which load-sensitive specs you re-ran alone, boxes you could not tick and why, what a reviewer should look at first.`, { label: 'verify', phase: 'Verify', ...MODEL.judge })

phase('Review')
const reviews = await parallel(LENSES.map(([key, tier, lens]) => () =>
  agent(`${COMMON}
YOU ARE A REVIEWER, lens: ${lens}
Scope: \`git status --short\` and \`git diff --stat\` in ${REPO} list everything this wave touched (earlier waves are committed; review only the UNCOMMITTED work, reading committed files only as context). Read the code and the diff, not any report. Report ONLY findings you can evidence with file:line and a rule/section citation; give a concrete fix each. Do not edit anything. Return the findings list only.
`, { label: `review:${key}`, phase: 'Review', ...MODEL[tier], schema: FINDINGS })))
const findings = reviews.filter(Boolean).flatMap((r) => r.findings)
log(`review findings: ${findings.length} (${findings.filter((f) => f.severity === 'blocker').length} blockers, ${findings.filter((f) => f.severity === 'major').length} major)`)

phase('Fix')
const fixed = await agent(`${COMMON}
YOU ARE THE FIX AGENT and run alone in the tree. Adversarial review produced these findings (JSON); each cites a rule — read the cited rule/section yourself before acting, not the reviewer's reasoning:
${JSON.stringify(findings, null, 2)}
Verify each against the code and the cited rule; apply every blocker and major, and cheap minors; reject a wrong finding with a reason. A finding that asks for a behaviour the decision list (lines ${DECISIONS_RANGE}) forbids is rejected, not applied. Then run \`${GATE}\` from ${REPO} until green, redirecting each stage to a file under ${SCRATCH} and reading only the failing part; re-run a listed load-sensitive spec alone before treating it as red. Do NOT commit.
Return under 50 lines: numbered finding → applied / rejected (reason); pass/fail per stage and the coverage figure; a 10-line summary for the human of what this wave delivers and what to look at in the browser (urls, states, what the test tenant cannot prove).
`, { label: 'fix', phase: 'Fix', ...MODEL.judge })

return { builds: BUILDERS.map((b) => `W-${b.key} ${b.name}: ${report(b.key)}`), seams, verified, findings, fixed }
