# Module 3: Workflows

*Time: 4 hours*

This module covers the daily patterns that make Claude Code a productive teammate rather than just a tool.

## Session Management

### Session State

Claude doesn't remember between sessions. But you can help it:

```markdown
# Session State

## What I'm Working On
- Adding user authentication to the API

## Context
- Using Passport.js with JWT
- Tests are in __tests__/auth/

## What's Done
- [x] JWT middleware created
- [x] Login endpoint working

## What's Next
- [ ] Add refresh token logic
- [ ] Add logout endpoint
```

Save this before ending a session. Load it when you return.

### The /save Command Pattern

Create a slash command to save state automatically:

```markdown
# /save

1. Create a session state file in `.claude-sessions/`
2. Include:
   - Current branch and recent commits
   - Files I've modified this session
   - What I was working on
   - What's left to do
3. Name it with today's date
```

### Resuming Sessions

When returning to a project:
```
> Load .claude-sessions/latest.md and continue where we left off
```

---

## Git Integration Patterns

### The Commit Workflow

```
> Stage and commit these changes with a descriptive message
```

Claude will:
1. Run `git status` to see changes
2. Run `git diff` to understand them
3. Write a conventional commit message
4. Stage and commit

### Branch Management

```
> Create a feature branch for adding user profiles
```

```
> What's different between this branch and main?
```

### The PR Workflow

```
> Create a PR for this branch with a summary of all changes
```

Claude will:
1. Analyze all commits since branching
2. Summarize the changes
3. Create a PR with proper description
4. Include a test plan section

### Git Worktrees for Parallel Work

When you need multiple Claude sessions on the same repo:

```bash
# Create a worktree for a feature
git worktree add ../project-feature feature/new-thing

# Work in it with Claude
cd ../project-feature
claude

# When done, merge and clean up
git checkout main
git merge feature/new-thing
git worktree remove ../project-feature
```

Worktrees let you run 5+ Claude sessions on different branches simultaneously.

---

## Test-Driven Development

### The TDD Loop

```
> Write tests for user authentication, then implement it
```

Claude should:
1. Write test first (RED)
2. Run test (fails)
3. Implement feature
4. Run test (GREEN)
5. Refactor if needed

### Prompting for TDD

Be explicit:

```
> Using TDD:
> 1. First write tests for the password reset feature
> 2. Run them (they should fail)
> 3. Then implement the feature
> 4. Run tests again (they should pass)
```

### Test Verification

Never trust "tests pass" without seeing output:

```
> Run the tests and show me the output
```

### The Test Matrix Pattern

For complex features:

```
> Create a test matrix for the checkout flow:
> - Guest vs logged in user
> - Single item vs cart
> - Credit card vs PayPal
> Then implement tests for each combination
```

---

## Code Review Workflows

### The /code-review Pattern

Boris's approach: spawn parallel subagents for review.

```markdown
# /code-review

Review the changes on this branch.

Spawn 5 subagents to analyze:
1. Code correctness
2. Error handling
3. Performance implications
4. Security concerns
5. Test coverage

Each subagent writes findings to a shared review document.
Synthesize into a final review.
```

### Self-Review Before Commit

```
> Before committing, review these changes for:
> - Unused imports
> - Console.log statements
> - Commented-out code
> - Missing error handling
```

### Requesting Specific Reviews

```
> Review this auth code specifically for security vulnerabilities
```

```
> Review this query for N+1 problems
```

---

## Continuous Operation

### The Stop Hook

Claude sometimes stops prematurely. The Stop hook prevents this.

```json
// .claude/settings.json
{
  "hooks": {
    "Stop": [
      {
        "command": "node .claude/hooks/stop-guard.js"
      }
    ]
  }
}
```

```javascript
// .claude/hooks/stop-guard.js
const output = {
  decision: "block",
  reason: "Keep working. Only stop when the task is truly complete."
};
console.log(JSON.stringify(output));
```

### The Ralph Wiggum Pattern

Named after Boris's example - Claude keeps going until explicitly told to stop.

**When to use:**
- Long refactoring sessions
- Multi-file changes
- Tasks with many steps

**When NOT to use:**
- Quick fixes
- Exploratory questions
- When you want checkpoints

### Task Lists for Long Operations

```
> Complete this refactoring. Track progress with a checklist:
> - [ ] Update UserService
> - [ ] Update UserController
> - [ ] Update tests
> - [ ] Run full test suite
>
> Don't stop until all boxes are checked.
```

---

## Multi-File Refactoring

### The Exploration Phase

```
> I want to rename the "Customer" model to "Client" throughout the codebase.
> First, find every file that references "Customer" and list them.
```

### The Plan Phase

```
> Now plan the refactoring:
> 1. What order should files be updated?
> 2. What could break?
> 3. What tests need updating?
```

### The Execution Phase

```
> Execute the refactoring plan. After each file:
> - Run the type checker
> - If errors, fix them before continuing
```

### Atomic vs Batch Changes

**Atomic** (safer):
```
> Rename Customer to Client in UserService.ts, then run tests
```

**Batch** (faster):
```
> Rename Customer to Client in all files at once
```

Use atomic for critical changes, batch for straightforward ones.

---

## Database Migrations

### Schema Changes

```
> Add an "email_verified" boolean column to the users table.
> Show me the migration before running it.
```

### Migration Safety

Always review migrations before running:

```
> Generate the migration but don't run it yet.
> Show me what SQL will execute.
```

### The Multi-Phase Pattern

For complex schema changes:

```markdown
Phase 1: Add new column (nullable)
Phase 2: Backfill data
Phase 3: Add NOT NULL constraint
Phase 4: Remove old column
```

```
> We're adding a new "team_id" foreign key to users.
> Create a 4-phase migration plan that maintains zero downtime.
```

### ORM-Specific Patterns

**Drizzle:**
```
> Update the Drizzle schema, generate the migration, and push to the database
```

**Prisma:**
```
> Add the field to schema.prisma, generate the migration, and apply it
```

---

## Exercises

### Exercise 1: Session State
1. Create a `.claude-sessions/` directory
2. Build a `/save` command that captures current state
3. End and restart a session using the saved state

### Exercise 2: TDD Flow
1. Pick a simple feature (e.g., email validation)
2. Write tests first with Claude
3. Implement with Claude
4. Verify the full RED → GREEN cycle

### Exercise 3: Code Review Pipeline
1. Create a `/code-review` command
2. Make some changes
3. Run the review before committing

### Exercise 4: Continuous Operation
1. Create a Stop hook
2. Give Claude a multi-step task
3. Observe it working through the full task list

## Checkpoint

Before moving on, you should be able to:
- [ ] Save and restore session state
- [ ] Use Claude for git workflows (commits, branches, PRs)
- [ ] Apply TDD with Claude
- [ ] Set up code review workflows
- [ ] Configure Stop hooks for long operations
- [ ] Execute multi-file refactoring safely
- [ ] Plan and execute database migrations

---

*Next: [Module 4: Advanced Patterns](../04-advanced-patterns/README.md)*
