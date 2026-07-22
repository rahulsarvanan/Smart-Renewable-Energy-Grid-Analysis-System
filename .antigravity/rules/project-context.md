---
description: Context regarding the GridPulse AI domain and database architecture.
globs: ["*"]
---

# Project Context: GridPulse AI

1.  **Domain Knowledge:**
    *   This is an industrial analytics platform for monitoring power grids, substations, and renewable energy assets.
    *   Vocabulary: SAIDI (System Average Interruption Duration Index), BESS (Battery Energy Storage Systems), Smart Meters, Transformers, Nodes.
2.  **Architecture:**
    *   **Frontend**: React (Vite) single-page application located in `frontend/`.
    *   **Backend / Database**: Supabase (PostgreSQL). We are heavily utilizing Supabase Realtime subscriptions to push live telemetry data to the frontend.
3.  **Data Strategy:**
    *   If database tables are empty during development, generate highly realistic streaming mock telemetry on the frontend that matches the expected Supabase schema.
    *   Automatically switch to live data once the Supabase endpoints are populated.
4.  **CLI / Agent Workflows:**
    *   When adding new features, use Stitch MCP to generate the UI components first, then integrate them with Recharts, Framer Motion, and Supabase.
