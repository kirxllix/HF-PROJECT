// /models/asistencia.js
const mongoose = require('mongoose');

const AsistenciaSchema = new mongoose.Schema({
    IDEMPLEADO: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    IDSucursal: { type: mongoose.Schema.Types.ObjectId, ref: 'Sucursal', required: true },
    fecha: { type: Date, required: true, default: Date.now, set: (v) => new Date(v).setHours(0, 0, 0, 0) }, // Solo guarda la fecha sin hora
    horaLlegada: { type: Date, required: true },
    horaSalida: { type: Date }, // Se llena con el check-out
});

// Índice para buscar la asistencia de un empleado en un día específico
AsistenciaSchema.index({ IDEMPLEADO: 1, fecha: 1 }, { unique: true });

module.exports = mongoose.model('Asistencia', AsistenciaSchema);