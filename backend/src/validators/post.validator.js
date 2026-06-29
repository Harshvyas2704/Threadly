import Joi from "joi";
import { validate } from "../utils/validate.util.js";

const objectId = Joi.string().hex().length(24);

const createSchema = Joi.object({
  communityId: objectId.required(),
  title: Joi.string().trim().min(1).max(300).required(),
  body: Joi.string().max(10000).allow(""),
  type: Joi.string().valid("text", "link", "image").default("text"),
  // link/image posts must carry a URL in mediaUrl; text posts must not.
  mediaUrl: Joi.when("type", {
    is: Joi.valid("link", "image"),
    then: Joi.string().uri().required(),
    otherwise: Joi.string().allow("").default(""),
  }),
});

const updateSchema = Joi.object({
  title: Joi.string().trim().min(1).max(300),
  body: Joi.string().max(10000).allow(""),
  mediaUrl: Joi.string().uri().allow(""),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });

const voteSchema = Joi.object({
  value: Joi.number().valid(1, -1).required(),
});

export const validateCreatePost = validate(createSchema);
export const validateUpdatePost = validate(updateSchema);
export const validateVote = validate(voteSchema);
