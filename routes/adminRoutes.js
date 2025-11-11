const express = require('express');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

// Controladores
const { createAdminEmployee } = require('../controllers/userController');
const { 
    getPendingMayoreoOrders, 
    approveRejectOrder, 
    getInventoryReport, 
    getTiempoReport,
    createSucursal,
    // 🚨 1. AÑADE ESTAS DOS FUNCIONES (vienen de adminController)
    getDashboardStats,
    getPendingOrders
} = require('../controllers/adminController');

const router = express.Router();

// Middleware: Proteger todas las rutas de admin y restringir el rol
router.use(protect);
router.use(checkRole(['administrador'])); 

// --- Rutas de Gestión de Usuarios ---
router.route('/users').post(createAdminEmployee);

// --- Rutas de Pedidos de Mayoreo ---
router.route('/orders/mayoreo/pending').get(getPendingMayoreoOrders);
router.route('/orders/:id/action').put(approveRejectOrder); 

// --- Rutas de Reportes (KPIs y Auditoría) ---
router.route('/reports/inventory/:sucursalId/:date').get(getInventoryReport);
router.route('/reports/times/:sucursalId/:date').get(getTiempoReport);

// --- RUTA NUEVA: Gestión de Sucursales ---
router.route('/sucursales').post(createSucursal);

// 🚨 2. AÑADE ESTAS DOS RUTAS (para que el Dashboard no de 404)
// (No necesitan 'protect' o 'checkRole' porque ya están cubiertas por router.use() arriba)
router.route('/stats').get(getDashboardStats);
router.route('/orders').get(getPendingOrders);

module.exports = router;