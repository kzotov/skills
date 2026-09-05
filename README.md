# skills

Personal [Claude Code](https://code.claude.com) skills, one directory each, installed into
`~/.claude/skills` by symlink.

```sh
git clone https://github.com/kzotov/skills ~/projects/skills
~/projects/skills/bin/install
```

| Skill | What it does |
| --- | --- |
| [`wave-build`](wave-build/SKILL.md) | Build one wave of a contract-first proposal with parallel agents so that no agent ever holds the whole tree: disjoint builders, pairwise seam-closers, a verify runner that reads only failure output, rule-citing reviewers, one fix agent. Needs the Workflow tool and a `## wave-build` bindings section in the project's rules file. |
| [`legacy-scout`](legacy-scout/SKILL.md) | Read one feature of an existing system once, with one cheap scout per source kind (legacy frontend, backend, live app, committed artefacts), and write a verbatim extraction doc that replaces the source for every later session: merge from compact reports, then a disagreements and open-questions pass over the doc alone. Needs a `## legacy-scout` bindings section in the project's rules file. |

Conventions for writing skills are in [CLAUDE.md](CLAUDE.md).
