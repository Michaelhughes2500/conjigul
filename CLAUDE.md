# CLAUDE.md

## Project Overview

**Conjigul** is a minimal community hub — a single-page web application where users can maintain a photo gallery and a friends list. All data is persisted in the browser's `localStorage`; there is no backend database.

## Architecture

```
conjigul/
├── server.js          # Express 5 static file server
├── public/
│   ├── index.html     # Single-page app shell (all sections present on load)
│   ├── app.js         # Vanilla JS: state management, rendering, event handling
│   └── styles.css     # Custom CSS with dark theme and CSS variables
├── scripts/
│   └── health-check.js # npm test: verifies required files and HTML markers exist
└── .github/
    └── workflows/
        ├── ci.yml                         # CI: install + test on push/PR
        └── nextjs.yml                     # GitHub Pages deployment (not active)
```

## Development Setup

```bash
npm install
npm start       # runs node server.js, listens on PORT env var or 3000
```

Open `http://localhost:3000`. No build step — the server just serves the `public/` directory as static files.

## Running Tests

```bash
npm test        # runs scripts/health-check.js
```

The health check does not start a server. It only verifies:
- Required files exist: `server.js`, `public/index.html`, `public/app.js`, `public/styles.css`
- Required HTML element IDs exist in `index.html`: `add-picture-form`, `add-friend-form`, `gallery-grid`, `friend-list`

Do not remove or rename those element IDs — they are part of the test contract.

## Key Conventions

### Server (`server.js`)
- Uses **Express 5** (`^5.2.1`) and **express-rate-limit** (`^8.3.1`)
- **Helmet** is applied globally for security headers (`app.use(helmet())`)
- Rate limit: 100 requests per 60-second window
- Catch-all route serves `public/index.html` to support client-side navigation
- `helmet` must remain imported and applied — removing it breaks the security posture

### Frontend (`public/app.js`)
- Plain vanilla JS (CommonJS module type is set in `package.json` for the server; the browser files are not modules)
- State shape:
  - `state.pictures`: array of `{ id, title, url, createdAt }` — `url` is a base64 data URL
  - `state.friends`: array of `{ id, name, contact, notes, createdAt }`
- `localStorage` keys: `conjigul:pictures`, `conjigul:friends`
- IDs are generated with `window.crypto.randomUUID()` (with a `Date.now()` fallback)
- Rendering is full re-render on each mutation (no virtual DOM / diffing)
- Remove buttons use `data-id` and `data-type` attributes and are handled by a single delegated `click` listener on `document.body`

### Styling (`public/styles.css`)
- Dark theme with CSS custom properties defined on `:root`
- Key colour tokens: `--accent` (purple `#7c3aed`), `--accent-soft`, `--bg`, `--panel`, `--card`, `--border`, `--muted`, `--text`
- Responsive breakpoint at `640px` (mobile hero padding / font size only)
- Component classes: `.card`, `.tile` (gallery item), `.chip` (friend item), `.button`, `.button--secondary`, `.button--ghost`

## CI / GitHub Actions

- **`.github/workflows/ci.yml`**: Runs on push to `main`, `copilot/**`, `codex/**`, and on PRs targeting `main`. Node 20, `npm ci`, then `npm test`.
- **`.github/workflows/nextjs.yml`**: GitHub Pages Next.js deployment workflow. This is a template that was committed but is not functional for this project (no Next.js build).

## Dependency Notes

- `package.json` contains a duplicate `"express"` key — this is a pre-existing issue. npm resolves it to the last value (`^5.2.1`), so it works, but it should be cleaned up.
- `overrides` in `package.json` pin `qs` to `>=6.14.2` and `path-to-regexp` to `>=8.4.0` to satisfy security advisories. Do not remove or downgrade these overrides.
- `helmet` is used in `server.js` but is not listed as a dependency in `package.json`. It is a transitive dependency pulled in by Express 5. If it ever needs to be an explicit dependency, add it directly.

## Security Considerations

- Never render user-supplied text directly as `innerHTML` without sanitisation — the current code does inject `item.title`, `friend.name`, `friend.contact`, and `friend.notes` into `innerHTML`. If these fields ever come from a shared/server source rather than trusted `localStorage`, XSS sanitisation will be required.
- Rate limiting is already configured on the server; do not remove it.
- All security-related dependency pins in `overrides` must be kept current.
