// src/routes/auth.js
const router = require('express').Router();
const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { registerRules, loginRules } = require('../validators/authValidators');
const validate = require('../middleware/validationMiddleware');

// POST /api/auth/register - Para registrar un nuevo usuario
router.post('/register', registerRules, validate, async (req, res) => {
  try {
    const { nombre, email, password, telefono } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        nombre,
        email,
        passwordHash,
        telefono,
        rol: "ciudadano",
      },
    });

    const { passwordHash: _, ...userSinPassword } = newUser;
    res.status(201).json(userSinPassword);

  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: "El correo electrónico ya está registrado." });
    }
    console.error(err);
    res.status(500).json({ error: "No se pudo registrar el usuario", detail: err.message });
  }
});

router.post('/login', loginRules, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      rol: user.rol,
      departamentoId: user.departamentoId,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Inicio de sesión exitoso',
      token: token,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

module.exports = router;