---
description: Performance optimization rules
globs: ["frontend/src/**/*.tsx", "frontend/src/**/*.ts"]
---

Always optimize for performance.

Rules:
- Lazy load routes.
- Memoize expensive components with React.memo.
- Use useMemo and useCallback only when beneficial.
- Avoid unnecessary re-renders.
- Use dynamic imports.
- Optimize Recharts rendering.
- Keep bundle size small.
- Remove unused imports.
- Split vendor chunks.
- Optimize images.
- Use Vite production optimizations.
