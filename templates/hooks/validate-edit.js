#!/usr/bin/env node

/**
 * Validate Edit Hook
 *
 * Prevents edits to protected files like:
 * - .env files (credentials)
 * - Lock files (package-lock.json, yarn.lock)
 * - Generated files
 *
 * Usage:
 * Add to .claude/settings.json:
 * {
 *   "hooks": {
 *     "PreToolUse": [{ "command": "node .claude/hooks/validate-edit.js" }]
 *   }
 * }
 */

// Protected patterns - customize for your project
const PROTECTED_PATTERNS = [
  /\.env$/,
  /\.env\..+$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /bun\.lockb$/,
  /\.git\//,
  /node_modules\//,
  /dist\//,
  /build\//,
  /\.generated\./,
];

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);

    // Only check Edit and Write operations
    if (data.tool_name !== 'Edit' && data.tool_name !== 'Write') {
      console.log(JSON.stringify({ decision: "allow" }));
      return;
    }

    const filePath = data.tool_input?.file_path || '';

    // Check against protected patterns
    for (const pattern of PROTECTED_PATTERNS) {
      if (pattern.test(filePath)) {
        console.log(JSON.stringify({
          decision: "block",
          reason: `Cannot edit protected file: ${filePath}. This file matches pattern: ${pattern}`
        }));
        return;
      }
    }

    // Allow the edit
    console.log(JSON.stringify({ decision: "allow" }));
  } catch (e) {
    // On parse error, allow and continue
    console.log(JSON.stringify({ decision: "allow" }));
  }
});
