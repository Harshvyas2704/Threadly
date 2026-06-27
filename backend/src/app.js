import express from "express";

import autRouter from "./routes/auth.route.js";

const app = express();

// AUTH ROUTES
app.use("/user/v1", autRouter);

export default app;
