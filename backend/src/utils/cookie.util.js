// Single source of truth for the refresh-token cookie so register/login,
// refresh, and logout all stay in sync.
export const REFRESH_COOKIE_NAME = "refreshToken";

// 10 days, matching REFRESH_TOKEN_EXPIRY in .env
const REFRESH_COOKIE_MAX_AGE = 10 * 24 * 60 * 60 * 1000;

export const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: REFRESH_COOKIE_MAX_AGE,
});

export const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions());
};

export const clearRefreshCookie = (res) => {
  // maxAge omitted on clear so the browser drops the cookie immediately
  const { maxAge, ...options } = refreshCookieOptions();
  res.clearCookie(REFRESH_COOKIE_NAME, options);
};
