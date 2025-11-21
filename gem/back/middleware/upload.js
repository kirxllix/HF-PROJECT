const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Definir la ruta ABSOLUTA a la carpeta uploads
// Esto navega desde 'middleware' hacia atrás (..) y entra a 'uploads'
const uploadDir = path.join(__dirname, '../uploads');

// 2. Crear la carpeta si no existe (automáticamente)
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Carpeta 'uploads' creada automáticamente en:", uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        // Limpiar nombre de archivo de caracteres raros
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'img-' + uniqueSuffix + path.extname(cleanName));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        console.log("⚠️ Archivo rechazado (no es imagen):", file.originalname);
        cb(new Error('Solo se permiten imágenes'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;