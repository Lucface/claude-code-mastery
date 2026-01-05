# TwentyFive Testing Guide

**Loaded on-demand when:** User asks about testing, TDD, test patterns, or coverage

## Testing Philosophy

TwentyFive follows **Test-Driven Development (TDD)** for all business logic:
1. Write test first (describes expected behavior)
2. Run test (should fail - red)
3. Implement feature (make test pass - green)
4. Refactor (improve without breaking - refactor)
5. Commit test and implementation separately

## Test Stack

- **Test Runner:** Vitest (faster than Jest, native ESM support)
- **Assertions:** Vitest's expect (compatible with Jest)
- **Component Testing:** @testing-library/react (when needed)
- **API Testing:** supertest (integration tests)
- **Coverage:** Vitest coverage (c8 provider)

## Running Tests

```bash
# Watch mode (recommended during development)
bun test

# Single run (CI/CD)
bun run test:run

# With coverage
bun run test:coverage

# UI mode (visual test explorer)
bun run test:ui

# Specific file
bun test tests/unit/lead-scoring.test.ts

# Specific test pattern
bun test -- --grep="hot leads"
```

## Test Organization

```
tests/
├── unit/                       # Pure logic tests (fast, isolated)
│   ├── lead-scoring.test.ts
│   ├── revenue-calculator.test.ts
│   └── date-utils.test.ts
│
├── integration/                # API + Database tests (slower, realistic)
│   ├── api/
│   │   ├── leads.test.ts
│   │   ├── projects.test.ts
│   │   └── analytics.test.ts
│   └── db/
│       ├── lead-queries.test.ts
│       └── project-queries.test.ts
│
├── component/                  # React component tests (when needed)
│   ├── LeadCard.test.tsx
│   └── DashboardStats.test.tsx
│
└── factories/                  # Test data factories
    ├── lead.factory.ts
    ├── project.factory.ts
    └── user.factory.ts
```

## Test Patterns

### AAA Pattern (Arrange-Act-Assert)

```typescript
import { describe, it, expect } from 'vitest';
import { calculateLeadScore } from '@server/lib/lead-scoring';

describe('Lead Scoring', () => {
  it('should score hot leads above 70', () => {
    // Arrange: Set up test data
    const lead = {
      source: 'referral',
      budget: 50000,
      engagement: 'high',
      timeline: 'immediate'
    };

    // Act: Execute the function
    const score = calculateLeadScore(lead);

    // Assert: Verify the result
    expect(score).toBeGreaterThan(70);
    expect(score).toBeLessThanOrEqual(100);
  });
});
```

### Test Factories (DRY test data)

```typescript
// tests/factories/lead.factory.ts
import { faker } from '@faker-js/faker';

export const LeadFactory = {
  createHotLead: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    source: 'referral',
    budget: 50000,
    engagement: 'high',
    timeline: 'immediate',
    score: 85,
    ...overrides
  }),

  createColdLead: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    source: 'cold-outreach',
    budget: 5000,
    engagement: 'none',
    timeline: 'exploring',
    score: 15,
    ...overrides
  }),

  create: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    source: 'website',
    budget: faker.number.int({ min: 5000, max: 100000 }),
    engagement: 'medium',
    timeline: '1-3 months',
    ...overrides
  })
};

// Usage in tests
import { LeadFactory } from '../factories/lead.factory';

it('should prioritize hot leads over cold leads', () => {
  const hot = LeadFactory.createHotLead();
  const cold = LeadFactory.createColdLead();

  const sorted = sortLeadsByPriority([hot, cold]);

  expect(sorted[0]).toBe(hot);
});
```

### API Integration Tests

```typescript
// tests/integration/api/leads.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@server/index';
import { db } from '@server/db';
import { leads } from '@server/db/schema';

describe('POST /api/leads', () => {
  beforeEach(async () => {
    // Clear test data before each test
    await db.delete(leads);
  });

  it('should create lead and return 201', async () => {
    const response = await request(app)
      .post('/api/leads')
      .send({
        name: 'Test Lead',
        email: 'test@example.com',
        source: 'website',
        budget: 25000
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.score).toBeGreaterThan(0);
  });

  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/leads')
      .send({
        name: 'Test Lead'
        // Missing email
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('email');
  });
});
```

### Database Tests

```typescript
// tests/integration/db/lead-queries.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@server/db';
import { leads } from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { LeadFactory } from '../../factories/lead.factory';

describe('Lead Database Operations', () => {
  beforeEach(async () => {
    await db.delete(leads);
  });

  it('should insert and retrieve lead by id', async () => {
    const testLead = LeadFactory.create();

    const [inserted] = await db
      .insert(leads)
      .values(testLead)
      .returning();

    const retrieved = await db.query.leads.findFirst({
      where: eq(leads.id, inserted.id)
    });

    expect(retrieved).toBeDefined();
    expect(retrieved?.email).toBe(testLead.email);
  });

  it('should calculate score on insert', async () => {
    const [lead] = await db
      .insert(leads)
      .values({
        name: 'Hot Lead',
        email: 'hot@example.com',
        source: 'referral',
        budget: 50000,
        engagement: 'high',
        timeline: 'immediate'
      })
      .returning();

    expect(lead.score).toBeGreaterThan(70);
  });
});
```

### React Component Tests

```typescript
// tests/component/LeadCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeadCard } from '@/components/LeadCard';
import { LeadFactory } from '../factories/lead.factory';

describe('LeadCard', () => {
  it('should display hot lead badge for high scores', () => {
    const lead = LeadFactory.createHotLead();

    render(<LeadCard lead={lead} />);

    expect(screen.getByText(lead.name)).toBeInTheDocument();
    expect(screen.getByText(/hot/i)).toBeInTheDocument();
  });

  it('should display cold lead badge for low scores', () => {
    const lead = LeadFactory.createColdLead();

    render(<LeadCard lead={lead} />);

    expect(screen.getByText(/cold/i)).toBeInTheDocument();
  });
});
```

## Coverage Goals

- **Business Logic:** 100% (scoring, calculations, transformations)
- **API Endpoints:** 90%+ (all happy paths + major error cases)
- **Database Operations:** 90%+ (CRUD + complex queries)
- **React Components:** 60%+ (focus on critical UI logic)
- **Overall Target:** 80%+

Check coverage:
```bash
bun run test:coverage
open coverage/index.html
```

## TDD Workflow Example

**Feature:** Add email validation to lead creation

```bash
# 1. Write test FIRST
cat > tests/unit/email-validator.test.ts <<'EOF'
import { describe, it, expect } from 'vitest';
import { isValidEmail } from '@server/lib/validators';

describe('Email Validator', () => {
  it('should accept valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user+tag@domain.co.uk')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
  });
});
EOF

# 2. Run test (SHOULD FAIL - red)
bun test tests/unit/email-validator.test.ts
# ❌ Error: Cannot find module '@server/lib/validators'

# 3. Commit test
git add tests/unit/email-validator.test.ts
git commit -m "Add tests for email validation"

# 4. Implement feature (GREEN)
cat > server/lib/validators.ts <<'EOF'
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
EOF

# 5. Run test (SHOULD PASS - green)
bun test tests/unit/email-validator.test.ts
# ✅ All tests passed

# 6. Commit implementation
git add server/lib/validators.ts
git commit -m "Implement email validation

Uses regex pattern to validate email format.
Handles common edge cases (missing @, domain, etc.)

Tests confirm valid emails accepted, invalid rejected."
```

## Best Practices

### DO

✅ Write tests BEFORE implementation (TDD)
✅ Use descriptive test names (`it('should score hot leads above 70')`)
✅ Test one thing per test
✅ Use factories for complex test data
✅ Clean up test data in `beforeEach`
✅ Test both happy paths and error cases
✅ Keep tests fast (isolate external dependencies)
✅ Run tests in watch mode during development

### DON'T

❌ Skip tests for "simple" code
❌ Write implementation before tests
❌ Use production database for tests
❌ Share state between tests
❌ Test implementation details (test behavior, not internals)
❌ Copy-paste test code (use factories)
❌ Ignore failing tests
❌ Write slow tests (mock external APIs)

## Debugging Tests

```bash
# Run single test with debug output
DEBUG=* bun test tests/unit/lead-scoring.test.ts

# Use console.log in tests
it('should calculate score', () => {
  const lead = LeadFactory.create();
  const score = calculateLeadScore(lead);
  console.log('Lead:', lead);
  console.log('Score:', score);
  expect(score).toBeGreaterThan(0);
});

# Use debugger
it('should calculate score', () => {
  const lead = LeadFactory.create();
  debugger; // Pause here
  const score = calculateLeadScore(lead);
  expect(score).toBeGreaterThan(0);
});

# Run with node inspector
node --inspect-brk node_modules/.bin/vitest run tests/unit/lead-scoring.test.ts
```

## CI/CD Integration

```bash
# In GitHub Actions
bun run test:run          # Single run, exit with error code
bun run test:coverage     # Generate coverage report

# Fail if coverage below threshold
bun run test:coverage -- --coverage.lines 80
```

## Common Patterns

### Testing Async Code

```typescript
it('should fetch lead from API', async () => {
  const lead = await fetchLead('123');
  expect(lead.id).toBe('123');
});
```

### Testing Errors

```typescript
it('should throw error for invalid lead', () => {
  expect(() => {
    validateLead({ name: '' }); // Invalid
  }).toThrow('Name is required');
});
```

### Testing Timers

```typescript
import { vi } from 'vitest';

it('should debounce function calls', async () => {
  vi.useFakeTimers();

  const fn = vi.fn();
  const debounced = debounce(fn, 100);

  debounced();
  debounced();
  debounced();

  vi.advanceTimersByTime(100);

  expect(fn).toHaveBeenCalledTimes(1);

  vi.useRealTimers();
});
```

## Related Documentation

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [TDD Best Practices](../tdd-workflow/SKILL.md)

---

**End of Testing Guide**
