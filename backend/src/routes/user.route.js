import { Router } from "express";
import requireAuth from "../middlewares/auth.middleware.js";
import { validateUpdateMe } from "../validators/user.validator.js";
import {
  getMe,
  updateMe,
  getPublicProfile,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, validateUpdateMe, updateMe);

// Public profile — keep last so it doesn't shadow /me.
router.get("/:userName", getPublicProfile);

export default router;
