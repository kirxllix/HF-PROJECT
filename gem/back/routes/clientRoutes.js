// /routes/clientRoutes.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { getCatalogo, solicitarPedido, getMyOrders, getPublicSucursales, getHomeData, getActivePromotions, getRecentReviews } = require('../controllers/clientController'); 
const { createPaymentPreference } = require('../controllers/paymentController');
const { getProductReviews, createReview } = require('../controllers/reviewController'); 

const router = express.Router();

// Rutas Públicas
router.get('/sucursales', getPublicSucursales);
router.get('/products', getCatalogo);
router.get('/home-data', getHomeData); // ✅ Nueva ruta unificada para el home
router.get('/promotions/active', getActivePromotions); 
router.get('/reviews/recent', getRecentReviews);

// Reviews
router.get('/reviews/:productId', getProductReviews);
router.post('/reviews', protect, createReview);

// Pedidos
router.route('/order').post(protect, solicitarPedido);
router.post('/order/:id/create-payment', protect, createPaymentPreference);
router.get('/orders', protect, getMyOrders);

module.exports = router;