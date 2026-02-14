# Project Misfits Website

Production-oriented SvelteKit site for Project Misfits with TailwindCSS, Vite, and GSAP.

## Commands

- `npm install` - install all dependencies (including dev dependencies)
- `npm run dev` - start local development server
- `npm run build` - create production build
- `npm run preview` - preview production build locally
- `npm run start` - run the built Node server (`build/` output)
- `npm run check` - run Svelte type and project checks

## Features

- Hero/showcase page (`/`) with GSAP intro + scroll animations
- Terms of Service page (`/tos`) with readable collapsible sections
- Rules page (`/rules`) with in-page search and collapsible groups
- Businesses & Departments page (`/departments`) with:
  - dynamic openings data
  - category and tag filtering
  - newest/oldest sorting
  - Discord OAuth2 gate for posting
- Dark immersive theme using server brand palette
- SEO metadata + OpenGraph + favicon placeholder
- Mobile-first responsive layout

## Discord OAuth2 Setup

1. Create a Discord application and OAuth2 redirect URI:
   - `http://localhost:5173/api/auth/discord/callback` (local)
   - `https://your-domain.com/api/auth/discord/callback` (production)
2. Copy `.env.example` to `.env` and set values:
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - optional `DISCORD_REDIRECT_URI`
3. Restart the server after updating env vars.

## Data Storage

Openings are persisted in `data/openings.json`.

For horizontal scaling or multi-instance deployment, replace the file-backed store in `src/lib/server/openings-store.ts` with a database backend.
