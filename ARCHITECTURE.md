# Architecture Overview

This document gives a high-level view of Smart City OS.

Frontend (React)
- Location: `frontend/`
- Tech: React 18, React Router, Tailwind CSS
- State: Context API for Auth/Theme/City, React Query for data
- Theming: `ThemeContext` with localStorage; default is dark, with no-flash script in `public/index.html`

Backend (Vercel Functions)
- Location: `api/`
- Node.js serverless endpoints for notices and related APIs
- Supabase used for data storage and auth

Data & Auth
- Supabase project provides Postgres, Auth, and storage
- API can use service role (server-side) or RLS with user JWT (client -> API -> Supabase)

Key Flows
- Announcements/Notices: Frontend calls `/api/notices` (GET/POST); detail view calls `/api/notices/[id]`
- Emergency services: Booking flow with a demo/test payment mode for DodoPayment

Deployment
- Frontend: Vercel (run deploys from `frontend/` directory)
- Backend: Vercel Functions auto-deployed with the repo

Conventions
- Student-style commit messages, no emojis
- Small, focused PRs with clear titles and summaries

