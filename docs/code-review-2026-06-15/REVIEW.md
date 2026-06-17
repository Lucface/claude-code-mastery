# Code Review — claude-code-mastery

**Repo:** claude-code-mastery (tier 3)
**Date:** 2026-06-16
**Status:** Findings surfaced by automated review — NOT yet adversarially verified.

## Summary

| Severity | Count |
|----------|-------|
| High     | 16    |
| Medium   | 25    |
| Low      | 23    |
| **Total**| **64**|

---

## High

**Type coercion bug: string compared to number without conversion**
`templates/hooks/session-context.js:33`
The variable `behind` is a trimmed string from execSync, but it's compared directly to the number 0 using `>`. JavaScript will coerce the string to a number, but if `behind` is NaN (from malformed command output), the comparison fails silently. This also doesn't match the parseInt pattern used on line 61 for `todoCount`.
*Fix:* Convert `behind` to an integer explicitly before comparison: `if (parseInt(behind, 10) > 0)` to match the todoCount pattern and prevent type confusion.

**Inconsistent error handling between identical command patterns**
`templates/hooks/session-context.js:60`
The grep command on line 60 uses the same pattern as the git command on line 29 (both check error output with `2>/dev/null`), but the grep is wrapped in try-catch on line 59 while the git command catches exceptions at a higher level. If grep output is malformed, `parseInt(todoCount)` could receive a non-numeric value. The code doesn't validate that todoCount contains only digits.
*Fix:* Add validation after parseInt: `const count = parseInt(todoCount, 10); if (!isNaN(count) && count > 0)` instead of `if (parseInt(todoCount) > 0)`.

**Command Injection in session-context.js via unsafe grep execution**
`templates/hooks/session-context.js:60`
The hook uses `execSync()` to run a grep command without proper escaping. While the command uses hardcoded include patterns, an attacker could exploit this if the working directory contains malicious filenames with backticks or special characters that break out of the grep context and execute arbitrary shell code.
*Fix:* Use `child_process.spawnSync()` instead of `execSync()` to avoid shell interpretation, or use Node.js fs APIs to search for TODO comments directly rather than shelling out to grep (e.g., `fs.readdirSync()` plus file content parsing).

**Insufficient input validation in log-edits.js — arbitrary log file path creation**
`templates/hooks/log-edits.js:30-31`
The log file path is constructed from `data.tool_input?.file_path` (stdin) but is not validated for path traversal. Although logging happens in `.claude-logs/`, if `file_path` contains directory traversal sequences (e.g., `../../sensitive`), it could write logs outside the intended directory or expose file edit operation info.
*Fix:* Sanitize `file_path` by removing traversal sequences and validating it's a safe filename. Use `path.basename()` to extract only the filename, or hash the file path instead of using the path itself.

**Missing type safety in hook file JSON parsing — unsafe data access patterns**
`templates/hooks/validate-edit.js:46`
JSON parsed from stdin is treated as untyped data. The pattern `data.tool_input?.file_path || ''` creates an implicit fallback to string without verifying structure. If the input schema changes or is malformed, this could silently default to empty string and allow unintended file edits.
*Fix:* Add explicit type guards: `const filePath = (data?.tool_input?.file_path && typeof data.tool_input.file_path === 'string') ? data.tool_input.file_path : '';` or use Zod to validate the parsed JSON before use.

**Missing type safety in hook file JSON parsing — unsafe input to regex test**
`templates/hooks/validate-edit.js:50`
The `filePath` variable is passed to `pattern.test(filePath)` without guaranteed string type. Although it defaults to empty string, if the fallback logic fails or upstream data is unexpected, this could pass a non-string to `regex.test()` which coerces and may behave unexpectedly.
*Fix:* Assert the type before use: `if (typeof filePath !== 'string') throw new Error('Invalid filePath');` or use a type guard helper.

**Multiple blocking synchronous file system and process operations in SessionStart hook**
`templates/hooks/session-context.js:27-29, 60`
Lines 27-29 execute three sequential git commands (`execSync`) blocking the main thread. Line 60 runs a recursive grep across the entire project directory with no depth limit or exclusions, which can be very slow on large codebases.
*Fix:* Use async I/O, or at minimum: (1) parallelize git commands; (2) add a depth limit and aggressive exclusions to grep (`--exclude-dir=node_modules,dist,.git`); (3) cache results to avoid re-scanning every session start; or (4) move TODO scanning to a background task.

**Synchronous I/O blocks on every file edit in PostToolUse hook**
`templates/hooks/log-edits.js:45`
`appendFileSync` is called synchronously on the main thread for every Edit/Write, blocking the Claude Code harness until the write completes. On a slow or network filesystem, this causes noticeable latency.
*Fix:* Use async `fs.appendFile()` with a callback/promise, or batch appends in memory and flush periodically. This hook blocks user-facing operations and should not use sync I/O.

**Unhandled synchronous file system errors in log-edits hook**
`templates/hooks/log-edits.js:45`
The `fs.appendFileSync()` call has no error handling. If the log file becomes inaccessible/corrupted or the filesystem is full, the hook process crashes silently. The directory creation on line 35 also lacks retry logic for race conditions with parallel hooks.
*Fix:* Wrap `fs.appendFileSync()` in try-catch within the logging branch. Add backoff retry for `mkdirSync()`. Example: `try { fs.appendFileSync(...) } catch (err) { console.error('Failed to log edit:', err); }`.

**No timeout handling for long-running execSync calls**
`templates/hooks/session-context.js:27-29, 60`
The `execSync()` calls for git ops and grep recursion have no timeout. On large repos or slow systems, these can hang indefinitely, blocking session start. The grep at line 60 can block for minutes searching all `.ts`/`.js` files.
*Fix:* Add `{ encoding: 'utf8', timeout: 5000 }` to all `execSync` calls. For the expensive grep, add file exclusions or limit recursion depth.

**Silent error swallowing masks critical failures in session-context hook**
`templates/hooks/session-context.js:39, 65`
Both catch blocks silently ignore all errors from git and grep. If a git command fails due to a corrupted repo or permission issues, the hook continues silently with no indication. This masks data-integrity issues that should be surfaced.
*Fix:* Log errors to stderr before returning context: `catch (e) { console.error('Warning: git command failed:', e.message); }`. Users see warnings without breaking the session.

**Session Context Hook: Unhandled child process errors in shell commands**
`templates/hooks/session-context.js`
The hook uses `execSync()` without proper error handling for git commands. The try-catch at 39-40 only wraps the first git command, leaving subsequent commands (line 29) vulnerable to unhandled exceptions. Line 60's grep try-catch is too broad — any grep failure silently continues with no visibility into the problem.
*Fix:* Wrap each `execSync()` call with individual error handling. Lines 25-30 should have separate try-catch blocks per git command. Line 60's grep should check the exit code explicitly or log to stderr. Example: `const branch = await safeExec('git branch --show-current')`.

**Validate Edit Hook: Regex pattern object printed in error message**
`templates/hooks/validate-edit.js`
At line 50-55, the block error message includes the pattern object directly via `${pattern}`. This converts the regex to a cryptic string like `/\.env$/`. Users see a confusing message ("This file matches pattern: /\.env$/") instead of a human-readable explanation.
*Fix:* Add descriptive labels per pattern. Create a `PROTECTED_PATTERNS_LABELS` map (e.g., `{ '\\.env$': 'Environment files', 'package-lock\\.json$': 'Lock files' }`) and use `labels[pattern.source]` in the error message.

**Log Edits Hook: Unsafe string concatenation into JSON without validation**
`templates/hooks/log-edits.js`
At lines 38-43, the `logEntry` object contains untrusted fields (`tool_input.file_path`, `tool_output.success`). More importantly, line 42's `?? true` default masks missing success fields — any failure with a missing `success` field is logged as `success=true`, hiding real errors.
*Fix:* Line 42 should explicitly check for false: `success: data.tool_output?.success !== false`, or log an `'unknown'` status when `success` is missing rather than defaulting to true. (`JSON.stringify` already handles string escaping safely.)

**Overly broad exception handling silently masks errors in session-context.js**
`templates/hooks/session-context.js:26-41, 59-67`
Two try-catch blocks catch all exceptions with generic comments (`// Not a git repo, skip`, `// Grep failed, skip`). This masks unexpected errors (permission denied, out of disk, command not found). Grep failure could be due to many issues besides not being a repo, but all are equally hidden.
*Fix:* Either (1) check specific error codes/messages before catching, or (2) log suppressed errors to stderr with details. Example: `console.error('Warning: git status failed:', e.message);`.

**'bun db:push --force' Documentation Lacks Data Loss Warning**
`templates/skills/twentyfive-dev/database-ops.md:324-328`
The troubleshooting section mentions `bun db:push --force (may lose data!)` but gives zero guidance on when/why to use it, what data is at risk, or how to recover. A developer hitting schema drift might blindly run `--force` and lose production data.
*Fix:* Expand the Schema Drift section with: (1) exact scenarios when `--force` is needed (enum additions, constraint changes); (2) mandatory backup step; (3) explicit diff command to preview changes; (4) safer alternative (manual SQL ALTER); (5) example data-loss scenario.

---

## Medium

**Missing radix parameter in parseInt calls**
`templates/hooks/session-context.js:61`
The `parseInt` call is missing the radix parameter. Without it, parseInt uses heuristic base detection, which can misbehave on strings starting with `0` (octal in older engines) or `0x` (hex). Code smell even if it works in modern Node.
*Fix:* Add radix 10: `if (parseInt(todoCount, 10) > 0)`.

**Shell injection vulnerability in session-context.js**
`templates/hooks/session-context.js:29`
The `execSync` command uses shell syntax (`2>/dev/null || echo 0`) which spawns a shell. While this command doesn't use user input, the pattern is fragile — if copied and modified to include user input (file paths, branch names), it becomes vulnerable to command injection.
*Fix:* Use `execSync` with explicit error handling rather than shell fallbacks: `let behind = '0'; try { behind = execSync('git', ['rev-list', 'HEAD..origin/main', '--count'], { encoding: 'utf8' }).trim(); } catch (e) { behind = '0'; }`.

**Unhandled promise rejection pattern in validate-edit.js stdin handler**
`templates/hooks/validate-edit.js:35-65`
The stdin `end` handler has a broad try-catch that silently allows operations on parse errors (line 63). If malformed JSON (not an error, just invalid data) is passed, the catch allows it through without logging, masking config errors and making debugging hard.
*Fix:* Split error handling — let JSON parse errors fail with a diagnostic message, but re-throw actual errors: `catch (e) { if (e instanceof SyntaxError) { console.log(JSON.stringify({ decision: 'allow' })); } else { throw e; } }`, or log the parse error before allowing.

**Over-permissive error handling in validate-edit.js**
`templates/hooks/validate-edit.js:63-64`
When JSON parsing fails, the hook silently allows the operation (`decision: 'allow'`). This defeats the security purpose — malformed/unexpected stdin should fail safe (block), not implicitly allow potentially dangerous operations.
*Fix:* Return `decision: 'block'` with a descriptive reason when JSON parsing fails, and log the error. Treat unexpected input as a security issue rather than passing it through.

**Missing regex pattern validation in validate-edit.js could lead to unintended blocks**
`templates/hooks/validate-edit.js:49-55`
The `PROTECTED_PATTERNS` regexes are absolute but `filePath` could be relative or absolute. Edge cases (symlinks, case-insensitive filesystems, non-normalized paths) could bypass protection. The error message also exposes the regex pattern (minor info disclosure).
*Fix:* Normalize the file path with `path.resolve()`/`path.normalize()` before testing. Consider case-insensitive matching where needed. Replace the regex in error messages with a simple description ("This file is protected and cannot be edited.").

**Unsafe use of fs.readdirSync without error handling in session-context.js**
`templates/hooks/session-context.js:46`
`fs.readdirSync()` reads filenames from `.claude-sessions/` and uses them directly in console output without sanitization. Filenames with special characters, newlines, or ANSI escape sequences could enable log injection or terminal-based attacks downstream.
*Fix:* Sanitize filenames before display: escape special characters, strip ANSI sequences, or use JSON serialization. Show only the basename.

**Unvalidated stdin input handling — missing schema validation in session-context.js**
`templates/hooks/session-context.js:26-29`
The `execSync` calls with shell syntax (`2>/dev/null || echo 0`) can fail silently or produce unexpected output. The broad catch-all masks problems, and there's no validation that branch name or status output is safe.
*Fix:* Use explicit error handling and output validation: add a stdout type assertion, split command and error handling, and validate the branch name against an expected pattern before use.

**Missing type hints on hook callback parameter — unvalidated input**
`templates/hooks/validate-edit.js:34-35`
`process.stdin.on('data', chunk => input += chunk)` concatenates chunks without type safety. The `chunk` parameter is implicitly typed; binary or unexpected data could corrupt the JSON input without detection.
*Fix:* Explicitly handle encoding: `process.stdin.setEncoding('utf8');`, or add a type assertion `(chunk as Buffer).toString('utf8')`.

**Weak error handling — silent failures in JSON parsing**
`templates/hooks/log-edits.js:26`
The JSON.parse catch block silently allows the operation (`decision: 'allow'`) without logging the parse error, masking malformed input and hiding config issues at runtime.
*Fix:* Log the error to stderr: `console.error('JSON parse failed:', e);`, or use a fallback decision based on error severity.

**Unsafe optional property access without runtime guard**
`templates/hooks/log-edits.js:42`
`success: data.tool_output?.success ?? true` uses nullish coalescing on a nested property without verifying `data.tool_output` exists or is an object. Silently defaults to true on type errors.
*Fix:* Add an explicit type guard: `success: (data?.tool_output && typeof data.tool_output === 'object' && 'success' in data.tool_output) ? data.tool_output.success : true`.

**Unbounded recursive directory scan with no exclusions**
`templates/hooks/session-context.js:60`
The grep command `grep -r "TODO" --include="*.ts" --include="*.js" -l .` scans recursively from the cwd without excluding `node_modules` or generated dirs, making it O(total_files) with no bounds.
*Fix:* Add exclusions and a cap: `grep -r "TODO" --include="*.ts" --include="*.js" -l . --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git --exclude-dir=build 2>/dev/null | head -1000`.

**Pattern matching loop with no early exit optimization**
`templates/hooks/validate-edit.js:49-56`
The for-loop iterates through `PROTECTED_PATTERNS` and tests each regex against `filePath`. Though the array is small (12 patterns), this runs on EVERY Edit/Write. With long paths or complex patterns, repeated matching could become a hot path.
*Fix:* Compile a single combined regex at module load: `const PROTECTED_REGEX = new RegExp(PROTECTED_PATTERNS.map(p => `(${p.source})`).join('|'));` then test once instead of looping.

**Synchronous directory reads without size validation**
`templates/hooks/session-context.js:45-49`
`fs.readdirSync()` on `.claude-sessions` has no size limit. With hundreds of accumulated session files, this loads all into memory and sorts the entire array just to access the first element.
*Fix:* Either (1) read and sort/slice to the first N most recent, (2) use a readdir stream with early exit, or (3) store the latest session reference in a marker file to avoid the full scan.

**Race condition in directory creation without atomic check-and-create**
`templates/hooks/log-edits.js:34-35`
`fs.existsSync()` followed by `fs.mkdirSync()` is not atomic. Between the check and the mkdir, another process could create or delete the directory, causing EEXIST/ENOENT errors under concurrent parallel sessions.
*Fix:* Use `fs.mkdirSync(logDir, { recursive: true })` directly and wrap in try-catch to ignore EEXIST: `try { fs.mkdirSync(...) } catch (err) { if (err.code !== 'EEXIST') throw; }`.

**No validation of stdin data completeness before parsing in validate-edit hook**
`templates/hooks/validate-edit.js:34-37`
The hook buffers all stdin before parsing, with no timeout and no incomplete-data check. If the parent sends incomplete JSON then hangs, the hook blocks forever waiting for `end`, hanging the whole session during tool execution.
*Fix:* Add a stdin timeout: `const timeout = setTimeout(() => { console.log(JSON.stringify({ decision: 'allow' })); process.exit(0); }, 5000);` and clear it in `end`. Also validate JSON structure after parsing.

**Missing error handling for parseInt() in add-api-endpoint template**
`templates/skills/twentyfive-dev/cookbook/add-api-endpoint.md:52, 71`
The example code calls `parseInt(req.params.id)` without validation. If `req.params.id` is `'abc'` or malformed, parseInt returns NaN, which silently passes to DB queries and produces incorrect results or SQL errors.
*Fix:* Validate before parsing: `const id = parseInt(req.params.id, 10); if (isNaN(id)) { return res.status(400).json({ error: 'Invalid ID format' }); }`, or use a Zod schema as in the POST example.

**Unhandled Promise rejection potential in health.md template command**
`templates/commands/health.md:18-23`
The DB connection check uses inline Node without an error-handling wrapper. If Neon is unreachable and the promise rejects, error handling relies on the shell script context, and there's no retry for transient failures.
*Fix:* Add retry with exponential backoff (up to 3 attempts, 1s delay). Wrap the promise in a timeout: `Promise.race([promise, timeoutPromise])` for a max 3s timeout per attempt.

**Session Context Hook: Missing newline handling in git output parsing**
`templates/hooks/session-context.js:29-30, 33`
`execSync` output is trimmed globally but the logic assumes single-line output. `behind` is coerced via `parseInt` at line 33; if output is unparseable, `behind` becomes NaN and `if (behind > 0)` fails silently. No validation that parseInt succeeded.
*Fix:* Add numeric coercion with fallback: `const behind = parseInt(execSync(...).trim()) || 0;` and validate `>= 0`. Consider `const behindCommits = Math.max(0, parseInt(...) || 0)`.

**Validate Edit Hook: No regex escape for dynamic error messages**
`templates/hooks/validate-edit.js:53`
The error message interpolates `filePath` directly without escaping. Files like `file[with]brackets.txt` or `file$var.txt` display as-is. Low severity (just a message), but inconsistent with security best practices and potentially confusing.
*Fix:* Quote/escape `filePath` in the message: `reason: 'Cannot edit protected file: "${filePath}"...'`, or use `JSON.stringify`.

**Log Edits Hook: No permissions or symlink handling for log directory**
`templates/hooks/log-edits.js:30-36`
The code creates the log dir with `mkdirSync` but doesn't handle permission errors or symlink attacks. If `.claude-logs` is a symlink to a sensitive directory, `mkdirSync` could behave unexpectedly. If `mkdirSync`/`appendFileSync` fail on permissions, the operation silently continues, masking that edit logs aren't persisting.
*Fix:* Handle directory creation errors: `try { fs.mkdirSync(...) } catch (e) { if (e.code !== 'EEXIST') throw e; }`. For append failures, log to stderr: `process.stderr.write(`Failed to log edit: ${e.message}`)` before allowing.

**Empty case-studies directory listed in architecture but never referenced**
`README.md:118`
The repo structure documents a `case-studies/` directory, but the directory is empty and no markdown references it, making it orphaned from course navigation and suggesting incomplete implementation.
*Fix:* Either populate `case-studies/` with real examples and link them from the course structure, or remove the directory and its README mention.

**Type coercion issue: parseInt() result compared to number without radix**
`templates/hooks/session-context.js:61`
Line 61 calls `parseInt(todoCount)` without a radix. Modern linters recommend always specifying it. `todoCount` is already a string from `execSync().trim()`; in rare cases (`'08'`, `'09'`), parseInt without radix can misbehave in strict/older engines.
*Fix:* Use `if (parseInt(todoCount, 10) > 0)`, or `if (Number(todoCount) > 0)` to be explicit about conversion intent.

**String comparison instead of numeric comparison for git commits behind**
`templates/hooks/session-context.js:33`
`if (behind > 0)` where `behind` is a string from `execSync().trim()`. This relies on implicit coercion (`'5' > 0` is true, but `'foo' > 0` behaves unexpectedly). The value should be explicitly converted.
*Fix:* `if (Number(behind) > 0)` or `if (parseInt(behind, 10) > 0)`.

**Stop-guard.js decision field value conflicts with documented output format**
`templates/hooks/stop-guard.js:29`
Line 29 outputs `decision: 'block'` but the stop-guard FORCES continued operation — `'block'` blocks Claude from stopping, a double-negative that obscures intent. The README documents `allow`/`block` only.
*Fix:* Either rename `decision` to `'continue'` in the hook spec, or add an explicit `reason`: `{ decision: 'block', reason: 'Continue working—task not complete' }`.

**Unsafe Delete Ordering in Seed Function Without FK Cascade Definition**
`templates/skills/twentyfive-dev/database-ops.md:162-164`
The seed function deletes tables in order (deals → leads) but the doc never states the deals table needs `ON DELETE CASCADE` or that delete order is critical. Reversing the order or forgetting FK constraints causes silent failures or orphaned records.
*Fix:* Document: (1) FK constraints MUST define `ON DELETE CASCADE` in schema.ts; (2) delete order must respect FK dependencies (child tables first); (3) consider wrapping deletes in a transaction for atomicity.

**No Mention of Race Conditions in Multi-Session Migrations**
`03-workflows/README.md:308-340`
Migration docs don't warn about concurrent sessions running schema changes simultaneously. Two sessions both running `bun db:push` can cause locking, orphaned schema states, or transaction conflicts. Worktree guidance omits connection-pooling concerns.
*Fix:* Add a migration-safety section: (1) only ONE session should run db:push at a time; (2) use advisory locks if parallel sessions needed; (3) document Neon connection-pooling gotchas; (4) run db:push in a dedicated single-session worktree before merging.

**No FK Constraint Definition Patterns in Schema Examples**
`templates/skills/twentyfive-dev/database-ops.md:105-113`
The FK example `.references(() => leads.id)` doesn't document cascade behavior. Drizzle defaults to NO ACTION for deletes, which can orphan records if the parent is deleted while children exist. No guidance on CASCADE vs RESTRICT vs SET NULL.
*Fix:* Add a "Foreign Key Cascade Strategy" subsection with 3 patterns: (1) `ON DELETE CASCADE` for logs/audit; (2) `ON DELETE RESTRICT` for critical relationships; (3) `ON DELETE SET NULL` for optional relationships. Include syntax and when each applies.

**Migration Pattern Lacks Tenant Scoping for Multi-Tenant Systems**
`templates/skills/twentyfive-dev/cookbook/database-migration.md:47-52`
The multi-phase backfill example (Phase 2) shows a raw UPDATE without WHERE filtering by tenant. In a multi-tenant system this updates records across all tenants, causing data cross-contamination or loss of tenant isolation.
*Fix:* If multi-tenancy is supported, add tenant_id to all examples: `UPDATE leads SET source_id = (...) WHERE source_id IS NULL AND tenant_id = ?`, with a note: "Always verify tenant scope before backfilling production data."

---

## Low

**Array filter without null check in session-context.js**
`templates/hooks/session-context.js:46-49`
The code assumes `fs.readdirSync` returns an array and filters by extension, but doesn't validate string-only contents. More importantly, if `.claude-sessions` exists but is unreadable, `readdirSync` throws into the outer try block, silently dropping this context section.
*Fix:* Add explicit error handling for the `readdirSync` call (own try-catch or `fs.accessSync` check) for clearer fallback behavior.

**Information disclosure in session-context.js git commands error handling**
`templates/hooks/session-context.js:39-40`
When git commands fail, the exception is silently caught without logging. Reasonable for "not a git repo," but if git fails for other reasons (permission denied, corrupted repo), valuable debugging info is lost and could mask security issues.
*Fix:* Log errors to stderr or a debug log rather than swallowing them. Check if `.git/` exists before running git commands to distinguish "not a repo" from "git command failed."

**Missing JSDoc type annotations in JavaScript hook files**
`templates/hooks/session-context.js:22`
`getContext()` has no JSDoc `@returns` hint. Without annotations, IDE autocomplete and type checking can't infer the return type (string), making the code harder to maintain.
*Fix:* Add JSDoc `@returns {string}`. Consider adding `@param` and `@throws` annotations.

**No explicit undefined/null checks on array access**
`templates/hooks/session-context.js:53-54`
`states[0]` is used without verifying non-empty, despite a `states.length > 0` guard. Safe due to the guard, but fragile if refactored.
*Fix:* Use `const latest = states.at(0); if (!latest) return;`, or `const latest = states[0]!;` (non-null assertion in TypeScript).

**Testing Guide: No example tests for error paths in factories**
`templates/skills/twentyfive-dev/testing-guide.md`
The guide shows comprehensive happy-path examples (lines 153-198) but only tests the success case (201) and one validation error. Critical paths — duplicate email rejection, constraint violations, concurrent write conflicts, timeouts — are absent, despite the 90%+ coverage goal at lines 279-285.
*Fix:* Add a "Testing Error Paths" section covering (1) input validation errors; (2) business logic errors (duplicate keys, insufficient funds); (3) dependency failures (DB down, API timeout); (4) concurrency issues. Include an example file with 2-3 error scenarios per feature.

**SKILL.md Example Test: Weak assertions and missing edge cases**
`templates/skills/twentyfive-dev/SKILL.md`
The example test at lines 207-218 has weak assertions: `expect(calculateLeadScore(lead)).toBeGreaterThan(70)` only checks the lower bound — a score of 150 passes. Hardcoded inputs (source: 'referral', budget: 50000) test implementation details, not behavior, and skip boundaries.
*Fix:* (1) Add an upper bound: `expect(score).toBeGreaterThan(70); expect(score).toBeLessThanOrEqual(100);`. (2) Test hot vs cold leads and boundary budgets (1, 50000, 100000). (3) Show parametrized testing: `describe.each([[50000, true], [5000, false]])`.

**Silent fallback on JSON parse errors in hook handlers**
`templates/hooks/validate-edit.js:61-63`
Both `validate-edit.js` (61-63) and `log-edits.js` (50-52) catch JSON.parse errors and silently allow/continue without logging. Malformed JSON is hidden, making hook failures harder to debug and violating fail-safe visibility.
*Fix:* Log to stderr before continuing: `console.error('JSON parse error in hook:', e.message);`.

**Inconsistent error handling pattern across hook files**
`templates/hooks/` (validate-edit.js:61, log-edits.js:50, session-context.js:26,59)
The four hook files use inconsistent error handling: session-context.js uses try-catch with empty comments, validate-edit.js and log-edits.js use minimal comments, stop-guard.js has none. This makes expected failure modes and deliberate-vs-accidental behavior hard to understand.
*Fix:* Establish a consistent pattern: (1) always log errors to stderr with context; (2) create a shared error-handling utility; or (3) document why each catch is intentionally silent.

**Transaction Example Lacks Error Handling Specification**
`templates/skills/twentyfive-dev/database-ops.md:253-274`
The transaction example shows rollback but doesn't document explicit throw, network failure, or connection timeout behavior, nor retry/deadlock handling. A developer might assume all errors auto-rollback (true here) but lack defensive patterns.
*Fix:* Expand with (1) try/catch with explicit error logging; (2) retry logic for deadlocks; (3) note Drizzle auto-rollbacks on error; (4) explain the connection-timeout edge case where commit succeeds but the app crashes before return.

**Schema Backfill Documentation Missing Idempotency Check**
`templates/skills/twentyfive-dev/cookbook/database-migration.md:48-52`
The backfill `UPDATE leads SET source_id = (...) WHERE source_id IS NULL` is safe once and a no-op on re-run, but there's no guidance on making the whole migration idempotent or handling partial mid-backfill failures.
*Fix:* Add a note: "This is idempotent (safe to re-run) because of the `WHERE source_id IS NULL` guard. Always include such guards. If a backfill fails mid-execution, re-running resumes from where it left off."

**Circular module progression reference in Module 0**
`00-getting-started/README.md:76, 90`
Module 0 links forward to Module 1, but Module 1+ reference configuration patterns introduced in Modules 2-4. The progression assumes strict sequential learning, but navigation relies on explicit "Next" footers rather than bidirectional cross-references.
*Fix:* Add a "Prerequisites" section to Module 1 clarifying it assumes Module 0, or add backward cross-reference links (e.g., "See Module 2 for configuration details") when Module 1 mentions hooks/commands explained later.

**Template skill examples assume external project context**
`templates/skills/twentyfive-dev/SKILL.md:1-50`
The TwentyFive skill template references a real external project (`~/Developer/personal/twentyfive`) with specific architecture (Drizzle, Neon, React + Vite). This tightly couples the template to that project's conventions; reuse for a different project requires replacing many paths/stack details.
*Fix:* Create a generic template in `templates/skills/generic-skill/` with placeholders, and keep TwentyFive as a specific case study under `templates/skills/case-studies/twentyfive-dev/`. Clarify in SKILL.md that the template is project-specific.

**Hook templates lack error boundary documentation**
`templates/hooks/validate-edit.js:34-65`
The validate-edit hook silently catches JSON parse errors and allows the edit; session-context.js (39-41) also silently skips failed git commands. This failure-silent pattern masks execution errors, making debugging hard if input format changes or system commands fail.
*Fix:* Add explicit stderr logging before silent failures: `console.error('Hook error: ' + e.message)`. Document the error-tolerance policy in README.md under hook best practices.

**Index.ts is unused placeholder**
`index.ts:1`
The file contains only `console.log("Hello via Bun!")` and is referenced in package.json as `module: index.ts`, but this is a Docsify course site with no real TS entry point. Residual setup config serving no function.
*Fix:* Either delete `index.ts` and remove the `module` field from package.json, or replace it with actual executable utilities. Update AGENTS.md and CLAUDE.md to clarify the repo is documentation-first.

**Inconsistent configuration scope documentation across modules**
`02-configuration/README.md:15-21`
Module 2 introduces the 3-level CLAUDE.md hierarchy (global, project, local), but Module 3 doesn't reinforce which scope to use for session state, git hooks, or workflow commands. Module 4 introduces subagents without clarifying whether their config lives at parent or child scope.
*Fix:* Add a "Configuration Scope Reference" table in Module 3 showing which settings (CLAUDE.md, hooks, commands) apply to which scope, and whether subagents inherit parent scope or need separate config.

**Session state pattern lacks versioning scheme**
`03-workflows/README.md:9-32`
Module 3 introduces manual session state files (`.claude-sessions/*.md`) without a schema or versioning convention. The session-context hook (lines 44-56) reads them without validating structure. If the schema changes or a file corrupts, recovery is manual.
*Fix:* Define a JSON schema (e.g., `{ "version": 1, "date": "...", "branch": "...", "progress": [...] }`), add validation to the session-context hook, and document it in Module 3 under a "Session State Format" section.

**Hook timeout values lack justification**
`templates/hooks/README.md:28-30`
The example hook config uses arbitrary timeout values (5000ms Stop, 3000ms PostToolUse). These may be too short for slow systems or network ops, with no documented rationale or tuning guidance.
*Fix:* Add a "Timeout Guidelines" section: PreToolUse (fast validation) 1000-2000ms, PostToolUse (file I/O) 3000-5000ms, SessionStart (git ops) 5000-10000ms. Recommend profiling on the target system.

## Adversarial verification (critical/high)

- **Type coercion bug: string compared to number without conversion @ session-context.js:33** — REFUTED. `|| echo 0` guarantees a numeric string, and JS `>` coerces it correctly; only an inconsistency with line 61's `parseInt`, not a functional bug.
- **Inconsistent error handling between identical command patterns** — REFUTED. `wc -l` always emits a pure numeric string, so both the string comparison (line 33) and `parseInt` (line 61) work; no non-numeric input risk.
- **Command Injection in session-context.js via unsafe grep execution** — REFUTED. The grep command is a hardcoded literal with no interpolation; `--include` whitelists files and malicious filenames are treated as literal bytes (verified empirically).
- **Insufficient input validation in log-edits.js - arbitrary log file path creation** — REFUTED. The log path is built only from hardcoded components; `file_path` from stdin is stored as a JSON value (line 41), never used in path construction.
- **Missing type safety in hook file JSON parsing — unsafe data access patterns @ validate-edit.js:46** — REFUTED. `?. || ''` defaults to empty string which matches no PROTECTED_PATTERN, so it fail-open allows; not an attacker-controllable bypass, and severity is overstated for educational template code.
- **Missing type safety in hook file JSON parsing - unsafe input to regex test** — REFUTED. The `|| ''` fallback guarantees `filePath` is always a string before `pattern.test()`; the non-string claim is false.
- **Multiple blocking synchronous file system and process operations in SessionStart hook** — CONFIRMED-REAL. Three sequential blocking `execSync` git calls (lines 27-29) plus an unbounded recursive grep (line 60) run at every SessionStart, creating visible init latency on dependency-heavy projects.
- **Synchronous I/O blocks on every file edit in PostToolUse hook** — CONFIRMED-REAL. `fs.appendFileSync` (line 45) runs synchronously after every Edit/Write; the course's own docs warn hooks block Claude, so this adds measurable latency on slow/network disks.
- **Unhandled synchronous file system errors in log-edits hook** — REFUTED. All fs operations are inside a try-catch that emits valid `{"decision":"allow"}` JSON, so the hook never crashes; the real (lesser) issue is silent data loss with no error logging, not a crash.
- **No timeout handling for long-running execSync calls in session-context.js:27-29, 60** — CONFIRMED-REAL. No `timeout` option on the git or grep `execSync` calls in a synchronous SessionStart hook; a hung command blocks session startup, directly violating the template's own "use timeouts" README guidance.
- **Silent error swallowing masks critical failures in session-context hook** — CONFIRMED-REAL. Broad catches (lines 39-41, 65-67) discard all errors with misleading "skip" comments, masking permission/corruption failures and giving users incomplete context (e.g., 0 TODOs reported when grep actually failed).
- **Session Context Hook: Unhandled child process errors in shell commands** — REFUTED. All three `execSync` calls are inside the same try-catch, so subsequent commands are not unprotected; the finding misreads the control flow (the real issue is the separately-tracked overly-broad/silent handling).
- **Validate Edit Hook: Regex pattern object printed in error message** — CONFIRMED-REAL. `${pattern}` (line 53) stringifies the RegExp (e.g., `/\.env$/`) into a cryptic user-facing block message instead of a human-readable description.
- **Log Edits Hook: Unsafe string concatenation into JSON without validation** — CONFIRMED-REAL. The JSON-escaping half is false, but the `?? true` fallback (line 42) logs any missing/failed success field as success=true, hiding real errors and defeating the audit purpose (independently confirmed by REVIEW.md:88).
- **Overly broad exception handling silently masks errors in session-context.js** — CONFIRMED-REAL. Two catch-all blocks (lines 26-41, 59-67) hide permission/corruption/I/O errors behind generic comments while the hook still returns valid JSON, so users can't tell "not applicable" from "failed to collect" — and it's a template teaching the anti-pattern.
- **'bun db:push --force' Documentation Lacks Data Loss Warning** — CONFIRMED-REAL. database-ops.md:324-328 flags possible data loss but gives no guidance distinguishing additive (safe) from destructive (unsafe) changes; two real decision records confirm the `--force` drop-column/table hazard.

**Tally:** 16 verdicts — 8 CONFIRMED-REAL, 8 REFUTED.
