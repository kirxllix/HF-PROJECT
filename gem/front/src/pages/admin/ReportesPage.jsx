// src/pages/admin/ReportesPage.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

// --- Componente de Gráfica Simple (Sin librerías externas) ---
const SalesChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-400">No hay datos de ventas recientes para graficar.</p>
            </div>
        );
    }

    // Encontrar el valor máximo para calcular la altura de las barras (100%)
    const maxVal = Math.max(...data.map(d => d.totalDia));

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-700 mb-6">Tendencia de Ventas (Últimos 7 Días)</h3>
            
            {/* Contenedor de la Gráfica */}
            <div className="flex items-end justify-between h-64 gap-2 sm:gap-4">
                {data.map((day) => {
                    // Calculamos altura en porcentaje (mínimo 5% para que se vea algo)
                    const heightPercent = maxVal > 0 ? (day.totalDia / maxVal) * 100 : 0;
                    const barHeight = Math.max(heightPercent, 5); 

                    return (
                        <div key={day._id} className="flex flex-col items-center flex-1 group relative">
                            
                            {/* Tooltip con el valor exacto al pasar el mouse */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 font-bold">
                                ${day.totalDia.toFixed(2)}
                            </div>

                            {/* La Barra */}
                            <div 
                                className="w-full bg-gradient-to-t from-pink-500 to-pink-400 rounded-t-md transition-all duration-500 ease-out hover:from-pink-600 hover:to-pink-500"
                                style={{ height: `${barHeight}%` }}
                            ></div>
                            
                            {/* La Fecha */}
                            <p className="mt-2 text-xs text-gray-500 font-medium transform -rotate-45 sm:rotate-0 origin-top-left sm:origin-center">
                                {new Date(day._id).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ReportesPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error("Error al cargar reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">Generando gráficas y reportes...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-black text-gray-800">Panel de Reportes</h1>
        <p className="text-gray-500">Resumen financiero y operativo.</p>
      </div>
      
      {/* --- SECCIÓN 1: Tarjetas de KPIs (Totales) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Ventas Netas */}
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingresos Totales</p>
                      <h2 className="text-3xl font-black text-gray-800 mt-1">{formatCurrency(stats?.ventasNetas || 0)}</h2>
                  </div>
                  <div className="bg-green-100 p-2 rounded-full text-green-600">
                    💰
                  </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Ventas históricas confirmadas</p>
          </div>

          {/* Pedidos Operativos */}
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">En Operación</p>
                      <h2 className="text-3xl font-black text-gray-800 mt-1">{stats?.operationalOrders || 0}</h2>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    🔥
                  </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Pedidos activos en cocina/entrega</p>
          </div>

           {/* Clientes */}
           <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Usuarios</p>
                      <h2 className="text-3xl font-black text-gray-800 mt-1">{stats?.activeUsers || 0}</h2>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                    👥
                  </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Clientes registrados en plataforma</p>
          </div>
      </div>

      {/* --- SECCIÓN 2: Gráfica de Ventas --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Gráfica (Ocupa 2/3 en pantallas grandes) */}
        <div className="lg:col-span-2">
             <SalesChart data={stats?.salesHistory} />
        </div>

        {/* Columna Derecha: Resumen Rápido */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-fit">
            <h3 className="font-bold text-gray-700 mb-4">Resumen Rápido</h3>
            <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex justify-between border-b border-gray-100 pb-2">
                    <span>Pedidos Mayoreo (Pendientes):</span>
                    <span className="font-bold text-yellow-600">{stats?.ordersForApproval || 0}</span>
                </li>
                <li className="flex justify-between border-b border-gray-100 pb-2">
                    <span>Última Actualización:</span>
                    <span className="font-mono text-xs">{new Date().toLocaleTimeString()}</span>
                </li>
                <li className="pt-2">
                    <p className="text-xs text-gray-400 italic">
                        * Los reportes de inventario detallado se encuentran en la sección de cada Sucursal.
                    </p>
                </li>
            </ul>
        </div>
      </div>

    </div>
  );
};

export default ReportesPage;