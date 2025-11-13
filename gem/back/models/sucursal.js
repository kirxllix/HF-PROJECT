// /models/sucursal.js
const mongoose = require('mongoose');

const SucursalSchema = new mongoose.Schema({
    nombreSucursal: { type: String, required: true, unique: true },
    direccion: {
        calle: { type: String, required: true },
        colonia: { type: String, required: true },
        ciudad: { type: String, required: true },
        cp: { type: String, required: true }
    },
    telefono: { type: String },
    estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
});

module.exports = mongoose.model('Sucursal', SucursalSchema);