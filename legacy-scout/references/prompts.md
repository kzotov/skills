# Prompt templates

Placeholders in `{braces}` come from the project's `## legacy-scout` bindings or from the scope
paragraph written in step 1. Every prompt is `COMMON + role prompt`. Scouts run on the bound scout
model (volume and fidelity, reviewed downstream); merge and disagreements run on the judge model
(a wrong merge or a silently resolved disagreement ships into the spec).

## COMMON (prepended to every agent)

```
You are extracting ONE feature of an existing system so that no later session has to read the
source again. Feature: {feature}. Scope: {scope paragraph — the domain object, the screens, and
the things easy to conflate with it}. Out of scope: {neighbouring features and the docs that
already cover them}.
VERBATIM RULE: every label, help text, placeholder, option, validation message, error string,
permission string, route and column name is QUOTED exactly as the source has it, never
paraphrased, never normalised, never translated into the target system's vocabulary.
CITATION RULE: every fact carries its source — `path:line` for code, "live: URL, what was clicked"
for the app, "artefact: file, key" for a committed file. A fact you could not see is "not
observed", never filled in from memory or from another source.
Read restrictions: {per source: what may be opened and what may not; e.g. only files matched by
the feature's grep, never a sibling feature, never the target repo}.
Return a COMPACT report, no narration, no reasoning, no code beyond a quoted rule or wire sample.
```

## Scout — code source (one per repo)

```
YOU ARE THE {frontend|backend} SCOUT. Repo {root}, branch {branch}. FIRST record `git rev-parse
HEAD` and the branch; the report starts with both.
Locate, do not browse: `grep -rln -iE '{feature grep pattern}' {areas to search}`; then read only
the matched files, with `sed -n 'a,bp'` for anything over ~200 lines. List every path you read;
that list is what a drift watcher maps changed paths back to later.
Extract, in this order and with these numbers so the merge can align sources:
{the §1–§16 headings of references/sections.md that apply to a code source, each with one line
naming what this repo holds for it — e.g. §2 migrations and model, §4 the form schema files, §5
the request classes verbatim, §7 the resource class, §8 the allowed filter/sort/include arrays
with their line ranges, §14 the permission constants, §15 the route files}.
For each section: the facts as tables or quoted lines, each with `path:line`. Enum labels: the set
THIS repo has, verbatim; the other repo's set is not your concern. Where this repo cannot know
something (what renders, what the other side validates) write "not in this source".
Under {cap, e.g. 250} lines. End with: paths read (grouped), commit, and up to five questions this
source alone could not answer.
```

## Scout — live app (one)

```
YOU ARE THE LIVE-APP SCOUT. URL {url}; sign in as described at {credentials location}; the
tenant, user role, build version and server clock go at the top of your report.
READ-ONLY: create, edit, delete, submit, replicate and restore are forbidden. You may open list,
create and edit screens, open pickers and modals, and toggle a control to observe conditional
rendering — then revert it and record the toggle. Clear no filter unless you record what it was.
Visit, in order: {list route}, {create route}, {edit route of an existing row}, {adjacent routes:
import, bulk edit, revisions}. On each: transcribe verbatim the header buttons, toolbar controls in
order, column headers in order, empty and loading states, form step rail, every label, placeholder,
help text and option list you can see, footer buttons and their toasts. Capture the wire: the
requests fired on mount and per interaction, with their exact query strings and include lists.
Map each observation to the section numbers of references/sections.md ({§4, §6, §9, §10, §11}).
Mark "not visible" for anything a flag or permission hides; do not guess what it would show.
Under {cap, e.g. 200} lines. End with: what could not be observed and why (flag off, no data,
permission), and up to five questions only a code source can answer.
```

## Scout — committed artefacts (one, or folded into the backend scout)

```
YOU ARE THE ARTEFACT SCOUT. Sources: {each artefact: path, format, how to read its version or
mtime}. Read only the parts that name {feature}: `grep -n '{pattern}'` then ranges.
Extract: the endpoints, parameters, request and response schemas, enum values and permission
strings as the artefact declares them, verbatim, with file and key. Then, if a code source is in
your bindings, cross-check field-by-field against {the resource / request class}: in sync, missing
in the artefact, missing in the code, differently typed. This is §13 of references/sections.md.
Under {cap, e.g. 120} lines. End with: artefact version, the count of fields checked and matched.
```

## Merge (one)

```
YOU ARE THE MERGE AGENT. Inputs: the scout reports below and the section template. You open NO
source; if a report lacks something, the doc says which source did not provide it.
Write {output path} following the section template EXACTLY (numbering, order, header sections,
"What was read" per source with commit / version / build). Every section is present; a section
with nothing gets one line saying what was looked for. Every string stays quoted and cited; where
two sources give the same fact, cite both; where they differ, put both readings in place with a
⚠️ prefix and move on — you reconcile nothing. Do not write §17 and §18.
Then update the index at {index path}: one row, "{doc name}" and a one-line contents summary.
Section template:
{references/sections.md, whole}
Reports:
{one per source, labelled}
Return under 30 lines: doc path and line count, sections that are thin and which source left them
thin, the ⚠️ count, and the index row you added.
```

## Disagreements + open questions (one)

```
YOU ARE THE DISAGREEMENTS AGENT. Read ONLY {output path}; open no source, no report. Append §17
and §18 as the section template defines them:
§17: every ⚠️ and every place two sources state different facts, as a table with one column per
source quoting what each said, a § reference, and a status: RESOLVED only when the doc itself
holds the reason (e.g. the client always sends an explicit value, so the server default never
applies), otherwise UNRESOLVED or OPEN with a pointer to §18. Then the single-source findings
with no counterpart, grouped by source. Never resolve by preferring a source.
§18: numbered questions the spec phase must answer; each cites its §, says why no source could
settle it, and names what would (a live check with the flag on, a captured payload, a human
decision). No recommendations.
Return under 20 lines: disagreement count by status, open-question count, and the three
disagreements a specifier should read first.
```
