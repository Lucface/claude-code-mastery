---
description: Create new worktree (parallel development branch)
---

# Create New Worktree

Create a git worktree for parallel development. This lets you work on multiple features simultaneously without conflicts.

## What to do:

1. Ask for a short name for this work (e.g., "analytics", "bugfix-login", "cicd")
2. Create the worktree:

```bash
cd $PROJECT_ROOT
git fetch origin
WORKTREE_NAME="$PROJECT_NAME-$SHORT_NAME"
git worktree add "../$WORKTREE_NAME" -b "feature/$SHORT_NAME"
```

3. Create lockfile in new worktree to mark active session:

```bash
cat > "../$WORKTREE_NAME/.claude-session-active" << EOF
session_id: $(date +%s)
branch: feature/$SHORT_NAME
started: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
worktree: $WORKTREE_NAME
EOF
```

4. Confirm creation and tell user:
   - New folder location
   - Branch name
   - Remind them to `cd` to new folder or open new terminal there

## Example output:
"Created worktree at ~/Developer/personal/twentyfive-analytics on branch feature/analytics. Open a new Claude Code session in that folder to work independently."
