#!/usr/bin/env node

/**
 * Stop Guard Hook (The Ralph Wiggum Pattern)
 *
 * Prevents Claude from stopping prematurely on long tasks.
 * Named after Boris Cherny's example - Claude keeps going until truly done.
 *
 * Usage:
 * 1. Add to .claude/settings.json:
 *    {
 *      "hooks": {
 *        "Stop": [{ "command": "node .claude/hooks/stop-guard.js" }]
 *      }
 *    }
 *
 * When to use:
 * - Long refactoring sessions
 * - Multi-file changes
 * - Tasks with many steps
 *
 * When NOT to use:
 * - Quick fixes
 * - Exploratory questions
 * - When you want checkpoints
 */

const output = {
  decision: "block",
  reason: "Continue working. Only stop when the task is truly complete. If you believe you're done, say 'DONE' explicitly."
};

console.log(JSON.stringify(output));
