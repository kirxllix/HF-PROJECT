// /controllers/clientController.js
const Product = require('../models/product');
const Inventory = require('../models/inventory');
const Order = require('../models/order');
const Sucursal = require('../models/sucursal');
const Config = require('../models/config'); 
const Promotion = require('../models/promotion');
const Review = require('../models/review'); 
const mongoose = require('mongoose');


// --- Constantes de Regla de Negocio ---
const LIMITE_MENUDEO = 32;
const CARGO_SERVICIO_ONLINE = 5.00;

// @desc    Obtener lista de sucursales (Pública para el selector)
// @route   GET /api/v1/client/sucursales
exports.getPublicSucursales = async (req, res) => {
    try {
        const sucursales = await Sucursal.find({ estado: 'activo' }).select('nombreSucursal _id direccion');
        res.json({ success: true, data: sucursales });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener sucursales.' });
    }
};

// @desc    Obtener el catálogo filtrado por Sucursal
// @route   GET /api/v1/client/products?sucursalId=...
// @access  Public
exports.getCatalogo = async (req, res) => {
    try {
        // 1. Recibimos la sucursal desde el Frontend (Selector)
        let { sucursalId } = req.query;

        // Fallback: Si no envían nada, intentamos usar Benton por defecto
        if (!sucursalId) {
             const benton = await Sucursal.findOne({ nombreSucursal: 'Benton' });
             if (benton) sucursalId = benton._id;
        }

        if (!sucursalId) {
            return res.status(400).json({ success: false, message: 'Debes seleccionar una sucursal.' });
        }

        // Convertir a ObjectId para el pipeline de MongoDB
        const sucursalObjectId = new mongoose.Types.ObjectId(sucursalId);
        const today = new Date().setHours(0, 0, 0, 0);

        const productsWithStock = await Product.aggregate([
            { 
                $match: { 
                    activo: true,
                    
                    $or: [
                        { sucursales: { $exists: false } },
                        { sucursales: { $size: 0 } },
                        { sucursales: { $in: [sucursalObjectId] } }
                    ]
                } 
            },
            {
                $lookup: {
                    from: 'inventories', 
                    let: { productId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$IDProducto', '$$productId'] },
                                        { $eq: ['$IDSucursal', sucursalObjectId] }, // <--- USAMOS LA SUCURSAL SELECCIONADA
                                        { $eq: ['$fecha', today] } 
                                    ]
                                }
                            }
                        },
                        { $limit: 1 } 
                    ],
                    as: 'inventoryData'
                }
            },
            { $unwind: { path: '$inventoryData', preserveNullAndEmptyArrays: true } },
            
            {
                $project: {
                    _id: 1, 
                    nombreProducto: 1,
                    descripcion: 1,
                    imagenUrl: 1, // Aseguramos enviar la imagen
                    categoria: 1,
                    variaciones: 1,
                    
                    stockDisponible: {
                        $cond: {
                            if: { $and: [ '$inventoryData.turnoManana', { $ifNull: ['$inventoryData.turnoManana.t1_mostrador', false] } ] }, 
                            then: '$inventoryData.turnoManana.t1_mostrador',
                            else: { $ifNull: ['$inventoryData.turnoNoche.t1_mostrador', 0] }
                        }
                    },
                    
                    puedeComprarseOnline: {
                        $cond: {
                            if: { $eq: ['$categoria', 'palomita'] }, 
                            then: true,
                            else: false
                        }
                    }
                }
            }
        ]);

        res.status(200).json({ success: true, count: productsWithStock.length, data: productsWithStock });
    
    } catch (error) {
        console.error("🔥 ERROR EN getCatalogo:", error);
        return res.status(500).json({
            success: false,
            message: 'Error al cargar el catálogo.',
            error: error.message
        });
    }
};


// @desc    Validar stock y solicitar pedido
// @route   POST /api/v1/client/order
// @access  Private (Cliente loggeado)
exports.solicitarPedido = async (req, res) => {
    // 1. Recibimos IDSucursal desde el body (enviado por el frontend)
    const { items, metodoPagoElegido, IDSucursal } = req.body;
    
    if (!IDSucursal) {
        return res.status(400).json({ message: 'Error: No se especificó la sucursal para el pedido.' });
    }

    let totalPalomitas = 0;
    let subtotalProductos = 0;
    const today = new Date().setHours(0, 0, 0, 0);

    // 2. Validaciones de Productos
    for (const item of items) {
        const productDoc = await Product.findById(item.IDProducto);
        
        if (!productDoc) {
             return res.status(400).json({ message: `El producto con ID ${item.IDProducto} ya no existe.` });
        }
        
        if (productDoc.categoria !== 'palomita') {
            return res.status(400).json({ message: `El producto "${productDoc.nombreProducto}" no está disponible para venta en línea.` });
        }
        
        const variacion = productDoc.variaciones.find(v => v.nombre === item.nombreVariacion);
        if (!variacion) {
             return res.status(400).json({ message: `Variación no encontrada para ${productDoc.nombreProducto}.` });
        }
        
        if (productDoc.categoria === 'palomita') {
            totalPalomitas += item.cantidad; 
        }
        
        subtotalProductos += variacion.precio * item.cantidad;
        item.precioUnitario = variacion.precio;
        item.subtotal = variacion.precio * item.cantidad;
        item.categoria = productDoc.categoria;
    }

    const tipoPedido = totalPalomitas > LIMITE_MENUDEO ? 'mayoreo' : 'menudeo';
    
    // 3. VALIDACIÓN DE STOCK DINÁMICA (Usando IDSucursal seleccionada)
    for (const item of items) {
        if (item.categoria === 'palomita') { 
            
            const inventoryRecord = await Inventory.findOne({ 
                IDSucursal: IDSucursal, // <--- VALIDAMOS CONTRA LA SUCURSAL ELEGIDA
                IDProducto: item.IDProducto, 
                fecha: today 
            });

            if (!inventoryRecord) {
                return res.status(400).json({ message: `Stock de ${item.nombreVariacion} no disponible hoy en esta sucursal.` });
            }

            let stockActivoMostrador = 0;
            let stockTotal = 0;

            if (inventoryRecord.turnoNoche && inventoryRecord.turnoNoche.t1_mostrador !== undefined) {
                stockActivoMostrador = inventoryRecord.turnoNoche.t1_mostrador || 0;
                stockTotal = (inventoryRecord.turnoNoche.t1_almacen || 0) + stockActivoMostrador;
            } 
            else if (inventoryRecord.turnoManana && inventoryRecord.turnoManana.t1_mostrador !== undefined) {
                stockActivoMostrador = inventoryRecord.turnoManana.t1_mostrador || 0;
                stockTotal = (inventoryRecord.turnoManana.t1_almacen || 0) + stockActivoMostrador;
            }

            if (stockActivoMostrador === 0 && stockTotal === 0) {
                 return res.status(400).json({ message: `Sin stock de ${item.nombreVariacion} en esta sucursal.` });
            }

            if (tipoPedido === 'menudeo' && item.cantidad > stockActivoMostrador) {
                return res.status(400).json({ message: `Stock insuficiente en mostrador para ${item.nombreVariacion}.` });
            }
            
            if (tipoPedido === 'mayoreo' && item.cantidad > stockTotal) {
                return res.status(400).json({ message: `Stock total insuficiente para pedido de mayoreo.` });
            }
        }
    }
    
    let cargoServicio = 0;
    if (metodoPagoElegido === 'tarjeta') {
        cargoServicio = CARGO_SERVICIO_ONLINE;
    }
    const montoTotalAPagar = subtotalProductos + cargoServicio;

    // 4. Registrar el Pedido
    try {
        const pedido = await Order.create({
            IDUSUARIO: req.user.id, 
            IDSucursal: IDSucursal, // <--- GUARDAMOS LA SUCURSAL SELECCIONADA
            tipoPedido,
            total: montoTotalAPagar,
            items: items, 
            estado: 'pendiente_aprobacion',
        });

        res.status(201).json({ success: true, message: `Pedido ${tipoPedido} solicitado.`, pedidoId: pedido._id });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al registrar el pedido.', error: error.message });
    }
};

// @desc    Obtener historial de pedidos del cliente logueado
// @route   GET /api/v1/client/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ IDUSUARIO: req.user.id })
            .sort({ fecha: -1 }); 
        
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener los pedidos.', error: error.message });
    }
};

// ... (código anterior)


// @desc    Obtener promociones activas y vigentes
// @route   GET /api/v1/client/promotions/active
exports.getActivePromotions = async (req, res) => {
    try {
        const today = new Date();
        const promotions = await Promotion.find({
            activo: true,
            fecha_inicio: { $lte: today }, // Que ya haya empezado
            fecha_fin: { $gte: today }     // Que no haya terminado
        });
        res.json({ success: true, data: promotions });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener promociones.' });
    }
};

// @desc    Obtener reseñas recientes (ej. las últimas 3 de 5 estrellas)
// @route   GET /api/v1/client/reviews/recent
exports.getRecentReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ 
            estado: 'aprobado',
            calificacion: { $gte: 4 } // Solo reseñas buenas (4 o 5 estrellas)
        })
        .sort({ createdAt: -1 }) // Las más nuevas primero
        .limit(3) // Solo 3
        .populate('IDUSUARIO', 'nombrePila') // Nombre del cliente
        .populate('IDPRODUCTO', 'nombreProducto'); // Nombre del helado

        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener reseñas.' });
    }
};

exports.getHomeData = async (req, res) => {
    try {
        const today = new Date();
        
        // 1. Promociones Activas (Populate sucursal para saber el nombre)
        const promotions = await Promotion.find({
            activo: true,
            fecha_inicio: { $lte: today },
            fecha_fin: { $gte: today }
        }).populate('IDSucursal', 'nombreSucursal');

        // 2. Productos Favoritos (Máx 3, activos)
        const favorites = await Product.find({ 
            activo: true, 
            esFavorito: true 
        }).limit(3);

        // 3. Configuración del Título
        const titleConfig = await Config.findOne({ key: 'home_title' });
        const sectionTitle = titleConfig ? titleConfig.value : 'Nuestros Favoritos';

        // 4. Reseñas Recientes
        const reviews = await Review.find({ estado: 'aprobado', calificacion: { $gte: 4 } })
            .sort({ createdAt: -1 }).limit(3)
            .populate('IDUSUARIO', 'nombrePila')
            .populate('IDPRODUCTO', 'nombreProducto');

        res.json({ 
            success: true, 
            data: { promotions, favorites, sectionTitle, reviews } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo datos del home.' });
    }
};