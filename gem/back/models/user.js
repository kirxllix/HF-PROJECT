// /models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    nombrePila: { type: String, required: true },
    primerApell: { type: String, default: '' }, // Hacemos el apellido opcional
    email: { type: String, required: true, unique: true, lowercase: true },
    
    // 🚨 IMPORTANTE: Quitamos 'required: true' de la contraseña
    contrasena: { type: String, select: false }, 
    
    // Nuevo campo para guardar el ID de Google
    googleId: { type: String }, 
    
    rol: { type: String, enum: ['cliente', 'empleado', 'administrador'], default: 'cliente' },
    pin: { type: String, select: false },
    IDSucursal: { type: mongoose.Schema.Types.ObjectId, ref: 'Sucursal' }
}, { timestamps: true });

// Middleware para encriptar contraseña ANTES de guardar
UserSchema.pre('save', async function(next) {
    // Solo encriptar si la contraseña fue modificada y EXISTE
    if (!this.isModified('contrasena') || !this.contrasena) { 
        return next(); 
    }
    const salt = await bcrypt.genSalt(10);
    this.contrasena = await bcrypt.hash(this.contrasena, salt);
    next();
});

// Método para comparar la contraseña
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // Si el usuario no tiene contraseña (es de Google), retorna falso
    if (!this.contrasena) return false;
    return await bcrypt.compare(enteredPassword, this.contrasena);
};

module.exports = mongoose.model('User', UserSchema);