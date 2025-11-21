// /controllers/userController.js
const User = require('../models/user'); 
const Sucursal = require('../models/sucursal'); 
const { generateToken } = require('../controllers/authController'); // Asume que esta función existe

// @desc    Crear nueva cuenta (Empleado o Admin)
// @route   POST /api/v1/admin/users
// @access  Private/Admin
exports.createAdminEmployee = async (req, res) => {
    const { nombrePila, primerApell, email, contrasena, rol, IDSucursal, pin } = req.body;

    // 1. Validación de campos obligatorios
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

// ... (código anterior de createAdminEmployee)

// @desc    Obtener todos los empleados y admins (con filtro opcional por sucursal)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getAllStaff = async (req, res) => {
    try {
        const { sucursal } = req.query;
        let query = { rol: { $in: ['empleado', 'administrador'] } };

        if (sucursal && sucursal !== 'todas') {
            query.IDSucursal = sucursal;
        }

        const users = await User.find(query)
            .select('-contrasena -pin') // No devolver datos sensibles
            .populate('IDSucursal', 'nombreSucursal');

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios.', error: error.message });
    }
};

// @desc    Actualizar un usuario
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateStaff = async (req, res) => {
    try {
        const { nombrePila, primerApell, email, rol, IDSucursal, pin, contrasena } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Actualizar campos básicos
        user.nombrePila = nombrePila || user.nombrePila;
        user.primerApell = primerApell || user.primerApell;
        user.email = email || user.email;
        user.rol = rol || user.rol;
        user.IDSucursal = IDSucursal || user.IDSucursal;

        // Actualizar PIN solo si se envía
        if (pin) user.pin = pin;

        // Actualizar Contraseña solo si se envía (El pre-save hook la encriptará)
        if (contrasena && contrasena.trim() !== '') {
            user.contrasena = contrasena;
        }

        await user.save(); // Usamos save() para que se ejecuten los hooks de encriptación
        res.json({ success: true, message: 'Usuario actualizado correctamente', data: user });

    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar usuario.', error: error.message });
    }
};

// @desc    Eliminar un usuario
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteStaff = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario.', error: error.message });
    }
};