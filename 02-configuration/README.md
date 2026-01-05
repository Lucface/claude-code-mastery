# Module 2: Configuration

*Time: 3 hours*

This is where Claude Code becomes truly powerful. Configuration transforms Claude from a generic assistant into your personalized coding partner.

## CLAUDE.md Fundamentals

CLAUDE.md is a markdown file that Claude reads at the start of every session. It's your way of teaching Claude about:
- Your preferences
- Project conventions
- Common patterns
- Things to avoid

### Location Hierarchy

| Location | Scope | Use Case |
|----------|-------|----------|
| `~/.claude/CLAUDE.md` | Global (all projects) | Your universal preferences |
| `.claude/CLAUDE.md` | Project | Team conventions, architecture |
| `.claude/CLAUDE.local.md` | Personal | Your project-specific preferences |

### The <1000 Token Rule

> "Keep CLAUDE.md under ~1000 tokens. With each model release, delete instructions that the model has internalized." — Boris Cherny

**Why?** Every token in CLAUDE.md is loaded every turn. Bloated instructions:
- Waste context window
- Can confuse the model
- Make updates harder

### What Goes in CLAUDE.md

**DO include:**
```markdown
# Project Context
This is a Next.js 14 app using TypeScript and Drizzle ORM.

# Conventions
- Use `bun` not npm
- Tests go in __tests__ folders
- API routes return { data, error } format

# Common Gotchas
- The auth middleware expects JWT in Authorization header
- Database migrations require `bun run db:push`
```

**DON'T include:**
```markdown
# How to write good code (the model knows this)
- Use descriptive variable names
- Write tests
- Handle errors properly
```

### Template: Starter CLAUDE.md

```markdown
# [Project Name]

## Stack
- [Framework]
- [Database]
- [Key libraries]

## Commands
- `bun dev` - Start development
- `bun test` - Run tests
- `bun db:push` - Push schema changes

## Conventions
- [List 3-5 key conventions]

## Gotchas
- [List things that are easy to get wrong]
```

See `templates/claude-md/` for more examples.

---

## Slash Commands

Slash commands are reusable prompts stored in `.claude/commands/`.

### Structure

```
.claude/commands/
├── commit.md       # /commit
├── review.md       # /review
└── test.md         # /test
```

### Example: /commit

```markdown
# /commit

Create a git commit for the current changes.

1. Run `git status` to see what changed
2. Run `git diff` to understand the changes
3. Write a clear commit message following conventional commits
4. Stage and commit the changes

Do NOT push unless explicitly asked.
```

### Parameterized Commands

Use `$ARGUMENTS` for dynamic input:

```markdown
# /feature $ARGUMENTS

Plan and implement the feature: $ARGUMENTS

1. Analyze the codebase to understand where this fits
2. Create a plan in Plan mode
3. Implement with tests
4. Run the test suite
```

Usage: `/feature Add user profile page`

See `templates/commands/` for more examples.

---

## Hooks

Hooks are shell scripts that run at specific points in Claude's lifecycle.

### The 8 Hook Types

| Hook | When It Runs | Use Case |
|------|--------------|----------|
| PreToolUse | Before any tool | Validate inputs, add context |
| PostToolUse | After any tool | Log actions, verify outputs |
| PermissionRequest | When permission needed | Auto-approve known patterns |
| PreCompact | Before context compaction | Preserve important info |
| SessionStart | When session begins | Load project context |
| Stop | When Claude wants to stop | Force continued operation |
| SubagentStop | When subagent wants to stop | Control subagent behavior |
| UserPromptSubmit | When you send a message | Pre-process input |

### Configuration

Hooks are configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "command": "node .claude/hooks/validate-edits.js",
        "timeout": 5000
      }
    ],
    "Stop": [
      {
        "command": "node .claude/hooks/stop-hook.js"
      }
    ]
  }
}
```

### The Ralph Wiggum Pattern

For continuous operation, use a Stop hook:

```javascript
// .claude/hooks/stop-hook.js
const output = {
  decision: "block",
  reason: "Continue working. Say 'DONE' when truly complete."
};
console.log(JSON.stringify(output));
```

This prevents Claude from stopping prematurely.

See `templates/hooks/` for more examples.

---

## Skills

Skills are bundles of knowledge that Claude can invoke. They're stored in `.claude/skills/`.

### Structure

```
.claude/skills/
└── my-project-dev/
    ├── SKILL.md           # Skill metadata and instructions
    ├── architecture.md    # Domain knowledge
    ├── database-ops.md    # Database patterns
    └── cookbook/
        ├── add-feature.md
        └── debugging.md
```

### SKILL.md Format

```yaml
---
name: my-project-dev
description: Development workflow for My Project
---

# My Project Development

## When to Use This Skill
- Adding features to My Project
- Debugging My Project issues
- Database operations

## Key Patterns
[Domain-specific knowledge here]
```

Skills are loaded on-demand, keeping context efficient.

See `templates/skills/` for a real-world example.

---

## Settings

### settings.json Locations

| File | Scope |
|------|-------|
| `~/.claude/settings.json` | Global |
| `.claude/settings.json` | Project |
| `.claude/settings.local.json` | Personal (gitignored) |

### Key Settings

```json
{
  "permissions": {
    "allow": [
      "Bash(bun:*)",
      "Bash(git:*)",
      "Read",
      "Write",
      "Edit"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(sudo:*)"
    ]
  },
  "hooks": { ... },
  "model": "claude-sonnet-4-20250514"
}
```

---

## Exercises

### Exercise 1: Create Your CLAUDE.md
1. Create `~/.claude/CLAUDE.md` with your global preferences
2. Keep it under 500 tokens
3. Test it in a new session

### Exercise 2: Build a Slash Command
1. Create `.claude/commands/` in a project
2. Add a command you'd use often (e.g., `/test`, `/deploy`)
3. Use `$ARGUMENTS` for flexibility

### Exercise 3: Add a Hook
1. Create a simple PostToolUse hook that logs all file edits
2. Configure it in settings.json
3. Verify it runs

## Checkpoint

Before moving on, you should be able to:
- [ ] Create and maintain a CLAUDE.md
- [ ] Build custom slash commands
- [ ] Understand the 8 hook types
- [ ] Know when to use Skills

---

*Next: [Module 3: Workflows](../03-workflows/README.md)*
