// src/middleware/auth.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // 1. Obtener el token del header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.sendStatus(401); // Unauthorized (No hay token)
  }

  // 2. Verificar el token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden (El token no es válido)
    }

    // 3. Si el token es válido, adjuntamos el usuario a la request
    req.user = user;
    next(); // Pasa al siguiente middleware o a la ruta final
  });
}

module.exports = authMiddleware;