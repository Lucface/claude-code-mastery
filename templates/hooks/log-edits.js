#!/usr/bin/env node

/**
 * Log Edits Hook
 *
 * Logs all file modifications made during a session.
 * Useful for auditing changes and creating session summaries.
 *
 * Usage:
 * Add to .claude/settings.json:
 * {
 *   "hooks": {
 *     "PostToolUse": [{ "command": "node .claude/hooks/log-edits.js" }]
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');

// Read input from stdin
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);

    // Only log Edit and Write operations
    if (data.tool_name === 'Edit' || data.tool_name === 'Write') {
      const logDir = path.join(process.cwd(), '.claude-logs');
      const logFile = path.join(logDir, `edits-${new Date().toISOString().split('T')[0]}.log`);

      // Ensure log directory exists
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logEntry = {
        timestamp: new Date().toISOString(),
        tool: data.tool_name,
        file: data.tool_input?.file_path || 'unknown',
        success: data.tool_output?.success ?? true
      };

      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    }

    // Always allow the operation to proceed
    console.log(JSON.stringify({ decision: "allow" }));
  } catch (e) {
    // On error, allow and continue
    console.log(JSON.stringify({ decision: "allow" }));
  }
});
