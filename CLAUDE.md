# ~/projects/skills — personal Claude Code skills

One repo, one directory per skill, installed into `~/.claude/skills` by symlink so every project
loads them. Sessions in THIS repo build and maintain skills; sessions in other projects only USE
them. Keep it that way — never develop a skill from inside the project that needs it.

## Layout

```
<skill-name>/            one skill, kebab-case, the directory name IS the skill name
  SKILL.md               required: frontmatter + instructions, under ~100 lines (hard cap 500)
  references/*.md        detail loaded on demand; SKILL.md links to each and says WHEN to read it
  scripts/               executables (not loaded into context); call via ${CLAUDE_SKILL_DIR}
templates/skill/         the starting point for a new skill (not installed)
bin/install              symlinks every top-level dir that has a SKILL.md into ~/.claude/skills
```

## Conventions

- **Portable by construction.** A skill never names a project, a path under `~/projects`, a
  repo's command, a tenant or a model as a hard-coded fact. Everything project-specific comes
  from a `## <skill-name>` bindings section in the consuming project's rules file
  (AGENTS.md / CLAUDE.md), and the skill says exactly which rows it needs and asks once if missing.
- **One skill, one purpose, stated in one line** as the `description` — that line is what
  decides invocation, so it names the triggers ("use when the user says …") and stays under
  ~300 characters. `when_to_use` may extend it. `argument-hint` documents the arguments.
- **Body = procedure + invariants + what to report.** Numbered steps, binding rules, and the
  shape of the message back to the human. No history, no rationale longer than one sentence —
  rationale goes to `references/`.
- **Frontmatter you will actually use**: `name`, `description`, `argument-hint`, `arguments`
  (for `$name` substitution), `disable-model-invocation: true` for skills that DO things (deploy,
  build, commit), `allowed-tools` only for the exact commands the skill runs, `context: fork` +
  `agent` when the work must not pollute the caller's context, `effort` when a skill needs
  judgement. Full field list: https://code.claude.com/docs/en/skills (verify there; do not code
  frontmatter from memory).
- **Dynamic context** (`` !`cmd` ``) only for cheap, fast, read-only commands; append `|| true`
  when a non-zero exit is expected.
- **Worked example over abstraction.** Each skill keeps one real, redacted example of its
  output in `references/` (a script, a report, a prompt) — the last run that worked.
- **No secrets, no customer data, no legacy-source excerpts** in this repo; it may be shared.

## Loop for a new or changed skill

1. Copy `templates/skill/` to `<skill-name>/`; fill frontmatter and the three body sections.
2. `bin/install` (idempotent), then `claude plugin validate ~/projects/skills` for the YAML (validate the repo root: the validator does not follow the symlinks in `~/.claude/skills`).
3. Test from a consuming project in a fresh session: `/<skill-name> <args>`; check `/context`
   for the listing cost and `/skill-doctor` for unused skills.
4. Commit: Conventional Commits (`feat(<skill>):`, `fix(<skill>):`, `docs(<skill>):`), one
   skill per commit. Remote: github.com/kzotov/skills (public) — so nothing project-private ever lands here; redact paths, tenant names and org scopes in examples before committing.
   No session links: never add a `Claude-Session:` trailer or any session URL/id to a commit
   message or a file in this repo. A `Co-Authored-By` trailer is fine.

## Existing skills

- `wave-build` — build one wave of a contract-first proposal with context-budgeted parallel
  agents (Workflow tool). Bindings: a `## wave-build` section in the project's rules file.
