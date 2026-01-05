# Add Feature (Full Flow)

Complete guide for adding a new feature to TwentyFive using TDD.

## The 7-Step Flow

### 1. Write Test FIRST (RED)

```typescript
// tests/unit/new-feature.test.ts
import { describe, it, expect } from 'vitest';
import { calculateSomething } from '@server/lib/new-feature';

describe('New Feature', () => {
  it('should do the expected thing', () => {
    const result = calculateSomething({ input: 'test' });
    expect(result).toBe('expected');
  });

  it('should handle edge case', () => {
    expect(() => calculateSomething({ input: '' })).toThrow();
  });
});
```

### 2. Run Test (Should Fail)

```bash
bun test tests/unit/new-feature.test.ts
# Expect: FAIL - function doesn't exist yet
```

### 3. Commit Test

```bash
git add tests/unit/new-feature.test.ts
git commit -m "Add tests for new feature"
```

### 4. Implement Feature

```typescript
// server/lib/new-feature.ts
export function calculateSomething(input: { input: string }): string {
  if (!input.input) {
    throw new Error('Input required');
  }
  return 'expected';
}
```

### 5. Run Test (Should Pass)

```bash
bun test tests/unit/new-feature.test.ts
# Expect: PASS
```

### 6. Commit Implementation

```bash
git add server/lib/new-feature.ts
git commit -m "Implement new feature calculation"
```

### 7. Wire Up to API/UI

- Add API endpoint (see: add-api-endpoint.md)
- Add React component
- Test end-to-end

## File Locations by Feature Type

| Feature Type | Location |
|--------------|----------|
| Business logic | `server/lib/` |
| API routes | `server/routes.ts` |
| React components | `client/src/components/` |
| Pages | `client/src/pages/` |
| Hooks | `client/src/hooks/` |
| Types | `shared/schema.ts` |
| Tests | `tests/unit/` or `tests/integration/` |

## Checklist

- [ ] Test written FIRST
- [ ] Test fails (proves test works)
- [ ] Test committed separately
- [ ] Implementation passes test
- [ ] Implementation committed
- [ ] API endpoint added (if needed)
- [ ] React component added (if needed)
- [ ] Manual browser test
