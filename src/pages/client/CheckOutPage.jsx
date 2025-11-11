// hf-frontend/src/pages/client/CheckoutPage.jsx

import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { createOrderAndGetPaymentUrl } from '../../api/OrderService';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const { cartItems, subtotal, totalItems, isMayoreo, clearCart } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado para capturar la información de envío del cliente
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  if (totalItems === 0) {
    return (
      <div className="text-center p-20">
        <h1 className="text-3xl font-bold text-gray-700">Tu carrito está vacío.</h1>
        <button onClick={() => navigate('/client/catalogo')} className="mt-4 bg-pink-500 text-white py-2 px-4 rounded">
          Ver Catálogo
        </button>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');

    // Validación básica de campos
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      setError("Por favor, completa tu nombre, teléfono y dirección.");
      return;
    }
    
    setLoading(true);

    try {
      // 1. Llamar al servicio para crear la orden y obtener la URL de MP
      const paymentUrl = await createOrderAndGetPaymentUrl(cartItems, shippingInfo);
      
      // 2. Limpiar el carrito local antes de redirigir
      clearCart();

      // 3. Redirigir al cliente a la pasarela de pago (Mercado Pago)
      window.location.href = paymentUrl;

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <h1 className="text-4xl font-extrabold text-pink-600 mb-8 text-center">
        Revisión y Pago
      </h1>

      <form onSubmit={handleCheckout} className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna 1 y 2: Información del Cliente y Envío */}
        <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl shadow-lg h-fit">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-3">
            1. Detalles de Contacto y Envío
          </h2>
          
          {/* Campos de Información */}
          {['name', 'phone', 'address'].map((field) => (
            <div key={field}>
              <label htmlFor={field} className="block text-sm font-medium text-gray-700 capitalize">
                {field === 'name' ? 'Nombre Completo' : field === 'phone' ? 'Teléfono de Contacto' : 'Dirección de Envío'}
              </label>
              <input
                type={field === 'phone' ? 'tel' : 'text'}
                id={field}
                name={field}
                value={shippingInfo[field]}
                onChange={handleInputChange}
                required
                className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          ))}

          {/* Notas Adicionales */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notas Adicionales (Ej: Horario de entrega)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={shippingInfo.notes}
              onChange={handleInputChange}
              rows="3"
              className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
        </div>

        {/* Columna 3: Resumen del Pedido y Pago */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-4">
              2. Resumen de la Orden
            </h2>
            
            {/* Ítems del Carrito (Scrollable) */}
            <div className="max-h-60 overflow-y-auto space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.quantity}x {item.productName} ({item.variationName})
                  </span>
                  <span className="font-medium text-gray-800">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total y Mensaje de Mayoreo */}
            <div className="pt-4 border-t border-dashed border-gray-300">
              {isMayoreo && (
                <p className="text-sm font-semibold text-red-500 mb-2">
                  ¡Pedido de MAYOREO detectado! (Más de 32 Palomitas)
                </p>
              )}
              <div className="flex justify-between text-xl font-extrabold text-gray-800">
                <span>Subtotal:</span>
                <span className="text-pink-600">${subtotal.toFixed(2)} MXN</span>
              </div>
            </div>
          </div>

          {/* Botón de Pago y Mensaje de Error */}
          <div className="mt-6">
            {error && (
              <p className="text-red-500 text-sm italic mb-3 text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-bold py-3 rounded-lg transition duration-200 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
              }`}
            >
              {loading ? 'Procesando Pago...' : 'Pagar con Mercado Pago'}
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">
              Serás redirigido a la plataforma segura de Mercado Pago.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;