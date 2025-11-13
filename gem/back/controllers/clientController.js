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
        // Usamos un nombre específico para la sucursal por defecto.
        const benton = await Sucursal.findOne({ nombreSucursal: 'Benton' });
        if (benton) {
            return benton._id;
        }
        // Si no existe, se retorna null y las funciones fallarán (lo cual es correcto).
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
exports.getCatalogo = async (req, res) => {
    try {
        const ID_SUCURSAL_BENTON = await getBentonSucursalId();
        if (!ID_SUCURSAL_BENTON) {
            return res.status(500).json({ success: false, message: 'Error de configuración: Sucursal Benton no disponible.' });
        }

        const today = new Date().setHours(0, 0, 0, 0);

        // 1. Usar MongoDB Aggregation para unir Productos con su Inventario más reciente
        const productsWithStock = await Product.aggregate([
            // Paso 1: Filtrar solo productos activos (no archivados)
            { $match: { activo: true } },
            
            // Paso 2: Buscar (Lookup) el inventario correspondiente (solo de Benton y de hoy)
            {
                $lookup: {
                    from: 'inventories', // Nombre de la colección 'inventories'
                    let: { productId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$IDProducto', '$$productId'] },
                                        { $eq: ['$IDSucursal', ID_SUCURSAL_BENTON] },
                                        { $eq: ['$fecha', today] } // Solo inventario de hoy
                                    ]
                                }
                            }
                        },
                        { $limit: 1 } // Solo el registro de hoy
                    ],
                    as: 'inventoryData'
                }
            },
            // Paso 3: Descomprimir el array 'inventoryData'
            { $unwind: { path: '$inventoryData', preserveNullAndEmptyArrays: true } },
            
            // Paso 4: Proyectar el resultado y calcular el stock visible
            {
                $project: {
                    nombreProducto: 1,
                    descripcion: 1,
                    categoria: 1,
                    variaciones: 1,
                    
                    // Lógica de Stock: Muestra el stock si existe, sin importar la venta online
                    stockDisponible: {
                        $cond: {
                            if: { $and: [ '$inventoryData.turnoManana' ] },
                            then: '$inventoryData.turnoManana.t1_mostrador',
                            else: 0 
                        }
                    },
                    
                    // NUEVO CAMPO: Define si se puede vender en línea basado en la categoría
                    puedeComprarseOnline: {
                        $cond: {
                            if: { $eq: ['$categoria', 'palomita'] }, // Si la categoría es 'palomita'
                            then: true,
                            else: false
                        }
                    }
                }
            }
        ]);

        res.status(200).json({ success: true, count: productsWithStock.length, data: productsWithStock });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener el catálogo.', error: error.message });
    }
};


// @desc    Validar stock y solicitar pedido (CRÍTICO)
// @route   POST /api/v1/client/order
// @access  Private (Cliente loggeado)
exports.solicitarPedido = async (req, res) => {
    const { items, metodoPagoElegido } = req.body;
    let totalPalomitas = 0;
    let subtotalProductos = 0;
    
    // --- OBTENER DATOS CRÍTICOS Y STOCK DISPONIBLE ---
    const ID_SUCURSAL_BENTON = await getBentonSucursalId();
    if (!ID_SUCURSAL_BENTON) {
        return res.status(500).json({ message: 'Error de configuración: Sucursal Benton no disponible.' });
    }
    const today = new Date().setHours(0, 0, 0, 0);
    // -----------------------------------------------------

    // 1. Revalidación de Precios (Recorrido de seguridad)
    for (const item of items) {
        const productDoc = await Product.findById(item.IDProducto);
        
        // a) Validar que exista y sea vendible en línea (solo palomitas)
        if (!productDoc || productDoc.categoria !== 'palomita') {
            return res.status(400).json({ message: `El producto "${productDoc.nombreProducto}" no está disponible para venta en línea.` });
        }
        
        // b) Recalcular precio y validar variación (Evita manipulación del precio)
        const variacion = productDoc.variaciones.find(v => v.nombre === item.nombreVariacion);
        if (!variacion) {
             return res.status(400).json({ message: `Variación de producto no encontrada.` });
        }
        
        // c) Contar palomitas para límite de menudeo/mayoreo
        if (productDoc.categoria === 'palomita') {
            totalPalomitas += item.cantidad; 
        }
        
        // d) Actualizar subtotales con el precio real del catálogo
        subtotalProductos += variacion.precio * item.cantidad;
        item.precioUnitario = variacion.precio;
        item.subtotal = variacion.precio * item.cantidad;
    }

    // 2. Determinar Tipo de Pedido y Monto Final
    const tipoPedido = totalPalomitas > LIMITE_MENUDEO ? 'mayoreo' : 'menudeo';
    
    // 3. VALIDACIÓN DE STOCK DINÁMICA (¡LÓGICA OPCIÓN A!)
    for (const item of items) {
        // Solo validamos stock de productos vendibles (Palomitas, ICEE, etc.)
        if (item.categoria === 'palomita' || item.categoria === 'icee') { // Asegúrate de validar todos los productos inventariables
            
            const inventoryRecord = await Inventory.findOne({ 
                IDSucursal: ID_SUCURSAL_BENTON, 
                IDProducto: item.IDProducto, 
                fecha: today 
            });

            if (!inventoryRecord || !inventoryRecord.turnoManana) {
                return res.status(400).json({ message: `Stock de ${item.nombreVariacion} no cargado para hoy.` });
            }

            // Extraer stock de T1 Mañana (el stock de apertura)
            const t1_mostrador = inventoryRecord.turnoManana.t1_mostrador || 0;
            const t1_almacen = inventoryRecord.turnoManana.t1_almacen || 0;
            const stockTotal = t1_mostrador + t1_almacen;

            if (tipoPedido === 'menudeo' && item.cantidad > t1_mostrador) {
                return res.status(400).json({ message: `Stock insuficiente en mostrador (${t1_mostrador} unidades) para ${item.nombreVariacion}.` });
            }
            
            if (tipoPedido === 'mayoreo' && item.cantidad > stockTotal) {
                return res.status(400).json({ message: `Stock TOTAL (${stockTotal} unidades) insuficiente para pedido de mayoreo de ${item.nombreVariacion}.` });
            }
        }
    }
    
    // 4. Aplicar Cargo por Servicio (+5 MXN)
    let cargoServicio = 0;
    if (metodoPagoElegido === 'tarjeta') {
        cargoServicio = CARGO_SERVICIO_ONLINE;
    }
    const montoTotalAPagar = subtotalProductos + cargoServicio;

    // 5. Registrar el Pedido
    try {
        const pedido = await Order.create({
            IDUSUARIO: req.user.id, // ID extraída del token
            IDSucursal: ID_SUCURSAL_BENTON, 
            tipoPedido,
            total: montoTotalAPagar,
            items: items, 
            estado: 'pendiente_aprobacion',
            // ... otros campos
        });

        res.status(201).json({ success: true, message: `Pedido ${tipoPedido} solicitado y pendiente de aprobación.`, pedidoId: pedido._id });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al registrar el pedido.', error: error.message });
    }
};
