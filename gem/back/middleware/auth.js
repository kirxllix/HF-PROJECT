// /middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user'); 

const protect = async (req, res, next) => {
    let token;

    // 1. Verificar si el token existe en los headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener el token (quitar 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // 2. Decodificar el token con la clave secreta
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Buscar el usuario en la DB (excluir contraseña)
            req.user = await User.findById(decoded.id).select('-contrasena');

            // 4. Adjuntar info del token (ID, Rol, Sucursal) a la petición
            req.user = decoded; 
            
            next(); // Continuar a la ruta
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'No autorizado, token fallido o expirado.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no se encontró token.' });
    }
};

module.exports = { protect };