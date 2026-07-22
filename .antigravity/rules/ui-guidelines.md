---
description: Applies to all UI and React component development.
globs: ["frontend/src/components/**/*.tsx", "frontend/src/**/*.ts", "frontend/src/**/*.tsx"]
---

# UI Guidelines for GridPulse AI

1.  **Frameworks & Libraries:**
    *   Use React, React Router (`react-router-dom`), Tailwind CSS, and `framer-motion` for animations.
    *   Use `recharts` for all data visualizations.
    *   Use `lucide-react` for iconography.
2.  **Design Aesthetic:**
    *   Maintain a high-density, "Premium Enterprise" industrial aesthetic.
    *   Always use a dark mode glassmorphic theme.
    *   Colors: Deep blue/navy backgrounds (`bg-[#000f1f]` or `bg-surface-container-low`), with vibrant cyan (`#57bfff`), emerald (`#10B981`), and purple (`#a9a0ff`) accents for glowing elements and highlights.
    *   Avoid generic admin cards; ensure screens look like complex engineering/telemetry reporting interfaces.
3.  **Code Standards:**
    *   No placeholder components. All widgets must display meaningful data or realistic simulated telemetry.
    *   Zero TypeScript and ESLint warnings.
    *   Always run `npm run build; npm run lint` from the `frontend` directory before finalizing any UI phase.
    *   Ensure all interfaces are responsive utilizing CSS grid, flexbox, and container queries.
