// hf-frontend/src/api/orderService.js

import apiClient from './apiClient';

/**
 * Función que envía el carrito de compras al Backend para:
 * 1. Crear una orden en MongoDB (collection PEDIDOS).
 * 2. Generar el 'preference ID' de Mercado Pago.
 * 3. Devolver la URL de redirección de Mercado Pago.
 * @param {object[]} cartItems - Array de ítems del carrito (del CartContext).
 * @param {object} shippingInfo - Información de envío y contacto del cliente.
 * @returns {string} - URL de redirección a Mercado Pago.
 */
export const createOrderAndGetPaymentUrl = async (cartItems, shippingInfo) => {
  // Mapeamos los ítems del carrito al formato que tu Backend espera 
  // (Mercado Pago espera 'title', 'unit_price', 'quantity')
  const orderData = {
    // 🚨 Esta es la lista de ítems que tu orderController.js debe recibir y validar
    items: cartItems.map(item => ({
      productName: item.productName,
      variationName: item.variationName,
      price: item.price,
      quantity: item.quantity,
      // Los campos para Mercado Pago (MP)
      title: `${item.productName} - ${item.variationName}`, 
      unit_price: item.price,
      currency_id: 'MXN',
    })),
    
    // Información de envío, necesaria para el PEDIDO en MongoDB
    shipping: shippingInfo, 
    
    // Opcional: Aquí podrías añadir un campo para el tipo de orden (Menudeo/Mayoreo)
    // type: isMayoreo ? 'Mayoreo' : 'Menudeo' 
  };

  try {
    // 🚨 RUTA DE TU ENDPOINT: Debe coincidir con orderRoutes.js (POST /orders/checkout)
    const response = await apiClient.post('/orders/checkout', orderData); 
    
    // El Backend de Node.js debe responder con la URL de Mercado Pago
    // [Ej: { paymentUrl: 'https://www.mercadopago.com.mx/...' }]
    const { paymentUrl } = response.data; 

    if (!paymentUrl) {
      throw new Error("El Backend no devolvió la URL de Mercado Pago.");
    }
    
    return paymentUrl;
  } catch (error) {
    console.error("Error al crear la orden o en Mercado Pago:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Hubo un error al procesar el pago. Intente de nuevo.");
  }
};