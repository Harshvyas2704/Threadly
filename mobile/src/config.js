import Constants from "expo-constants";

// Hardcoded fallback (your Mac's LAN IP). Change this if your network changes
// and the auto-detection below doesn't apply.
const FALLBACK_HOST = "10.172.149.35";
const PORT = 8777;

// In Expo Go the bundle is served from your dev machine, so the host portion of
// hostUri is the Mac's LAN IP — the same machine the backend runs on. We reuse
// it so the app finds the API automatically on a physical device without edits.
const hostUri =
  Constants.expoConfig?.hostUri ||
  Constants.expoGoConfig?.debuggerHost ||
  Constants.manifest?.debuggerHost ||
  "";

const host = hostUri.split(":")[0] || FALLBACK_HOST;

export const API_BASE_URL = `http://${host}:${PORT}/api/v1`;
