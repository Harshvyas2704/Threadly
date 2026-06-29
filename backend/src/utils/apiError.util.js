// Lightweight error type so controllers/services can throw with a status code
// and let the centralized error handler shape the response.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
