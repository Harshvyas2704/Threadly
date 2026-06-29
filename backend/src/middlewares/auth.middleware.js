import ApiError from "../utils/apiError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { verifyAccessToken } from "../utils/token.util.js";

// Protects routes by requiring a valid access token in the Authorization
// header. Attaches the decoded payload to req.user.
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  // jwt.verify is synchronous; it throws on invalid/expired tokens, which the
  // centralized error handler maps to 401.
  const decoded = verifyAccessToken(token);
  req.user = { _id: decoded._id, userName: decoded.userName };
  next();
});

export default requireAuth;
