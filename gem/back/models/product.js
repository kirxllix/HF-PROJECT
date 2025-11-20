// /models/Product.js
const mongoose = require('mongoose');

// Sub-esquema para las variaciones (precios por sabor o tamaño)
const VariacionSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    // Usado para excepciones de Helado (Ej: 'Vainilla' o 'Monk Fruit')
    aplicaParaSabor: { type: String } 
});

const ProductSchema = new mongoose.Schema({
    nombreProducto: { type: String, required: true, unique: true },
    descripcion: { type: String },
    imagenUrl: { type: String, default: 'https://via.placeholder.com/150' },
    
    // Categoría para controlar la lógica (calculadora vs. venta en línea)
    categoria: { 
        type: String, 
        enum: ['helado_sabor', 'helado_presentacion', 'palomita', 'icee', 'slush', 'topping', 'gomita', 'sazonador'], 
        required: true 
    },
    
    // Flag para permitir la venta en línea (TRUE solo para Palomitas, ICEE, etc.)
    habilitarVentaOnline: { type: Boolean, default: false },
    
    // Flag para Archivado: si es 'false', se oculta del catálogo (regla de archivado)
    activo: { type: Boolean, default: true }, 

    // Array para manejar múltiples precios por sabor o tamaño
    variaciones: [VariacionSchema] 
    
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);