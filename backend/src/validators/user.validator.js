import Joi from "joi";
import { validate } from "../utils/validate.util.js";

// Both fields optional, but at least one must be present so PUT /me always
// carries an actual change. avatar may be cleared by passing "".
const updateMeSchema = Joi.object({
  bio: Joi.string().trim().max(300).allow(""),
  avatar: Joi.string().uri().allow(""),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });

export const validateUpdateMe = validate(updateMeSchema);
