---
description: Quick sanity check - is everything working? (30 seconds)
---

Fast health check - verify all systems are operational.

**Time:** ~30 seconds

Run these checks IN PARALLEL and show results as a status board:

## 1. App Status
```bash
# Check if dev server is running
lsof -ti:5000 -ti:5001 -ti:3000 2>/dev/null && echo "✅ Dev server running" || echo "⚠️ Dev server not running"
```

## 2. Database Connection
```bash
cd ~/Developer/clients/twentyfive && export $(grep -v '^#' .env | xargs) 2>/dev/null && node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT 1\`.then(() => console.log('✅ Database connected')).catch(e => console.log('❌ Database error:', e.message));
" 2>/dev/null || echo "❌ Database check failed"
```

## 3. Environment Variables
```bash
# Run env-guardian to check for missing keys
~/.claude/scripts/env-guardian.sh validate . 2>/dev/null
```
Also verify these critical keys are set (don't show values):
- `ANTHROPIC_API_KEY` - AI features
- `STRIPE_SECRET_KEY` - Payments
- `DATABASE_URL` - Database
- `SESSION_SECRET` - Auth
- `MAILS_SO_API_KEY` - Email validation

## 4. Git Status
```bash
cd ~/Developer/clients/twentyfive && git status --porcelain | wc -l | xargs -I {} echo "📁 {} uncommitted changes"
cd ~/Developer/clients/twentyfive && git log -1 --format="📝 Last commit: %h (%ar)"
```

## 5. Test Tools Available
```bash
cd ~/Developer/clients/twentyfive
[ -f node_modules/.bin/vitest ] && echo "✅ Vitest installed" || echo "❌ Vitest missing"
[ -f node_modules/.bin/playwright ] && echo "✅ Playwright installed" || echo "❌ Playwright missing"
[ -f node_modules/.bin/storybook ] && echo "✅ Storybook installed" || echo "❌ Storybook missing"
```

## 6. TypeScript
```bash
cd ~/Developer/clients/twentyfive && bun tsc --noEmit 2>&1 | tail -1 | grep -q "error" && echo "❌ TypeScript errors" || echo "✅ TypeScript clean"
```

---

**Output Format:**
```
┌─────────────────────────────────────┐
│          QUICK HEALTH CHECK         │
├─────────────────────────────────────┤
│ App Server:     ✅ Running (5001)   │
│ Database:       ✅ Connected        │
│ API Keys:       ✅ 4/4 configured   │
│ Git:            📁 3 uncommitted    │
│ TypeScript:     ✅ Clean            │
│ Test Tools:     ✅ All installed    │
├─────────────────────────────────────┤
│ Status: HEALTHY                     │
└─────────────────────────────────────┘
```

If any issues found, list them with recommended fixes.

**IMPORTANT:** Always use `bun` commands, never npm/pnpm. If server not running, suggest `bun run dev`.

**For full diagnostics:** Use `/health-full` (runs tests, fetches errors, 2-5 min)
