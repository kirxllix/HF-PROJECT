// hf-frontend/src/api/orderService.jsx (CORREGIDO)

import apiClient from './apiClient';

/**
 * Función que envía el carrito de compras al Backend para:
 * 1. Crear una orden en MongoDB (collection PEDIDOS).
 * 2. Ponerla en estado 'pendiente_aprobacion'.
 * @param {object[]} cartItems - Array de ítems del carrito.
 * @param {object} shippingInfo - Información de envío y contacto.
 * @returns {object} - El pedido creado.
 */

// 1. EL NOMBRE DE LA FUNCIÓN AHORA ES EL CORRECTO
export const requestOrderForApproval = async (cartItems, shippingInfo) => {
  
  const orderData = {
    // 2. Mapea los items al formato que espera tu backend (clientController.js)
    items: cartItems.map(item => ({
      IDPRODUCTO: item.productId,
      nombreVariacion: item.variationName,
      cantidad: item.quantity,
    })),
    
    // 3. Añade el campo que tu backend espera
    metodoPagoElegido: 'tarjeta', // Asumimos esto
  };

  try {
    // 4. Llama a la ruta de API correcta
    const response = await apiClient.post('/client/order', orderData); 
    
    return response.data; // Devuelve el pedido creado
  } catch (error) {
    console.error("Error al solicitar la orden:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Hubo un error al solicitar el pedido.");
  }
};