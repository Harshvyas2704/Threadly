async function authValidation(req, res, next) {
  try {
    next();
  } catch (error) {}
}

export default authValidation;
