---
description: Save current session state + update changelogs
---

Save the current session state for later restoration AND update project changelogs.

IMPORTANT: Do NOT ask the user for confirmation or description. Automatically generate a description from context and proceed immediately.

Steps:
1. Analyze the recent conversation to understand:
   - Current working directory
   - What project/task we're working on
   - Files that were created/modified
   - What was accomplished
   - What's next/remaining tasks
   - Key decisions or context

2. Automatically generate a concise description (5-10 words) based on the main accomplishment:
   - Example: "Server crash fix and auto-restart system"
   - Example: "LTV analytics bug fix and UX improvements"
   - Example: "Dashboard card customization feature"
   - DO NOT ask user - just pick the best description from context

3. Create filename: `YYYY-MM-DD_HHMM_description.md` (lowercase, hyphens for spaces)

4. Save to `~/.claude/states/` with this format:
   ```markdown
   # Session: [Description]

   **Saved:** YYYY-MM-DD HH:MM
   **Directory:** /full/path/to/working/directory

   ## What We Were Doing
   [Brief summary of the task/project]

   ## Progress Made
   - [What was accomplished]
   - [Files created/modified]

   ## Next Steps
   - [ ] [What's left to do]
   - [ ] [Follow-up tasks]

   ## Key Context
   [Important decisions, approaches, or context needed to continue]

   ## Files Modified
   - path/to/file1
   - path/to/file2

   ## Browser Context
   [This section is auto-generated - see step 4b]
   ```

4b. **Capture browser context** (Phase 6 - Tab Intelligence):
   ```bash
   cd ~/.claude/scripts && python3 -c "from tab_intel.capture import format_browser_context_for_session; print(format_browser_context_for_session('PROJECT_NAME'))"
   ```
   - Replace `PROJECT_NAME` with the current project (e.g., 'twentyfive')
   - Replace the `## Browser Context` placeholder with the output
   - Shows: capture timestamp, project tabs, key references, top domains
   - Alerts if stale tabs detected (recommend `/tabs-audit`)
   - If browser not running, shows "*Browser context unavailable*"

5. Update BOTH changelogs (dual-write):

   a. **Project-Specific Changelog:** `~/Developer/{category}/{project}/docs/changelogs/{project}-changelog.md`
      - Determine project name from git repo or working directory
      - Create entry with format:
        ```markdown
        ## YYYY-MM-DD HH:MM - [Feature/Change Description]

        **Session:** [session-description-from-step-2]

        ### What Changed
        [Summary of what was done]

        ### Features Added / Files Modified
        [Key changes and files]

        ### Impact
        [Why this matters]

        ---
        ```

   b. **Master Timeline (PERMANENT - NEVER DELETE OR MOVE):** `~/Documents/claude-projects-changelogs/ALL-PROJECTS-MASTER.md`
      - Same entry but prefixed with `[ProjectName]` in the title
      - Format: `## YYYY-MM-DD HH:MM - [ProjectName] Description`
      - Insert in chronological order (newest first, after the header)

6. Backup .env (protect API keys):
   ```bash
   ~/.claude/scripts/env-guardian.sh backup . 2>/dev/null
   ```
   This creates a timestamped backup of the .env file to prevent key loss.

7. Confirm all operations:
   - "State saved to ~/.claude/states/[filename]"
   - "Updated ~/Developer/{category}/{project}/docs/changelogs/{project}-changelog.md"
   - "Updated ~/Documents/claude-projects-changelogs/ALL-PROJECTS-MASTER.md"
   - ".env backed up" (if in a project with .env)
