import { Router } from "express";
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import communityRouter from "./community.route.js";
import postRouter from "./post.route.js";
import commentRouter from "./comment.route.js";
import feedRouter from "./feed.route.js";
import searchRouter from "./search.route.js";

// Aggregates all v1 routers. Mounted at /api/v1 in app.js.
const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/communities", communityRouter);
router.use("/posts", postRouter);
router.use("/feed", feedRouter);
router.use("/search", searchRouter);
// Carries full paths (/posts/:postId/comments and /comments/...).
router.use("/", commentRouter);

export default router;
