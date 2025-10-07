// src/uploadConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Directorio donde se guardarán las evidencias
const uploadDir = path.join(__dirname, '..', 'uploads');

// Asegurarse de que el directorio de subidas exista
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Le decimos que guarde los archivos en la carpeta 'uploads'
  },
  filename: function (req, file, cb) {
    // Creamos un nombre de archivo único para evitar que se sobreescriban
    // Ejemplo: 1759435200000-evidencia-bache.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = upload;