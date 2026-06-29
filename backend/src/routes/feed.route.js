import { Router } from "express";
import requireAuth from "../middlewares/auth.middleware.js";
import { homeFeed, trendingFeed } from "../controllers/feed.controller.js";

const router = Router();

// Home feed is per-user, so it requires auth. Trending is public.
router.get("/home", requireAuth, homeFeed);
router.get("/trending", trendingFeed);

export default router;
