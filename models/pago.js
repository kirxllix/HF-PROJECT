// /models/Pago.js
const mongoose = require('mongoose');

const PagoSchema = new mongoose.Schema({
    IDPEDIDO: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true }, // Referencia única al pedido
    metodoPago: { type: String, enum: ['tarjeta'], default: 'tarjeta' },
    concepto: { type: String },
    subTotal: { type: Number, required: true },
    IVA: { type: Number, required: true },
    montoTotal: { type: Number, required: true },
    fechaPago: { type: Date, default: Date.now },
    estadoPago: { type: String, enum: ['pendiente', 'confirmado', 'rechazado'], default: 'pendiente' },
    referencia: { type: String }
});

module.exports = mongoose.model('Pago', PagoSchema);