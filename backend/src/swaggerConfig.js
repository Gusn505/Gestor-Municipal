// src/swaggerConfig.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestor Municipal',
      version: '1.0.0',
      description: 'Documentación de la API para el sistema de gestión de reportes municipales.',
    },
    servers: [
      {
        url: 'http://localhost:4000/api',
      },
    ],
  },
  // Apunta a los archivos donde tienes tus rutas documentadas
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;