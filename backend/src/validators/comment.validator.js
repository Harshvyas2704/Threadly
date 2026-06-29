import Joi from "joi";
import { validate } from "../utils/validate.util.js";

const objectId = Joi.string().hex().length(24);

const createSchema = Joi.object({
  body: Joi.string().trim().min(1).max(10000).required(),
  // omitted / null => top-level comment
  parentId: objectId.allow(null).default(null),
});

const updateSchema = Joi.object({
  body: Joi.string().trim().min(1).max(10000).required(),
});

const voteSchema = Joi.object({
  value: Joi.number().valid(1, -1).required(),
});

export const validateCreateComment = validate(createSchema);
export const validateUpdateComment = validate(updateSchema);
export const validateVoteComment = validate(voteSchema);
