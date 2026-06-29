import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import apiRouter from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Core middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
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
