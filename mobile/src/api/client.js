import { API_BASE_URL } from "../config";

// In-memory token state for the API client. AuthContext keeps these in sync and
// registers callbacks so the client can persist rotated tokens / force logout.
let accessToken = null;
let refreshToken = null;
let onTokensRefreshed = async () => {};
let onAuthFailure = async () => {};

const baseHeaders = {
  "Content-Type": "application/json",
  "X-Client-Type": "mobile",
};

export const setClientTokens = (at, rt) => {
  accessToken = at;
  refreshToken = rt;
};

export const configureClient = ({ onTokens, onLogout } = {}) => {
  if (onTokens) onTokensRefreshed = onTokens;
  if (onLogout) onAuthFailure = onLogout;
};

const rawFetch = (path, { method = "GET", body, auth = true } = {}) => {
  const headers = { ...baseHeaders };
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
};

// Single-flight refresh so concurrent 401s don't fire multiple refreshes.
let refreshing = null;

const doRefresh = async () => {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify({ refreshToken }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return false;
    accessToken = json.data.accessToken;
    if (json.data.refreshToken) refreshToken = json.data.refreshToken;
    await onTokensRefreshed(accessToken, refreshToken);
    return true;
  } catch {
    return false;
  }
};

export const api = async (path, options = {}) => {
  let res = await rawFetch(path, options);

  // Access token expired — try one silent refresh + retry.
  if (res.status === 401 && options.auth !== false) {
    if (!refreshing) refreshing = doRefresh().finally(() => (refreshing = null));
    const ok = await refreshing;
    if (ok) {
      res = await rawFetch(path, options);
    } else {
      await onAuthFailure();
    }
  }

  const json = await res
    .json()
    .catch(() => ({ success: false, message: "Network error", data: null }));

  if (!res.ok || !json.success) {
    const err = new Error(json.message || "Request failed");
    err.status = res.status;
    if (json.retryAfter) err.retryAfter = json.retryAfter;
    throw err;
  }
  return json.data;
};
