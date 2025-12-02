import React, { useState, useEffect } from 'react';
import { getDashboardStats, getPendingWholesaleOrders, moderateWholesaleOrder } from '../../api/adminService';
// 1. Importar íconos de Lucide
import { DollarSign, ShoppingCart, Activity, Users, Package, CheckCircle, XCircle, Clock, LayoutDashboard } from 'lucide-react';

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
    <div className="space-y-8 min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
         <LayoutDashboard className="text-pink-600" size={32} />
         Panel de Control (Admin)
      </h1>

      {/* --- SECCIÓN DE KPIS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ventas Totales */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex items-center justify-between">
          <div>
             <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Ventas Totales</p>
             <p className="text-3xl font-extrabold text-green-600 mt-1">{loading ? '...' : formatCurrency(stats.ventasNetas)}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full text-green-600">
             <DollarSign size={24} />
          </div>
        </div>

        {/* Mayoreo Pendiente */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500 flex items-center justify-between">
          <div>
             <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Mayoreo Pendiente</p>
             <p className="text-3xl font-extrabold text-yellow-600 mt-1">{loading ? '...' : stats.ordersForApproval}</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
             <Clock size={24} />
          </div>
        </div>

        {/* En Preparación */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 flex items-center justify-between">
          <div>
             <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">En Preparación</p>
             <p className="text-3xl font-extrabold text-blue-600 mt-1">{loading ? '...' : stats.operationalOrders}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
             <Activity size={24} />
          </div>
        </div>

        {/* Clientes Activos */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-pink-500 flex items-center justify-between">
          <div>
             <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Clientes Activos</p>
             <p className="text-3xl font-extrabold text-pink-600 mt-1">{loading ? '...' : stats.activeUsers}</p>
          </div>
          <div className="bg-pink-100 p-3 rounded-full text-pink-600">
             <Users size={24} />
          </div>
        </div>
      </div>
      
      {/* --- SECCIÓN DE APROBACIÓN DE MAYOREO --- */}
      <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-purple-600">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Package className="text-purple-600" size={28} />
            Pedidos de Mayoreo por Aprobar
            {wholesaleOrders.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse ml-2">{wholesaleOrders.length}</span>
            )}
        </h2>

        {loading ? (
            <div className="flex justify-center py-10 text-gray-500 gap-2">
                <span className="animate-spin">⌛</span> Cargando pedidos...
            </div>
        ) : wholesaleOrders.length === 0 ? (
            <div className="p-8 bg-gray-50 rounded-lg text-center text-gray-500 italic border border-gray-200 flex flex-col items-center gap-3">
                <CheckCircle size={48} className="text-green-300" />
                <p>¡Todo al día! No hay pedidos de mayoreo pendientes.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6">
                {wholesaleOrders.map(order => (
                    <div key={order._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition bg-gray-50/50">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b pb-4 border-gray-200">
                            <div>
                                <p className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    Pedido #{order._id.slice(-6).toUpperCase()} 
                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200 font-bold">MAYOREO</span>
                                </p>
                                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                    <Users size={14} />
                                    Cliente: <span className="font-semibold">{order.IDUSUARIO?.nombrePila} {order.IDUSUARIO?.primerApell}</span> ({order.IDUSUARIO?.email})
                                </p>
                            </div>
                            <div className="mt-2 md:mt-0 text-right">
                                <p className="text-2xl font-black text-gray-800">{formatCurrency(order.total)}</p>
                                <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                                    <Clock size={12} />
                                    {new Date(order.fecha).toLocaleDateString()} {new Date(order.fecha).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>

                        {/* Detalle de productos */}
                        <div className="mb-6 bg-white p-4 rounded-lg border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
                                <ShoppingCart size={14} /> Productos Solicitados:
                            </h4>
                            <ul className="space-y-2">
                                {order.items.map((item, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex justify-between border-b border-gray-50 pb-1 last:border-0 last:pb-0">
                                        <span className="flex items-center gap-2">
                                            <span className="font-bold bg-gray-100 px-2 rounded text-gray-600">{item.cantidad}x</span> 
                                            Palomitas {item.nombreVariacion}
                                        </span>
                                        <span className="font-medium text-gray-900">{formatCurrency(item.subtotal)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleModeration(order._id, 'approve')}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition flex justify-center items-center gap-2 transform active:scale-95"
                            >
                                 <CheckCircle size={20} /> Aprobar Pedido
                            </button>
                            <button 
                                onClick={() => handleModeration(order._id, 'reject')}
                                className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-lg font-bold shadow-sm hover:shadow transition flex justify-center items-center gap-2 transform active:scale-95"
                            >
                                 <XCircle size={20} /> Rechazar
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