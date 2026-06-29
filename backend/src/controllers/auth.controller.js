import User from "../models/user.model.js";
import ApiError from "../utils/apiError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token.util.js";
import {
  REFRESH_COOKIE_NAME,
  setRefreshCookie,
  clearRefreshCookie,
} from "../utils/cookie.util.js";
import { privateUser } from "../utils/userPresenter.util.js";

// Native apps (no cookie jar) identify themselves with this header. For them
// we return the refresh token in the body so it can be kept in secure storage.
const isMobileClient = (req) => req.headers["x-client-type"] === "mobile";

// A refresh token arrives via httpOnly cookie (web) or request body (mobile).
const readRefreshToken = (req) =>
  req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

// Issues a fresh access/refresh pair, persists the refresh token on the user,
// and sets the refresh cookie. Returns both tokens; callers decide whether to
// expose the refresh token in the body (mobile only).
const issueTokens = async (res, user) => {
  const accessToken = generateAccessToken(user._id, user.userName);
  const refreshToken = generateRefreshToken(user._id, user.userName);

  user.refreshTokens.push(refreshToken);
  await user.save();

  setRefreshCookie(res, refreshToken);
  return { accessToken, refreshToken };
};

// POST /auth/register
export const register = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { userName }] });
  if (existing) {
    const field = existing.email === email ? "email" : "userName";
    throw new ApiError(409, `${field} already exists`);
  }

  // passwordHash is hashed by the pre-save hook on the model.
  const user = await User.create({ userName, email, passwordHash: password });

  const { accessToken, refreshToken } = await issueTokens(res, user);

  return successResponse(
    res,
    "User registered successfully",
    {
      user: privateUser(user),
      accessToken,
      ...(isMobileClient(req) && { refreshToken }),
    },
    201,
  );
});

// POST /auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = await issueTokens(res, user);

  return successResponse(res, "Logged in successfully", {
    user: privateUser(user),
    accessToken,
    ...(isMobileClient(req) && { refreshToken }),
  });
});

// POST /auth/logout
export const logout = asyncHandler(async (req, res) => {
  const token = readRefreshToken(req);

  // Best-effort: drop this token from whichever user holds it.
  if (token) {
    await User.updateOne(
      { refreshTokens: token },
      { $pull: { refreshTokens: token } },
    );
  }

  clearRefreshCookie(res);
  return successResponse(res, "Logged out successfully");
});

// POST /auth/refresh — rotates the refresh token on every use.
export const refresh = asyncHandler(async (req, res) => {
  const token = readRefreshToken(req);
  if (!token) {
    throw new ApiError(401, "Refresh token missing");
  }

  // Throws (-> 401) if the signature is invalid or the token is expired.
  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded._id);
  if (!user || !user.refreshTokens.includes(token)) {
    // Token is valid but unknown — treat as compromised/reused.
    throw new ApiError(401, "Invalid refresh token");
  }

  // Rotate: remove the used token, issue a new pair.
  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  const { accessToken, refreshToken } = await issueTokens(res, user);

  return successResponse(res, "Token refreshed successfully", {
    accessToken,
    ...(isMobileClient(req) && { refreshToken }),
  });
});
