# TwentyFive Database Operations Guide

**Last Updated:** 2025-12-31

Comprehensive guide for database operations using Drizzle ORM with Neon PostgreSQL.

---

## Quick Reference

```bash
# Schema → Database
bun db:push          # Push schema changes to database

# Generate types (REQUIRED after schema changes)
bun db:generate      # Generate TypeScript types

# Seeding
bun db:seed          # Seed with development data
bun db:reset         # Reset and reseed (destructive!)

# Migrations (production)
bun db:migrate       # Run pending migrations
bun db:rollback      # Rollback last migration
```

---

## Schema Changes Workflow

### 1. Edit Schema

```typescript
// server/db/schema.ts (or shared/schema.ts)
import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 255 }),
  score: integer('score').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### 2. Push to Database

```bash
bun db:push
```

This command:
- Compares schema.ts with database
- Generates and applies SQL changes
- Updates database structure

### 3. Generate Types (CRITICAL!)

```bash
bun db:generate
```

**⚠️ Never skip this step!** It generates TypeScript types from the schema. Without it:
- Type errors in IDE
- Runtime type mismatches
- Confusing error messages

### 4. Test Changes

```bash
bun dev
# Test the new fields work
```

### 5. Commit

```bash
git add server/db/schema.ts
git commit -m "Add [field] to [table]"
```

---

## Common Schema Patterns

### Adding a Column

```typescript
// Before
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }),
});

// After
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }),
  priority: varchar('priority', { length: 20 }).default('medium'), // NEW
});
```

### Adding a Foreign Key

```typescript
export const deals = pgTable('deals', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  leadId: uuid('lead_id').references(() => leads.id), // FK to leads
  ownerId: uuid('owner_id').references(() => users.id),
});
```

### Adding an Index

```typescript
import { index } from 'drizzle-orm/pg-core';

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }),
  status: varchar('status', { length: 50 }),
}, (table) => ({
  emailIdx: index('leads_email_idx').on(table.email),
  statusIdx: index('leads_status_idx').on(table.status),
}));
```

### Adding an Enum

```typescript
import { pgEnum } from 'drizzle-orm/pg-core';

export const leadStatusEnum = pgEnum('lead_status', [
  'new',
  'contacted',
  'qualified',
  'converted',
  'lost'
]);

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: leadStatusEnum('status').default('new'),
});
```

---

## Seeding Data

### Development Seed

```typescript
// server/db/seed.ts
import { db } from './index';
import { leads, deals, users } from './schema';

async function seed() {
  // Clear existing data
  await db.delete(deals);
  await db.delete(leads);

  // Insert users
  const [adminUser] = await db.insert(users).values({
    email: 'admin@example.com',
    name: 'Admin User',
  }).returning();

  // Insert leads
  const sampleLeads = await db.insert(leads).values([
    { firstName: 'John', lastName: 'Doe', email: 'john@example.com', score: 75 },
    { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', score: 85 },
  ]).returning();

  console.log(`Seeded ${sampleLeads.length} leads`);
}

seed().catch(console.error);
```

### Running Seeds

```bash
# Standard seed
bun db:seed

# Project management seed
bun db:seed:pm

# Analytics seed (for testing charts)
bun db:seed:analytics
```

---

## Querying Data

### Basic Queries

```typescript
import { db } from '@server/db';
import { leads, deals } from '@server/db/schema';
import { eq, gt, desc, and, or, like } from 'drizzle-orm';

// Select all
const allLeads = await db.select().from(leads);

// Select with where
const hotLeads = await db.select()
  .from(leads)
  .where(gt(leads.score, 70));

// Select with multiple conditions
const qualifiedHot = await db.select()
  .from(leads)
  .where(and(
    gt(leads.score, 70),
    eq(leads.status, 'qualified')
  ));

// Select with ordering and limit
const topLeads = await db.select()
  .from(leads)
  .orderBy(desc(leads.score))
  .limit(10);

// Select with join
const dealsWithLeads = await db.select()
  .from(deals)
  .leftJoin(leads, eq(deals.leadId, leads.id));
```

### Aggregations

```typescript
import { count, sum, avg } from 'drizzle-orm';

// Count
const totalLeads = await db.select({ count: count() }).from(leads);

// Sum
const totalValue = await db.select({ total: sum(deals.value) }).from(deals);

// Average
const avgScore = await db.select({ avg: avg(leads.score) }).from(leads);
```

---

## Transactions

```typescript
import { db } from '@server/db';

await db.transaction(async (tx) => {
  // Create lead
  const [lead] = await tx.insert(leads).values({
    firstName: 'New',
    lastName: 'Lead',
  }).returning();

  // Create deal for lead
  await tx.insert(deals).values({
    name: 'New Deal',
    leadId: lead.id,
    value: 10000,
  });

  // If either fails, both rollback
});
```

---

## Backup & Restore

### Backup

```bash
# Full backup
pg_dump $DATABASE_URL > backup.sql

# Data only
pg_dump --data-only $DATABASE_URL > data_backup.sql

# Specific tables
pg_dump -t leads -t deals $DATABASE_URL > leads_deals.sql
```

### Restore

```bash
# Full restore (destructive!)
psql $DATABASE_URL < backup.sql

# Data only
psql $DATABASE_URL < data_backup.sql
```

---

## Troubleshooting

### Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check DATABASE_URL is set
echo $DATABASE_URL

# If using Neon, check connection pooling settings
```

### Schema Drift

If database doesn't match schema:

```bash
# Force push (may lose data!)
bun db:push --force

# Or reset completely
bun db:reset
```

### Type Mismatches

```bash
# Regenerate types
bun db:generate

# Clear TypeScript cache
rm -rf node_modules/.cache
bun dev
```

---

## Production Considerations

1. **Always use migrations** (not db:push) in production
2. **Backup before migrations**
3. **Test migrations in staging first**
4. **Use connection pooling** (Neon provides this)
5. **Monitor slow queries**

```bash
# Production migration
bun db:migrate

# Rollback if issues
bun db:rollback
```

---

## Related Docs

- [database-migration.md](./cookbook/database-migration.md) - Detailed migration walkthrough
- [architecture.md](./architecture.md) - Why Drizzle + Neon
- Neon docs: https://neon.tech/docs
- Drizzle docs: https://orm.drizzle.team
