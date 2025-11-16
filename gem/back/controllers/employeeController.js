// /controllers/employeeController.js
const Inventory = require('../models/inventory');
const Asistencia = require('../models/asistencia'); 
const Order = require('../models/order'); // ✅ IMPORTAR ORDER
const mongoose = require('mongoose');
const User = require('../models/user'); 

// ... (Todas tus funciones de checkIn, checkOut, checkInByPin, getTodayInventory, registerInventory... van aquí)
// ... (Asegúrate de que estén todas las funciones anteriores) ...

// @desc    Registrar la hora de llegada (Check-in)
// @route   POST /api/v1/employee/check-in
// @access  Private/Employee
exports.checkIn = async (req, res) => {
    const { id: IDEmpleado, IDSucursal } = req.user; 
    
    try {
        const asistencia = await Asistencia.create({
            IDEMPLEADO: IDEmpleado,
            IDSucursal,
            horaLlegada: new Date(),
            fecha: new Date().setHours(0,0,0,0)
        });
        res.status(201).json({ success: true, message: 'Entrada registrada con éxito.', data: asistencia });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar la llegada.', error: error.message });
    }
};

// @desc    Registrar la hora de salida (Check-out)
// @route   PUT /api/v1/employee/check-out
// @access  Private/Employee
exports.checkOut = async (req, res) => {
    const { id: IDEmpleado } = req.user; 
    
    try {
        const asistencia = await Asistencia.findOneAndUpdate(
            { IDEMPLEADO: IDEmpleado, horaSalida: { $exists: false } }, 
            { horaSalida: new Date() },
            { new: true }
        );

        if (!asistencia) {
            return res.status(404).json({ message: 'No se encontró registro de llegada activo para cerrar el turno.' });
        }
        res.status(200).json({ success: true, message: 'Salida registrada con éxito.', data: asistencia });

    } catch (error) {
        res.status(500).json({ message: 'Error al registrar la salida.', error: error.message });
    }
};

// @desc    Registrar la hora de llegada (Check-in) con PIN
// @route   POST /api/v1/employee/check-in-pin
// @access  Private/Employee (Cualquier empleado logueado puede llamar)
exports.checkInByPin = async (req, res) => {
    const { pin } = req.body;
    const { IDSucursal } = req.user; 

    if (!pin) {
        return res.status(400).json({ message: 'Se requiere PIN.' });
    }

    try {
        const employee = await User.findOne({ pin: pin }).select('+pin');

        if (!employee) {
            return res.status(404).json({ message: 'PIN incorrecto.' });
        }
        
        const existingCheckin = await Asistencia.findOne({ IDEMPLEADO: employee._id, horaSalida: { $exists: false } });
        if (existingCheckin) {
            return res.status(400).json({ message: 'Este empleado ya tiene un turno abierto.' });
        }

        const asistencia = await Asistencia.create({
            IDEMPLEADO: employee._id,
            IDSucursal: IDSucursal, 
            horaLlegada: new Date(),
            fecha: new Date().setHours(0, 0, 0, 0)
        });
        res.status(201).json({ success: true, message: `Entrada registrada para ${employee.nombrePila}.`, data: asistencia });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar la llegada.', error: error.message });
    }
};

// @desc    Registrar la hora de salida (Check-out) con PIN
// @route   PUT /api/v1/employee/check-out-pin
// @access  Private/Employee
exports.checkOutByPin = async (req, res) => {
    const { pin } = req.body;

    if (!pin) {
        return res.status(400).json({ message: 'Se requiere PIN.' });
    }
    
    try {
        const employee = await User.findOne({ pin: pin }).select('+pin');
        if (!employee) {
            return res.status(404).json({ message: 'PIN incorrecto.' });
        }

        const asistencia = await Asistencia.findOneAndUpdate(
            { IDEMPLEADO: employee._id, horaSalida: { $exists: false } }, 
            { horaSalida: new Date() },
            { new: true }
        );

        if (!asistencia) {
            return res.status(404).json({ message: 'No se encontró registro de llegada activo para este empleado.' });
        }
        res.status(200).json({ success: true, message: `Salida registrada para ${employee.nombrePila}.`, data: asistencia });

    } catch (error) {
        res.status(500).json({ message: 'Error al registrar la salida.', error: error.message });
    }
};


// @desc    Obtener el registro de inventario del día actual para la sucursal del empleado
// @route   GET /api/v1/employee/inventory/today
// @access  Private/Employee
exports.getTodayInventory = async (req, res) => {
    const { IDSucursal } = req.user; 
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    try {
        // 1. Get Inventory Records
        const inventoryRecords = await Inventory.find({ 
            IDSucursal, 
            fecha: today 
        })
        .populate('IDProducto', 'nombreProducto variaciones');

        // 2. Get Aggregated Online Sales for Today
        const onlineSales = await Order.aggregate([
            {
                $match: {
                    IDSucursal: new mongoose.Types.ObjectId(IDSucursal),
                    fecha: { $gte: today },
                    estado: { $in: ['aprobado', 'preparacion', 'listo', 'entregado'] } 
                }
            },
            { $unwind: '$items' }, 
            {
                $group: {
                    _id: '$items.IDPRODUCTO', 
                    totalVendidoOnline: { $sum: '$items.cantidad' } 
                }
            }
        ]);

        // 3. Combina los datos del inventario con las ventas online calculadas
        const inventoryMap = inventoryRecords.reduce((acc, record) => {
            acc[record.IDProducto._id.toString()] = {
                ...record.toObject(),
                IDProducto: record.IDProducto.toObject(),
                ventasOnlineCalculadas: 0 
            };
            return acc;
        }, {});

        // 4. Añade las ventas calculadas al mapa
        onlineSales.forEach(sale => {
            const productId = sale._id.toString();
            if (inventoryMap[productId]) {
                inventoryMap[productId].ventasOnlineCalculadas = sale.totalVendidoOnline;
            }
        });

        res.status(200).json({ success: true, data: inventoryMap });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el inventario del día.', error: error.message });
    }
};


// @desc    Registrar Inventario (Apertura T1 o Cierre T2)
// @route   POST /api/v1/employee/inventory
// @access  Private/Employee
exports.registerInventory = async (req, res) => {
    const { id: IDEmpleado, IDSucursal } = req.user; 
    
    const { registros, turnoSeleccionado } = req.body; 
    const type = req.query.type; // 'apertura' o 'cierre'
    
    if (!['Mañana', 'Noche'].includes(turnoSeleccionado)) {
        return res.status(400).json({ message: 'Turno inválido. Debe ser Mañana o Noche.' });
    }
    if (!registros || registros.length === 0) {
        return res.status(400).json({ message: 'No se recibieron registros de inventario.' });
    }
    if (!['apertura', 'cierre'].includes(type)) {
        return res.status(400).json({ message: 'Tipo de registro inválido. Debe ser apertura o cierre.' });
    }

    const turnoField = turnoSeleccionado === 'Mañana' ? 'turnoManana' : 'turnoNoche';
    const isApertura = type === 'apertura';
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const today = new Date().setHours(0,0,0,0);
        const results = [];
        let updateMessage = '';

        for (const registro of registros) {
            const { IDProducto, almacen, mostrador, ventasSistemaPOS } = registro; 

            let updateData = { $set: {} };
            let pushPOS = {};
            
            if (isApertura) {
                // Rellena los campos T1 (Apertura)
                updateData.$set[`${turnoField}.t1_almacen`] = almacen;
                updateData.$set[`${turnoField}.t1_mostrador`] = mostrador;
                updateMessage = `Inventario de Apertura (T1 - ${turnoSeleccionado}) registrado.`;

            } else {
                // Rellena los campos T2 (Cierre/Cambio)
                updateData.$set[`${turnoField}.t2_almacen`] = almacen;
                updateData.$set[`${turnoField}.t2_mostrador`] = mostrador;
                updateData.$set[`${turnoField}.IDEmpleado_Cierre`] = IDEmpleado;
                updateData.$set[`${turnoField}.horaRegistro_Cierre`] = new Date();
                
                updateMessage = `Inventario de Cierre (T2 - ${turnoSeleccionado}) registrado.`;

                // ✅ LA CORRECCIÓN:
                // Esta lógica asegura que CERO (0) también se guarde.
                if (ventasSistemaPOS !== undefined && ventasSistemaPOS !== null) {
                    pushPOS = {
                        $push: {
                            ventasSistemaPOS: {
                                cantidadVendida: ventasSistemaPOS, // Guarda el 0 o el 4
                                IDEmpleado,
                                horaRegistro: new Date()
                            }
                        }
                    };
                }
            }
            
            const updatedDoc = await Inventory.findOneAndUpdate(
                { IDSucursal, IDProducto, fecha: today }, 
                { ...updateData, ...pushPOS },
                { upsert: true, new: true, session }
            );
            results.push(updatedDoc);
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ success: true, message: updateMessage, data: results });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Error en la transacción de inventario.', error: error.message });
    }
};

// @desc    Obtener órdenes pendientes de la sucursal del empleado
// @route   GET /api/v1/employee/orders/pending
// @access  Private/Employee
exports.getPendingOrdersBySucursal = async (req, res) => {
    const { IDSucursal } = req.user; // ID de la sucursal viene del token

    try {
        const orders = await Order.find({ 
            IDSucursal: IDSucursal, 
            estado: 'pendiente_aprobacion' 
        })
        .sort({ fecha: 1 })
        .populate('IDUSUARIO', 'nombrePila primerApell'); // Obtener nombre del cliente

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener órdenes pendientes.', error: error.message });
    }
};


// ✅ --- INICIA NUEVA FUNCIÓN ---
// @desc    Aprobar o Rechazar pedido de Menudeo (Empleado)
// @route   PUT /api/v1/employee/orders/:id/status
// @access  Private/Employee
exports.updateOrderStatus = async (req, res) => {
    const { action } = req.body; // 'approve' o 'reject'
    const { id: orderId } = req.params;
    const { IDSucursal } = req.user; // ID de la sucursal del empleado logueado

    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: 'Acción no válida.' });
    }

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        // Verificación de seguridad: El empleado solo puede modificar pedidos de su sucursal
        if (order.IDSucursal.toString() !== IDSucursal) {
             return res.status(403).json({ message: 'No autorizado para modificar este pedido.' });
        }
        
        // Solo se pueden modificar pedidos pendientes
        if (order.estado !== 'pendiente_aprobacion') {
             return res.status(400).json({ message: `Este pedido ya fue ${order.estado}.` });
        }

        // Asignar el nuevo estado
        // Para "Ordena y Recoge", 'aprobado' significa 'listo para recoger'
        const newStatus = action === 'approve' ? 'aprobado' : 'rechazado';

        order.estado = newStatus;
        await order.save();
        
        res.json({ success: true, message: `Pedido ${newStatus} exitosamente.`, data: order });

    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el pedido.', error: error.message });
    }
};
