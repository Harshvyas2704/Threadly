import { Router } from "express";
import requireAuth, { optionalAuth } from "../middlewares/auth.middleware.js";
import {
  validateCreateComment,
  validateUpdateComment,
  validateVoteComment,
} from "../validators/comment.validator.js";
import {
  listComments,
  createComment,
  updateComment,
  deleteComment,
  voteComment,
} from "../controllers/comment.controller.js";
import {
  commentRateLimit,
  voteRateLimit,
} from "../middlewares/rateLimit.middleware.js";

// Mounted at /api/v1 — routes carry their own full paths since comments are
// addressed both under a post and on their own.
const router = Router();

router.get("/posts/:postId/comments", optionalAuth, listComments);
router.post(
  "/posts/:postId/comments",
  requireAuth,
  commentRateLimit,
  validateCreateComment,
  createComment,
);
router.put("/comments/:id", requireAuth, validateUpdateComment, updateComment);
router.delete("/comments/:id", requireAuth, deleteComment);
router.post(
  "/comments/:id/vote",
  requireAuth,
  voteRateLimit,
  validateVoteComment,
  voteComment,
);

export default router;
