import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import apiRouter from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Core middleware
// Credentialed CORS (httpOnly refresh cookie) can't use a wildcard origin, so
// we reflect any origin listed in CORS_ORIGIN (comma-separated). Requests with
// no Origin header (curl, mobile) are allowed through.
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (no Origin) and configured origins. For any
      // other origin, just withhold the CORS headers (browser blocks it) rather
      // than throwing a 500.
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "OK", data: null });
});

// API v1 routes
app.use("/api/v1", apiRouter);

// 404 + centralized error handler (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
