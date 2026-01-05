---
name: twentyfive-dev
description: Complete development workflow for TwentyFive CRM project including testing, database operations, deployment, and architectural best practices
---

# TwentyFive Development Skill

**Project:** TwentyFive - Modern CRM for small businesses
**Location:** `~/Developer/personal/twentyfive`
**Tech Stack:** React + TypeScript + Vite + Drizzle ORM + PostgreSQL

## When to Use This Skill

Load this skill when:
- Working on the TwentyFive project
- User mentions "twentyfive", "CRM", or the project directory
- Questions about lead scoring, analytics, or CRM features

## Cookbook (Use-Case Specific Guides)

For detailed walkthroughs, load from `cookbook/`:
- [add-api-endpoint.md](./cookbook/add-api-endpoint.md) - New API endpoint pattern
- [add-feature.md](./cookbook/add-feature.md) - Full feature development flow
- [database-migration.md](./cookbook/database-migration.md) - Safe schema changes
- [debugging.md](./cookbook/debugging.md) - Common issues & fixes

## Quick Start Commands

```bash
# Development server (port 5001)
cd ~/Developer/personal/twentyfive && bun dev

# Run tests (watch mode)
bun test

# Run tests (single run)
bun test:run

# Database operations
bun db:push        # Push schema to PostgreSQL
bun db:seed        # Seed with sample data

# Or use slash commands
/dev-twentyfive        # Start dev server
/test-twentyfive       # Run tests
/db-reset-twentyfive   # Reset and reseed database
```

## Core Workflows

### 1. TDD Workflow (Test-Driven Development)

```bash
# 1. Write test first
vim tests/unit/lead-scoring.test.ts

# 2. Run test (should fail)
bun test

# 3. Commit test
git add tests/unit/lead-scoring.test.ts
git commit -m "Add tests for lead scoring"

# 4. Implement feature
vim server/lib/lead-scoring.ts

# 5. Run test (should pass)
bun test

# 6. Commit implementation
git add server/lib/lead-scoring.ts
git commit -m "Implement lead scoring algorithm"
```

### 2. Feature Development

```bash
# 1. Check plan (if exists)
cat ~/Developer/personal/twentyfive/docs/plans/twentyfive-plan.md

# 2. Start dev server
bun dev

# 3. Make changes with tests
bun test  # (in separate terminal, watch mode)

# 4. Commit and update changelog
git add .
git commit -m "Feature description"
/save-commit
```

### 3. Database Changes

```bash
# 1. Edit schema
vim server/db/schema.ts

# 2. Push to database
bun db:push

# 3. Test migration
bun db:seed
bun dev
# (verify changes work)

# 4. Commit schema
git add server/db/schema.ts
git commit -m "Add [field] to [table]"
```

## Project Structure

```
twentyfive/
├── client/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Main pages
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utilities
│   └── index.html
│
├── server/
│   ├── db/
│   │   ├── schema.ts        # Database schema
│   │   └── index.ts         # Database connection
│   ├── routes.ts            # API endpoints
│   └── index.ts             # Express server
│
├── tests/
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
│
├── shared/
│   └── types.ts             # Shared TypeScript types
│
├── package.json
├── vite.config.ts
├── vitest.config.ts
└── drizzle.config.ts
```

## Key Features

- **Lead Scoring:** Algorithmic scoring based on source, budget, engagement, timeline
- **Analytics Dashboard:** Revenue, conversion, pipeline, lead velocity charts
- **Telephony Integration:** Twilio SMS and call tracking
- **Form Builder:** Dynamic form creation with AI audit
- **Project Management:** Kanban boards, timelines, budgets

## Advanced Context

For detailed information, load these on-demand:

- [testing-guide.md](./testing-guide.md) - TDD patterns, test factories, coverage strategies
- [architecture.md](./architecture.md) - Tech stack decisions, patterns, conventions
- [database-ops.md](./database-ops.md) - Migrations, seeding, backup/restore
- [deployment.md](./deployment.md) - Build process, deployment checklist

## Common Tasks

**Add new API endpoint:**
```typescript
// server/routes.ts
app.post('/api/leads', async (req, res) => {
  const lead = await db.insert(leads).values(req.body).returning();
  res.json(lead);
});
```

**Add new React component:**
```bash
# Create component
vim client/src/components/NewComponent.tsx

# Add to page
vim client/src/pages/Dashboard.tsx

# Test in browser
bun dev
# Visit http://localhost:5001
```

**Debug database:**
```bash
# Connect to PostgreSQL
psql $DATABASE_URL

# Or inspect with Drizzle Studio (future)
bun db:studio
```

## Testing Standards

- **Unit tests:** All business logic (scoring, calculations, transformations)
- **Integration tests:** API endpoints, database operations
- **Coverage target:** 80%+ on core features
- **Test factories:** Use for complex test data
- **AAA pattern:** Arrange, Act, Assert

Example test:
```typescript
import { describe, it, expect } from 'vitest';
import { calculateLeadScore } from '@server/lib/lead-scoring';

describe('Lead Scoring', () => {
  it('should score hot leads above 70', () => {
    const lead = {
      source: 'referral',
      budget: 50000,
      engagement: 'high',
      timeline: 'immediate'
    };

    expect(calculateLeadScore(lead)).toBeGreaterThan(70);
  });
});
```

## Git Workflow

```bash
# 1. Work on feature branch (for big features)
git checkout -b feature/lead-scoring

# 2. Make commits
git add .
git commit -m "Add lead scoring algorithm"

# 3. Push to remote
git push origin feature/lead-scoring

# 4. Create PR (if using GitHub workflow)
gh pr create --title "Add lead scoring" --body "Implements weighted scoring..."

# 5. Or merge directly to main (for small changes)
git checkout main
git merge feature/lead-scoring
git push
```

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
NODE_ENV=development

# Optional
PORT=5001
SESSION_SECRET=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
```

## Troubleshooting

**Port already in use:**
```bash
lsof -ti:5001 | xargs kill -9
bun dev
```

**Database connection error:**
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**Tests failing:**
```bash
# Clear test cache
bun test:run -- --clearCache

# Run single test file
bun test tests/unit/lead-scoring.test.ts
```

## Performance Tips

- Use React.memo() for expensive components
- Implement pagination for large lists
- Add database indexes for frequent queries
- Use Vite's code splitting for large bundles

## Security Checklist

- ✅ SQL injection prevention (Drizzle parameterized queries)
- ✅ XSS prevention (React auto-escaping)
- ✅ CSRF protection (session-based auth)
- ✅ Input validation (Zod schemas)
- ✅ Environment variables (never commit secrets)

## Deployment Checklist

- [ ] All tests passing: `bun test:run`
- [ ] TypeScript compiles: `bun build`
- [ ] Database migrations applied: `bun db:push`
- [ ] Environment variables set
- [ ] Build optimized: `bun build`
- [ ] Git tagged: `git tag v1.0.0`

## Related Skills

- Load `tdd-workflow` for detailed testing guidance
- Load `git-workflow` for advanced Git patterns
- Load `changelog-automation` for changelog best practices

---

**End of Core Skill**

*For detailed instructions on specific topics, load the referenced .md files on-demand.*
