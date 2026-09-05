---
name: legacy-scout
description: Read ONE feature of an existing system once, with parallel cheap scouts (one per source kind — legacy frontend, backend, live app, committed artefacts), and write a verbatim extraction doc that replaces the source for every later session. Use when the user says "scout <feature>", "extract <feature> from legacy", "/legacy-scout <feature>", or starts a new feature that has no extraction doc yet.
argument-hint: <feature> [scope note]
disable-model-invocation: true
---

# legacy-scout

One idea: **read the source once, verbatim, then never again.** Each scout holds one source kind
for one feature and returns a compact report; a merge agent holds only the reports and writes the
doc; a last pass holds only the doc and lists where the sources disagree. After the doc exists,
every later session (specify, wave-build, drift updates) reads the doc, not the source.

## Preconditions

1. A `## legacy-scout` bindings section in the project's rules file (AGENTS.md / CLAUDE.md).
   Required rows: `sources` (each source repo with root, default branch and its read rule),
   `live app` (URL, credentials location, the READ-ONLY rule), `artefacts` (committed files that
   count as sources: an API spec, a schema dump, a route inventory), `output` (directory, file
   naming, the index file to update), `scout model` (model / effort for the scouts),
   `drift watcher` (the script and how it maps paths to docs, or "none"). Optional: `judge model`
   for the merge and disagreements agents (default: the main session's model). Step 0 checks this
   BEFORE anything else: `grep -n '^## legacy-scout' <rules file>`. Missing → ask for the rows
   once and write the section; do not guess, do not open any source.
2. The feature is ONE thing with a name (an entity, a screen group, a flow) and no doc for it
   exists in the output directory. If a doc exists, this is a drift update, not a scout: say so.

## Procedure

0. **Bindings.** Read the section; stop and ask if it is missing. Read the output index and any
   doc that already covers a neighbouring feature so this one can declare its boundary.
1. **Scope the feature in one paragraph**: the domain object, the screens, the things it is easy
   to conflate with (a sibling entity, a page template with the same name). This paragraph goes
   into every scout prompt; scouts that find the boundary wrong report it, they do not widen it.
2. **Fan out one scout per source kind** the bindings name (`references/prompts.md`, scout
   prompts), on the bound scout model. Workflow tool when available, Agent tool in parallel
   otherwise. Each scout locates its files
   by grep first, reads only those, records the commit it read at, and returns a compact report
   in the section order of `references/sections.md`.
3. **Merge.** One agent holds ONLY the reports and `references/sections.md`; it writes the doc to
   the bound output path, filling every section, quoting every string, marking a source as
   "not read" or "partial" instead of filling the gap from another source.
4. **Disagreements and open questions.** One agent reads ONLY the doc, reconciles nothing, and
   appends the two final sections: every difference between sources with every side stated and a
   status (resolved with the reason / unresolved), and the questions the spec phase must answer.
5. **Main session:** read the doc's header and the two final sections, spot-check three quoted
   strings against a scout report, add the index row, register the paths in the drift watcher
   map if the bindings name one, commit doc + index as one `docs(legacy):` commit.

## Invariants (binding for every prompt you write)

- VERBATIM: labels, help text, placeholders, options, validation messages, error strings,
  permission strings, routes, column names are QUOTED, never paraphrased or normalised.
- Every fact carries its source and citation: `path:line` for code, `URL + what was clicked` for
  the live app, `file + key` for an artefact. A fact with two sources cites both.
- The doc records what was read: every path, the commit hash and branch per repo, the artefact
  file with its version or mtime, the live app URL, tenant, build version and clock. That is what
  a drift watcher maps later changes back to.
- Scouts read ONLY the feature's files; grep to locate, `sed -n` ranges to read; whole files only
  under ~200 lines. Never the whole repo, never a neighbouring feature beyond a cross-link.
- The live app is READ-ONLY: nothing created, edited, deleted, submitted; a control toggled to
  observe conditional rendering is reverted and the toggle is recorded in the header.
- No source fills another's gap: a source that could not see something says "not observed".
- Disagreements are recorded with every side, never settled by picking a favourite source.
- Reports are COMPACT: facts and quotes in section order, under the cap named in the prompt; no
  narration, no code beyond a quoted rule or wire sample.
- Agents never commit; the main session commits doc + index together.

## Sizing

`agents = source kinds + 1 merge + 1 disagreements`. Three sources is five agents. A feature that
needs more than one scout per source kind is two features: split by screen group and cross-link.

## What to tell the human

At launch: feature, the scope paragraph, which sources are being read and by which model, the
run id. At the end: the doc path and line count, per source what was read (paths, commit) and
what was missing or partial, the counts of disagreements (resolved / open) and open questions,
the three spot-checked strings, and what the drift watcher now maps to this doc.

## References

- `references/sections.md` — the section template, one line each on what goes in; read before
  writing the merge prompt and hand it to the merge agent whole.
- `references/prompts.md` — the COMMON, scout, merge and disagreements prompts.
- `references/workflow.template.js` — the script skeleton; copy and fill.
