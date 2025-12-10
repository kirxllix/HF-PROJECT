// /controllers/authController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library'); 

// Asegúrate de que GOOGLE_CLIENT_ID esté en tu archivo config.env
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Función auxiliar para generar el Token
const generateToken = (id, rol, IDSucursal) => {
    return jwt.sign(
        { id, rol, IDSucursal }, 
        process.env.JWT_SECRET,
        { expiresIn: '30d' } 
    );
};
// Importante: exportar esta función auxiliar también si se usa en otros lados (como userController)
module.exports.generateToken = generateToken;

// @desc    Registrar un nuevo usuario (CLIENTE)
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

// @desc    Autenticar (Login Normal)
exports.loginUser = async (req, res) => {
    const { email, contrasena } = req.body;
    if (!email || !contrasena) {
        return res.status(400).json({ message: 'Por favor ingrese email y contraseña.' });
    }
    
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

// ✅ LOGIN CON GOOGLE (Esta es la función que te faltaba o no se exportaba)
exports.googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        // 1. Verificar el token con Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const { email, given_name, family_name, sub } = ticket.getPayload();

        // 2. Buscar o Crear Usuario
        let user = await User.findOne({ email });

        if (user) {
            // Si existe, ligamos su googleId si no lo tiene
            if (!user.googleId) {
                user.googleId = sub;
                await user.save();
            }
        } else {
            // Si no existe, lo creamos sin contraseña
            user = await User.create({
                nombrePila: given_name,
                primerApell: family_name || '',
                email: email,
                googleId: sub,
                rol: 'cliente'
            });
        }

        // 3. Generar JWT de nuestra App
        const tokenJWT = generateToken(user._id, user.rol, user.IDSucursal);

        res.status(200).json({
            success: true,
            _id: user._id,
            nombre: user.nombrePila,
            rol: user.rol,
            token: tokenJWT
        });

    } catch (error) {
        console.error("Error Google Auth:", error);
        res.status(401).json({ message: 'Token de Google inválido.' });
    }
};

// @desc    Obtener perfil
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-contrasena');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor.' });
    }
};