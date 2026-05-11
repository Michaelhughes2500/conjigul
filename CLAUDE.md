# CLAUDE.md

Guidance for Claude Code (and humans) when working in this repository.

## Project overview

**Conjigul** is a community hub web app. It is a small Node.js/Express server that serves a static SPA from the `public/` directory, hardened with `helmet` and `express-rate-limit`.

## Tech stack

- Node.js (CommonJS)
- Express 5
- helmet (security headers)
- express-rate-limit (basic abuse protection)
- Static frontend in `public/`

## Commands

```bash
npm install        # install dependencies
npm start          # start server (default: http://localhost:3000)
npm test           # run scripts/health-check.js
```

Set `PORT` env var to override the default port.

## Repo layout

- `server.js` — Express app entrypoint.
- `public/` — static assets shipped to the browser (HTML/CSS/JS/images).
- `scripts/` — maintenance / health-check scripts.
- `package.json` pins `qs` and `path-to-regexp` overrides for security.

## Conventions

- Keep all routes mounted before the SPA fallback (`app.use((_req,res)=>...)`).
- Don't disable `helmet` defaults without a clear reason.
- Rate limits live in `server.js` — tune `windowMs` / `max` rather than removing.
- Public assets must be cache-friendly (hashed filenames where possible).

## Running in VS Code

Open the folder in VS Code, install recommended extensions (you'll be prompted), then press F5 to launch the server with the debugger attached.
