# Section template for an extraction doc

The merge agent fills every section in this order and keeps the numbering; a section with nothing
to say is kept with one line ("none", "not observed by any source") so the reader knows it was
looked for. The three header sections are unnumbered; the body is `## 1.` … `## 16.`; §17 and §18
are appended by the disagreements agent, never by the merge.

Every quoted string is in backticks or a fenced block, exactly as the source has it, with its
citation in parentheses: (`path:line`), (live: URL, what was clicked), (artefact: file, key).
A ⚠️ prefix marks a fact that one source contradicts or that no source could confirm.

## Header

**Title** — `# <Feature> in the legacy <system>`: one line naming the feature and the system.

**Preamble** — When it was read, by which scouts (one per source kind), which earlier doc declared
this feature out of scope (so the boundary is explicit), and the sentence "recorded so nobody opens
the source for this feature again". States which sources were present and complete and which were
missing or partial. Not: any finding.

**What was read** — Per source: repo root, branch, commit hash, every path read (grouped by area,
brace-expanded); per artefact: file, format, version or mtime; per live app: URL, tenant, user
role, build version, server clock, and the read-only statement (what was toggled and reverted,
what was cleared). This is the section a drift watcher maps changed paths back to. Not: findings.

## Body

1. **What the thing is, and what it is easy to conflate with** — One paragraph defining the domain
   object, then a list of every sibling, template, tag or page that shares the name or the screen,
   each with one line on how it differs. Not: fields or behaviour (those come later).

2. **History and the net field set** — The migrations or schema changes in date order (one line
   each, verbatim column names and types), then the net current column set as a table; model
   defaults, casts and scopes verbatim. Not: form fields (§4), validation (§5).

3. **Relationships** — Every relation with its kind, foreign key, the class or table on the other
   side, and where the UI or API exposes it. Not: include lists (§8).

4. **Fields, reconciled across schema, model and live screen** — One subsection per form step or
   panel, in screen order; a table per step: field key, control type, label, default, validation
   rule, help text, all verbatim; below it the option lists and conditional rendering; a ⚠️ line
   for every column with no control or control with no column. Not: backend rules (§5).

5. **Validation, the backend's exact rules** — The rule set per request class, verbatim, with the
   line range; the deltas between create, update, patch and import; custom rules and their exact
   messages. Not: frontend validation (that sits in §4's table).

6. **Delete, restore, force-delete, replicate** — Which verbs exist, what blocks each, the exact
   error and confirmation strings, what a trashed row looks like in the list. Not: permissions (§14).

7. **Wire shape** — The response resource verbatim (field list with types), the request payload
   shape, and a ⚠️ subsection for every place the client's types disagree with the wire.

8. **List query: filters, sorts, includes, pagination** — Each allowed list as the code has it
   (names, count, line range), the default sort and page size from every source, and the wire
   request captured verbatim. Not: how the toolbar renders (§9).

9. **The list screen** — Route, header buttons, filter toolbar controls in order, columns in
   template order with their rendering, row actions, bulk actions, loading and empty states, the
   URL round-trip, the requests fired on mount and per interaction. Not: form (§10).

10. **The form: mechanics, enums, pickers** — Page wiring for create and edit, footer buttons and
    toasts, create defaults as seen live, every enum with its label set per source, every picker
    with its endpoint and label template, registry entries. Not: field tables (§4).

11. **Adjacent flows** — Import, bulk edit, revisions, preview, export: one subsection each with
    its route, columns and rule deltas. "None" if the feature has none.

12. **Related entities and feature flags** — Entities the feature owns or gates on (tags,
    categories), each with its own routes and permissions in brief; every flag with its default
    and what it hides. Not: a full extraction of the related entity (that is its own doc).

13. **The committed artefacts versus reality** — Field-by-field cross-check of the API spec or
    schema dump against live code: in sync or not, and every caveat to carry forward.

14. **Permissions, exact strings** — Every permission string verbatim, grouped by entity, with
    the count; page-level guards; policy wiring; ⚠️ for every gate that checks a different
    permission than the endpoint enforces.

15. **Exact routes and the client calls** — Client routes (file-based or declared), nav placement,
    backend routes with verb and controller method, the API composables or clients that call them,
    observers, jobs and cache purges. All verbatim.

16. **Deviation candidates** — Facts the rewrite will probably NOT reproduce (dead props, wrong
    gates, live defects), one line each, so the spec phase can name them as decisions. Not: a
    decision; the doc records, the spec decides.

## Appended by the disagreements agent

17. **Disagreements between sources, every side stated** — A table: #, topic (§ ref), one column
    per source with what it said verbatim, status (RESOLVED with the reason / UNRESOLVED / OPEN →
    §18). Then "single-source findings with no counterpart", grouped by source, so they are not
    mistaken for consensus. Not: a resolution reached by preferring a source.

18. **Open questions for the spec phase** — Numbered; each names the § it comes from, why no
    source could settle it, and what would (a live check with a flag on, a human decision, a
    payload nobody captured). Not: recommendations.
