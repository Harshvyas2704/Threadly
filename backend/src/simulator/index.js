// Threadly activity simulator: a standalone process that keeps generating
// lifelike activity on a set of timers. Writes directly to the database.
//
//   npm run simulate              real timings (5 / 10 / 20 min)
//   SIM_SPEED=fast npm run simulate   ~120x faster, for quick verification
//
// Stop with Ctrl+C.
import "dotenv/config";

import mongoose from "mongoose";
import connectDB from "../config/connectDB.js";
import User from "../models/user.model.js";
import Community from "../models/community.model.js";
import {
  createUser,
  createCommunity,
  createPost,
  createComment,
} from "./actions.js";

const FAST = process.env.SIM_SPEED === "fast";
const SPEEDUP = FAST ? 120 : 1;

// Task cadence in minutes, scaled by the speed factor.
const everyMinutes = (minutes) => Math.max(500, (minutes * 60_000) / SPEEDUP);

const log = (msg) =>
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

// Run a task, swallowing/reporting errors so one bad tick never kills a timer.
const safely = (name, fn) => async () => {
  try {
    await fn(log);
  } catch (err) {
    log(`❌ ${name} failed: ${err.message}`);
  }
};

const timers = [];

const schedule = (name, fn, minutes) => {
  const ms = everyMinutes(minutes);
  timers.push(setInterval(safely(name, fn), ms));
  return ms;
};

// Make sure the post/comment tasks have something to act on right away.
const bootstrap = async () => {
  const users = await User.countDocuments();
  for (let i = users; i < 2; i++) await safely("user", createUser)();

  const communities = await Community.countDocuments();
  if (communities < 1) await safely("community", createCommunity)();
};

const start = async () => {
  await connectDB();
  log(`Simulator starting (${FAST ? "FAST test mode" : "real timings"})`);

  await bootstrap();

  const u = schedule("user", createUser, 20);
  const c = schedule("community", createCommunity, 10);
  const p = schedule("post", createPost, 5);
  const cm = schedule("comment", createComment, 5);

  const secs = (ms) => `${Math.round(ms / 1000)}s`;
  log(
    `Cadence — user: ${secs(u)}, community: ${secs(c)}, post: ${secs(p)}, comment: ${secs(cm)}`,
  );

  // Kick a post + comment shortly after launch so activity shows immediately.
  setTimeout(safely("post", createPost), 1500);
  setTimeout(safely("comment", createComment), 3000);
};

const shutdown = async () => {
  log("Stopping simulator…");
  timers.forEach(clearInterval);
  await mongoose.connection.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start().catch((err) => {
  console.error("Simulator failed to start:", err);
  process.exit(1);
});
