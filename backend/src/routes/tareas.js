// src/routes/tareas.js
const router = require('express').Router();
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/auth.js');
const { createTaskRules } = require('../validators/taskValidators'); // <-- 1. IMPORTA REGLAS
const validate = require('../middleware/validationMiddleware');     // <-- 2. IMPORTA MIDDLEWARE


// **NOTA IMPORTANTE:**
// Este código ASUME que TODAS las rutas de tareas son para usuarios logueados.
// Por eso movemos el middleware aquí, para que aplique a TODO el archivo.
// Si tuvieras rutas públicas y privadas en el mismo archivo, lo aplicarías ruta por ruta.

// Ruta para crear una nueva tarea (la movimos aquí para unificar)
router.post('/', authMiddleware, createTaskRules, validate, async (req, res) => {
  try {
    const {
      titulo, descripcion, departamentoId,
      nombreSolicitante, direccionSolicitante, telefonoSolicitante, fechaLimite
    } = req.body;

    const ciudadanoId = req.user.userId;
    const referencia = 'GEST-' + Date.now();

    const tarea = await prisma.tarea.create({
      data: {
        referencia,
        titulo,
        descripcion,
        departamento: { connect: { id: departamentoId } },
        ciudadano: { connect: { id: ciudadanoId } },
        nombreSolicitante,
        direccionSolicitante,
        telefonoSolicitante,
        fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
      }
    });

    await prisma.historialTarea.create({
      data: {
        tarea: { connect: { id: tarea.id } },
        estadoNuevo: 'pendiente',
        nota: 'Reporte creado por ciudadano.',
        cambiadoPor: { connect: { id: ciudadanoId } }
      }
    });

    res.status(201).json(tarea);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo crear la tarea', detail: err.message });
  }
});

// Ruta para obtener las tareas del usuario logueado (la movimos aquí)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const tareas = await prisma.tarea.findMany({
      where: { ciudadanoId: userId },
      include: { departamento: { select: { nombre: true } } }
    });
    res.json(tareas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron obtener las tareas' });
  }
});

// --- NUEVAS RUTAS ---

/**
 * GET /api/tareas/:id
 * Devuelve el detalle de una tarea específica.
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const tarea = await prisma.tarea.findUnique({
      where: { id: id },
      include: {
        evidencias: true,
        historial: { orderBy: { creadoEn: 'asc' } },
        departamento: true,
        ciudadano: { select: { id: true, nombre: true, email: true, telefono: true } }
      }
    });

    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Lógica de permisos
    const esAdminOPresidente = user.rol === 'admin' || user.rol === 'presidente';
    const esDirectorDelDepto = user.rol === 'director' && user.departamentoId === tarea.departamentoId;
    const esElCiudadanoDueño = user.rol === 'ciudadano' && user.userId === tarea.ciudadanoId;

    if (esAdminOPresidente || esDirectorDelDepto || esElCiudadanoDueño) {
      return res.json(tarea);
    }

    // Si no cumple ninguna condición, no está autorizado
    return res.status(403).json({ error: 'No autorizado para ver esta tarea' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/tareas/:id
 * Actualiza una tarea.
 */
router.put('/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const { estado, nota } = req.body; // Solo permitiremos cambiar el estado y añadir una nota
  
      const tareaExistente = await prisma.tarea.findUnique({ where: { id } });
  
      if (!tareaExistente) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }

  
      // Lógica de permisos (solo un director del depto o admin/presidente puede cambiar estado)
      const esAdminOPresidente = user.rol === 'admin' || user.rol === 'presidente';
      const esDirectorDelDepto = user.rol === 'director' && user.departamentoId === tareaExistente.departamentoId;
  
      if (!esAdminOPresidente && !esDirectorDelDepto) {
        return res.status(403).json({ error: 'No autorizado para actualizar esta tarea' });
      }
  
      // Validar que el nuevo estado sea uno de los permitidos
      const estadosPermitidos = ['pendiente', 'en_proceso', 'cumplido'];
      if (estado && !estadosPermitidos.includes(estado)) {
        return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${estadosPermitidos.join(', ')}` });
      }
  
      // Actualizar la tarea
      const tareaActualizada = await prisma.tarea.update({
        where: { id: id },
        data: {
          estado: estado,
          // Si el nuevo estado es 'cumplido', actualizamos la fecha de cumplimiento
          fechaCumplido: estado === 'cumplido' ? new Date() : null
        },
      });
  
      // Registrar el cambio en el historial
      if (estado && estado !== tareaExistente.estado) {
        await prisma.historialTarea.create({
          data: {
            tareaId: id,
            estadoAnterior: tareaExistente.estado,
            estadoNuevo: estado,
            cambiadoPorId: user.userId,
            nota: nota || `Estado cambiado a ${estado}`
          }
        });
      }
  
      res.json(tareaActualizada);
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error actualizando la tarea' });
    }
  });

/**
 * DELETE /api/tareas/:id
 * Elimina una tarea.
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
  
      const tarea = await prisma.tarea.findUnique({ where: { id } });
  
      if (!tarea) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
  
      // Permisos: Solo el ciudadano que la creó o un admin/presidente pueden borrarla.
      const esAdminOPresidente = user.rol === 'admin' || user.rol === 'presidente';
      const esElCiudadanoDueño = user.rol === 'ciudadano' && user.userId === tarea.ciudadanoId;
  
      if (!esAdminOPresidente && !esElCiudadanoDueño) {
        return res.status(403).json({ error: 'No autorizado para eliminar esta tarea' });
      }
  
      await prisma.tarea.delete({
        where: { id: id },
      });
  
      res.json({ message: 'Tarea eliminada exitosamente' });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error eliminando la tarea' });
    }
  });


module.exports = router;