// /routes/employeeRoutes.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');
const { checkIn, checkOut, registerInventory } = require('../controllers/employeeController');
const router = express.Router();

// 1. Proteger todas las rutas y restringir el rol
router.use(protect);
router.use(checkRole(['empleado'])); 

// Rutas de Asistencia
router.post('/check-in', checkIn);
router.put('/check-out', checkOut);

// Rutas de Inventario
router.put('/inventory', registerInventory);
// Añadir la ruta GET para que el empleado vea el historial
router.get('/inventory/history/:date', (req, res) => res.send('Endpoint de historial')); 


module.exports = router;