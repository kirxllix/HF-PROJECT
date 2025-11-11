// /models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    nombrePila: { type: String, required: true },
    primerApell: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    contrasena: { type: String, required: true, select: false }, // No se devuelve por defecto
    
    rol: { type: String, enum: ['cliente', 'empleado', 'administrador'], default: 'cliente' },
    
    // Referencia a la sucursal (solo para empleado/admin)
    IDSucursal: { type: mongoose.Schema.Types.ObjectId, ref: 'Sucursal' }
}, { timestamps: true });

// Middleware para encriptar contraseña ANTES de guardar
UserSchema.pre('save', async function(next) {
    if (!this.isModified('contrasena')) { 
        return next(); 
    }
    const salt = await bcrypt.genSalt(10);
    this.contrasena = await bcrypt.hash(this.contrasena, salt);
    next();
});

// Método para comparar la contraseña (usado en el login)
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.contrasena);
};

module.exports = mongoose.model('User', UserSchema);