// /middleware/checkRole.js

// rolesAllowed debe ser un array (ej: ['administrador', 'empleado'])
const checkRole = (rolesAllowed) => (req, res, next) => {
    // El rol viene adjunto en req.user desde el middleware 'protect'
    if (!req.user || !req.user.rol) {
        return res.status(401).json({ message: 'Acceso denegado. No autenticado.' });
    }
    
    const userRole = req.user.rol;

    // Verificar si el rol del usuario está incluido en los roles permitidos
    if (rolesAllowed.includes(userRole)) {
        next(); // Permitir el acceso
    } else {
        res.status(403).json({ message: 'Acceso denegado. Rol insuficiente.' });
    }
};

module.exports = { checkRole };

