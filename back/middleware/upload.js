const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Definir la ruta ABSOLUTA a la carpeta uploads
const uploadDir = path.join(__dirname, '../uploads');

// 2. Crear la carpeta si no existe (Robustez)
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Carpeta 'uploads' creada automáticamente en:", uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        // Limpiar nombre y agregar timestamp único
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'img-' + uniqueSuffix + path.extname(cleanName));
    }
});

const fileFilter = (req, file, cb) => {
    // Filtro básico de seguridad
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;