---
description: Testing and verification workflow
globs: ["*"]
---

Before finishing any task:

1. Run npm run lint
2. Run npm run build
3. Fix all TypeScript errors
4. Fix all ESLint errors
5. Remove unused imports
6. Optimize bundle size
7. Ensure responsive design
8. Verify dark mode
9. Verify Supabase Realtime
10. Do not stop until everything passes successfully.

Never finish while errors exist.
