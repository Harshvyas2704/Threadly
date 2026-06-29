import { Router } from "express";
import {
  validateRegister,
  validateLogin,
} from "../validators/auth.validator.js";
import {
  register,
  login,
  logout,
  refresh,
} from "../controllers/auth.controller.js";
import { loginRateLimit } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", loginRateLimit, validateLogin, login);
router.post("/logout", logout);
router.post("/refresh", refresh);

export default router;
