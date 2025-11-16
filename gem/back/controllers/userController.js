// /controllers/userController.js
const User = require('../models/user'); 
const Sucursal = require('../models/sucursal'); 
const { generateToken } = require('../controllers/authController'); // Asume que esta función existe

// @desc    Crear nueva cuenta (Empleado o Admin)
// @route   POST /api/v1/admin/users
// @access  Private/Admin
exports.createAdminEmployee = async (req, res) => {
    // ✅ CAMBIO: Añadimos 'pin' a la desestructuración
    const { nombrePila, primerApell, email, contrasena, rol, IDSucursal, pin } = req.body;

    // 1. Validación de campos obligatorios
    // ✅ CAMBIO: Añadimos 'pin' a la validación
    if (!email || !contrasena || !rol || !IDSucursal || !pin) {
        return res.status(400).json({ message: 'Faltan campos obligatorios (Email, Contraseña, Rol, Sucursal y PIN).' });
    }
    // 2. Validación de rol permitido
    if (rol !== 'empleado' && rol !== 'administrador') {
        return res.status(400).json({ message: 'Rol inválido para creación de staff.' });
    }

    try {
        // 3. Verificar que la sucursal exista (Integridad de datos)
        const sucursalExists = await Sucursal.findById(IDSucursal);
        if (!sucursalExists) {
            return res.status(404).json({ message: 'La ID de Sucursal proporcionada no existe.' });
        }

        // 4. Crear el usuario (La encriptación de contraseña ocurre en el pre-save hook)
        // ✅ CAMBIO: Añadimos 'pin' al objeto de creación
        const user = await User.create({
            nombrePila, primerApell, email, contrasena, rol, IDSucursal, pin
        });

        // Respuesta: puede incluir el token para iniciar la sesión inmediatamente
        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                nombre: user.nombrePila,
                rol: user.rol,
                IDSucursal: user.IDSucursal
            },
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};