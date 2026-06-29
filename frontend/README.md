# Threadly Web (Vite + React)

React web client for the Threadly backend. Built with **Vite 6**, **React 19**,
and **React Router** (route-based navigation).

## Run

1. **Start the backend** (from `../backend`):
   ```bash
   npm run dev
   ```
   The backend must allow this app's origin in `CORS_ORIGIN` (already set to
   `http://localhost:5173,http://127.0.0.1:5173`).

2. **Start the web app** (from this folder):
   ```bash
   npm run dev
   ```
   Open http://localhost:5173.

> API base URL defaults to `http://localhost:8777/api/v1`. Override with
> `VITE_API_BASE_URL` in a `.env` file if needed.

## Test accounts (from backend seed)

| email | password |
|-------|----------|
| alice@threadly.dev | password123 |
| bob@threadly.dev | password123 |
| carol@threadly.dev | password123 |

## Routes

| Path | Page |
|------|------|
| `/` | Home / Trending feed |
| `/login`, `/register` | Auth |
| `/r/:slug` | Community (details, join/leave, posts) |
| `/r/:slug/post/:id` | Post detail + comments |
| `/u/:userName` | Public profile |
| `/create` | Create post (**protected** — redirects to /login) |
| `/search?q=` | Search posts/communities |

## Auth model (web)

- **Access token** is held in memory only (`api/client.js`).
- **Refresh token** is an httpOnly cookie set by the backend; the browser sends
  it automatically because requests use `credentials: "include"`.
- On a 401 the client does one **silent refresh** (`POST /auth/refresh`) and
  retries; if that fails the user is signed out.
- On load it attempts a silent refresh so a returning user stays logged in.

> Note: the refresh cookie is `SameSite=Strict`, which works across
> `localhost:5173` ↔ `localhost:8777` (same site, different port). For a
> production deploy on different domains you'd switch to `SameSite=None; Secure`.
