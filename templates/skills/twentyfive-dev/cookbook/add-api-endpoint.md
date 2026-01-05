# Add API Endpoint

Step-by-step guide for adding a new API endpoint to TwentyFive.

## Pattern: RESTful CRUD Endpoint

### 1. Define Zod Schema (shared/schema.ts)

```typescript
// At the appropriate section in shared/schema.ts
export const insertNewEntitySchema = createInsertSchema(newEntity).pick({
  name: true,
  // other fields...
});

export type InsertNewEntity = z.infer<typeof insertNewEntitySchema>;
export type NewEntity = typeof newEntity.$inferSelect;
```

### 2. Add Route Handler (server/routes.ts)

```typescript
// GET - List all
app.get('/api/new-entity', async (req, res) => {
  try {
    const entities = await db.select().from(newEntity);
    res.json(entities);
  } catch (error) {
    console.error('Error fetching entities:', error);
    res.status(500).json({ error: 'Failed to fetch entities' });
  }
});

// POST - Create
app.post('/api/new-entity', async (req, res) => {
  try {
    const validated = insertNewEntitySchema.parse(req.body);
    const [created] = await db.insert(newEntity).values(validated).returning();
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create entity' });
    }
  }
});

// PATCH - Update
app.patch('/api/new-entity/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(newEntity)
      .set(req.body)
      .where(eq(newEntity.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update entity' });
  }
});

// DELETE
app.delete('/api/new-entity/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [deleted] = await db
      .delete(newEntity)
      .where(eq(newEntity.id, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete entity' });
  }
});
```

### 3. Add Frontend Hook (client/src/hooks/)

```typescript
// client/src/hooks/use-new-entity.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NewEntity, InsertNewEntity } from '@shared/schema';

const API = '/api/new-entity';

export function useNewEntities() {
  return useQuery<NewEntity[]>({
    queryKey: ['new-entity'],
    queryFn: async () => {
      const res = await fetch(API);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });
}

export function useCreateNewEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertNewEntity) => {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-entity'] });
    },
  });
}
```

## Checklist

- [ ] Schema defined in shared/schema.ts
- [ ] Routes added to server/routes.ts
- [ ] Frontend hook created
- [ ] Test manually: `curl http://localhost:5001/api/new-entity`
- [ ] Add to API documentation if public
