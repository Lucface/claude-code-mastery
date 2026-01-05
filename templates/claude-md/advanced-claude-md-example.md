# User-Level Instructions for Claude Code

## Critical Rules (Always Active)

### Tool Autonomy
✅ **FULL AUTONOMY** - Use ANY tools without asking
✅ WebFetch, WebSearch, MCP tools - Use immediately
✅ No "Can I...?" or "Should I...?" questions
❌ Only ask for genuine security concerns

**Details:** [tool-autonomy.md](./context/tool-autonomy.md)

### Package Managers - USE MODERN TOOLS ONLY

**THIS IS NON-NEGOTIABLE. NEVER use legacy package managers.**

| Language/Runtime | ✅ USE | ❌ NEVER USE |
|------------------|--------|--------------|
| **Node.js packages** | `bun` | npm, yarn, pnpm |
| **Node.js runtime** | `bun` | node (when possible) |
| **Node.js versions** | `bun` handles this | nvm, fnm, n, nodenv |
| **Python packages** | `uv pip` | pip, pip3, pipenv |
| **Python versions** | `uv` | pyenv, conda |
| **Python venvs** | `uv venv` | python -m venv, virtualenv |

**Commands to use:**
```bash
# Node.js - ALWAYS use Bun
bun install           # NOT npm/pnpm install
bun run dev           # NOT npm/pnpm run dev
bun add <pkg>         # NOT npm/pnpm install <pkg>
bun x                 # NOT npx/pnpm dlx
bun test              # Built-in test runner
bun build             # Built-in bundler

# Python
uv pip install        # NOT pip install
uv venv               # NOT python -m venv
uv run                # NOT python directly (for scripts)
```

**Why this matters:**
- Bun is 10-25x faster than npm, faster than pnpm, all-in-one runtime
- Bun includes: package manager, bundler, test runner, runtime
- Bun is a drop-in replacement for Node.js with native TypeScript support
- uv is 10-100x faster than pip, written in Rust
- These are the modern standard - legacy tools are technical debt

**If you EVER suggest npm, pnpm, yarn, pip, nvm, or pyenv - YOU ARE WRONG. Stop and correct yourself.**

### Auto-Pilot vs Ask-First (Decision Authority)

**JUST DO IT (no permission needed):**
- Fix typos, formatting, linting issues
- Remove `any` types → use proper TypeScript types
- Clean up unused imports/variables
- Add missing error handling for obvious cases
- Run tests after changes
- Update changelogs after commits
- Consistent naming conventions

**ASK FIRST (could break things or change direction):**
- Database schema changes / migrations
- Deleting files or significant code blocks
- Changing architecture or folder structure
- Adding new dependencies
- Modifying auth/security code
- Anything that affects production data

### Sensitive Personal Content - ASK FIRST

**🚫 Never access sensitive personal content without explicit permission.**

**Always ask before accessing:**
- **Personal photos** (family photos, selfies, private images)
- **Medical records** (health documents, prescriptions, doctor notes)
- **Financial documents** (bank statements, tax returns, investments)
- **Private communications** (personal emails, messages, social media exports)
- **Identity documents** (IDs, passports, SSN-related files)
- **Intimate/private content** (anything obviously personal)

**Fine to access without asking:**
- Project/work files (even if in ~/Documents)
- Code, configs, logs related to current task
- Downloads you're actively working with
- Public/professional documents

**When testing requires images/media:**
- Download from internet (picsum.photos, Unsplash, placeholder services)
- Use generated/placeholder content
- Ask before using any personal photos as test data

```bash
# Download test images instead of using personal photos
curl -o test_photo.jpg "https://picsum.photos/800/600"
```

Privacy for sensitive content is non-negotiable.

### Learning Mode (Micro-Explanations)

When doing something non-obvious, add ONE sentence explaining it:
```
✅ "Fixed: `any` → `Lead[]` (TypeScript now catches if you pass wrong data)"
✅ "Added Redis check (queues work now, were silently failing before)"
✅ "Commit abc123 pushed (backs up your work to GitHub)"
```

❌ Don't write paragraphs
❌ Don't explain obvious things
❌ Don't make them ask follow-up questions

**Goal:** They learn passively without interrupting flow.

### Context Efficiency

Reduce back-and-forth by being proactive and specific:
- **List things automatically** instead of offering to list them
- **Explain what options mean** instead of just listing them
- **Include "what this means" context** when showing git status, errors, etc.
- **Give clear next steps** so they don't have to ask "what now?"

Example of good vs bad:
```
❌ "Want me to list the worktrees?"
✅ "Found 2 worktrees:
   - ~/project-feature → feature/login (you were working on login)
   - ~/project-bugfix → bugfix/typo (small fix)
   If you're done with one, use /worktree-merge to merge it to main."
```

**Goal:** One message that answers their question AND the follow-up they would have asked.

### Teachable Moments (Recognize & Explain)

When certain events happen, add a brief educational note:

**Push rejected (remote has changes):**
> "📌 Push conflict - another session pushed to main. Resolved with rebase, but this is exactly what worktrees prevent. Consider `/worktree-new` for parallel sessions."

**Merge conflict during rebase:**
> "📌 Merge conflict from parallel work. I'll resolve it, but next time `/worktree-new` keeps branches separate."

**Found stale lockfile:**
> "📌 Found lockfile from [X hours ago]. Previous session may not have cleaned up properly. Proceeding, but worth knowing."

**Don't interrupt to ask** - resolve the issue, then explain what happened and how to prevent it. Learning happens after the friction, not during it.

### Code Quality (Auto-Enforce)

#### Linting Strategy: Oxlint First, ESLint Second

**Use hybrid linting for maximum speed + type safety:**

```bash
bun run lint           # Oxlint first (fast), then ESLint (type-aware)
bun run lint:oxlint    # Super-fast, catches most issues
bun run lint:eslint    # Type-aware rules only
bun run lint:fix       # Auto-fix with both tools
```

**Why this order matters:**
- Oxlint (Rust-based) is 10-100x faster than ESLint
- Catches 600+ rules in milliseconds
- ESLint only runs for type-aware rules that need TypeScript analysis
- `eslint-plugin-oxlint` disables ESLint rules that Oxlint already covers

**When TypeScript 7 releases (Q1-Q2 2026):** Oxlint will support `--type-aware` mode, potentially replacing ESLint entirely.

#### ABSOLUTE NO `any` POLICY - THIS IS NON-NEGOTIABLE

**The `any` type is BANNED.** This rule has been violated too many times. No more.

❌ **NEVER use `any`** - Not in parameters, not in return types, not anywhere
❌ **NEVER use implicit `any`** - Every parameter must have an explicit type
❌ **NEVER write `.map((item) => ...)` without typing `item`**
❌ **NEVER write `.reduce((sum, x) => ...)` without typing both parameters
❌ **NEVER use `// eslint-disable-next-line @typescript-eslint/no-explicit-any`**

✅ **ALWAYS** use proper types from schema, interfaces, or generics
✅ **ALWAYS** type callback parameters: `.map((item: Lead) => ...)`
✅ **ALWAYS** type reduce accumulators: `.reduce((sum: number, deal: Deal) => ...)`
✅ **IF TRULY UNKNOWN**, use `unknown` with type guards:
```typescript
// BAD - NEVER DO THIS
function process(data: any) { ... }

// GOOD - Use unknown + type guard
function process(data: unknown) {
  if (isLead(data)) {
    // TypeScript now knows data is Lead
  }
}
```

**Common Drizzle ORM types:**
```typescript
type Lead = typeof schema.leads.$inferSelect;
type Deal = typeof schema.deals.$inferSelect;
type Project = typeof schema.projects.$inferSelect;
```

**Why this matters:**
- `any` defeats the purpose of TypeScript
- `any` hides bugs that should be caught at compile time
- `any` spreads - one `any` infects everything it touches
- Every `any` is technical debt that someone has to fix later

**If you think you need `any`:**
1. You probably don't - figure out the actual type
2. Use `unknown` with proper type narrowing
3. Define an interface for the expected shape
4. Use generics `<T>` if the type varies

### File Organization
- All projects: `~/Developer/` (personal/, clients/, tools/, learning/, archive/)
- Project docs: `~/Developer/{category}/{project}/docs/` (changelogs/, plans/, guides/)
- Session states: `~/Developer/{category}/{project}/.claude-sessions/`
- Analysis artifacts: `~/.claude/artifacts/` (shared across all projects)
- Use lowercase-kebab-case for all project directories

**Details:** [file-organization.md](./context/file-organization.md)

### Session Management
After EVERY commit+push:
1. Run `/save` (save state to `~/.claude/states/`)
2. Update `~/Developer/{category}/{project}/docs/changelogs/{project}-changelog.md`
3. Update `~/Documents/claude-projects-changelogs/ALL-PROJECTS-MASTER.md` **(PERMANENT - NEVER DELETE OR MOVE)**

**Details:** [session-management.md](./context/session-management.md)

### Session Start (Sync + Worktree Check)

**ON EVERY NEW SESSION in a git project**, automatically:

1. **Sync with remote first:**
```bash
git fetch origin
git log HEAD..origin/main --oneline  # Show commits you're missing
```

If behind remote, remind:
> "📌 **Daily habit reminder:** You're [N] commit(s) behind GitHub. Run:
> ```
> git pull origin main && bun install && bun run db:generate
> ```
> This ensures you have the latest code from other sessions."

2. **Check worktrees:**
```bash
git worktree list
git branch --show-current
```

Then explain what you found:

**If on main branch with no other worktrees:**
> "You're on `main`. This is your primary codebase. Any changes here go directly to main."

**If on main branch WITH other worktrees:**
> "📌 You're on `main`, but you have [N] worktree(s) in progress:
> - `~/Developer/.../project-feature` → branch `feature/xyz` (started Dec 4)
> - `~/Developer/.../project-bugfix` → branch `bugfix/abc` (started Dec 3)
>
> These are separate folders with their own branches. Work in them won't conflict with main.
> **Before starting new work:** Consider if you want to:
> 1. Continue in one of those worktrees (open Claude Code in that folder)
> 2. Merge one back to main (`/worktree-merge` in that folder)
> 3. Start fresh on main (you're already here)"

**If IN a worktree (not main):**
> "📌 You're in worktree `project-feature` on branch `feature/xyz`.
> This is separate from main. When done with this work, use `/worktree-merge` to merge back.
> ⚠️ Don't forget to merge - unmerged worktrees = lost work."

**Lockfile Convention:**
- When starting work: Create `.claude-session-active` in worktree root
- Contents: `session_id: [timestamp]\nbranch: [branch-name]\nstarted: [ISO timestamp]`
- When ending: Delete the lockfile
- If lockfile exists when starting: "⚠️ Another session may be active here (started [time]). Proceed with caution."

**Goal:** Reduce context burn by being specific upfront. User should know exactly where they are and what their options are without asking follow-up questions.

3. **Architecture Context (for major projects):**

For TwentyFive, FutureTree, or other documented projects, briefly remind:
> "📐 **Architecture available:** Use `/arch` to explore the ecosystem structure.
> TwentyFive: 94 pages, 16 AI agents | FutureTree: Scenario planning"

Only show this on first session entry to a project, not on every message.

**Details:** [architecture-reminders.md](./context/architecture-reminders.md)

### Worktree Commands
- `/worktree-new` (or `/wtn`) - Create new worktree (safe parallel work)
- `/worktree-merge` (or `/wtm`) - Merge worktree to main and cleanup
- `/worktree-list` (or `/wtl`) - List all worktrees
- `/worktree-delete` (or `/wtd`) - Delete/abandon worktree

### Major Plan Tracking
For multi-day/multi-phase projects:
- Create: `~/Developer/{category}/{project}/docs/plans/{project}-plan.md`
- Update "Current Status" after each session
- Log tangents with return points
- Read plan FIRST after 1+ day break

**Details:** [plan-tracking.md](./context/plan-tracking.md)

### Test-Driven Development
1. Write test FIRST (describes expected behavior)
2. Run test (should fail - RED)
3. Commit test
4. Implement feature
5. Run test (should pass - GREEN)
6. Commit implementation

**Details:** [tdd-workflow.md](./context/tdd-workflow.md)

### Schema Migration Convention
When replacing text fields with FKs:
1. Add FK alongside text field
2. Add TODO: `// TODO: Remove after Phase X - replaced by newFieldId`
3. Update forms to write to both during transition
4. After phase complete: remove legacy field in cleanup phase

Every multi-phase plan must include a final **CLEANUP phase**.

---

## Agent Skills (Progressive Disclosure)

### What Are Skills?
Skills are modular capabilities Claude auto-invokes when relevant. Unlike slash commands (user-invoked), Skills trigger automatically based on context matching.

**Structure:** `~/.claude/skills/{skill-name}/SKILL.md`
```yaml
---
name: skill-name
description: When Claude should use this skill
---
# Instructions here
```

### Current Skills
- **twentyfive-dev** - TwentyFive CRM development workflow
- **finflow-dev** - FinFlow personal finance workflow
- **futuretree-dev** - FutureTree strategic intelligence workflow

### Skills Culture (IMPORTANT)

**Build Skills when you create repeatable, valuable capabilities:**

✅ **CREATE A SKILL when:**
- We build something that could be useful in other projects
- A workflow has 3+ steps that we'd repeat
- Domain expertise is packaged (e.g., "how to work with this API")
- A capability saves significant context or reduces errors

❌ **DON'T create a skill for:**
- One-off tasks
- Simple commands (use slash commands instead)
- Things that change frequently

**After completing significant work, ask:**
1. "Could this be a Skill?"
2. "Which tasks would have been easier with more domain context?"
3. "Does Anthropic or the community already have a skill for this?"

### Proactive Skill Discovery (DO THIS)

**When entering a new domain, proactively search for existing skills:**

| Domain | Search For |
|--------|------------|
| Financial/accounting | Anthropic finance skills, QuickBooks integrations |
| Documents/PDFs | Anthropic document processing skills |
| Database work | Schema design patterns, migration skills |
| API integrations | Official SDK skills, community wrappers |
| Testing | TDD skills, test generation patterns |

**How to search:**
- `mcp__Ref__ref_search_documentation` - Check Anthropic docs for official skills
- WebSearch for "Claude Code skill [domain]" or "Anthropic MCP [domain]"
- Exa.ai for code examples and community skills

**When to interject:**
> "We're working on [X]. Let me check if Anthropic has an official skill for this..."
> "Found: Anthropic has a PDF processing skill that handles [Y]. Want me to install it?"

**Goal:** Don't reinvent wheels. If Anthropic or the community solved it, use that first.

### How Skills Work (3-Tier Loading)
1. **Metadata** (~100 tokens): Always loaded - just name/description
2. **Instructions** (<5k tokens): Loaded when triggered
3. **Resources** (unlimited): Scripts, schemas stay on filesystem until accessed

This reduces context rot - content loads only when needed.

---

## Multi-Agent Artifacts

For parallel subagent execution:
- Research outputs: `~/.claude/artifacts/research/`
- Analysis results: `~/.claude/artifacts/analysis/`
- Generated plans: `~/.claude/artifacts/plans/`
- Quality reports: `~/.claude/artifacts/reports/`

**Details:** `~/.claude/artifacts/README.md`

---

## Context Files (Load On-Demand)

When detailed instructions needed:

- [tool-autonomy.md](./context/tool-autonomy.md) - Permissions, tool usage (PERMANENT: full autonomy)
- [file-organization.md](./context/file-organization.md) - Directory structure, conventions
- [session-management.md](./context/session-management.md) - State saves, changelogs
- [neon-database-workflow.md](./context/neon-database-workflow.md) - **OUR BIBLE for safe DB changes**
- [plan-tracking.md](./context/plan-tracking.md) - Multi-day project tracking
- [tdd-workflow.md](./context/tdd-workflow.md) - Test-driven development
- [anti-patterns.md](./context/anti-patterns.md) - Common mistakes to avoid

---

## Quick Reference

### Slash Commands

**Health & Status:**
- `/health` - Quick sanity check (30 sec)
- `/health-full` - Full diagnostics with tests (2-5 min)

**Development:**
- `/dev-twentyfive` - Start TwentyFive (port 5001)
- `/dev-finflow` - Start FinFlow (port 3001)
- `/dev-futuretree` - Start FutureTree
- `/dev-sandiego` - Start San Diego AI Studio

**Database:**
- `/db-reset-twentyfive` - Reset TwentyFive DB
- `/db-reset-finflow` - Reset FinFlow DB

**Testing:**
- `/test-twentyfive` - Run TwentyFive tests

**State Management:**
- `/save` (or `/sv`) - Save session state
- `/save-commit` (or `/svg`) - Save + commit
- `/save-push` (or `/svgg`) - Save + commit + push
- `/load` (or `/ld`) - Load previous state
- `/changelog` (or `/s`) - Add changelog entry

**Worktrees (Parallel Sessions):**
- `/worktree-new` (or `/wtn`) - Create new worktree
- `/worktree-merge` (or `/wtm`) - Merge worktree to main
- `/worktree-list` (or `/wtl`) - List all worktrees
- `/worktree-delete` (or `/wtd`) - Delete/abandon worktree

**Environment:**
- `/env` - Link to central .env
- `/env-add` (or `/enva`) - Add API key
- `/env-edit` (or `/enve`) - Edit .env
- `/env-list` (or `/envl`) - List services
- `/env-path` (or `/envp`) - Show .env path

**Tools:**
- `/leaderboard` (or `/ldb`) - AI model rankings
- `/leaderboard-full` (or `/ldbf`) - Full leaderboard report
- `/screenshot` - Capture screenshot
- `/mcm` - MCP Context Manager
- `/arch` - Architecture Navigator (ecosystem docs)

**Meta:**
- `/cmds` - Show all commands

---

## Workflow: Explore → Plan → Code → Commit

### 1. Explore
- Read relevant files
- Understand current implementation
- Identify what needs to change

### 2. Plan
- Use "ultrathink" for complex features
- Create PLAN.md for multi-day work (3+ phases or 3+ days)
- Use TodoWrite to track tasks

### 3. Code (with TDD if applicable)
- Write test FIRST
- Run test (should fail)
- Commit test
- Implement feature
- Run test (should pass)
- Commit implementation

### 4. Commit
- Descriptive commit message
- Reference plan phase if applicable
- Include: `🤖 Generated with Claude Code\nCo-Authored-By: Claude <noreply@anthropic.com>`

---

## Anti-Patterns (Quick Reference)

❌ Don't work on multi-day project without PLAN.md
❌ Don't skip `/save` after commit+push
❌ Don't forget dual-write changelogs
❌ Don't write implementation before tests (TDD)
❌ Don't use camelCase for project directories
❌ Don't skip worktree check on session start
❌ Don't forget to merge worktree after completing work
❌ **Don't use npm, pnpm, or yarn** - use Bun
❌ **Don't use pip** - use uv pip
❌ **Don't use nvm or fnm** - Bun handles Node.js versions

✅ Do create PLAN.md for 3+ phases
✅ Do run `/save` and update changelogs
✅ Do test-first development
✅ Do use lowercase-kebab-case
✅ Do check `git worktree list` on session start
✅ Do use `/worktree-new` for parallel work on same project
✅ **Do use Bun** for all Node.js/TypeScript projects
✅ **Do use uv** for all Python projects

**Full list:** [anti-patterns.md](./context/anti-patterns.md)

---

**Token Count:** ~450 tokens (vs 2,000 in original)
**Pattern:** Progressive disclosure - load details on-demand
