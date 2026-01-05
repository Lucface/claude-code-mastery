# Module 4: Advanced Patterns

*Time: 4 hours*

This is where you level up from productive to exceptional. These patterns are how Anthropic's own engineers achieve 10x output.

## Subagents and Parallel Execution

### What Are Subagents?

Subagents are separate Claude instances spawned by the main agent. They:
- Run in parallel
- Have their own context
- Report back to the main agent

### The Task Tool

Claude Code can spawn subagents using the Task tool:

```
> Analyze this codebase for security issues.
> Spawn subagents to check:
> 1. SQL injection vulnerabilities
> 2. XSS risks
> 3. Authentication bypasses
> 4. Insecure dependencies
>
> Each subagent should write findings to .claude-analysis/
```

### Subagent Patterns

**Research Pattern:**
```
> Research the best approach for implementing WebSocket in our stack.
> Spawn 3 subagents to:
> 1. Evaluate Socket.io
> 2. Evaluate ws library
> 3. Evaluate native WebSocket
>
> Synthesize findings into a recommendation.
```

**Review Pattern:**
```
> Review this PR from 5 different angles:
> - Correctness
> - Performance
> - Security
> - Maintainability
> - Test coverage
>
> Each reviewer is a separate subagent.
```

**Execution Pattern:**
```
> Update all API endpoints to use the new response format.
> Spawn a subagent for each endpoint.
> Collect results and report any failures.
```

---

## The 3+5 Code Review Pattern

Boris's signature pattern for thorough reviews:

### Step 1: Three Reviewers (Breadth)

```
> Spawn 3 subagents to review this change:
> 1. General code quality reviewer
> 2. Domain expert (for this part of the codebase)
> 3. Devil's advocate (find problems)
```

### Step 2: Five Focused Checks (Depth)

```
> Now spawn 5 focused reviewers:
> 1. Error handling completeness
> 2. Edge case coverage
> 3. Performance implications
> 4. Security considerations
> 5. Test adequacy
```

### Step 3: Synthesis

```
> Combine all 8 review reports.
> Prioritize findings by severity.
> Create a single action list.
```

### Creating a /code-review Command

```markdown
# /code-review

Run the 3+5 review pattern on the current changes.

## Phase 1: Breadth Review
Spawn 3 subagents:
1. **General Reviewer**: Code quality, readability, patterns
2. **Domain Expert**: Business logic correctness, edge cases
3. **Skeptic**: What could go wrong? What's missing?

Each writes to `.claude-review/phase1/`

## Phase 2: Focused Review
Spawn 5 subagents:
1. **Error Handling**: Are all failure modes covered?
2. **Edge Cases**: Empty arrays, null values, boundaries
3. **Performance**: N+1 queries, unnecessary iterations, memory
4. **Security**: Injection, auth bypass, data exposure
5. **Tests**: Coverage gaps, missing assertions, flaky tests

Each writes to `.claude-review/phase2/`

## Phase 3: Synthesis
Read all reports. Create prioritized action list.
Output to `.claude-review/REVIEW.md`
```

---

## MCP Server Integrations

### What is MCP?

Model Context Protocol (MCP) allows Claude to connect to external services.

### Official MCP Servers

| Server | Purpose |
|--------|---------|
| GitHub | Issues, PRs, code search |
| Slack | Channel messaging |
| Google Drive | Document access |
| PostgreSQL | Database queries |
| Filesystem | Extended file access |
| Memory | Persistent context |

### Setting Up MCP

```json
// .claude/settings.json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-github"]
    }
  }
}
```

### Using MCP in Practice

Once configured, Claude can use MCP tools naturally:

```
> Look at the open issues on our GitHub repo and summarize them
```

```
> Post a message to #engineering about this deployment
```

### Custom MCP Servers

You can build custom MCP servers for:
- Internal tools and APIs
- Database connections
- CI/CD integration
- Monitoring systems

See the [MCP SDK documentation](https://docs.anthropic.com/en/docs/claude-code/mcp) for building custom servers.

---

## Chrome Extension for Visual Verification

### The Problem

Claude can write UI code, but can't see the result. The Chrome extension solves this.

### How It Works

1. Install the Claude Code Chrome extension
2. Claude can take screenshots of your browser
3. Claude verifies UI changes visually

### Usage Pattern

```
> Add a loading spinner to the submit button.
> Take a screenshot before and after to verify.
```

```
> The button should be blue and 200px wide.
> Take a screenshot and verify it matches the spec.
```

### Visual Regression Testing

```
> Take a screenshot of the current homepage.
> Make the header redesign changes.
> Compare screenshots to ensure nothing else changed.
```

---

## Multi-Claude Orchestration

### The 15+ Parallel Sessions Model

Boris regularly runs 15+ Claude sessions simultaneously. Here's how:

### 1. Git Worktrees (Covered in Workflows)

Each Claude session works in its own worktree:

```bash
# Feature development
git worktree add ../project-feature feature/new-dashboard

# Bug fix
git worktree add ../project-bugfix bugfix/auth-issue

# Refactoring
git worktree add ../project-refactor refactor/database-layer
```

### 2. Session Isolation

Each terminal tab runs Claude in a different worktree:
- Tab 1: `cd ../project-feature && claude`
- Tab 2: `cd ../project-bugfix && claude`
- Tab 3: `cd ../project-refactor && claude`

### 3. Coordination Strategy

**Low coordination (independent work):**
- Different features in different areas
- Each Claude completes their task
- Merge when ready

**Medium coordination (shared context):**
- Share a PLAN.md across sessions
- Each session works on different phases
- Regular sync points

**High coordination (collaborative):**
- One "orchestrator" Claude manages others
- Subagents report to orchestrator
- Orchestrator synthesizes and decides

### 4. Resource Management

Monitor your sessions:
```bash
# See all Claude processes
ps aux | grep claude

# Check worktree status
for dir in ../project-*; do
  echo "=== $dir ==="
  git -C "$dir" status --short
done
```

---

## Throwaway Development Methodology

### The Philosophy

> "Prototype first. Learn from it. Throw it away. Build properly." — Boris Cherny

### The Pattern

**Step 1: Quick Prototype**
```
> Build a quick prototype of the user dashboard.
> Don't worry about edge cases or error handling.
> Just get the core idea working.
```

**Step 2: Learn**
```
> What did we learn from this prototype?
> What works? What doesn't?
> What would we do differently?
```

**Step 3: Rewind**
- Press `Esc Esc` to rewind to before the prototype
- Or create a throwaway branch that you'll delete

**Step 4: Build Properly**
```
> Now build the dashboard properly.
> Apply what we learned:
> - [lessons from prototype]
>
> This time with proper error handling and tests.
```

### When to Throwaway

**Good for throwaway:**
- New features you've never built
- Unfamiliar libraries or APIs
- Complex UI interactions
- Architectural experiments

**Bad for throwaway:**
- Well-understood features
- Simple CRUD operations
- Bug fixes
- Documentation

### Example Workflow

```
# Phase 1: Throwaway prototype
> Build a quick WebSocket chat feature.
> Just make it work, don't worry about edge cases.

# After it works
> What did we learn?
> - Socket.io handles reconnection nicely
> - Need to handle message ordering
> - Room management is trickier than expected

# Esc Esc to rewind

# Phase 2: Proper implementation
> Now build the chat feature properly.
> Key requirements:
> - Handle reconnection gracefully
> - Ensure message ordering
> - Proper room join/leave logic
> - Full test coverage
```

---

## Advanced Prompting Techniques

### Context Priming

Load context before making requests:

```
> Read server/api/auth.ts, server/middleware/auth.ts, and lib/jwt.ts.
> Understand how our authentication works.
> Then add a password reset feature.
```

### Constraint Setting

Be explicit about constraints:

```
> Add the feature with these constraints:
> - No new dependencies
> - Must work with existing API format
> - Must pass existing tests
> - Should take less than 100 lines
```

### Checkpoint Pattern

For long operations:

```
> Complete these steps, checkpointing after each:
> 1. Add the database migration [CHECKPOINT]
> 2. Update the model [CHECKPOINT]
> 3. Add the API endpoint [CHECKPOINT]
> 4. Add tests [CHECKPOINT]
> 5. Update documentation [CHECKPOINT]
>
> After each checkpoint, tell me what you did.
```

---

## Exercises

### Exercise 1: Subagent Research
1. Pick a technical decision (library, pattern, approach)
2. Spawn 3 subagents to research options
3. Synthesize into a recommendation

### Exercise 2: 3+5 Review
1. Create a `/code-review` command
2. Make a substantial code change
3. Run the full 3+5 review

### Exercise 3: Multi-Session Workflow
1. Create 3 worktrees for a project
2. Run Claude in each
3. Complete a small task in each
4. Merge all back to main

### Exercise 4: Throwaway Development
1. Choose a new feature
2. Build a quick prototype
3. Document learnings
4. Rewind and build properly

## Checkpoint

Before moving on, you should understand:
- [ ] How to spawn and coordinate subagents
- [ ] The 3+5 code review pattern
- [ ] How to set up MCP integrations
- [ ] Visual verification with Chrome extension
- [ ] Running 5+ parallel Claude sessions
- [ ] The throwaway development methodology

---

*Next: [Module 5: Real-World Examples](../05-real-world-examples/README.md)*
