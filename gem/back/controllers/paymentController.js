// /controllers/paymentController.js
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const Order = require('../models/order');
const Pago = require('../models/pago');

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

// ===============================
//   CREAR PREFERENCIA DE PAGO
// ===============================
exports.createPaymentPreference = async (req, res) => {
    const { id: orderId } = req.params;
    const { id: userId } = req.user;

    try {
        const order = await Order.findById(orderId).populate('IDUSUARIO', 'email');

        if (!order) return res.status(404).json({ message: 'Pedido no encontrado.' });
        if (order.IDUSUARIO._id.toString() !== userId)
            return res.status(403).json({ message: 'No autorizado para pagar este pedido.' });
        if (order.estado !== 'pendiente_pago')
            return res.status(400).json({ message: `Este pedido no está pendiente de pago.` });

        const items_mercadopago = order.items.map(item => ({
            title: `Palomitas ${item.nombreVariacion}`,
            unit_price: Number(item.precioUnitario.toFixed(2)),
            quantity: item.cantidad,
            currency_id: 'MXN',
        }));

        const preferenceBody = {
            items: items_mercadopago,
            payer: {
                email: order.IDUSUARIO.email,   // se usa el email real del cliente
            },
            back_urls: {
                success: `${process.env.FRONTEND_URL}/pago/exitoso`,
                failure: `${process.env.FRONTEND_URL}/pago/fallido`,
                pending: `${process.env.FRONTEND_URL}/pago/pendiente`,
            },
            auto_return: "approved",
            external_reference: orderId,
            notification_url: `${process.env.BACKEND_URL}/api/v1/payment/webhook`,
        };

        const preference = new Preference(client);
        const response = await preference.create({ body: preferenceBody });

        return res.json({
            id: response.id,
            init_point: response.init_point,
        });

    } catch (error) {
        console.error('Error al crear preferencia:', error);
        return res.status(500).json({ message: 'Error al procesar el pago.' });
    }
};

// ===============================
//   WEBHOOK DE MERCADO PAGO
// ===============================
exports.receiveWebhook = async (req, res) => {
    try {
        let paymentId =
            req.query['data.id'] ||
            req.body?.data?.id ||
            req.query.id;

        if (!paymentId) {
            console.log("Webhook recibido sin ID de pago.");
            return res.sendStatus(200);
        }

        console.log("🔔 Webhook recibido. paymentId =", paymentId);

        const paymentClient = new Payment(client);
        const data = await paymentClient.get({ id: paymentId });

        const orderId = data.external_reference;
        const order = await Order.findById(orderId);

        if (!order) return res.sendStatus(200);

        if (data.status === "approved" && order.estado === "pendiente_pago") {

            const nuevoPago = await Pago.create({
                IDPEDIDO: orderId,
                metodoPago: data.payment_method_id,
                montoTotal: data.transaction_amount,
                subTotal: data.transaction_details?.net_received_amount || data.transaction_amount,
                IVA: 0,
                estadoPago: "confirmado",
                referencia: data.id,
            });

            order.estado = "preparacion";
            order.IDPAGO = nuevoPago._id;
            await order.save();

            console.log(`✅ Pedido ${orderId} actualizado a 'preparacion'.`);
        }

        return res.sendStatus(200);

    } catch (error) {
        console.error("❌ Error en webhook:", error);
        return res.sendStatus(500);
    }
};
