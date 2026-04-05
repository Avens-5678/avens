When you finish building a new feature, always:

1. Add a `registerFeature()` entry in the relevant `src/features/*.ts` file
2. Include: id (unique), group, name, description (specific), route, implementation
3. If creating a new feature group, add the import to `src/features/index.ts`
4. Commit message should include "feat:" prefix so features are trackable

This ensures every feature you ship is automatically tested by the AI testing agent.
