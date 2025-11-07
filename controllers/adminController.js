// /controllers/adminController.js
const Order = require('../models/order');
const Inventory = require('../models/inventory');
const Asistencia = require('../models/asistencia'); // Asume que el modelo se llama 'asistencia.js'
const Product = require('../models/product');
const User = require('../models/user');
const Sucursal = require('../models/sucursal');

// @desc    Obtener pedidos de Mayoreo pendientes de aprobación
// @route   GET /api/v1/admin/orders/mayoreo/pending
// @access  Private/Admin
exports.getPendingMayoreoOrders = async (req, res) => {
    try {
        // Busca todos los pedidos marcados como 'mayoreo' y 'pendiente_aprobacion'
        const orders = await Order.find({ 
            tipoPedido: 'mayoreo', 
            estado: 'pendiente_aprobacion' 
        })
        .populate('IDUSUARIO', 'nombrePila primerApell email') 
        .sort({ fecha: 1 });
        
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Aprobar o Rechazar pedido de Mayoreo
// @route   PUT /api/v1/admin/orders/:id/action
// @access  Private/Admin
exports.approveRejectOrder = async (req, res) => {
    const { action } = req.body; // 'approve' o 'reject'
    
    try {
        const newStatus = action === 'approve' ? 'aprobado' : 'rechazado';
        const approvedBy = req.user.id; // ID del Admin viene del token

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { estado: newStatus, aprobadoPor: approvedBy },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }
        
        // Notificación al cliente 

        res.json({ 
            success: true, 
            message: `Pedido de Mayoreo fue ${newStatus} por el administrador.`, 
            data: order 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Generar Reporte de Merma y Faltantes por Sucursal (KPI)
// @route   GET /api/v1/admin/reports/inventory/:sucursalId/:date
// @access  Private/Admin
exports.getInventoryReport = async (req, res) => {
    const { sucursalId, date } = req.params;
    const targetDate = new Date(date);

    try {
        // 1. Obtener todos los registros de inventario para esa sucursal y fecha
        const inventoryRecords = await Inventory.find({ 
            IDSucursal: sucursalId, 
            fecha: targetDate.setHours(0,0,0,0) // Busca por fecha exacta
        }).populate('IDProducto', 'nombreProducto categoria');

        // 2. Mapear y calcular la merma/faltante (KPI)
        const reporte = inventoryRecords.map(record => {
            const manana = record.turnoManana;
            const noche = record.turnoNoche;
            
            // Lógica de cálculo: Se asume que el reporte se hace sobre los datos del día completo
            if (manana && manana.t2_almacen !== undefined && noche && noche.t2_almacen !== undefined) {
                
                const stockInicial = manana.t1_almacen + manana.t1_mostrador;
                const stockFinal = noche.t2_almacen + noche.t2_mostrador;
                const vendidosConteo = stockInicial - stockFinal; // Productos vendidos según el conteo
                
                // Suma de ventas reportadas del sistema POS (Auditoría Cruzada)
                const ventasPOS = record.ventasSistemaPOS.reduce((sum, item) => sum + item.cantidadVendida, 0);

                const mermaFaltante = vendidosConteo - ventasPOS; // Si es negativo, hay merma/faltante
                
                return {
                    producto: record.IDProducto.nombreProducto,
                    stockInicial,
                    stockFinal,
                    vendidosConteo,
                    ventasSistema: ventasPOS,
                    mermaFaltante, // KPI
                };
            }
            return null; // Omitir registros incompletos
        }).filter(item => item !== null);

        res.json({ success: true, data: reporte });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generar Reporte de Tiempos de Asistencia
// @route   GET /api/v1/admin/reports/times/:sucursalId/:date
// @access  Private/Admin
exports.getTiempoReport = async (req, res) => {
    const { sucursalId, date } = req.params;
    try {
        // Busca asistencias de la sucursal y fecha, mostrando el nombre del empleado
        const times = await Asistencia.find({
            IDSucursal: sucursalId,
            fecha: new Date(date).setHours(0,0,0,0)
        })
        .populate('IDEMPLEADO', 'nombrePila primerApell');

        // Lógica: Calcular horas trabajadas por cada registro antes de enviar la respuesta
        const report = times.map(time => {
            let horasTrabajadas = 0;
            if (time.horaLlegada && time.horaSalida) {
                const diff = time.horaSalida.getTime() - time.horaLlegada.getTime();
                horasTrabajadas = diff / (1000 * 60 * 60); // Diferencia en horas
            }

            return {
                nombre: `${time.IDEMPLEADO.nombrePila} ${time.IDEMPLEADO.primerApell}`,
                llegada: time.horaLlegada,
                salida: time.horaSalida || 'En turno',
                horasTrabajadas: horasTrabajadas.toFixed(2)
            };
        });

        res.json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createSucursal = async (req, res) => {
    const { nombreSucursal, direccion, telefono, estado } = req.body;

    // Validación básica
    if (!nombreSucursal || !direccion) {
        return res.status(400).json({ message: 'El nombre de sucursal y la dirección son obligatorios.' });
    }

    try {
        const sucursal = await Sucursal.create({
            nombreSucursal,
            direccion,
            telefono,
            estado
        });
        res.status(201).json({ success: true, data: sucursal });
    } catch (error) {
        // Manejar error si el nombre de la sucursal ya existe
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Una sucursal con ese nombre ya existe.' });
        }
        res.status(500).json({ success: false, message: 'Error al crear la sucursal.', error: error.message });
    }
};