// /controllers/clientController.js
const Product = require('../models/product');
const Inventory = require('../models/inventory');
const Order = require('../models/order');
const Sucursal = require('../models/sucursal');
const mongoose = require('mongoose');

// --- Constantes de Regla de Negocio ---
const LIMITE_MENUDEO = 32;
const CARGO_SERVICIO_ONLINE = 5.00;

// Función reutilizable para obtener la ID de la sucursal de Benton (la sucursal por defecto)
const getBentonSucursalId = async () => {
    try {
        const benton = await Sucursal.findOne({ nombreSucursal: 'Benton' });
        if (benton) {
            return benton._id;
        }
        console.error("Error crítico: La sucursal 'Benton' no está registrada en la DB.");
        return null;
    } catch (error) {
        console.error("Error al buscar sucursal Benton:", error);
        return null; 
    }
};

// @desc    Obtener el catálogo público (Cliente)
// @route   GET /api/v1/client/products
// @access  Public
// /controllers/clientController.js
// ... (El resto de tus funciones como getBentonSucursalId, etc. se quedan igual)

// @desc    Obtener el catálogo público (Cliente)
// @route   GET /api/v1/client/products
// @access  Public
exports.getCatalogo = async (req, res) => {
    try {
        const ID_SUCURSAL_BENTON = await getBentonSucursalId();
        if (!ID_SUCURSAL_BENTON) {
            return res.status(500).json({ success: false, message: 'Error de configuración: Sucursal Benton no disponible.' });
        }

        const today = new Date().setHours(0, 0, 0, 0);

        const productsWithStock = await Product.aggregate([
            { $match: { activo: true } },
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
                                        { $eq: ['$IDSucursal', ID_SUCURSAL_BENTON] },
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
            
            // Paso 4: Proyectar el resultado
            {
                $project: {
                    // ✅ LA CORRECCIÓN CLAVE ESTÁ AQUÍ
                    _id: 1, 
                    
                    nombreProducto: 1,
                    descripcion: 1,
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
    console.error("🔥 ERROR EN solicitarPedido:", error);

    return res.status(500).json({
        success: false,
        message: 'Error al registrar el pedido.',
        error: error.message
    });
}




// ... (El resto de tu archivo, como solicitarPedido, continúa igual)


// @desc    Validar stock y solicitar pedido (CRÍTICO)
// @route   POST /api/v1/client/order
// @access  Private (Cliente loggeado)
exports.solicitarPedido = async (req, res) => {
    const { items, metodoPagoElegido } = req.body;
    let totalPalomitas = 0;
    let subtotalProductos = 0;
    
    const ID_SUCURSAL_BENTON = await getBentonSucursalId();
    if (!ID_SUCURSAL_BENTON) {
        return res.status(500).json({ message: 'Error de configuración: Sucursal Benton no disponible.' });
    }
    const today = new Date().setHours(0, 0, 0, 0);

    // 1. Revalidación de Precios (Recorrido de seguridad)
    for (const item of items) {
        const productDoc = await Product.findById(item.IDProducto);
        
        if (!productDoc) {
             return res.status(400).json({ message: `El producto con ID ${item.IDProducto} ya no existe en el catálogo. Por favor, vacía tu carrito y vuelve a empezar.` });
        }
        
        if (productDoc.categoria !== 'palomita') {
            return res.status(400).json({ message: `El producto "${productDoc.nombreProducto}" no está disponible para venta en línea.` });
        }
        
        const variacion = productDoc.variaciones.find(v => v.nombre === item.nombreVariacion);
        if (!variacion) {
             return res.status(400).json({ message: `Variación de producto no encontrada para ${productDoc.nombreProducto}.` });
        }
        
        if (productDoc.categoria === 'palomita') {
            totalPalomitas += item.cantidad; 
        }
        
        subtotalProductos += variacion.precio * item.cantidad;
        item.precioUnitario = variacion.precio;
        item.subtotal = variacion.precio * item.cantidad;
        item.categoria = productDoc.categoria;
    }

    // 2. Determinar Tipo de Pedido y Monto Final
    const tipoPedido = totalPalomitas > LIMITE_MENUDEO ? 'mayoreo' : 'menudeo';
    
    // ✅ INICIO DE CORRECCIÓN (LÓGICA DE VALIDACIÓN DE STOCK)
    // 3. VALIDACIÓN DE STOCK DINÁMICA
    for (const item of items) {
        // Solo validamos stock de productos vendibles (Palomitas)
        if (item.categoria === 'palomita') { 
            
            const inventoryRecord = await Inventory.findOne({ 
                IDSucursal: ID_SUCURSAL_BENTON, 
                IDProducto: item.IDProducto, 
                fecha: today 
            });

            // Si no hay registro de inventario para hoy
            if (!inventoryRecord) {
                return res.status(400).json({ message: `Stock de ${item.nombreVariacion} no cargado para hoy.` });
            }

            // Determina cuál es el stock activo
            let stockActivoMostrador = 0;
            let stockTotal = 0;

            // Primero, revisa si el Turno Noche (Tarde) ha iniciado
            if (inventoryRecord.turnoNoche && inventoryRecord.turnoNoche.t1_mostrador !== undefined) {
                stockActivoMostrador = inventoryRecord.turnoNoche.t1_mostrador || 0;
                stockTotal = (inventoryRecord.turnoNoche.t1_almacen || 0) + stockActivoMostrador;
            } 
            // Si no, revisa el Turno Mañana
            else if (inventoryRecord.turnoManana && inventoryRecord.turnoManana.t1_mostrador !== undefined) {
                stockActivoMostrador = inventoryRecord.turnoManana.t1_mostrador || 0;
                stockTotal = (inventoryRecord.turnoManana.t1_almacen || 0) + stockActivoMostrador;
            }
            // Si ninguno tiene T1, el stock es 0 (y el 'if' de abajo fallará)

            if (stockActivoMostrador === 0 && stockTotal === 0) {
                 return res.status(400).json({ message: `Stock de ${item.nombreVariacion} no cargado para hoy.` });
            }

            // Aplicar las reglas de stock
            if (tipoPedido === 'menudeo' && item.cantidad > stockActivoMostrador) {
                return res.status(400).json({ message: `Stock insuficiente en mostrador (${stockActivoMostrador} unidades) para ${item.nombreVariacion}.` });
            }
            
            if (tipoPedido === 'mayoreo' && item.cantidad > stockTotal) {
                return res.status(400).json({ message: `Stock TOTAL (${stockTotal} unidades) insuficiente para pedido de mayoreo de ${item.nombreVariacion}.` });
            }
        }
    }
    // ✅ FIN DE CORRECCIÓN
    
    // 4. Aplicar Cargo por Servicio (+5 MXN)
    let cargoServicio = 0;
    if (metodoPagoElegido === 'tarjeta') {
        cargoServicio = CARGO_SERVICIO_ONLINE;
    }
    const montoTotalAPagar = subtotalProductos + cargoServicio;

    // 5. Registrar el Pedido
    try {
        const pedido = await Order.create({
            IDUSUARIO: req.user.id, 
            IDSucursal: ID_SUCURSAL_BENTON, 
            tipoPedido,
            total: montoTotalAPagar,
            items: items, 
            estado: 'pendiente_aprobacion',
        });

        res.status(201).json({ success: true, message: `Pedido ${tipoPedido} solicitado y pendiente de aprobación.`, pedidoId: pedido._id });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al registrar el pedido.', error: error.message });
    }
};
}