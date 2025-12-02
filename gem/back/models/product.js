// /models/product.js
const mongoose = require('mongoose');

const VariacionSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    aplicaParaSabor: { type: String } 
});

const ProductSchema = new mongoose.Schema({
    nombreProducto: { type: String, required: true, unique: true },
    descripcion: { type: String },
    imagenUrl: { type: String, default: 'https://via.placeholder.com/150' },
    
    categoria: { 
        type: String, 
        enum: ['helado_sabor', 'helado_presentacion', 'palomita', 'icee', 'slush', 'topping', 'gomita', 'sazonador'], 
        required: true 
    },
    
    habilitarVentaOnline: { type: Boolean, default: false },
    activo: { type: Boolean, default: true }, 
    
    // ✅ NUEVO: Para marcar si sale en el Home
    esFavorito: { type: Boolean, default: false },

    variaciones: [VariacionSchema],
    sucursales: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sucursal' }] 
    
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);