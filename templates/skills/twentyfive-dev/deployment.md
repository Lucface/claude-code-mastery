# TwentyFive Deployment Guide

**Last Updated:** 2025-12-31

Complete deployment workflow for TwentyFive CRM.

---

## Quick Reference

```bash
# Local development
bun dev                 # Start dev server (port 5001)

# Build
bun build               # Production build

# Type check
bun check               # TypeScript validation

# Full pre-deploy check
bun build && bun check && bun test:run
```

---

## Deployment Checklist

### Before Deploy

- [ ] All tests passing (`bun test:run`)
- [ ] TypeScript clean (`bun check`)
- [ ] Build succeeds (`bun build`)
- [ ] No console.log statements in production code
- [ ] Environment variables documented
- [ ] Database migrations applied (if any)
- [ ] Changelog updated

### Deploy Steps

1. **Ensure clean build:**
   ```bash
   bun build
   ```

2. **Run type checks:**
   ```bash
   bun check
   ```

3. **Run tests:**
   ```bash
   bun test:run
   ```

4. **Push to main:**
   ```bash
   git push origin main
   ```

5. **Verify deployment:**
   - Check production URL
   - Test critical paths (login, lead creation, deal flow)
   - Verify API endpoints respond

---

## Environment Variables

### Required for Production

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection | `postgresql://...` |
| `SESSION_SECRET` | Express session encryption | Random 32+ char string |
| `NODE_ENV` | Environment mode | `production` |

### Optional

| Variable | Purpose | Default |
|----------|---------|---------|
| `PORT` | Server port | `5001` |
| `OPENAI_API_KEY` | AI features | None (features disabled) |

### Setting Environment Variables

```bash
# Replit (via Secrets tab)
# Or local .env file (never commit!)

# Verify variables are set
echo $DATABASE_URL
echo $SESSION_SECRET
```

---

## Build Process

### What `bun build` Does

1. **Vite builds client:**
   - Bundles React app
   - Tree-shakes unused code
   - Outputs to `dist/public/`

2. **esbuild bundles server:**
   - Compiles TypeScript
   - Bundles Express server
   - Outputs to `dist/index.js`

### Build Output Structure

```
dist/
├── index.js          # Server bundle
└── public/           # Client assets
    ├── index.html
    ├── assets/
    │   ├── index-[hash].js
    │   └── index-[hash].css
    └── ...
```

---

## Common Issues

### Build Fails with Type Errors

```bash
# Find and fix type errors
bun check

# Common fixes:
# - Add missing type annotations
# - Fix any -> proper types
# - Update schema types after DB changes
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Common fixes:
# - Check DATABASE_URL is set correctly
# - Verify Neon project is active
# - Check connection pooling settings
```

### Port Already in Use

```bash
# Find process using port
lsof -i :5001

# Kill process
kill -9 <PID>

# Or use different port
PORT=5002 bun dev
```

### Migrations Out of Sync

```bash
# Push schema changes
bun db:push

# Regenerate types
bun db:generate

# If stuck, reset (destructive!)
bun db:reset
```

---

## Rollback Procedure

If deployment fails:

1. **Identify the issue:**
   ```bash
   # Check recent commits
   git log --oneline -5
   ```

2. **Revert to last known good:**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **If database issue:**
   ```bash
   # Restore from backup
   psql $DATABASE_URL < backup.sql
   ```

---

## Monitoring

### Health Checks

```bash
# API health
curl https://your-app.com/api/health

# Should return:
# { "status": "ok", "database": "connected" }
```

### Logs

```bash
# Replit: View in Console tab
# Local: Check terminal output
# Production: Check hosting provider logs
```

---

## Performance Optimization

### Before Launch

1. **Enable compression:**
   - Already handled by Express compression middleware

2. **Optimize images:**
   - Use WebP format
   - Lazy load below-fold images

3. **Database indexes:**
   - Verify indexes on frequently queried columns
   - Add indexes for slow queries

### Monitoring Performance

- Use browser DevTools Network tab
- Check API response times
- Monitor database query times

---

## Security Checklist

- [ ] HTTPS enabled (automatic on Replit)
- [ ] SESSION_SECRET is unique and secret
- [ ] No secrets in git history
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured
- [ ] CORS properly configured

---

## Related Docs

- [testing-guide.md](./testing-guide.md) - Run tests before deploy
- [database-ops.md](./database-ops.md) - Migration procedures
- [architecture.md](./architecture.md) - System overview
