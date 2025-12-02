// /models/review.js (NUEVO ARCHIVO)
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    IDPRODUCTO: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    IDUSUARIO: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    calificacion: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String },
    estado: { 
        type: String, 
        enum: ['pendiente', 'aprobado', 'rechazado'], 
        default: 'pendiente' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);