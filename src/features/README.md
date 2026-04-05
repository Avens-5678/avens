# Adding a new feature to the AI testing agent

When you build a new feature, add it to the testing agent by:

1. Find the relevant file in `src/features/` (or create a new one)
2. Add a `registerFeature()` call:

```ts
import { registerFeature } from '../lib/featureRegistry'

registerFeature({
  id: 'unique_snake_case_id',
  group: 'Your Group Name',
  name: 'Short feature name',
  description: 'What it should do and how to verify it works.',
  route: '/the-route',
  implementation: 'FileName.tsx + table_name + key logic',
})
```

3. Import the file in `src/features/index.ts` if it's a new file:
   ```ts
   import './yourNewFeatureFile'
   ```

4. The feature automatically appears in Admin > AI Testing next time the page loads.

## Existing groups

- Ecommerce (8 tests)
- Cart & Checkout (10 tests)
- Vendor Onboarding (8 tests)
- Vendor Dashboard (13 tests)
- Client Dashboard (1 test)
- Admin Dashboard (3 tests)
- WhatsApp & Notifications (4 tests)
- Authentication (2 tests)
- Mobile & UX (3 tests)
- Payments (3 tests)
