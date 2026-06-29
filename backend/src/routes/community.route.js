import { Router } from "express";
import requireAuth, { optionalAuth } from "../middlewares/auth.middleware.js";
import {
  validateCreateCommunity,
  validateUpdateCommunity,
  validateUpdateMemberRole,
} from "../validators/community.validator.js";
import {
  listCommunities,
  createCommunity,
  getCommunity,
  updateCommunity,
  joinCommunity,
  leaveCommunity,
  listMembers,
  listCommunityPosts,
  listMyCommunities,
  updateMemberRole,
} from "../controllers/community.controller.js";

const router = Router();

// Authenticated: must be registered before "/:slug" so it isn't read as a slug.
router.get("/mine", requireAuth, listMyCommunities);

// Public reads
router.get("/", listCommunities);
router.get("/:slug", getCommunity);
router.get("/:slug/members", listMembers);
router.get("/:slug/posts", optionalAuth, listCommunityPosts);

// Authenticated writes
router.post("/", requireAuth, validateCreateCommunity, createCommunity);
router.put("/:slug", requireAuth, validateUpdateCommunity, updateCommunity);
router.post("/:slug/join", requireAuth, joinCommunity);
router.post("/:slug/leave", requireAuth, leaveCommunity);
router.put(
  "/:slug/members/:userId",
  requireAuth,
  validateUpdateMemberRole,
  updateMemberRole,
);

export default router;
