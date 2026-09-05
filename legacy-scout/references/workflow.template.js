// legacy-scout workflow template. Copy, fill the CONSTANTS and SCOUTS from the project's
// `## legacy-scout` bindings and the scope paragraph, and pass it inline to the Workflow tool.
// Plain JS, no TS, no Date.now(). Models/efforts are per agent() call: scouts on the bound scout
// model, merge and disagreements on the judge model.

export const meta = {
  name: 'legacy-scout',
  description: 'Read one feature of an existing system once: one scout per source kind, one merge agent writes the verbatim extraction doc, one agent appends disagreements and open questions',
  phases: [
    { title: 'Scout', detail: 'one transcriber-tier agent per source kind, feature files only, verbatim' },
    { title: 'Merge', detail: 'one judge-tier agent holds only the reports and writes the doc' },
    { title: 'Disagree', detail: 'one judge-tier agent reads only the doc and appends §17–§18' },
  ],
}

// ---- CONSTANTS: from the bindings ----
const FEATURE = '<feature>'
const OUT = '/abs/path/to/docs/legacy/<feature>.md'
const INDEX = '/abs/path/to/docs/legacy/README.md'
const SECTIONS = '<paste references/sections.md whole>'
const MODEL = {
  scout: { model: 'sonnet', effort: 'medium' },
  judge: { model: 'fable', effort: 'high' },
}
const CAPS = { code: 250, live: 200, artefact: 120 }

const COMMON = `
<paste the filled COMMON template from references/prompts.md: feature, scope paragraph, out of
scope, verbatim rule, citation rule, read restrictions per source>
`

// ---- SCOUTS: one per source kind the bindings name; drop the kinds the project lacks ----
const SCOUTS = [
  { key: 'frontend', prompt: `YOU ARE THE FRONTEND SCOUT. Repo <root>, branch <branch>. ... Under ${CAPS.code} lines.` },
  { key: 'backend', prompt: `YOU ARE THE BACKEND SCOUT. Repo <root>, branch <branch>. ... Under ${CAPS.code} lines.` },
  { key: 'live', prompt: `YOU ARE THE LIVE-APP SCOUT. URL <url> ... Under ${CAPS.live} lines.` },
  { key: 'artefact', prompt: `YOU ARE THE ARTEFACT SCOUT. Sources: <spec path> ... Under ${CAPS.artefact} lines.` },
]

phase('Scout')
const reports = await parallel(SCOUTS.map((s) => () =>
  agent(`${COMMON}\n${s.prompt}`, { label: `scout:${s.key}`, phase: 'Scout', ...MODEL.scout })))
const labelled = SCOUTS.map((s, i) => `### Report: ${s.key}\n${reports[i] ?? 'NO REPORT (scout failed) — the doc must say this source was not read'}`).join('\n\n')
log(`scouts done: ${reports.filter(Boolean).length}/${SCOUTS.length}`)

phase('Merge')
const merged = await agent(`${COMMON}
YOU ARE THE MERGE AGENT. Inputs: the scout reports below and the section template. You open NO source; if a report lacks something, the doc says which source did not provide it.
Write ${OUT} following the section template EXACTLY (numbering, order, header sections, "What was read" per source with commit / version / build). Every section is present; a section with nothing gets one line saying what was looked for. Every string stays quoted and cited; where two sources give the same fact, cite both; where they differ, put both readings in place with a ⚠️ prefix and move on — you reconcile nothing. Do not write §17 and §18.
Then update the index at ${INDEX}: one row, "${FEATURE}" and a one-line contents summary.
Section template:
${SECTIONS}
Reports:
${labelled}
Return under 30 lines: doc path and line count, sections that are thin and which source left them thin, the ⚠️ count, and the index row you added.`, { label: 'merge', phase: 'Merge', ...MODEL.judge })

phase('Disagree')
const disagreements = await agent(`${COMMON}
YOU ARE THE DISAGREEMENTS AGENT. Read ONLY ${OUT}; open no source, no report. Append §17 and §18 as the section template defines them:
§17: every ⚠️ and every place two sources state different facts, as a table with one column per source quoting what each said, a § reference, and a status: RESOLVED only when the doc itself holds the reason, otherwise UNRESOLVED or OPEN with a pointer to §18. Then the single-source findings with no counterpart, grouped by source. Never resolve by preferring a source.
§18: numbered questions the spec phase must answer; each cites its §, says why no source could settle it, and names what would settle it. No recommendations.
Section template for §17–§18:
${SECTIONS}
Return under 20 lines: disagreement count by status, open-question count, and the three disagreements a specifier should read first.`, { label: 'disagree', phase: 'Disagree', ...MODEL.judge })

return { reports: SCOUTS.map((s, i) => `${s.key}: ${reports[i]}`), merged, disagreements }
