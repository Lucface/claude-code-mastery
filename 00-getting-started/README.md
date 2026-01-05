# Module 0: Getting Started

*Time: 30 minutes*

## Prerequisites

- macOS, Linux, or Windows with WSL
- Node.js 18+ (or Bun - recommended)
- A terminal you're comfortable with
- An Anthropic account

## Installation

### Option 1: NPM (Standard)
```bash
npm install -g @anthropic-ai/claude-code
```

### Option 2: Bun (Recommended - 10x faster)
```bash
bun install -g @anthropic-ai/claude-code
```

## First Launch

```bash
# Navigate to any project
cd ~/my-project

# Launch Claude Code
claude

# Or with a specific question
claude "What does this project do?"
```

## Authentication

On first run, Claude Code will:
1. Open your browser for Anthropic login
2. Create `~/.claude/` directory for configuration
3. Store your credentials securely

## Your First Session

### 1. Explore the Codebase
```
> What is this project? Give me a high-level overview.
```

### 2. Make a Small Change
```
> Add a comment explaining what the main function does
```

### 3. Use Plan Mode
Press `Shift+Tab` twice, then:
```
> Plan how we would add a new feature to [describe feature]
```

## Interface Overview

| Key | Action |
|-----|--------|
| `Enter` | Send message |
| `Shift+Tab` (x2) | Toggle Plan mode |
| `Esc` | Cancel current operation |
| `Esc Esc` | Rewind to previous state |
| `/` | Slash commands |
| `Ctrl+C` | Exit |

## What's Next?

Once you're comfortable with basic interaction:
1. Read the [Core Concepts](../01-core-concepts/README.md) module
2. Start customizing with [Configuration](../02-configuration/README.md)
3. Learn [Workflows](../03-workflows/README.md) for daily use

## Checkpoint

Before moving on, you should be able to:
- [ ] Launch Claude Code in any project
- [ ] Have a basic conversation about code
- [ ] Use Plan mode for complex questions
- [ ] Exit and restart sessions

---

*Next: [Module 1: Core Concepts](../01-core-concepts/README.md)*
