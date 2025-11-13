// hf-frontend/src/pages/admin/AdminDashboard.jsx (ACTUALIZADO con KPIs)

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient'; 
// import { DollarSign, Package, Users, Truck } from 'lucide-react'; // Iconos

const AdminDashboard = () => {
  // 1. Estado actualizado para los KPIs
  const [stats, setStats] = useState({ 
      ventasNetas: 0,
      ordersForApproval: 0, 
      operationalOrders: 0,
      activeUsers: 0 
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Función de carga (sin cambios, solo recibe los nuevos datos)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Llama al endpoint de Stats (que ahora devuelve los KPIs)
        const statsResponse = await apiClient.get('/admin/stats'); 
        setStats(statsResponse.data);

        // Llama al endpoint de órdenes pendientes (para la lista)
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

  // Función para formatear como moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Inicio (KPIs Generales)
      </h1>

      {/* --- 3. Tarjetas de Estadísticas (KPIs de Figma) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Ventas Totales Netas */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">
            Ventas Totales Netas (Entregadas)
          </p>
          <p className="text-3xl font-extrabold text-green-600 mt-1">
            {loading ? '...' : formatCurrency(stats.ventasNetas)}
          </p>
        </div>
        
        {/* KPI 2: Órdenes por Aprobar (Tarea) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
          <p className="text-sm font-medium text-gray-500">
            Órdenes Mayoreo por Aprobar
          </p>
          <p className="text-3xl font-extrabold text-yellow-600 mt-1">
            {loading ? '...' : stats.ordersForApproval}
          </p>
        </div>

        {/* KPI 3: Órdenes en Proceso (Tarea) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">
            Órdenes en Preparación
          </p>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">
            {loading ? '...' : stats.operationalOrders}
          </p>
        </div>
        
        {/* KPI 4: Clientes Activos */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-pink-500">
          <p className="text-sm font-medium text-gray-500">
            Clientes Registrados
          </p>
          <p className="text-3xl font-extrabold text-pink-600 mt-1">
            {loading ? '...' : stats.activeUsers}
          </p>
        </div>
      </div>
      
      {/* --- 4. Lista de Órdenes Pendientes (Sin cambios) --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Órdenes Pendientes de Aprobación
        </h2>
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
                            <p className="text-sm text-gray-600">Total: {formatCurrency(order.total)}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800`}>
                           {order.estado.replace('_', ' ')}
                        </span>
                    </li>
                ))}
            </ul>
        )}
      </div>

      {/* --- 5. Gráficos (Próximamente) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Distribución de Ventas por Sucursal</h2>
              <p className="text-gray-500">(Gráfico de barras próximamente)</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pérdida por Categoría</h2>
              <p className="text-gray-500">(Gráfico de pastel próximamente)</p>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;