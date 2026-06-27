import { Router } from "express";
import authValidation from "../validators/auth.validator.js";
import { authController } from "../controllers/auth.controller.js";

const route = Router();

route.post("/register", [authValidation], authController);

export default route;
