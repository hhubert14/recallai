# Resolve GitHub Issue

Fetch a GitHub issue and begin working on resolving it.

## Instructions

1. **Fetch the issue** using the GitHub MCP tool (`issue_read` with method `get`)
   - Extract: title, description, labels, comments
   - Note the issue number for branch naming

2. **Create a branch** following the project's naming convention:
   - Bug/fix labels → `fix/{issue-number}-{short-description}`
   - Feature/enhancement → `feature/{issue-number}-{short-description}`
   - Other → `chore/{issue-number}-{short-description}`

3. **Push the branch** to origin and set upstream tracking:
```bash
   git push -u origin HEAD
```

4. **Explore the codebase** to understand:
   - What files/areas are relevant to the issue
   - Current implementation patterns
   - Whether the issue description is still accurate (codebase may have changed)

5. **Ask clarifying questions** (only if needed):
   - If the issue description is ambiguous
   - If the codebase has changed and the issue may be outdated
   - If there are multiple valid approaches
   - Do NOT ask questions if the issue is clear and codebase matches expectations

6. **Enter plan mode** to design the implementation approach

## Usage
```
/resolve-issue <issue-number>
```

Example: `/resolve-issue 53`

## Notes

- Only works for the current repository
- Follows TDD workflow from CLAUDE.md when implementing
- Will create commits linked to the issue (e.g., "Fixes #53")