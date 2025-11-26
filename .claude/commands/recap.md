# Daily Status Report

Analyze my git state and provide a structured status report to help me resume work.

## Instructions

1. Check the current branch and any uncommitted changes
2. Run `git diff` to see the actual uncommitted code changes
3. Run `git diff HEAD~10` to see the actual code changes from recent commits
4. Review recent commit messages for additional context
5. Identify what I was working on based on the actual code diffs
6. Suggest what to pick up next

## Response Format

Use this exact format:

---

**Branch:** `{branch_name}`

**Uncommitted Changes:**
- {list of modified/staged/untracked files, or "None"}

**Recent Work (Last Session):**
{2-3 sentence summary of what the recent commits indicate I was doing}

**Left Off At:**
{Based on uncommitted changes and last commit, what was I in the middle of?}

**Suggested Next Steps:**
1. {First priority}
2. {Second priority}
3. {Third priority if applicable}

---
