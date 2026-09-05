---
name: skill-name
description: One line — what it does and the phrases that should trigger it ("use when the user says …"). Under ~300 characters.
argument-hint: <arg>
# disable-model-invocation: true   # for skills that act (deploy, build, commit)
# context: fork                     # when the work must not pollute the caller's context
# agent: general-purpose
# effort: high                      # only when the skill needs judgement
---

# skill-name

One paragraph: the single idea this skill applies. If it takes more, it is two skills.

## Preconditions

1. What must exist before it runs (a document, a command, a bindings section) and what to ask
   for once if missing.

## Procedure

1. Numbered, imperative, each step names what it reads and what it produces.
2. …

## Invariants

- Binding rules every prompt/output must satisfy.

## What to tell the human

At the start: … At the end: …

## References

- `references/example.md` — the last real run that worked; read before writing a new one.
