# Contributing

Thanks for your interest in contributing to Smart City OS.

Getting started
- Fork the repo and create a feature branch from `main`
- Keep changes focused and small; prefer multiple small PRs over one large PR
- Write clear commit messages and PR descriptions (no emojis)
- For UI work, test in both light and dark themes

Development
- Frontend lives in `frontend/` (React). Run `npm install && npm start` inside that folder.
- Backend serverless functions live in `api/` for Vercel.
- Supabase client config is in `frontend/src/lib/supabase.js`. Do not commit real keys.

Code style
- Use Prettier defaults and ESLint if available
- Prefer functional React components and hooks
- Keep components small and reusable

Testing
- Add or update unit tests when changing logic
- For UI flows, add simple integration tests where possible

PR checklist
- [ ] Descriptive title and summary
- [ ] Screenshots or short notes for UI changes
- [ ] Tests added/updated when applicable
- [ ] No secrets committed; env documented in README

License
- By contributing, you agree your contributions are licensed under the project license.

