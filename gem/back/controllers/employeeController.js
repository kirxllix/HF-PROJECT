// /controllers/employeeController.js
const Inventory = require('../models/inventory');
const Asistencia = require('../models/asistencia'); 
const Order = require('../models/order');
const mongoose = require('mongoose');

// @desc    Registrar la hora de llegada (Check-in)
// @route   POST /api/v1/employee/check-in
// @access  Private/Employee
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

// @desc    Registrar la hora de salida (Check-out)
// @route   PUT /api/v1/employee/check-out
// @access  Private/Employee
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

// @desc    Registrar Inventario (Apertura T1 o Cierre T2)
// @route   PUT /api/v1/employee/inventory
// @access  Private/Employee
exports.registerInventory = async (req, res) => {
    const { id: IDEmpleado, IDSucursal } = req.user; 
    
    // Asumimos que el body contiene un array de registros por producto para este endpoint
    const { registros, turnoSeleccionado } = req.body; 
    
    if (!['Mañana', 'Noche'].includes(turnoSeleccionado)) {
        return res.status(400).json({ message: 'Turno inválido. Debe ser Mañana o Noche.' });
    }
    if (!registros || registros.length === 0) {
        return res.status(400).json({ message: 'No se recibieron registros de inventario.' });
    }

    const turnoField = turnoSeleccionado === 'Mañana' ? 'turnoManana' : 'turnoNoche';
    const isApertura = req.query.type === 'apertura'; // Usamos un query param para saber si es T1 o T2
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const today = new Date().setHours(0,0,0,0);
        const results = [];

        for (const registro of registros) {
            const { IDProducto, t1_almacen, t1_mostrador, t2_almacen, t2_mostrador, ventasSistemaPOS } = registro;
            
            let updateData = {};
            let pushPOS = {};
            
            // Lógica de Llenado:
            if (isApertura) {
                // Rellena los campos T1
                updateData.$set = {
                    [`${turnoField}.t1_almacen`]: t1_almacen,
                    [`${turnoField}.t1_mostrador`]: t1_mostrador,
                    // No se necesita el ID de cierre en T1
                };
            } else {
                // Rellena los campos T2 y el empleado/hora de cierre
                updateData.$set = {
                    [`${turnoField}.t2_almacen`]: t2_almacen,
                    [`${turnoField}.t2_mostrador`]: t2_mostrador,
                    [`${turnoField}.IDEmpleado_Cierre`]: IDEmpleado,
                    [`${turnoField}.horaRegistro_Cierre`]: new Date(),
                };
                // Prepara el registro de corte de caja POS
                if (ventasSistemaPOS) {
                    pushPOS = {
                        $push: {
                            ventasSistemaPOS: {
                                cantidadVendida: ventasSistemaPOS.cantidadVendida,
                                IDEmpleado,
                                horaRegistro: new Date()
                            }
                        }
                    };
                }
            }
            
            // Ejecutar la actualización para cada producto (upsert: crea si no existe)
            const updatedDoc = await Inventory.findOneAndUpdate(
                { IDSucursal, IDProducto, fecha: today }, 
                { ...updateData, ...pushPOS },
                { upsert: true, new: true, session }
            );
            results.push(updatedDoc);
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ success: true, message: `Inventario de ${turnoSeleccionado} registrado con éxito.`, data: results });

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
