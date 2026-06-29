import ApiError from "./apiError.util.js";

// Returns middleware that validates a request property (default req.body)
// against a Joi schema, strips unknown keys, and replaces it with the
// sanitized value. Validation failures become a 400 for the error handler.
export const validate =
  (schema, property = "body") =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(", ");
      return next(new ApiError(400, message));
    }

    req[property] = value;
    next();
  };
