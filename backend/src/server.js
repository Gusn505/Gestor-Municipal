// src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const prisma = require('./prismaClient'); // <-- Importa el cliente de Prisma
const authRoutes = require('./routes/auth.js');
const taskRoutes = require('./routes/tareas.js');
const directorRoutes = require('./routes/director.js');
const evidenciaRoutes = require('./routes/evidencias.js');
const adminRoutes = require('./routes/admin.js');
const swaggerUi = require('swagger-ui-express'); 
const swaggerSpec = require('./swaggerConfig');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

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

app.use('/api/auth', authRoutes);
app.use('/api/tareas', taskRoutes);
app.use('/api/director', directorRoutes);
app.use('/api/evidencias', evidenciaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// POST /api/tareas - Crear una nueva tarea


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));