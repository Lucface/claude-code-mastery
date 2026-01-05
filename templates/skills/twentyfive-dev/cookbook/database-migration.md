# Database Migration

Safe schema changes for TwentyFive's PostgreSQL database.

## The Safe Migration Pattern

### Adding a New Table

```typescript
// 1. Edit db/schema.ts
export const newTable = pgTable("new_table", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Push to database
// $ bun run db:push

// 3. Generate TypeScript types
// $ bun run db:generate
```

### Adding a Column to Existing Table

```typescript
// 1. Add column with default (safe for existing data)
export const leads = pgTable("leads", {
  // ... existing columns
  newField: text("new_field").default("default_value"), // Has default = safe
});

// 2. Push
// $ bun run db:push
```

### Replacing Text with FK (Multi-Phase)

**Phase 1: Add FK alongside old field**
```typescript
// OLD: source: text("source")
// NEW (keep both during transition):
source: text("source"), // TODO: Remove after Phase 2
sourceId: integer("source_id").references(() => leadSources.id),
```

**Phase 2: Backfill data**
```sql
UPDATE leads
SET source_id = (SELECT id FROM lead_sources WHERE name = leads.source)
WHERE source_id IS NULL;
```

**Phase 3: Remove old field**
```typescript
// Remove: source: text("source")
// Keep: sourceId: integer("source_id").notNull()
```

## Commands

```bash
# Push schema to database
bun run db:push

# Generate TypeScript types (CRITICAL after schema changes)
bun run db:generate

# Seed database
bun run db:seed

# Reset and reseed
bun run db:reset
```

## Rollback Pattern

If migration breaks something:

```bash
# Option 1: Revert schema.ts and push again
git checkout db/schema.ts
bun run db:push

# Option 2: Manual SQL fix
psql $DATABASE_URL -c "ALTER TABLE leads DROP COLUMN bad_column"
```

## Checklist

- [ ] Schema edited in db/schema.ts
- [ ] New columns have defaults (if table has data)
- [ ] `bun run db:push` succeeded
- [ ] `bun run db:generate` run (types updated)
- [ ] App still starts (`bun run dev`)
- [ ] Existing data preserved
- [ ] Schema change committed
