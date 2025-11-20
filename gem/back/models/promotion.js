// /models/promotion.js (NUEVO ARCHIVO)
const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    fecha_inicio: { type: Date, required: true },
    fecha_fin: { type: Date, required: true },
    activo: { type: Boolean, default: true },
    // Opcional: Para qué sucursal aplica
    IDSucursal: { type: mongoose.Schema.Types.ObjectId, ref: 'Sucursal' }
}, { timestamps: true });

module.exports = mongoose.model('Promotion', PromotionSchema);