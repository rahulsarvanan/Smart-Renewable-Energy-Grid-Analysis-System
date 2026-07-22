# Smart Energy Grid Analysis Platform

An expert-level, AI-powered Smart Grid monitoring platform. Built for utility operators and energy consumers to monitor live telemetry, predict failures, and optimize energy flow.

## Features
- **Live Geographic Monitoring:** Leaflet-based GIS tracking of substations, transformers, and smart meters.
- **Real-Time Telemetry:** Powered by Supabase Realtime and an MQTT IoT simulator (Aedes).
- **AI Integration:** Google Gemini integration for demand forecasting and anomaly detection via Supabase Edge Functions.
- **Role-Based Access:** Portals for Engineers, Technicians, and Consumers.
- **Glassmorphic UI:** A dark-mode, futuristic UI utilizing Tailwind CSS and React.
- **DevOps Ready:** Dockerized for local development and Vercel-ready for production.

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- Leaflet (GIS Mapping)
- Recharts
- Node.js + Aedes (IoT Simulator)
- Docker & GitHub Actions

## Setup Instructions

### 1. Supabase Setup
1. Create a Supabase project.
2. Run the SQL schema found in `supabase/schema.sql` (if exported) to create tables and RLS policies.
3. Configure your Gemini API Key in Supabase Secrets for Edge Functions:
   `supabase secrets set GEMINI_API_KEY=your_key`

### 2. Frontend Setup
```bash
cd frontend
cp .env.example .env
# Edit .env with your Supabase URL and Anon Key
npm install
npm run dev
```

### 3. IoT Simulator Setup
```bash
cd simulator
cp .env.example .env
# Edit .env with your Supabase URL and Service Role Key (or Anon if RLS allows)
npm install
npm start
```

## Architecture
- `frontend/`: React Vite SPA.
- `simulator/`: Node.js MQTT Broker & Data generator pushing live stats to Supabase.
- `supabase/functions/`: Deno Edge Functions integrating Google Gemini AI.
