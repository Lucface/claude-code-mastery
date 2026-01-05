# Module 1: Core Concepts

*Time: 2 hours*

## How Claude Code Thinks

Claude Code is not a chatbot with file access. It's an **agentic coding assistant** that:

1. **Reads your codebase** to understand context
2. **Plans multi-step solutions** before executing
3. **Uses tools** (file editing, terminal, web search) autonomously
4. **Verifies its work** through tests and feedback loops

### The Context Window

Claude Code maintains a conversation with:
- Your messages
- File contents it has read
- Tool outputs (terminal results, search results)
- CLAUDE.md instructions (always loaded)

> "The context window is finite. Be strategic about what you load." — Boris Cherny

### Tools Available

| Tool | Purpose |
|------|---------|
| Read | Read file contents |
| Write | Create new files |
| Edit | Modify existing files |
| Bash | Run terminal commands |
| Glob | Find files by pattern |
| Grep | Search file contents |
| WebSearch | Search the web |
| WebFetch | Fetch web pages |
| Task | Spawn subagents |

## Plan Mode vs Execution Mode

### Execution Mode (Default)
- Claude reads, thinks, and acts immediately
- Good for: Simple tasks, quick fixes, exploration

### Plan Mode (Shift+Tab twice)
- Claude creates a detailed plan before acting
- You approve before execution begins
- Good for: Complex features, multi-file changes, unfamiliar code

> "Start most sessions in Plan mode. It yields 2-3x better results." — Boris Cherny

## Thinking Intensifiers

The words you use affect how deeply Claude thinks:

| Phrase | Effect |
|--------|--------|
| (none) | Standard reasoning |
| "think" | Extended reasoning |
| "think hard" | Deep analysis |
| "think harder" | Very deep analysis |
| "ultrathink" | Maximum depth, consider all angles |

### Example
```
# Quick fix
> Fix the typo in the README

# Complex architecture
> ultrathink: Design a caching layer for our API that handles
> invalidation, supports multiple backends, and doesn't break
> existing code
```

## When to Vibe Code vs Be Precise

### Vibe Coding Works For:
- Prototypes and throwaway code
- Exploring ideas quickly
- Non-critical path code
- Learning how something works

### Be Precise For:
- Production code
- Data model changes
- Security-sensitive code
- Core business logic

> "Vibe coding works well for throwaway code and prototypes. You want maintainable code sometimes. You want to be very thoughtful about every line sometimes." — Boris Cherny

## The Throwaway Development Pattern

Boris's recommended workflow for complex features:

1. **Prototype First**: Let Claude build a quick version
2. **Learn From It**: Understand what works and what doesn't
3. **Escape Twice**: Rewind (`Esc Esc`) to before the prototype
4. **Build Properly**: Now implement with full understanding

This is faster than trying to get it perfect the first time.

## Verification Loops

Never trust code without verification:

### 1. Tests
```
> Write tests for this feature, then implement it
```

### 2. Visual Verification (Chrome Extension)
For UI work, Claude can take screenshots and verify rendering.

### 3. Subagent Review
```
> /code-review
```
Spawns 5 parallel reviewers to analyze your changes.

## The Mental Model Shift

From Boris's advice to Andrej Karpathy:

> "Newer coworkers and even new grads that don't make all sorts of assumptions about what the model can and can't do—legacy memories formed when using old models—are able to use the model most effectively."

**Key insight**: Constantly re-adjust your expectations. What Claude couldn't do last month, it might nail today.

## Exercises

### Exercise 1: Plan Mode Practice
1. Open a project you're working on
2. Enter Plan mode (Shift+Tab twice)
3. Ask Claude to plan a new feature
4. Review the plan before approving

### Exercise 2: Thinking Intensifiers
Try the same complex question with:
- No intensifier
- "think hard"
- "ultrathink"

Compare the depth of responses.

### Exercise 3: Throwaway Development
1. Ask Claude to prototype a feature quickly
2. Note what works and what doesn't
3. Use `Esc Esc` to rewind
4. Ask Claude to build it properly with your learnings

## Checkpoint

Before moving on, you should understand:
- [ ] The difference between Plan mode and Execution mode
- [ ] When to use thinking intensifiers
- [ ] The throwaway development pattern
- [ ] Why verification loops matter
- [ ] How to adjust your mental model as Claude improves

---

*Next: [Module 2: Configuration](../02-configuration/README.md)*
