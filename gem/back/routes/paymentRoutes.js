// /routes/paymentRoutes.js
const express = require('express');
const { receiveWebhook } = require('../controllers/paymentController');

const router = express.Router();

// Esta ruta debe ser pública para que Mercado Pago pueda acceder
router.post('/webhook', receiveWebhook);

module.exports = router;