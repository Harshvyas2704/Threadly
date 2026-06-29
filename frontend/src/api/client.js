import { API_BASE_URL } from "../config";

// Web auth model: the access token lives only in memory (this module), and the
// refresh token is an httpOnly cookie the browser sends automatically when we
// use `credentials: "include"`. On a 401 we silently refresh once and retry.

let accessToken = null;
let onAuthFailure = async () => {};

export const setAccessToken = (token) => {
  accessToken = token;
};

export const configureClient = ({ onLogout } = {}) => {
  if (onLogout) onAuthFailure = onLogout;
};

const rawFetch = (path, { method = "GET", body, auth = true } = {}) => {
  const headers = { "Content-Type": "application/json" };
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: "include", // send/receive the refresh cookie
    body: body ? JSON.stringify(body) : undefined,
  });
};

// Single-flight refresh so parallel 401s trigger only one refresh call.
let refreshing = null;

const doRefresh = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return false;
    accessToken = json.data.accessToken;
    return true;
  } catch {
    return false;
  }
};

export const api = async (path, options = {}) => {
  let res = await rawFetch(path, options);

  if (res.status === 401 && options.auth !== false) {
    if (!refreshing) refreshing = doRefresh().finally(() => (refreshing = null));
    const ok = await refreshing;
    if (ok) {
      res = await rawFetch(path, options);
    } else {
      accessToken = null;
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
