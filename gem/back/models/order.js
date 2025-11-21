// /models/Order.js
const mongoose = require('mongoose');

// Sub-esquema para el detalle de cada producto incrustado
const ItemSchema = new mongoose.Schema({
    IDProducto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    nombreVariacion: { type: String, required: true }, // Ej: 'Saladas', 'Vaso Grande'
    cantidad: { type: Number, required: true },
    precioUnitario: { type: Number, required: true }, // Precio que se validó y registró
    subtotal: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema({
    fecha: { type: Date, default: Date.now },
    IDUSUARIO: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    IDSucursal: { type: mongoose.Schema.Types.ObjectId, ref: 'Sucursal', required: true },

    tipoPedido: { type: String, enum: ['menudeo', 'mayoreo'], required: true },
    total: { type: Number, required: true },
    
    // Estados secuenciales del flujo de aprobación
    estado: { 
        type: String, 
        enum: ['pendiente_aprobacion', 'pendiente_pago', 'aprobado', 'rechazado', 'preparacion', 'listo', 'entregado', 'cancelado'], 
        default: 'pendiente_aprobacion' 
    },
    aprobadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Empleado/Admin que aprobó
    
    // Referencia al pago (solo se llena si es aprobado y pagado)
    IDPAGO: { type: mongoose.Schema.Types.ObjectId, ref: 'Pago' }, 
    
    // Array de productos comprados (Detalle incrustado)
    items: [ItemSchema], 
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);