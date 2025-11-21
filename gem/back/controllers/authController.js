// /controllers/authController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Función auxiliar para generar el Token
const generateToken = (id, rol, IDSucursal) => {
    return jwt.sign(
        { id, rol, IDSucursal }, 
        process.env.JWT_SECRET,
        { expiresIn: '30d' } 
    );
};
// Exportamos la función para que userController la use
module.exports.generateToken = generateToken;


// @desc    Registrar un nuevo usuario (CLIENTE)
// @route   POST /api/v1/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const { nombrePila, primerApell, email, contrasena } = req.body;
    try {
        const user = await User.create({
            nombrePila, primerApell, email, contrasena, rol: 'cliente' 
        });
        res.status(201).json({
            _id: user._id, nombre: user.nombrePila, rol: user.rol, 
            token: generateToken(user._id, user.rol, user.IDSucursal)
        });
    } catch (error) {
        if (error.code === 11000) { return res.status(400).json({ message: 'El correo ya está registrado.' }); }
        res.status(500).json({ message: 'Error al registrar el usuario.' });
    }
};

// @desc    Autenticar (Login)
// @route   POST /api/v1/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, contrasena } = req.body;
    if (!email || !contrasena) {
        return res.status(400).json({ message: 'Por favor ingrese email y contraseña.' });
    }
    
    // Buscar usuario y seleccionar la contraseña 
    const user = await User.findOne({ email }).select('+contrasena');

    if (user && (await user.matchPassword(contrasena))) {
        res.json({
            _id: user._id,
            nombre: user.nombrePila,
            rol: user.rol,
            IDSucursal: user.IDSucursal, 
            token: generateToken(user._id, user.rol, user.IDSucursal)
        });
    } else {
        res.status(401).json({ message: 'Credenciales inválidas.' });
    }
};


// @desc    Obtener el perfil del usuario actual (basado en el token)
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        // req.user es adjuntado por el middleware 'protect'
        // Busca al usuario en la DB usando el ID del token
        const user = await User.findById(req.user.id).select('-contrasena');

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Devuelve la información del usuario
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor.' });
    }
};