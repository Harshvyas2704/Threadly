import { Router } from "express";
import requireAuth from "../middlewares/auth.middleware.js";
import {
  validateCreatePost,
  validateUpdatePost,
  validateVote,
} from "../validators/post.validator.js";
import {
  createPost,
  getPost,
  updatePost,
  deletePost,
  votePost,
} from "../controllers/post.controller.js";
import {
  postRateLimit,
  voteRateLimit,
} from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/", requireAuth, postRateLimit, validateCreatePost, createPost);
router.get("/:id", getPost);
router.put("/:id", requireAuth, validateUpdatePost, updatePost);
router.delete("/:id", requireAuth, deletePost);
router.post("/:id/vote", requireAuth, voteRateLimit, validateVote, votePost);

export default router;
