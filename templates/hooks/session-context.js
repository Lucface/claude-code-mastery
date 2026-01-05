#!/usr/bin/env node

/**
 * Session Context Hook
 *
 * Loads project context when a session starts.
 * Outputs context that Claude will see at the beginning of the session.
 *
 * Usage:
 * Add to .claude/settings.json:
 * {
 *   "hooks": {
 *     "SessionStart": [{ "command": "node .claude/hooks/session-context.js" }]
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getContext() {
  const context = [];

  // Git status
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const status = execSync('git status --short', { encoding: 'utf8' }).trim();
    const behind = execSync('git rev-list HEAD..origin/main --count 2>/dev/null || echo 0', { encoding: 'utf8' }).trim();

    context.push(`## Git Status`);
    context.push(`Branch: ${branch}`);
    if (behind > 0) {
      context.push(`Warning: ${behind} commits behind origin/main`);
    }
    if (status) {
      context.push(`Changes:\n${status}`);
    }
  } catch (e) {
    // Not a git repo, skip
  }

  // Check for session state
  const stateDir = path.join(process.cwd(), '.claude-sessions');
  if (fs.existsSync(stateDir)) {
    const states = fs.readdirSync(stateDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse();

    if (states.length > 0) {
      context.push(`\n## Previous Session`);
      context.push(`Found ${states.length} session state(s). Latest: ${states[0]}`);
      context.push(`Use "/load ${states[0]}" to restore.`);
    }
  }

  // Check for TODO items
  try {
    const todoCount = execSync('grep -r "TODO" --include="*.ts" --include="*.js" -l . 2>/dev/null | wc -l', { encoding: 'utf8' }).trim();
    if (parseInt(todoCount) > 0) {
      context.push(`\n## TODOs`);
      context.push(`Found TODO comments in ${todoCount} file(s).`);
    }
  } catch (e) {
    // Grep failed, skip
  }

  return context.join('\n');
}

// Output context for Claude to see
const context = getContext();
if (context) {
  console.log(JSON.stringify({
    decision: "allow",
    context: context
  }));
} else {
  console.log(JSON.stringify({ decision: "allow" }));
}
