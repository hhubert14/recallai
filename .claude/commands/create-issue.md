# Create GitHub Issue

Help create a well-structured GitHub issue for a feature or bug. Follow this workflow:

## Step 1: Understand the Request
Ask the user to describe the feature or bug they want to track. Get enough context to search effectively.

## Step 2: Check for Duplicates
Search existing GitHub issues using `mcp__github__search_issues` with relevant keywords:
- Search for the main concept/feature name
- Check both open and closed issues
- Report findings to user before proceeding

If a similar issue exists, ask if they want to:
- Add to the existing issue
- Create a new one anyway (explain differences)
- Skip creation

## Step 3: Clarify Scope
Use `AskUserQuestion` to gather details. Ask about:
- **For features**: Scope, key requirements, where it fits in the UI/architecture
- **For bugs**: Steps to reproduce, expected vs actual behavior
- Keep questions focused (2-4 max per round)

## Step 4: Create the Issue
Use `mcp__github__issue_write` with this structure:

```markdown
## Summary
[1-2 sentence description]

## Motivation
[Why is this needed? What problem does it solve?]

## Scope
[Checkbox list of specific tasks/requirements]

## Technical Notes
[Implementation considerations, constraints, relevant files]

## Acceptance Criteria
[Checkbox list of testable conditions for "done"]
```

Add appropriate labels (enhancement, bug, etc.)

## Step 5: Confirm
Share the issue URL with the user.

## Guidelines
- Keep issues focused - suggest splitting if scope is too large
- Use checkbox lists for trackable tasks
- Include technical context when relevant
- Reference related issues if applicable
