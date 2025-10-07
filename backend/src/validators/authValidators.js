// src/validators/authValidators.js
const { body } = require('express-validator');

const registerRules = [
  body('nombre', 'El nombre es obligatorio').notEmpty().trim(),
  body('email', 'El email no es válido').isEmail().normalizeEmail(),
  body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  body('telefono', 'El teléfono es opcional pero si se envía, debe ser válido').optional().isString().trim()
];

const loginRules = [
  body('email', 'El email no es válido').isEmail().normalizeEmail(),
  body('password', 'La contraseña no puede estar vacía').notEmpty()
];

module.exports = {
  registerRules,
  loginRules,
};