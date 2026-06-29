# Threadly Mobile (Expo)

React Native app (Expo SDK 54) for the Threadly backend. Uses **React
Navigation** (navigation-flow auth gating, bottom tabs + native stacks) — not
file-based routing.

## Run

1. **Start the backend** (from `../backend`):
   ```bash
   npm run dev
   ```
   It must be reachable from your phone over Wi-Fi. The app auto-detects the
   dev-machine IP from Expo; a fallback is hardcoded in [src/config.js](src/config.js).

2. **Start Expo** (from this folder):
   ```bash
   npm start
   ```
   Scan the QR code with **Expo Go** on your phone. The phone and your Mac must
   be on the **same Wi-Fi network**.

> If the app can't reach the API, set your Mac's LAN IP in
> `src/config.js` (`FALLBACK_HOST`).

## Test accounts (from backend seed)

`npm run seed` in the backend creates:

| email | password |
|-------|----------|
| alice@threadly.dev | password123 |
| bob@threadly.dev | password123 |
| carol@threadly.dev | password123 |

## Structure

```
src/
  api/          API client (silent token refresh) + per-resource calls
  context/      AuthContext — tokens in SecureStore, auth-state gating
  navigation/   Root -> Auth | Main(tabs: Home/Search/Create/Profile)
  screens/      Login, Register, HomeFeed, Search, CreatePost, Profile,
                PostDetail, Community
  components/   PostCard, CommentItem, shared UI
  storage/      SecureStore token persistence
```

## Auth model

- Access + refresh tokens are stored in **expo-secure-store**.
- The app sends `X-Client-Type: mobile`, so the backend returns the refresh
  token in the body (instead of the web httpOnly cookie).
- On a 401 the client does a single silent refresh and retries; if refresh
  fails it signs out.
