// src/routes/evidencias.js
const router = require('express').Router();
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/auth.js');
const upload = require('../uploadConfig'); // <-- Importamos nuestra configuración de Multer

/**
 * POST /api/evidencias/upload/:tareaId
 * Sube un archivo de evidencia para una tarea específica.
 */
router.post('/upload/:tareaId', authMiddleware, upload.single('evidencia'), async (req, res) => {
  try {
    const { tareaId } = req.params;
    const user = req.user;

    // Verificar que el archivo se subió
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }

    // Aquí guardamos la información del archivo en la base de datos
    const nuevaEvidencia = await prisma.evidencia.create({
      data: {
        tareaId: tareaId,
        url: `/uploads/${req.file.filename}`, // Guardamos la ruta relativa al archivo
        descripcion: req.body.descripcion || 'Evidencia adjunta',
        subidoPorId: user.userId
      }
    });

    res.status(201).json(nuevaEvidencia);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al subir la evidencia.' });
  }
});

module.exports = router;