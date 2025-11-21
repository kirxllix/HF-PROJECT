// /routes/employeeRoutes.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');
const { 
    checkIn, 
    checkOut, 
    registerInventory, 
    getPendingOrdersBySucursal, 
    getTodayInventory,
    checkInByPin,  
    checkOutByPin,
    updateOrderStatus // ✅ 1. Importar la nueva función
} = require('../controllers/employeeController');

const router = express.Router();

// 1. Proteger todas las rutas y restringir el rol
router.use(protect);
router.use(checkRole(['empleado'])); 

// Rutas de Asistencia
router.post('/check-in', checkIn);
router.put('/check-out', checkOut);
router.post('/check-in-pin', checkInByPin);
router.put('/check-out-pin', checkOutByPin);

// Rutas de Inventario
router.post('/inventory', registerInventory);
router.get('/inventory/today', getTodayInventory); 
router.get('/inventory/history/:date', (req, res) => res.send('Endpoint de historial')); 

// Rutas de Pedidos
router.get('/orders/pending', getPendingOrdersBySucursal);
router.put('/orders/:id/status', updateOrderStatus); // ✅ 2. Añadir la nueva ruta PUT

module.exports = router;