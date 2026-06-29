import { Router } from "express";
import requireAuth, { optionalAuth } from "../middlewares/auth.middleware.js";
import {
  homeFeed,
  trendingFeed,
  activityFeed,
} from "../controllers/feed.controller.js";

const router = Router();

// Home feed is per-user, so it requires auth. Trending/activity are public.
router.get("/home", requireAuth, homeFeed);
router.get("/trending", optionalAuth, trendingFeed);
router.get("/activity", activityFeed);

export default router;
