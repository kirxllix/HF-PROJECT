const express = require('express');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');
// ✅ 1. IMPORTAR UPLOAD (Esto faltaba)
const upload = require('../middleware/upload'); 

const { 
    createAdminEmployee, getAllStaff, updateStaff, deleteStaff 
} = require('../controllers/userController');

const { 
    getPendingMayoreoOrders, approveRejectOrder, 
    getInventoryReport, getTiempoReport,
    createSucursal, getDashboardStats, getPendingOrders, getSucursales,
    getPromotions, createPromotion, updatePromotion, togglePromotionActive, deletePromotion,
    getPendingReviews, moderateReview,
    createProduct, updateProduct, archiveProduct, getAllProducts, deleteProduct,
    updateSucursal, deleteSucursal
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect);
router.use(checkRole(['administrador'])); 

// ... (Rutas de usuarios, órdenes, reportes, sucursales, stats, promociones y reviews IGUALES) ...
router.route('/users').post(createAdminEmployee).get(getAllStaff);
router.route('/users/:id').put(updateStaff).delete(deleteStaff);
router.route('/orders/mayoreo/pending').get(getPendingMayoreoOrders);
router.route('/orders/:id/action').put(approveRejectOrder); 
router.route('/reports/inventory/:sucursalId/:date').get(getInventoryReport);
router.route('/reports/times/:sucursalId/:date').get(getTiempoReport);
router.route('/sucursales').post(createSucursal).get(getSucursales);
router.route('/sucursales/:id').put(updateSucursal).delete(deleteSucursal);
router.route('/stats').get(getDashboardStats);
router.route('/orders/pending').get(getPendingOrders);
router.route('/promotions').get(getPromotions).post(createPromotion);
router.route('/promotions/:id').put(updatePromotion).delete(deletePromotion);
router.route('/promotions/:id/toggle').put(togglePromotionActive);
router.route('/reviews/pending').get(getPendingReviews);
router.route('/reviews/:id/status').put(moderateReview);

// ✅ 2. RUTAS DE PRODUCTOS CORREGIDAS (Con upload.single)
router.route('/products')
    .post(upload.single('imagen'), createProduct) // <--- ¡IMPORTANTE!
    .get(getAllProducts);

router.route('/products/:id')
    .put(upload.single('imagen'), updateProduct)  // <--- ¡IMPORTANTE!
    .delete(deleteProduct);
    
router.route('/products/:id/archive').put(archiveProduct);
    
module.exports = router;