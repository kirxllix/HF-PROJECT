// /routes/clientRoutes.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { getCatalogo, solicitarPedido } = require('../controllers/clientController'); 
const router = express.Router();

// 1. Ruta pública: Catálogo
router.get('/products', getCatalogo);

// 2. Ruta protegida: Solicitar pedido
// El cliente DEBE estar loggeado para hacer un pedido.
router.route('/order').post(protect, solicitarPedido);

module.exports = router;