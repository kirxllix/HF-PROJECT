// hf-frontend/src/pages/admin/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient'; // Para consumir la API de Admin
// import { Clock, ShoppingCart, UserCheck } from 'lucide-react'; // Íconos

const AdminDashboard = () => {
  const [stats, setStats] = useState({ 
      pendingOrders: 0, 
      ordersForApproval: 0, 
      activeUsers: 0 
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  //  Función para obtener las estadísticas del Dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        //  Endpoint de Admin para estadísticas (deberías tener una ruta /admin/stats)
        const statsResponse = await apiClient.get('/admin/stats'); 
        setStats(statsResponse.data);

        //  Endpoint para obtener órdenes pendientes (debería existir en adminRoutes.js)
        const ordersResponse = await apiClient.get('/admin/orders/pending');
        setRecentOrders(ordersResponse.data);

      } catch (error) {
        console.error("Error al cargar datos del Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
        👋 Dashboard de Administración
      </h1>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Tarjeta 1: Órdenes Pendientes de Aprobación (Mayoreo) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
          <p className="text-sm font-medium text-gray-500">
            Órdenes Mayoreo por Aprobar
          </p>
          <p className="text-3xl font-extrabold text-yellow-600 mt-1">
            {loading ? '...' : stats.ordersForApproval}
          </p>
        </div>
        
        {/* Tarjeta 2: Total de Órdenes Pendientes (Preparación) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
          <p className="text-sm font-medium text-gray-500">
            Órdenes Pendientes (Total)
          </p>
          <p className="text-3xl font-extrabold text-red-600 mt-1">
            {loading ? '...' : stats.pendingOrders}
          </p>
        </div>
        
        {/* Tarjeta 3: Clientes Registrados o Empleados Activos */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">
            Clientes Activos (Último mes)
          </p>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">
            {loading ? '...' : stats.activeUsers}
          </p>
        </div>
      </div>
      
      {/* Listado de Órdenes Pendientes */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Órdenes Pendientes de Aprobación y Procesamiento
        </h2>
        {/*  Aquí iría un componente reutilizable para listar las órdenes */}
        {loading ? (
            <div className='text-gray-500'>Cargando órdenes...</div>
        ) : recentOrders.length === 0 ? (
            <div className='text-green-600 font-semibold'>🎉 ¡No hay órdenes pendientes de aprobación!</div>
        ) : (
            <ul className="space-y-4">
                {recentOrders.map(order => (
                    <li key={order._id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50 transition">
                        <div>
                            <p className="font-semibold">Pedido #{order._id.slice(-6).toUpperCase()} - {order.tipoPedido}</p>
                            <p className="text-sm text-gray-600">Total: ${order.subtotal.toFixed(2)} MXN</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${order.estado === 'pendiente_aprobacion' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                           {order.estado.replace('_', ' ')}
                        </span>
                    </li>
                ))}
            </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;