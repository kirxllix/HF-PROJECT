// /routes/authRoutes.js
const express = require('express');

// --- IMPORTACIONES ---
// Importa los controladores
const { registerUser, loginUser, getMe } = require('../controllers/authController'); 
// Importa el middleware de seguridad
const { protect } = require('../middleware/auth'); 

const router = express.Router();

// --- RUTAS PÚBLICAS ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- RUTA PRIVADA (NUEVA) ---
// Esta ruta requiere un token JWT (usando el middleware 'protect')
// GET /api/v1/auth/me
router.get('/me', protect, getMe); 

module.exports = router;