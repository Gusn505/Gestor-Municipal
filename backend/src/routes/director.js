// src/routes/director.js
const router = require('express').Router();
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/auth.js');

/**
 * GET /api/director/tareas
 * Obtiene todas las tareas asignadas al departamento del director logueado.
 * Solo accesible para roles de 'director', 'presidente' o 'admin'.
 */
router.get('/tareas', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    // 1. Verificación de Permisos (Rol)
    if (user.rol !== 'director' && user.rol !== 'presidente' && user.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Permisos insuficientes.' });
    }

    // 2. Obtener el ID del departamento del token del director
    const departamentoId = user.departamentoId;
    if (!departamentoId) {
      return res.status(400).json({ error: 'El usuario no está asociado a ningún departamento.' });
    }

    // 3. Buscar todas las tareas de ese departamento
    const tareasDelDepartamento = await prisma.tarea.findMany({
      where: {
        departamentoId: departamentoId,
      },
      include: {
        ciudadano: { // Incluimos info básica de quién reportó
          select: {
            nombre: true,
            telefono: true
          }
        }
      },
      orderBy: {
        creadoEn: 'desc' // Ordenamos por las más recientes primero
      }
    });

    res.json(tareasDelDepartamento);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron obtener las tareas del departamento.' });
  }
});

module.exports = router;