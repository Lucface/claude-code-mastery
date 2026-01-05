# Hook Templates

Hooks are shell commands or scripts that run at specific points in Claude Code's lifecycle.

## The 8 Hook Types

| Hook | When It Runs | Common Use |
|------|--------------|------------|
| `PreToolUse` | Before any tool | Validate inputs, add context |
| `PostToolUse` | After any tool | Log actions, verify outputs |
| `PermissionRequest` | When permission needed | Auto-approve known patterns |
| `PreCompact` | Before context compaction | Preserve important info |
| `SessionStart` | When session begins | Load project context |
| `Stop` | When Claude wants to stop | Force continued operation |
| `SubagentStop` | When subagent wants to stop | Control subagent behavior |
| `UserPromptSubmit` | When you send a message | Pre-process input |

## Configuration

Add hooks to `.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "command": "node .claude/hooks/stop-guard.js",
        "timeout": 5000
      }
    ],
    "PostToolUse": [
      {
        "command": "node .claude/hooks/log-edits.js",
        "timeout": 3000
      }
    ]
  }
}
```

## Hook Input/Output

Hooks receive JSON input via stdin and should output JSON to stdout.

### Input Format
```json
{
  "hook_type": "Stop",
  "session_id": "abc123",
  "tool_name": "Edit",  // for tool-related hooks
  "tool_input": { ... }  // for PreToolUse
}
```

### Output Format
```json
{
  "decision": "allow",  // or "block"
  "reason": "Optional explanation"
}
```

## Template Files

- `stop-guard.js` - The Ralph Wiggum pattern (keep working)
- `log-edits.js` - Log all file modifications
- `validate-edit.js` - Prevent edits to protected files
- `session-context.js` - Load context on session start

## Usage Tips

1. **Keep hooks fast** - They run synchronously and block Claude
2. **Use timeouts** - Prevent hung hooks from blocking forever
3. **Log judiciously** - Too much logging clutters output
4. **Test thoroughly** - Buggy hooks can break your workflow
