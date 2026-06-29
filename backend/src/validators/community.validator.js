import Joi from "joi";
import { validate } from "../utils/validate.util.js";

const createSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).required(),
  description: Joi.string().trim().min(1).max(500).required(),
  avatar: Joi.string().uri().allow(""),
  banner: Joi.string().uri().allow(""),
});

// Name/slug are immutable after creation; only presentational fields change.
const updateSchema = Joi.object({
  description: Joi.string().trim().min(1).max(500),
  avatar: Joi.string().uri().allow(""),
  banner: Joi.string().uri().allow(""),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });

// Owner can assign these roles to a member; "owner" is excluded so a community
// never ends up with two owners via this endpoint.
const updateRoleSchema = Joi.object({
  role: Joi.string().valid("moderator", "member", "banned").required(),
});

export const validateCreateCommunity = validate(createSchema);
export const validateUpdateCommunity = validate(updateSchema);
export const validateUpdateMemberRole = validate(updateRoleSchema);
