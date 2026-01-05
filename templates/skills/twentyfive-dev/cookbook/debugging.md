# Debugging Guide

Common issues and fixes for TwentyFive.

## Quick Fixes

### Port Already in Use

```bash
lsof -ti:5001 | xargs kill -9
bun run dev
```

### Database Connection Failed

```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# If Neon, check it's not sleeping
# Visit Neon dashboard or make any query to wake it
```

### TypeScript Errors After Schema Change

```bash
bun run db:generate
# Regenerates types from schema.ts
```

### Tests Failing Unexpectedly

```bash
# Clear cache
bun run test:run -- --clearCache

# Run single test with verbose output
bun test tests/unit/specific.test.ts -- --verbose

# Check for leftover test data
psql $DATABASE_URL -c "SELECT * FROM test_data LIMIT 5"
```

### React Component Not Updating

```typescript
// Check if TanStack Query needs invalidation
queryClient.invalidateQueries({ queryKey: ['your-key'] });

// Check if state is stale
console.log('Current state:', state);
```

### API Returns 500

```bash
# Check server logs
# Look for the error in terminal running bun run dev

# Test endpoint directly
curl -v http://localhost:5001/api/your-endpoint
```

## Debug Tools

### Database Inspection

```bash
# Connect to PostgreSQL
psql $DATABASE_URL

# Common queries
\dt                     # List tables
\d leads                # Describe table
SELECT * FROM leads LIMIT 5;
```

### Network Requests

```javascript
// In browser console
// Check what API is returning
fetch('/api/leads').then(r => r.json()).then(console.log)
```

### Server Logs

```typescript
// Add temporary logging
console.log('Debug:', JSON.stringify(data, null, 2));
```

## Error Patterns

| Error | Cause | Fix |
|-------|-------|-----|
| `EADDRINUSE` | Port in use | Kill process on port |
| `relation does not exist` | Table missing | `bun run db:push` |
| `column does not exist` | Schema out of sync | `bun run db:push` |
| `invalid input syntax` | Type mismatch | Check Zod schema |
| `cannot read properties of undefined` | Null data | Add null check |

## When All Else Fails

```bash
# Nuclear option: fresh start
bun run db:reset     # Drops and recreates
bun run db:seed      # Seeds sample data
bun run dev          # Start fresh
```
