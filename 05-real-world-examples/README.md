# Module 5: Real-World Examples

*Time: Ongoing reference*

This module provides concrete examples of using Claude Code for real development tasks. Reference these when tackling similar work.

---

## Example 1: Building a Full-Stack Feature

### The Task
Add user profile pages with avatar upload to an existing Next.js application.

### The Approach

**Step 1: Plan Mode**
```
[Shift+Tab twice to enter Plan mode]

> Plan how to add user profile pages with avatar upload.
> The app uses Next.js 14, Drizzle ORM, and S3 for storage.
```

Claude creates a plan:
```markdown
## Profile Pages Implementation

### Phase 1: Database
- Add profile fields to users table (bio, avatar_url, location)
- Create migration

### Phase 2: Backend
- GET /api/users/[id]/profile
- PUT /api/users/[id]/profile
- POST /api/users/[id]/avatar (presigned URL)

### Phase 3: Frontend
- Profile view page
- Profile edit form
- Avatar upload component

### Phase 4: Tests
- API route tests
- Upload flow tests
```

**Step 2: Execute with TDD**

```
> Implement Phase 1. Start with a test for the new profile fields.
```

```
> Now Phase 2. Write API tests first, then implement routes.
```

**Step 3: Verify**

```
> Run all tests and show me the output.
```

```
> Start the dev server. I'll check the UI manually.
```

### Key Prompts Used

```
> Show me the migration before running it.
```

```
> Add validation for bio (max 500 chars) and location (max 100 chars).
```

```
> Handle the case where the user doesn't exist gracefully.
```

---

## Example 2: Debugging a Production Issue

### The Task
Users report intermittent 500 errors on the checkout page. No obvious pattern.

### The Approach

**Step 1: Gather Context**
```
> Read the checkout route handler, the cart service, and payment integration.
> I'm investigating intermittent 500 errors.
```

**Step 2: Analyze Error Patterns**
```
> Look at the error handling in these files.
> What could cause intermittent failures?
```

Claude identifies:
- Race condition in cart total calculation
- Missing retry logic on payment API
- Timeout too short for international cards

**Step 3: Reproduce**
```
> Write a test that reproduces the race condition you identified.
```

**Step 4: Fix**
```
> Fix the race condition. Show me the before/after.
```

**Step 5: Verify**
```
> Run the test. Make sure it passes now.
```

### Key Prompts Used

```
> ultrathink: What could cause a 500 error that only happens sometimes?
```

```
> Add logging to help debug this in production.
```

```
> What other parts of the codebase might have this same issue?
```

---

## Example 3: Large-Scale Refactoring

### The Task
Migrate from REST API to tRPC across 40+ endpoints.

### The Approach

**Step 1: Assess Scope**
```
> Find all API routes in this project. List them with their methods.
```

Output: 47 endpoints found.

**Step 2: Plan the Migration**
```
> Plan a phased migration from REST to tRPC.
> Constraints:
> - Can't do all at once
> - Old and new must coexist
> - Need backwards compatibility
```

Claude creates a plan:
```markdown
## Migration Plan

### Phase 1: Setup (Day 1)
- Install tRPC
- Create router structure
- Add both REST and tRPC support

### Phase 2: Read Endpoints (Days 2-3)
- Migrate GET endpoints first
- Easier, no state changes
- 23 endpoints

### Phase 3: Write Endpoints (Days 4-6)
- Migrate POST/PUT/DELETE
- More complex validation
- 24 endpoints

### Phase 4: Cleanup (Day 7)
- Remove REST routes
- Update all client code
- Final testing
```

**Step 3: Execute in Parallel**

Using git worktrees:
```bash
git worktree add ../project-trpc-reads phase/trpc-reads
git worktree add ../project-trpc-writes phase/trpc-writes
```

Session 1 (reads):
```
> Migrate these GET endpoints to tRPC: /api/users, /api/posts, /api/comments
> Keep REST working during migration.
```

Session 2 (writes):
```
> Migrate these POST endpoints to tRPC: /api/users, /api/posts
> Keep REST working during migration.
```

**Step 4: Merge and Test**
```
> Run the full test suite. List any failures.
```

### Key Prompts Used

```
> Show me the tRPC equivalent of this REST endpoint.
```

```
> Create a shared validation schema that works for both REST and tRPC.
```

```
> Find all client code that calls this REST endpoint.
```

---

## Example 4: API Integration

### The Task
Integrate Stripe for subscription billing.

### The Approach

**Step 1: Research**
```
> What are the key Stripe concepts for subscription billing?
> What webhooks do we need to handle?
```

**Step 2: Plan with Security in Mind**
```
> Plan the Stripe integration.
> Flag any security considerations.
```

Claude's plan includes:
- Webhook signature verification
- Idempotency keys
- PCI compliance (never store card numbers)
- Handling failed payments

**Step 3: Implement with Tests**
```
> Start with the webhook handler. Write tests using Stripe's test mode.
```

```
> Implement subscription creation. Handle these cases:
> - New customer
> - Existing customer, new subscription
> - Failed payment
```

**Step 4: Security Review**
```
> Review this Stripe integration for security issues.
> Check for PCI compliance.
```

### Key Prompts Used

```
> ultrathink: What's the safest way to handle payment webhooks?
```

```
> Add retry logic for failed Stripe API calls.
```

```
> What happens if the webhook is delivered twice?
```

---

## Example 5: Database Schema Evolution

### The Task
The `users` table has grown unwieldy. Split into `users`, `profiles`, and `preferences`.

### The Approach

**Step 1: Analyze Current State**
```
> Read the users table schema and all code that queries it.
> Map out what fields belong where.
```

**Step 2: Design New Schema**
```
> Design the split:
> - users: auth-related only (email, password_hash)
> - profiles: public info (name, bio, avatar)
> - preferences: settings (theme, notifications)
```

**Step 3: Multi-Phase Migration**

```
> Create a 4-phase migration plan:
> 1. Add new tables (non-breaking)
> 2. Dual-write (populate new tables)
> 3. Switch reads (use new tables)
> 4. Remove old columns
```

**Step 4: Implement Phase by Phase**

Phase 1:
```
> Create migration for profiles and preferences tables.
> Add foreign keys to users.
```

Phase 2:
```
> Update all write operations to dual-write.
> Add a backfill script for existing data.
```

Phase 3:
```
> Update all read operations to use new tables.
> Keep old columns for rollback safety.
```

Phase 4 (after verification):
```
> Create migration to remove old columns.
> Update all remaining references.
```

### Key Prompts Used

```
> Show me the migration before running it. Explain what each part does.
```

```
> What if we need to rollback after Phase 3?
```

```
> Verify data integrity after the backfill.
```

---

## Prompting Patterns That Worked

### The Context Stack

```
> Read [file1], [file2], [file3].
> Understand how they work together.
> Then [make the change].
```

### The Constraint List

```
> Implement [feature] with these constraints:
> - No new dependencies
> - Must maintain backwards compatibility
> - Should follow existing patterns in [reference file]
> - Needs tests before code
```

### The Verification Loop

```
> Make the change.
> Run tests.
> If tests fail, fix and repeat.
> Don't stop until tests pass.
```

### The Security Check

```
> Implement [feature].
> Then review it for [OWASP Top 10 / auth bypass / injection / etc].
> Fix any issues found.
```

### The Rollback Plan

```
> Before making this change, explain:
> - What could go wrong
> - How we would detect it
> - How we would rollback
```

---

## Common Mistakes and Fixes

### Mistake: Skipping Plan Mode

**Problem:** Jumping straight into complex features leads to rework.

**Fix:** Always use Plan mode for features touching 3+ files.

### Mistake: Not Verifying

**Problem:** Claude says "tests pass" but didn't actually run them.

**Fix:** Always ask to see the actual output.

### Mistake: Accepting First Solution

**Problem:** First solution works but isn't optimal.

**Fix:** Ask for alternatives:
```
> What other approaches could work here?
> What are the tradeoffs?
```

### Mistake: Ignoring Edge Cases

**Problem:** Happy path works, edge cases break.

**Fix:** Explicitly ask:
```
> What edge cases should we handle?
> - Empty input
> - Null values
> - Very large data
> - Concurrent access
```

### Mistake: Manual Testing Only

**Problem:** No automated tests, regressions sneak in.

**Fix:** Make tests a requirement:
```
> Add tests for this feature before implementing it.
```

---

## Your Turn

Pick a real task from your work and apply these patterns:

1. **Start with Plan mode** - Get the full picture before coding
2. **Use TDD** - Tests first, then implementation
3. **Verify explicitly** - See the actual output
4. **Review before committing** - Run the 3+5 pattern
5. **Document for next time** - Add learnings to CLAUDE.md

---

*Return to: [Course Overview](../README.md)*
