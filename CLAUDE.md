# Claude Code Mastery

Comprehensive course for mastering Claude Code -- from install to running 15+ parallel AI coding sessions.

## Dev Commands

```bash
bun install              # Install dependencies
bun run dev              # Serve docs locally with Docsify on :3006
bun run serve            # Same as dev, no auto-open
```

## Project Type

This is a **documentation/course site**, not an application. Content is Markdown served via Docsify.

## Course Structure (6 modules)

```
00-getting-started/      # Installation, first session (~30 min)
01-core-concepts/        # Context model, plan mode, thinking (~2 hrs)
02-configuration/        # CLAUDE.md, commands, hooks, skills (~3 hrs)
03-workflows/            # Git, TDD, code review, sessions (~4 hrs)
04-advanced-patterns/    # Subagents, MCP, parallel sessions (~4 hrs)
05-real-world-examples/  # Full-stack features, debugging, refactoring
```

## Key Resources

```
resources/
  boris-cherny/          # Boris Cherny's 80-page methodology PDF + MD
  external-courses/      # Third-party course references
  official-docs/         # Curated Anthropic docs
templates/
  claude-md/             # CLAUDE.md examples (advanced template)
  commands/              # Slash command examples (save, health, worktree)
  hooks/                 # Hook configuration examples
  skills/                # Skill structure examples (twentyfive-dev)
```

## Content Guidelines

- Each module directory has a `README.md` as its index
- Boris Cherny manual is the foundational reference
- Course synthesizes Boris Cherny, Cat Wu, official docs, and real-world patterns
- Checklist format (`- [ ]`) for progress tracking within modules

## Conventions

- Use `bun` for all tooling, never npm/yarn/pnpm
- Use `bunx` instead of `npx`
- Markdown files are the primary content format
- Docsify handles routing from Markdown files
