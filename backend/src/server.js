// src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const prisma = require('./prismaClient'); // <-- Importa el cliente de Prisma

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true }));

// Ruta de ping actualizada para usar Prisma
app.get('/api/ping-db', async (req, res) => {
  try {
    // prisma.$queryRaw es para ejecutar SQL puro
    const now = await prisma.$queryRaw`SELECT NOW()`;
    res.json({ db: now[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error', detail: err.message });
  }
});

// Nueva ruta para listar los departamentos usando el ORM de Prisma
app.get('/api/departamentos', async (req, res) => {
  try {
    const deps = await prisma.departamento.findMany(); // <-- ¡Magia de Prisma!
    res.json(deps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error', detail: err.message });
  }
});

// POST /api/tareas - Crear una nueva tarea
app.post('/api/tareas', async (req, res) => {
  try {
    const {
      titulo, descripcion, departamentoId,
      nombreSolicitante, direccionSolicitante, telefonoSolicitante, fechaLimite, ciudadanoId
    } = req.body;

    // Generar un número de referencia único y simple
    const referencia = 'GEST-' + Date.now();

    const tarea = await prisma.tarea.create({
      data: {
        referencia,
        titulo,
        descripcion,
        // Así se conectan las relaciones en Prisma
        departamento: { connect: { id: departamentoId } },
        ciudadano: ciudadanoId ? { connect: { id: ciudadanoId } } : undefined,
        nombreSolicitante,
        direccionSolicitante,
        telefonoSolicitante,
        fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
      }
    });

    // Crear el primer registro en el historial para esta tarea
    await prisma.historialTarea.create({
      data: {
        tarea: { connect: { id: tarea.id } },
        estadoAnterior: null, // No hay estado anterior, es la creación
        estadoNuevo: 'pendiente',
        nota: 'Reporte creado',
      }
    });

    // Devolver la tarea creada con un código 201 (Created)
    res.status(201).json(tarea);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo crear la tarea', detail: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));