// src/routes/admin.js
const router = require('express').Router();
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/auth.js');

/**
 * GET /api/admin/tareas
 * Obtiene absolutamente todas las tareas del sistema.
 * Solo accesible para roles de 'presidente' o 'admin'.
 */
router.get('/tareas', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    // 1. Verificación de Permisos (Rol)
    if (user.rol !== 'presidente' && user.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Permisos insuficientes.' });
    }

    // 2. Buscar todas las tareas sin ningún filtro
    const todasLasTareas = await prisma.tarea.findMany({
      include: {
        departamento: { // Incluimos el nombre del departamento
          select: {
            nombre: true,
          }
        },
        ciudadano: { // Incluimos el nombre de quien reportó
          select: {
            nombre: true,
          }
        }
      },
      orderBy: {
        creadoEn: 'desc' // Ordenamos por las más recientes primero
      }
    });

    res.json(todasLasTareas);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron obtener todas las tareas.' });
  }
});

module.exports = router;