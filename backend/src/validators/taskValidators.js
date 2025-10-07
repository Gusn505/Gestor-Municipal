// src/validators/taskValidators.js
const { body } = require('express-validator');

const createTaskRules = [
  body('titulo', 'El título de la tarea es obligatorio').notEmpty().trim(),

  body('departamentoId', 'Debes seleccionar un departamento').notEmpty().trim(),
  body('departamentoId', 'El ID del departamento no es válido').isUUID(),

  body('nombreSolicitante', 'El nombre del solicitante es obligatorio').notEmpty().trim(),

  // Campos opcionales
  body('descripcion').optional().trim(),
  body('direccionSolicitante').optional().trim(),
  body('telefonoSolicitante').optional().trim(),
];

module.exports = {
  createTaskRules,
};