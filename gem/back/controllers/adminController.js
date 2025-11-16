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

// --- FUNCIONES NUEVAS PARA EL DASHBOARD ---

// @desc    Obtener estadísticas para el Dashboard
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
// @desc    Obtener estadísticas para el Dashboard (ACTUALIZADO CON KPIs)
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        // --- 1. KPI Financiero: Ventas Totales Netas ---
        // Suma el 'total' de todas las órdenes marcadas como 'entregado'
        const ventasResult = await Order.aggregate([
            { $match: { estado: 'entregado' } },
            { $group: { _id: null, totalVentas: { $sum: '$total' } } }
        ]);
        const ventasNetas = ventasResult.length > 0 ? (ventasResult[0].totalVentas || 0) : 0;
        // --- 2. KPIs Operativos (Tareas Pendientes) ---
        
        // Tarea: Órdenes de Mayoreo por Aprobar
        const ordersForApproval = await Order.countDocuments({
            tipoPedido: 'mayoreo',
            estado: 'pendiente_aprobacion'
        });

        // Tarea: Órdenes en preparación (que ya fueron aprobadas)
        const operationalOrders = await Order.countDocuments({
            estado: { $in: ['aprobado', 'preparacion', 'listo'] }
        });

        // --- 3. KPI General: Crecimiento de Clientes ---
        const activeUsers = await User.countDocuments({ rol: 'cliente' });

        res.json({
            ventasNetas: ventasNetas,           // KPI Financiero
            ordersForApproval: ordersForApproval, // Tarea Pendiente
            operationalOrders: operationalOrders, // Tarea Pendiente
            activeUsers: activeUsers             // KPI General
        });

    } catch (error) {
        res.status(500).json({ message: 'Error al obtener estadísticas.', error: error.message });
    }
};
// @desc    Obtener órdenes pendientes (todas)
// @route   GET /api/v1/admin/orders/pending
// @access  Private/Admin
exports.getPendingOrders = async (req, res) => {
    try {
        const orders = await Order.find({ 
            estado: 'pendiente_aprobacion' 
        })
        .sort({ fecha: 1 })
        .limit(10); // Limitar a las 10 más recientes
        
        res.json(orders); // El dashboard espera un array
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener órdenes pendientes.', error: error.message });
    }
};


// @desc    Obtener todas las sucursales
// @route   GET /api/v1/admin/sucursales
// @access  Private/Admin
exports.getSucursales = async (req, res) => {
    try {
        const sucursales = await Sucursal.find({ estado: 'activo' });
        res.json({ success: true, data: sucursales });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener sucursales.' });
    }
};

// =============================================
// --- SECCIÓN DE GESTIÓN DE PROMOCIONES ---
// =============================================

// @desc    Obtener todas las promociones
// @route   GET /api/v1/admin/promotions
exports.getPromotions = async (req, res) => {
    try {
        const promos = await Promotion.find({}).sort({ fecha_inicio: -1 });
        res.json(promos);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// @desc    Crear una nueva promoción
// @route   POST /api/v1/admin/promotions
exports.createPromotion = async (req, res) => {
    try {
        const promo = await Promotion.create(req.body);
        res.status(201).json(promo);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

// @desc    Actualizar una promoción
// @route   PUT /api/v1/admin/promotions/:id
exports.updatePromotion = async (req, res) => {
    try {
        const promo = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!promo) return res.status(404).json({ message: 'Promoción no encontrada' });
        res.json(promo);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

// @desc    Activar/Desactivar una promoción
// @route   PUT /api/v1/admin/promotions/:id/toggle
exports.togglePromotionActive = async (req, res) => {
    try {
        const promo = await Promotion.findByIdAndUpdate(req.params.id, { activo: req.body.activo }, { new: true });
        if (!promo) return res.status(404).json({ message: 'Promoción no encontrada' });
        res.json(promo);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

// =============================================
// --- SECCIÓN DE MODERACIÓN DE RESEÑAS ---
// =============================================

// @desc    Obtener reseñas pendientes
// @route   GET /api/v1/admin/reviews/pending
exports.getPendingReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ estado: 'pendiente' })
            .populate('IDPRODUCTO', 'nombreProducto')
            .populate('IDUSUARIO', 'nombrePila');
        res.json(reviews);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// @desc    Moderar una reseña (aprobar/rechazar)
// @route   PUT /api/v1/admin/reviews/:id/status
exports.moderateReview = async (req, res) => {
    const { estado } = req.body; // 'aprobado' o 'rechazado'
    if (!['aprobado', 'rechazado'].includes(estado)) {
        return res.status(400).json({ message: 'Estado no válido' });
    }
    
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, { estado: estado }, { new: true });
        if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });
        res.json(review);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

// =============================================
// --- SECCIÓN DE GESTIÓN DE PRODUCTOS ---
// =============================================

// @desc    Crear un nuevo producto
// @route   POST /api/v1/admin/products
exports.createProduct = async (req, res) => {
    try {
        // NOTA: req.body contendrá (nombre, descripcion, categoria, variaciones, etc.)
        // La lógica de la imagen se añadirá aquí más tarde.
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (err) { 
        res.status(400).json({ success: false, message: err.message }); 
    }
};

// @desc    Actualizar un producto (incluyendo variaciones)
// @route   PUT /api/v1/admin/products/:id
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { 
            new: true, 
            runValidators: true 
        });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.json({ success: true, data: product });
    } catch (err) { 
        res.status(400).json({ success: false, message: err.message }); 
    }
};

// @desc    Archivar o Reactivar un producto
// @route   PUT /api/v1/admin/products/:id/archive
exports.archiveProduct = async (req, res) => {
    try {
        // El frontend enviará { activo: false } para archivar
        const product = await Product.findByIdAndUpdate(req.params.id, 
            { activo: req.body.activo }, 
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.json({ success: true, data: product });
    } catch (err) { 
        res.status(400).json({ success: false, message: err.message }); 
    }
};

// @desc    Obtener TODOS los productos (activos y archivados)
// @route   GET /api/v1/admin/products
// @access  Private/Admin
exports.getAllProducts = async (req, res) => {
    try {
        // Busca todos los productos sin filtro de 'activo'
        const products = await Product.find({}).sort({ nombreProducto: 1 });
        res.json({ success: true, data: products });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
};