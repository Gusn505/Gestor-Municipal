// src/middleware/validationMiddleware.js
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next(); // Si no hay errores, continúa a la siguiente función (la lógica de la ruta)
  }

  // Si hay errores, los extraemos y los enviamos como respuesta
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

module.exports = validate;