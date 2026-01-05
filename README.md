# Claude Code Mastery

A comprehensive course for mastering Claude Code - from first install to running 15+ parallel AI coding sessions like the Anthropic team.

## Who This Is For

- Developers who want to 10x their productivity with AI-assisted coding
- Teams adopting Claude Code and wanting battle-tested workflows
- Anyone curious about how Anthropic's own engineers use their tool

## Course Philosophy

This course synthesizes:
- **Boris Cherny's methodology** (creator of Claude Code, 259 PRs in 30 days)
- **Cat Wu's PM philosophy** (founding PM, product vision)
- **Real-world patterns** from production use across multiple projects
- **Official documentation** organized for learning, not reference

> "Code is no longer the bottleneck. Execution and direction are." — Boris Cherny

---

## Course Structure

### Module 0: Getting Started
*Time: 30 minutes*

- [ ] Installing Claude Code
- [ ] First session walkthrough
- [ ] Understanding the interface
- [ ] Your first AI-assisted edit

### Module 1: Core Concepts
*Time: 2 hours*

- [ ] How Claude Code thinks (context, tools, permissions)
- [ ] The conversation model
- [ ] Plan mode vs execution mode
- [ ] Thinking intensifiers ("think", "think hard", "ultrathink")
- [ ] When to vibe code vs when to be precise

### Module 2: Configuration
*Time: 3 hours*

- [ ] CLAUDE.md fundamentals
- [ ] The <1000 token rule
- [ ] Project vs user vs local settings
- [ ] Slash commands (`.claude/commands/`)
- [ ] Hooks (8 types, when to use each)
- [ ] Skills (agent knowledge system)
- [ ] Permissions and safety

### Module 3: Workflows
*Time: 4 hours*

- [ ] Session management and state
- [ ] Git integration patterns
- [ ] Test-driven development with Claude
- [ ] Code review workflows
- [ ] Continuous operation (Stop hooks, Ralph Wiggum)
- [ ] Multi-file refactoring
- [ ] Database migrations

### Module 4: Advanced Patterns
*Time: 4 hours*

- [ ] Subagents and parallel execution
- [ ] The 3+5 code review pattern
- [ ] MCP server integrations
- [ ] Chrome extension for visual verification
- [ ] Multi-Claude orchestration (15+ parallel sessions)
- [ ] Git worktrees for parallel development
- [ ] Throwaway development methodology

### Module 5: Real-World Examples
*Time: Ongoing*

- [ ] Building a full-stack feature from scratch
- [ ] Debugging a production issue
- [ ] Large-scale refactoring
- [ ] API integration
- [ ] Database schema evolution

---

## Quick Start

```bash
# Clone this repo
git clone https://github.com/Lucface/claude-code-mastery.git
cd claude-code-mastery

# Start with Boris's methodology (the foundation)
open resources/boris-cherny/boris-cherny-claude-code-manual.pdf
```

---

## Repository Structure

```
claude-code-mastery/
├── 00-getting-started/       # Installation and first steps
├── 01-core-concepts/         # How Claude Code works
├── 02-configuration/         # CLAUDE.md, commands, hooks, skills
├── 03-workflows/             # Daily patterns and practices
├── 04-advanced-patterns/     # Subagents, orchestration, MCP
├── 05-real-world-examples/   # Case studies and walkthroughs
├── resources/
│   ├── boris-cherny/         # The definitive Boris Cherny manual
│   ├── external-courses/     # Other courses for reference
│   └── official-docs/        # Curated official documentation
├── templates/
│   ├── claude-md/            # CLAUDE.md templates and examples
│   ├── commands/             # Slash command examples
│   ├── hooks/                # Hook configuration examples
│   └── skills/               # Skill structure examples
└── case-studies/             # Real project implementations
```

---

## Key Resources

### The Boris Cherny Manual
The foundation of this course. 80-page PDF covering:
- Boris's complete methodology
- All 8 hook types with examples
- 13 official plugins documented
- 51 live links to resources

Location: `resources/boris-cherny/boris-cherny-claude-code-manual.pdf`

### Official Links
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Plugins Directory](https://github.com/anthropics/claude-code/tree/main/plugins)
- [Hooks Reference](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [SDK Documentation](https://docs.anthropic.com/en/docs/claude-code/sdk)

### Podcasts (Listen While You Code)
- [Latent Space: Claude Code](https://www.latent.space/p/claude-code) - Deep technical dive
- [AI & I: How to Use Claude Code](https://every.to/podcast/how-to-use-claude-code-like-the-people-who-built-it) - Practical tips
- [Behind the Craft: Cat Wu](https://creatoreconomy.so/p/inside-claude-code-how-an-ai-native-actually-works-cat-wu) - PM philosophy

---

## The Boris Cherny Stats

In 30 days, using Claude Code:
- **259 PRs** merged
- **497 commits**
- **40k lines added**
- **38k lines removed**
- **100%** written by Claude Code + Opus 4.5

His longest session: **~42 hours** continuous operation.

---

## Core Principles

### 1. Plan Mode First
> "Start most sessions in Plan mode (Shift+Tab twice). It yields 2-3x better results on complex tasks."

### 2. Same Quality Bar
> "Hold the same code quality bar whether a human or Claude writes it. Use /code-review."

### 3. Verification Loops
- Tests that actually run
- Visual verification (Chrome extension)
- Subagent code review

### 4. Build for Future Models
> "Build for the model six months from now—not today's limitations."

### 5. Compounding Knowledge
- CLAUDE.md captures mistakes so they're never repeated
- Slash commands automate recurring patterns
- Skills encode domain expertise

---

## Progress Tracking

Use this to track your progress through the course:

```markdown
## My Progress

### Module 0: Getting Started
- [x] Installed Claude Code
- [x] Completed first session
- [ ] Understood the interface
- [ ] Made first AI-assisted edit

### Module 1: Core Concepts
- [ ] ...
```

---

## Contributing

This is a living document. As Claude Code evolves and new patterns emerge, this course will be updated.

Found something useful? Open a PR.
Found an error? Open an issue.

---

## License

MIT - Use this to learn, teach, and build.

---

*Course created by synthesizing 60+ sources, starting with Boris Cherny's definitive methodology.*

*Last updated: January 2026*
