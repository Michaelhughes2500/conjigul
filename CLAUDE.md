# CLAUDE.md

Guidance for Claude Code (and humans) when working in this repository.

## Project overview

**Conjigul** is a minimal community hub SPA. A small Node.js/Express server hardened with `helmet` and `express-rate-limit` serves a static frontend from `public/`. The browser-side app is vanilla HTML/CSS/JS that persists an image gallery and a friends/contacts list to `localStorage` — there is no backend database.

## Tech stack

- Node.js (CommonJS), Node 20+ on CI
- Express 5
- helmet (security headers)
- express-rate-limit (100 requests / 60s, applied globally)
- Vanilla HTML/CSS/JavaScript in `public/` — no bundler, no framework
- Browser `localStorage` for state persistence

## Commands

```bash
npm install        # install dependencies
npm start          # start server (default: http://localhost:3000)
npm test           # node scripts/health-check.js (validates required files/markers)
```

Set `PORT` and `NODE_ENV` via `.env` (see `.env.example`).

## Repo layout

- `server.js` — Express app entrypoint. Mounts helmet, the rate limiter, a `/health` route exempt from rate limiting, static file serving (1h cache), then an SPA fallback.
- `public/` — static assets shipped to the browser.
  - `index.html` — HTML structure (hero, forms, gallery).
  - `app.js` — all frontend logic (~160 lines). Centralized `state` object synced via `saveState()` → `localStorage`. Uses event delegation for "Remove" buttons.
  - `styles.css` — dark theme (slate/purple).
- `scripts/health-check.js` — verifies required files and form markers exist; run by `npm test` and CI.
- `.github/workflows/ci.yml` — runs `npm ci && npm test` on push/PR (Node 20).
- `.vscode/` — Prettier/ESLint format-on-save + an F5 launch config.
- `package.json` pins `qs` and `path-to-regexp` overrides for security.

> The `.github/workflows/nextjs.yml` and `npm-publish-github-packages.yml` files are unused templates from the original scaffold — ignore them.

## Conventions

- Keep all routes mounted **before** the SPA fallback (`app.use((_req,res)=>...)`).
- Don't disable `helmet` defaults without a clear reason.
- Tune rate limits via `windowMs` / `max` in `server.js`; don't remove the limiter.
- Always escape user input before injecting into the DOM — see `escapeHtml()` in `public/app.js` (XSS prevention).
- Prefer `crypto.randomUUID()` (with the existing timestamp fallback) for new IDs — see `uniqueId()`.
- Public assets must be cache-friendly (hashed filenames where possible).
- Heads-up: image uploads are stored as base64 data URLs in `localStorage`. Large or many images will blow the per-origin quota fast — keep this in mind before adding features that store more binary data.

## Data model (browser-local only)

```js
// Pictures: { id, title, url (data URL), createdAt }
// Friends:  { id, name, contact, notes, createdAt }
```

Clearing browser storage = data loss. There is no server-side persistence.

## Running in VS Code

Open the folder, accept the recommended extensions, then press **F5** to launch the server with the debugger attached.
