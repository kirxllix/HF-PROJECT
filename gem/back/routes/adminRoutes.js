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
    getDashboardStats,
    getPendingOrders,
    getSucursales,
    getPromotions,
    createPromotion,
    updatePromotion,
    togglePromotionActive,
    getPendingReviews,
    moderateReview,
    createProduct,   
    updateProduct,   
    archiveProduct,
    getAllProducts
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
router.route('/sucursales')
    .post(createSucursal)
    .get(getSucursales);
    
// 🚨 2. AÑADE ESTAS DOS RUTAS (para que el Dashboard no de 404)
// (No necesitan 'protect' o 'checkRole' porque ya están cubiertas por router.use() arriba)
router.route('/stats').get(getDashboardStats);
router.route('/orders/pending').get(getPendingOrders);

// --- Rutas de Gestión de Promociones ---
// (Coinciden con api/promotionService.js)
router.route('/promotions')
    .get(getPromotions)
    .post(createPromotion);

router.route('/promotions/:id')
    .put(updatePromotion);
    
router.route('/promotions/:id/toggle')
    .put(togglePromotionActive);

// --- Rutas de Moderación de Reseñas ---
// (Coinciden con api/reviewService.js)
router.route('/reviews/pending')
    .get(getPendingReviews);
    
router.route('/reviews/:id/status')
    .put(moderateReview);

    // --- Rutas de Gestión de Productos ---
router.route('/products')
    .post(createProduct)
    .get(getAllProducts);

router.route('/products/:id')
    .put(updateProduct);
    
router.route('/products/:id/archive')
    .put(archiveProduct);
    
module.exports = router;