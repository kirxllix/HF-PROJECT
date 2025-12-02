import React, { useState, useEffect } from 'react';
import { getMyOrders, initiatePayment } from '../../api/orderService';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      setError("No se pudieron cargar tus pedidos.");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (orderId) => {
    try {
      // 1. Llamar al backend para crear la preferencia
      const data = await initiatePayment(orderId);
      
      // 2. Redirigir a Mercado Pago (init_point)
      if (data.init_point) {
        window.location.href = data.init_point; 
      }
    } catch (err) {
      alert("Error al iniciar el pago: " + (err.response?.data?.message || err.message));
    }
  };

  // Diccionario de colores para los estados
  const statusColors = {
    'pendiente_aprobacion': 'bg-yellow-100 text-yellow-800',
    'pendiente_pago': 'bg-blue-100 text-blue-800',
    'preparacion': 'bg-purple-100 text-purple-800',
    'listo': 'bg-green-100 text-green-800',
    'entregado': 'bg-gray-100 text-gray-800',
    'rechazado': 'bg-red-100 text-red-800',
    'cancelado': 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    'pendiente_aprobacion': 'Esperando Aprobación',
    'pendiente_pago': '¡Listo para Pagar!',
    'preparacion': 'En Preparación',
    'listo': 'Listo para Recoger',
    'entregado': 'Entregado',
    'rechazado': 'Rechazado',
    'cancelado': 'Cancelado',
  };

  if (loading) return <div className="p-10 text-center">Cargando tus pedidos...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-pink-600 mb-8">Mis Pedidos</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Aún no tienes pedidos.</p>
          <button onClick={() => navigate('/client/catalogo')} className="text-pink-600 font-semibold hover:underline">
            ¡Ve al catálogo y pide algo rico!
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition">
              
              {/* Cabecera del Pedido */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Pedido #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-gray-400">{new Date(order.fecha).toLocaleDateString()} a las {new Date(order.fecha).toLocaleTimeString()}</p>
                </div>
                <div className="mt-2 md:mt-0 text-right">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[order.estado] || 'bg-gray-100'}`}>
                      {statusLabels[order.estado] || order.estado}
                   </span>
                </div>
              </div>

              {/* Lista de Productos */}
              <ul className="space-y-2 mb-6">
                {order.items.map((item, idx) => (
                  <li key={idx} className="text-gray-700 text-sm flex justify-between">
                    <span>{item.cantidad}x Palomitas ({item.nombreVariacion})</span>
                    <span className="font-medium">${(item.subtotal).toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              {/* Total y Acciones */}
              <div className="flex justify-between items-center pt-2">
                <div className="text-xl font-extrabold text-gray-800">
                  Total: <span className="text-pink-600">${order.total.toFixed(2)}</span>
                </div>
                
                {/* BOTÓN DE PAGO - Solo aparece si el estado es 'pendiente_pago' */}
                {order.estado === 'pendiente_pago' && (
                  <button 
                    onClick={() => handlePay(order._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform transition hover:-translate-y-1"
                  >
                    Pagar Ahora 💳
                  </button>
                )}

                {/* Mensajes para otros estados */}
                {order.estado === 'pendiente_aprobacion' && (
                   <p className="text-xs text-yellow-600 italic">Tu pedido está siendo revisado por la sucursal.</p>
                )}
                {order.estado === 'preparacion' && (
                   <p className="text-xs text-purple-600 font-semibold">¡Ya estamos preparando tus palomitas!</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;