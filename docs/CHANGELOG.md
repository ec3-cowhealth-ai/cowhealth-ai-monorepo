# All notable changes to this project are documented in `/docs/change_control/CHANGELOG.md`.


Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). Make sure to observe the following specs:

## How to register your changes

> Read before writing in the CHANGELOG. Poorly made records generate rework and merge conflicts.

### Mandatory rules

1. **Write for humans, not for machines.**
   The CHANGELOG is not a commit log. Explain the impact of the change, not what you typed.

2. **One section per developer per date.**
   Use the header `## YYYY-MM-DD - Brief description (NAME)` and group everything you did that day into a single entry.

3. **Classify each change into one of the 6 categories.**
4. **Use dates in ISO 8601 format: `YYYY-MM-DD`.** Correct: `2026-05-23`. Wrong: `23/05/26`, `May 23`, `today`.
5. **Keep the most recent at the top.** New entries always above previous ones within your section.
6. **Do not copy commit messages.** `fix typo`, `wip`, `adjustments` say nothing. Describe what changed and why it matters.

#### The 6 valid categories

- `### Added` — New functionality, file, route, component
- `### Changed` — Change to something that already existed
- `### Deprecated` — Something that still works but will be removed soon
- `### Removed` — Functionality, file, or route eliminated
- `### Fixed` — Bug fix
- `### Security` — Vulnerability fix

### Best practices

- List files created, modified, and removed explicitly.
- If you fixed a bug, describe the cause and the solution — not just the symptom.
- If the change affects another team member (e.g., API contract, TypeScript type, environment variable), highlight in bold or with a note.
- Build status at the end of the entry is welcome: `✅ TypeScript: zero errors`.

### What to avoid

- Do not use git diff or git log as a substitute for the CHANGELOG.
- Do not omit removals — these are the changes that most break others' work.
- Do not mix different dates in the same entry.
- Do not write in excessive first person (`I did`, `I fixed`) — the name in the header already identifies the author.
