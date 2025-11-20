// hf-frontend/src/pages/admin/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { getDashboardStats, getPendingWholesaleOrders, moderateWholesaleOrder } from '../../api/adminService';

const AdminDashboard = () => {
  // Estados para KPIs
  const [stats, setStats] = useState({ 
      ventasNetas: 0,
      ordersForApproval: 0, 
      operationalOrders: 0,
      activeUsers: 0 
  });
  
  // Estado para la lista de pedidos de mayoreo
  const [wholesaleOrders, setWholesaleOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos
  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData] = await Promise.all([
          getDashboardStats(),
          getPendingWholesaleOrders()
      ]);
      
      setStats(statsData);
      setWholesaleOrders(ordersData);

    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Manejar aprobación/rechazo
  const handleModeration = async (orderId, action) => {
      if(!window.confirm(`¿Estás seguro de ${action === 'approve' ? 'APROBAR' : 'RECHAZAR'} este pedido de mayoreo?`)) return;

      try {
          await moderateWholesaleOrder(orderId, action);
          alert(`Pedido ${action === 'approve' ? 'aprobado' : 'rechazado'} correctamente.`);
          fetchData(); // Recargar datos
      } catch (error) {
          alert("Error al procesar la solicitud.");
      }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Panel de Control (Admin)</h1>

      {/* --- SECCIÓN DE KPIS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">Ventas Totales Netas</p>
          <p className="text-3xl font-extrabold text-green-600 mt-1">{loading ? '...' : formatCurrency(stats.ventasNetas)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
          <p className="text-sm font-medium text-gray-500">Mayoreo Pendiente</p>
          <p className="text-3xl font-extrabold text-yellow-600 mt-1">{loading ? '...' : stats.ordersForApproval}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">En Preparación</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">{loading ? '...' : stats.operationalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-pink-500">
          <p className="text-sm font-medium text-gray-500">Clientes Activos</p>
          <p className="text-3xl font-extrabold text-pink-600 mt-1">{loading ? '...' : stats.activeUsers}</p>
        </div>
      </div>
      
      {/* --- SECCIÓN DE APROBACIÓN DE MAYOREO --- */}
      <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-purple-600">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            🏭 Pedidos de Mayoreo por Aprobar
            {wholesaleOrders.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">{wholesaleOrders.length}</span>
            )}
        </h2>

        {loading ? (
            <p className="text-gray-500">Cargando pedidos...</p>
        ) : wholesaleOrders.length === 0 ? (
            <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-500 italic border border-gray-200">
                No hay pedidos de mayoreo pendientes.
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6">
                {wholesaleOrders.map(order => (
                    <div key={order._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition bg-gray-50">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b pb-4 border-gray-200">
                            <div>
                                <p className="font-bold text-lg text-gray-800">
                                    Pedido #{order._id.slice(-6).toUpperCase()} 
                                    <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">MAYOREO</span>
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Cliente: <span className="font-semibold">{order.IDUSUARIO?.nombrePila} {order.IDUSUARIO?.primerApell}</span> ({order.IDUSUARIO?.email})
                                </p>
                            </div>
                            <div className="mt-2 md:mt-0 text-right">
                                <p className="text-2xl font-black text-gray-800">{formatCurrency(order.total)}</p>
                                <p className="text-xs text-gray-500">{new Date(order.fecha).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Detalle de productos */}
                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Productos Solicitados:</h4>
                            <ul className="space-y-1">
                                {order.items.map((item, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex justify-between border-b border-gray-100 pb-1 last:border-0">
                                        <span>{item.cantidad}x Palomitas {item.nombreVariacion}</span>
                                        <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleModeration(order._id, 'approve')}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-sm transition flex justify-center items-center gap-2"
                            >
                                 Aprobar Pedido
                            </button>
                            <button 
                                onClick={() => handleModeration(order._id, 'reject')}
                                className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-lg font-bold shadow-sm transition flex justify-center items-center gap-2"
                            >
                                 Rechazar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;