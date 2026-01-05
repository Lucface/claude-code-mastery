# TwentyFive Architecture Guide

**Last Updated:** 2025-12-31

This document covers tech stack decisions, patterns, and conventions for TwentyFive CRM.

---

## Tech Stack Decisions (ADRs)

### ADR-001: Drizzle ORM over Prisma

**Decision:** Use Drizzle ORM instead of Prisma

**Why:**
- Type-safe SQL with better TypeScript inference
- Lighter bundle size (~7kb vs ~800kb)
- No code generation step needed
- Direct SQL control when needed
- Better performance for complex queries

**Trade-offs:**
- Smaller community than Prisma
- Less documentation
- Manual migration management

### ADR-002: Neon PostgreSQL

**Decision:** Use Neon as managed PostgreSQL

**Why:**
- Serverless-native (auto-scaling)
- Branching for development
- Pay-per-use pricing
- Fast cold starts
- Built-in connection pooling

**Trade-offs:**
- Vendor lock-in
- Newer service (less battle-tested)

### ADR-003: Session-based Authentication

**Decision:** Use session-based auth (express-session) over JWT

**Why:**
- Simpler mental model
- Server-side session revocation
- Works better with SSR
- No token refresh complexity
- Better security for web apps

**Trade-offs:**
- Requires session store (PostgreSQL)
- Not ideal for mobile apps
- Slight latency from DB lookup

---

## Code Patterns

### API Route Pattern

```typescript
// server/routes.ts
app.post('/api/leads', requireAuth, async (req, res) => {
  try {
    // 1. Validate input
    const validated = insertLeadSchema.parse(req.body);

    // 2. Business logic
    const lead = await db.insert(leads).values({
      ...validated,
      ownerId: req.user.id,
    }).returning();

    // 3. Return response
    res.status(201).json(lead[0]);
  } catch (error) {
    // 4. Handle errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    throw error;
  }
});
```

### React Component Pattern

```typescript
// client/src/components/LeadCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LeadCardProps {
  lead: Lead;
  onAction?: (action: string) => void;
}

export function LeadCard({ lead, onAction }: LeadCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{lead.name}</CardTitle>
        <Badge variant={getScoreVariant(lead.score)}>
          Score: {lead.score}
        </Badge>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  );
}
```

### Data Fetching Pattern

```typescript
// client/src/hooks/useLeads.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: () => fetch('/api/leads').then(r => r.json()),
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewLead) =>
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
```

---

## Naming Conventions

### Files
- Components: `PascalCase.tsx` (e.g., `LeadCard.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useLeads.ts`)
- Utilities: `camelCase.ts` (e.g., `formatCurrency.ts`)
- Tests: `*.test.ts` (e.g., `lead-scoring.test.ts`)

### Code
- React components: PascalCase
- Functions/variables: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Database columns: snake_case (Drizzle maps to camelCase)

### URLs
- API routes: `/api/kebab-case` (e.g., `/api/lead-scoring`)
- Pages: `/kebab-case` (e.g., `/lead-details`)

---

## Folder Structure Rationale

```
client/
├── components/     # Reusable UI components
│   ├── ui/         # Base components (shadcn/ui)
│   └── [domain]/   # Domain-specific components
├── pages/          # Route pages (matches URL structure)
├── hooks/          # Custom React hooks
└── lib/            # Utilities, stores, API client

server/
├── routes.ts       # All API routes
├── middleware/     # Express middleware
├── db/             # Database schema and connection
└── lib/            # Server utilities
```

**Why this structure:**
- Clear separation of concerns
- Easy to find files
- Scales well as app grows
- Matches React conventions

---

## Performance Considerations

1. **Database:** Use indexes on frequently queried columns
2. **API:** Implement pagination for list endpoints
3. **Frontend:** Use React.memo() for expensive components
4. **Bundle:** Use code splitting for large pages
5. **Caching:** TanStack Query handles client-side caching

---

## Security Practices

1. **Input Validation:** All inputs validated with Zod
2. **SQL Injection:** Drizzle's parameterized queries
3. **XSS:** React's automatic escaping
4. **CSRF:** Session-based with SameSite cookies
5. **Auth:** requireAuth middleware on all protected routes
6. **Secrets:** Never commit to git, use environment variables

---

## Full Architecture Docs

For the complete architecture documentation including:
- All 94 pages mapped
- 16 AI agents architecture
- User journey maps
- More ADRs

See: `/arch twentyfive` or browse `~/Developer/tools/ecosystem-architecture/projects/twentyfive/`
