// /controllers/adminController.js
const Promotion = require('../models/promotion'); 
const Review = require('../models/review');
const Product = require('../models/product');
const Order = require('../models/order');
const Inventory = require('../models/inventory');
const Asistencia = require('../models/asistencia'); 
const User = require('../models/user');
const Sucursal = require('../models/sucursal');

// @desc    Obtener pedidos de Mayoreo pendientes de aprobación
// @route   GET /api/v1/admin/orders/mayoreo/pending
exports.getPendingMayoreoOrders = async (req, res) => {
    try {
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
exports.approveRejectOrder = async (req, res) => {
    const { action } = req.body; 
    try {
        const newStatus = action === 'approve' ? 'pendiente_pago' : 'rechazado';
        const approvedBy = req.user.id;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { estado: newStatus, aprobadoPor: approvedBy },
            { new: true, runValidators: true }
        );

        if (!order) return res.status(404).json({ message: 'Pedido no encontrado.' });

        res.json({ 
            success: true, 
            message: `Pedido de Mayoreo actualizado a: ${newStatus}`, 
            data: order 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Generar Reporte de Merma y Faltantes por Sucursal (KPI)
// @route   GET /api/v1/admin/reports/inventory/:sucursalId/:date
exports.getInventoryReport = async (req, res) => {
    const { sucursalId, date } = req.params;
    
    const queryDate = new Date(date);
    const startDate = new Date(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate(), 0, 0, 0);
    const endDate = new Date(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate(), 23, 59, 59);

    try {
        const inventoryRecords = await Inventory.find({ 
            IDSucursal: sucursalId, 
            fecha: { $gte: startDate, $lte: endDate }
        }).populate('IDProducto', 'nombreProducto categoria');

        const reporte = inventoryRecords.map(record => {
            // --- DATOS MAÑANA ---
            const m = record.turnoManana || {};
            const m_inicial = (m.t1_almacen || 0) + (m.t1_mostrador || 0);
            const m_final = (m.t2_almacen || 0) + (m.t2_mostrador || 0);
            
            // Si no hay T2 registrado, no calculamos venta todavía
            const m_vendido = (m.t1_almacen !== undefined && m.t2_almacen !== undefined) 
                              ? (m_inicial - m_final) 
                              : null;

            // --- DATOS NOCHE ---
            const n = record.turnoNoche || {};
            const n_inicial = (n.t1_almacen || 0) + (n.t1_mostrador || 0);
            const n_final = (n.t2_almacen || 0) + (n.t2_mostrador || 0);
            
            const n_vendido = (n.t1_almacen !== undefined && n.t2_almacen !== undefined)
                              ? (n_inicial - n_final)
                              : null;
            
            return {
                producto: record.IDProducto?.nombreProducto || "Producto Eliminado",
                // Objeto Turno Mañana
                manana: {
                    registrado: m.t1_almacen !== undefined, // Flag para saber si existe
                    completo: m.t2_almacen !== undefined,
                    t1_alm: m.t1_almacen, t1_most: m.t1_mostrador,
                    t2_alm: m.t2_almacen, t2_most: m.t2_mostrador,
                    vendido: m_vendido
                },
                // Objeto Turno Noche
                noche: {
                    registrado: n.t1_almacen !== undefined,
                    completo: n.t2_almacen !== undefined,
                    t1_alm: n.t1_almacen, t1_most: n.t1_mostrador,
                    t2_alm: n.t2_almacen, t2_most: n.t2_mostrador,
                    vendido: n_vendido
                }
            };
        });

        res.json({ success: true, data: reporte });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generar Reporte de Tiempos de Asistencia
// @route   GET /api/v1/admin/reports/times/:sucursalId/:date
exports.getTiempoReport = async (req, res) => {
    const { sucursalId, date } = req.params;
    
    // Ajuste de fechas para búsqueda amplia
    const queryDate = new Date(date);
    const startDate = new Date(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate(), 0, 0, 0);
    const endDate = new Date(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate(), 23, 59, 59);

    try {
        const times = await Asistencia.find({
            IDSucursal: sucursalId,
            fecha: { $gte: startDate, $lte: endDate }
        })
        .populate('IDEMPLEADO', 'nombrePila primerApell');

        const report = times.map(time => {
            let horasTrabajadas = 0;
            if (time.horaLlegada && time.horaSalida) {
                const diff = new Date(time.horaSalida).getTime() - new Date(time.horaLlegada).getTime();
                horasTrabajadas = diff / (1000 * 60 * 60); 
            }

            return {
                nombre: time.IDEMPLEADO ? `${time.IDEMPLEADO.nombrePila} ${time.IDEMPLEADO.primerApell}` : 'Usuario Eliminado',
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

// @desc    Crear Sucursal
exports.createSucursal = async (req, res) => {
    const { nombreSucursal, direccion, telefono, estado } = req.body;
    if (!nombreSucursal || !direccion) return res.status(400).json({ message: 'Datos incompletos.' });

    try {
        const sucursal = await Sucursal.create({ nombreSucursal, direccion, telefono, estado });
        res.status(201).json({ success: true, data: sucursal });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Nombre de sucursal duplicado.' });
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Stats Dashboard
exports.getDashboardStats = async (req, res) => {
    try {
        const ventasResult = await Order.aggregate([
            { $match: { estado: 'entregado' } },
            { $group: { _id: null, totalVentas: { $sum: '$total' } } }
        ]);
        const ventasNetas = ventasResult.length > 0 ? (ventasResult[0].totalVentas || 0) : 0;
        
        const ordersForApproval = await Order.countDocuments({ tipoPedido: 'mayoreo', estado: 'pendiente_aprobacion' });
        const operationalOrders = await Order.countDocuments({ estado: { $in: ['aprobado', 'preparacion', 'listo', 'pendiente_pago'] } });
        const activeUsers = await User.countDocuments({ rol: 'cliente' });

        res.json({ ventasNetas, ordersForApproval, operationalOrders, activeUsers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Órdenes Pendientes (General)
exports.getPendingOrders = async (req, res) => {
    try {
        const orders = await Order.find({ estado: 'pendiente_aprobacion' }).sort({ fecha: 1 }).limit(10);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener Sucursales
exports.getSucursales = async (req, res) => {
    try {
        const sucursales = await Sucursal.find({ estado: 'activo' });
        res.json({ success: true, data: sucursales });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener sucursales.' });
    }
};

// --- PROMOCIONES ---
exports.getPromotions = async (req, res) => {
    try {
        const promos = await Promotion.find({}).sort({ fecha_inicio: -1 });
        res.json(promos);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createPromotion = async (req, res) => {
    try {
        const promo = await Promotion.create(req.body);
        res.status(201).json(promo);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updatePromotion = async (req, res) => {
    try {
        const promo = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!promo) return res.status(404).json({ message: 'Promoción no encontrada' });
        res.json(promo);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.togglePromotionActive = async (req, res) => {
    try {
        const promo = await Promotion.findByIdAndUpdate(req.params.id, { activo: req.body.activo }, { new: true });
        if (!promo) return res.status(404).json({ message: 'Promoción no encontrada' });
        res.json(promo);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

// --- REVIEWS ---
exports.getPendingReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ estado: 'pendiente' })
            .populate('IDPRODUCTO', 'nombreProducto')
            .populate('IDUSUARIO', 'nombrePila');
        res.json(reviews);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.moderateReview = async (req, res) => {
    const { estado } = req.body;
    if (!['aprobado', 'rechazado'].includes(estado)) return res.status(400).json({ message: 'Estado no válido' });
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, { estado: estado }, { new: true });
        if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });
        res.json(review);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

// --- PRODUCTOS ---
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        res.json({ success: true, data: product });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.archiveProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { activo: req.body.activo }, { new: true });
        if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        res.json({ success: true, data: product });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ nombreProducto: 1 });
        res.json({ success: true, data: products });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ...

// @desc    Actualizar una sucursal
// @route   PUT /api/v1/admin/sucursales/:id
exports.updateSucursal = async (req, res) => {
    try {
        const { nombreSucursal, direccion, telefono, estado } = req.body;

        // Buscamos y actualizamos
        const sucursal = await Sucursal.findByIdAndUpdate(req.params.id, {
            nombreSucursal,
            direccion, // Se espera un objeto { calle, colonia, ... }
            telefono,
            estado
        }, { new: true, runValidators: true });

        if (!sucursal) {
            return res.status(404).json({ message: 'Sucursal no encontrada.' });
        }

        res.json({ success: true, message: 'Sucursal actualizada.', data: sucursal });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Eliminar una sucursal
// @route   DELETE /api/v1/admin/sucursales/:id
exports.deleteSucursal = async (req, res) => {
    try {
        const sucursal = await Sucursal.findByIdAndDelete(req.params.id);
        
        if (!sucursal) {
            return res.status(404).json({ message: 'Sucursal no encontrada.' });
        }

        res.json({ success: true, message: 'Sucursal eliminada.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Eliminar un producto definitivamente
// @route   DELETE /api/v1/admin/products/:id
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        res.json({ success: true, message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};