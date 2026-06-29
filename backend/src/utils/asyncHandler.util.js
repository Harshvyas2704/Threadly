// Wraps an async controller so any rejected promise is forwarded to the
// centralized error handler instead of needing try/catch in every controller.
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export default asyncHandler;
