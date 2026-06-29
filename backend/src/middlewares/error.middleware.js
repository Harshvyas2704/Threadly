import { errorResponse } from "../utils/response.util.js";
import ApiError from "../utils/apiError.util.js";

// 404 for any unmatched route.
export const notFound = (req, res) => {
  return errorResponse(res, `Route not found: ${req.originalUrl}`, 404);
};

// Centralized error handler — the single place that turns thrown errors into
// the standard error response shape.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Mongoose duplicate key (e.g. email/userName already taken)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field} already exists`;
  }

  // Malformed ObjectId in a route param/query (e.g. /posts/not-an-id)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Invalid / expired JWT
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  if (!(err instanceof ApiError) && statusCode === 500) {
    console.error("[UNHANDLED ERROR]", err);
  }

  return errorResponse(res, message, statusCode);
};
