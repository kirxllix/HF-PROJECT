// /routes/clientRoutes.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { getCatalogo, solicitarPedido, getMyOrders, getPublicSucursales,getActivePromotions, getRecentReviews } = require('../controllers/clientController'); 
const { createPaymentPreference } = require('../controllers/paymentController');

// 1. IMPORTAR CONTROLADOR DE RESEÑAS
const { getProductReviews, createReview } = require('../controllers/reviewController'); 

const router = express.Router();

// Rutas Públicas
router.get('/sucursales', getPublicSucursales);
router.get('/products', getCatalogo);
router.get('/promotions/active', getActivePromotions); 
router.get('/reviews/recent', getRecentReviews);

// 2. RUTAS DE RESEÑAS (ACTIVADAS)
router.get('/reviews/:productId', getProductReviews); // Pública para leer
router.post('/reviews', protect, createReview);       // Privada para escribir

// Rutas Privadas de Pedidos
router.route('/order').post(protect, solicitarPedido);
router.post('/order/:id/create-payment', protect, createPaymentPreference);
router.get('/orders', protect, getMyOrders);

module.exports = router;