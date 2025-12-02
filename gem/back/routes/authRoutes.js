// /routes/authRoutes.js
const express = require('express');

// --- IMPORTACIONES ---
// 🚨 CORRECCIÓN: Asegúrate de que 'googleLogin' esté dentro de estas llaves {}
const { registerUser, loginUser, getMe, googleLogin } = require('../controllers/authController'); 
const { protect } = require('../middleware/auth'); 

const router = express.Router();

// --- RUTAS PÚBLICAS ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// ✅ Nueva ruta para Google (Ahora sí funcionará porque la importamos arriba)
router.post('/google', googleLogin);

// --- RUTA PRIVADA ---
router.get('/me', protect, getMe); 

module.exports = router;