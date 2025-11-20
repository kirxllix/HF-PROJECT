// hf-frontend/src/api/orderService.jsx

import apiClient from './apiClient';

/**
 * Función que envía el carrito de compras al Backend para:
 * 1. Crear una orden en MongoDB (collection PEDIDOS).
 * 2. Ponerla en estado 'pendiente_aprobacion'.
 */
export const requestOrderForApproval = async (cartItems, shippingInfo) => {
  
  const orderData = {
    // Mapea los items al formato que espera tu backend
    items: cartItems.map(item => ({
      IDProducto: item.productId,
      nombreVariacion: item.variationName,
      cantidad: item.quantity,
    })),
    
    metodoPagoElegido: 'tarjeta', 
  };

  try {
    const response = await apiClient.post('/client/order', orderData); 
    return response.data; 
  } catch (error) {
    console.error("Error al solicitar la orden:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Hubo un error al solicitar el pedido.");
  }
};

// ============================================================
// 👇 ¡ESTAS SON LAS FUNCIONES NUEVAS QUE NECESITAS AGREGAR! 👇
// ============================================================

/**
 * Obtiene el historial de pedidos del cliente logueado.
 * (Usa la ruta GET /client/orders)
 */
export const getMyOrders = async () => {
    const response = await apiClient.get('/client/orders');
    // El backend devuelve { success: true, data: [...] }
    return response.data.data;
};

/**
 * Solicita el link de pago a Mercado Pago para una orden específica.
 * (Usa la ruta POST /client/order/:id/create-payment)
 */
export const initiatePayment = async (orderId) => {
    const response = await apiClient.post(`/client/order/${orderId}/create-payment`);
    // El backend devuelve { id: "...", init_point: "..." }
    return response.data; 
};