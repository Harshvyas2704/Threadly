import Joi from "joi";
import { validate } from "../utils/validate.util.js";

const registerSchema = Joi.object({
  userName: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const validateRegister = validate(registerSchema);
export const validateLogin = validate(loginSchema);
