import { Router } from "express";
import { optionalAuth } from "../middlewares/auth.middleware.js";
import { search } from "../controllers/search.controller.js";

const router = Router();

// Public search across posts and communities (personalized votes if authed).
router.get("/", optionalAuth, search);

export default router;
