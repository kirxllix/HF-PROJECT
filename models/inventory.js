// /models/inventory.js
const mongoose = require('mongoose');

// Sub-esquema para los 4 conteos de un solo turno (T1 y T2)
const TurnoRegistroSchema = new mongoose.Schema({
    t1_almacen: { type: Number, min: 0 }, 
    t1_mostrador: { type: Number, min: 0 },
    t2_almacen: { type: Number, min: 0 }, 
    t2_mostrador: { type: Number, min: 0 }, 
    IDEmpleado_Cierre: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    horaRegistro_Cierre: { type: Date },
});

const InventorySchema = new mongoose.Schema({
    IDSucursal: { type: mongoose.Schema.Types.ObjectId, ref: 'Sucursal', required: true },
    IDProducto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    fecha: { type: Date, required: true, default: Date.now, set: (v) => new Date(v).setHours(0, 0, 0, 0) },

    // Registros consolidados para los dos turnos del día
    turnoManana: { type: TurnoRegistroSchema },
    turnoNoche: { type: TurnoRegistroSchema },

    // Registro de ventas del POS para la auditoría cruzada (Puede ser un array de dos entradas)
    ventasSistemaPOS: [{
        cantidadVendida: { type: Number },
        IDEmpleado: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        horaRegistro: { type: Date }
    }]
});

// Índice compuesto para buscar rápidamente el conteo de un producto en una fecha/sucursal
InventorySchema.index({ IDSucursal: 1, IDProducto: 1, fecha: -1 }, { unique: true });

module.exports = mongoose.model('Inventory', InventorySchema);