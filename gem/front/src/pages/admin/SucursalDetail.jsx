import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getInventoryReport, getAttendanceReport, getSucursalById } from '../../api/adminService';
// Importamos íconos de lucide-react
import { Store, Clock, Package, IceCream, Table as TableIcon, List, Calendar, Sun, Moon, ClipboardList, AlertCircle, ArrowLeft } from 'lucide-react';

// --- COMPONENTE DE TABLA "FALTANTE DE PALOMITAS" (DOMINGOS) ---
const WeeklyShortageTable = ({ data, date }) => {
    if (data.length === 0) return <p className="text-center text-gray-400 py-8 italic">No hay datos de palomitas para generar el reporte.</p>;

    // Calculamos el total general con lógica de respaldo (Prioridad Noche -> Si no, Mañana)
    const totalGlobalFaltante = data.reduce((acc, item) => {
        let t2_alm = 0;
        let t2_most = 0;

        // 1. Prioridad: Turno Noche (Si existe cierre)
        if (item.noche.t2_alm !== undefined) {
            t2_alm = item.noche.t2_alm;
            t2_most = item.noche.t2_most;
        } 
        // 2. Respaldo: Turno Mañana (Si no hay cierre de noche)
        else if (item.manana.t2_alm !== undefined) {
            t2_alm = item.manana.t2_alm;
            t2_most = item.manana.t2_most;
        }

        return acc + (t2_alm || 0) + (t2_most || 0);
    }, 0);

    // Verificar si la fecha seleccionada es domingo
    const dateObj = new Date(date + 'T00:00:00');
    const isSunday = dateObj.getDay() === 0;

    return (
        <div className="bg-white rounded-xl shadow-md border border-red-200 overflow-hidden animate-fade-in-up">
            <div className="px-6 py-5 border-b border-red-200 bg-red-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="text-xl font-black text-red-800 flex items-center gap-2">
                        <ClipboardList size={28} />
                        Reporte Semanal de Faltantes
                    </h3>
                    <p className="text-red-600 text-sm mt-1">
                        Conteo físico final de palomitas (Cierre de Domingo - Turno Noche)
                        {!isSunday && <span className="font-bold ml-1">(Nota: La fecha seleccionada no es domingo)</span>}
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Total General</span>
                    <span className="bg-red-600 text-white px-4 py-2 rounded-lg text-2xl font-black shadow-sm">
                        {totalGlobalFaltante} <span className="text-sm font-normal opacity-80">pzas</span>
                    </span>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-red-100/30 text-red-900 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-bold border-b border-red-200">Producto</th>
                            <th className="px-4 py-4 text-center border-b border-red-200 bg-red-50/50">T2 Almacén (Noche)</th>
                            <th className="px-4 py-4 text-center border-b border-red-200 bg-red-50/50">T2 Mostrador (Noche)</th>
                            <th className="px-6 py-4 text-center font-black border-b border-red-200 bg-red-100/40 text-red-700">Total Faltante</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-red-100 bg-white">
                        {data.map((item, idx) => {
                            // Lógica de selección de datos para la fila
                            const hasNight = item.noche.t2_alm !== undefined;
                            const hasMorning = item.manana.t2_alm !== undefined;

                            let t2_alm = 0;
                            let t2_most = 0;
                            let total = 0;
                            let sourceLabel = null; // Etiqueta para indicar si usamos datos de la mañana
                            let hasData = false;

                            if (hasNight) {
                                // Usar datos de noche
                                t2_alm = item.noche.t2_alm;
                                t2_most = item.noche.t2_most;
                                total = t2_alm + t2_most;
                                hasData = true;
                            } else if (hasMorning) {
                                // Fallback: Usar datos de mañana
                                t2_alm = item.manana.t2_alm;
                                t2_most = item.manana.t2_most;
                                total = t2_alm + t2_most;
                                sourceLabel = '(Cierre Mañana)';
                                hasData = true;
                            }

                            return (
                                <tr key={idx} className="hover:bg-red-50/30 transition">
                                    <td className="px-6 py-4 font-bold text-gray-800 border-r border-gray-100">
                                        {item.producto}
                                        {/* Mostrar etiqueta si se usó el respaldo */}
                                        {sourceLabel && <span className="text-xs text-orange-600 font-medium ml-2 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">{sourceLabel}</span>}
                                    </td>
                                    <td className="px-4 py-4 text-center font-mono text-gray-600 border-r border-gray-100 bg-gray-50/30">
                                        {hasData ? t2_alm : '-'}
                                    </td>
                                    <td className="px-4 py-4 text-center font-mono text-gray-600 border-r border-gray-100 bg-gray-50/30">
                                        {hasData ? t2_most : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center font-black text-red-600 bg-red-50/10 text-lg">
                                        {hasData ? total : <span className="text-xs text-gray-400 font-normal italic">Pendiente</span>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- COMPONENTE DE TABLA REUTILIZABLE (INVENTARIO DIARIO) ---
const InventoryTable = ({ data, viewMode, colorTheme }) => {
    if (data.length === 0) return <p className="text-center text-gray-400 py-4 italic">Sin datos en esta categoría.</p>;

    // === VISTA DETALLADA (GRAN TABLA COMPARATIVA) ===
    if (viewMode === 'detailed') {
        return (
            <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
                <table className="min-w-full text-xs md:text-sm text-left border-collapse">
                    <thead>
                        {/* 1. Fila Superior de Encabezados (Agrupación de Turnos) */}
                        <tr className="text-gray-600 uppercase text-xs tracking-wider">
                            <th rowSpan="2" className="px-4 py-3 font-black bg-gray-50 border-b border-r border-gray-200 sticky left-0 z-20 w-48">
                                Producto
                            </th>
                            
                            {/* Encabezado Turno Mañana */}
                            <th colSpan="5" className="px-2 py-2 text-center bg-yellow-100/70 text-yellow-800 font-bold border-b border-r border-yellow-200">
                                <div className="flex items-center justify-center gap-2">
                                    <Sun size={16} /> <span>Turno Mañana</span>
                                </div>
                            </th>

                            {/* Encabezado Turno Noche */}
                            <th colSpan="5" className="px-2 py-2 text-center bg-indigo-100/70 text-indigo-800 font-bold border-b border-indigo-200">
                                <div className="flex items-center justify-center gap-2">
                                    <Moon size={16} /> <span>Turno Noche</span>
                                </div>
                            </th>
                        </tr>

                        {/* 2. Fila Inferior de Encabezados (Columnas Específicas) */}
                        <tr className="text-gray-500 text-[10px] md:text-xs uppercase text-center font-semibold">
                            {/* Mañana Sub-columnas */}
                            <th className="px-2 py-2 bg-yellow-50/50 border-b border-r border-yellow-100 w-16">Ini Alm</th>
                            <th className="px-2 py-2 bg-yellow-50/50 border-b border-r border-yellow-100 w-16">Ini Most</th>
                            <th className="px-2 py-2 bg-yellow-50/50 border-b border-r border-yellow-100 w-16">Fin Alm</th>
                            <th className="px-2 py-2 bg-yellow-50/50 border-b border-r border-yellow-100 w-16">Fin Most</th>
                            <th className="px-2 py-2 bg-yellow-100/30 border-b border-r border-yellow-200 text-yellow-700 w-16 font-bold">Venta</th>

                            {/* Noche Sub-columnas */}
                            <th className="px-2 py-2 bg-indigo-50/50 border-b border-r border-indigo-100 w-16">Ini Alm</th>
                            <th className="px-2 py-2 bg-indigo-50/50 border-b border-r border-indigo-100 w-16">Ini Most</th>
                            <th className="px-2 py-2 bg-indigo-50/50 border-b border-r border-indigo-100 w-16">Fin Alm</th>
                            <th className="px-2 py-2 bg-indigo-50/50 border-b border-r border-indigo-100 w-16">Fin Most</th>
                            <th className="px-2 py-2 bg-indigo-100/30 border-b text-indigo-700 w-16 font-bold">Venta</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {data.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                {/* Nombre del Producto (Sticky a la izquierda) */}
                                <td className="px-4 py-3 font-bold text-gray-800 bg-white sticky left-0 border-r border-gray-100 z-10">
                                    {item.producto}
                                </td>

                                {/* === DATOS MAÑANA === */}
                                <td className="px-1 py-2 text-center bg-yellow-50/10 text-gray-600 border-r border-gray-100 font-mono">
                                    {item.manana.t1_alm}
                                </td>
                                <td className="px-1 py-2 text-center bg-yellow-50/10 text-gray-600 border-r border-gray-100 font-mono">
                                    {item.manana.t1_most}
                                </td>
                                <td className="px-1 py-2 text-center bg-yellow-50/10 text-gray-500 border-r border-gray-100 font-mono">
                                    {item.manana.t2_alm ?? '-'}
                                </td>
                                <td className="px-1 py-2 text-center bg-yellow-50/10 text-gray-500 border-r border-gray-100 font-mono">
                                    {item.manana.t2_most ?? '-'}
                                </td>
                                <td className="px-1 py-2 text-center bg-yellow-50/30 font-black text-yellow-700 border-r border-yellow-100">
                                    {item.manana.vendido ?? 0}
                                </td>

                                {/* === DATOS NOCHE === */}
                                <td className="px-1 py-2 text-center bg-indigo-50/10 text-gray-600 border-r border-gray-100 font-mono">
                                    {item.noche.t1_alm}
                                </td>
                                <td className="px-1 py-2 text-center bg-indigo-50/10 text-gray-600 border-r border-gray-100 font-mono">
                                    {item.noche.t1_most}
                                </td>
                                <td className="px-1 py-2 text-center bg-indigo-50/10 text-gray-500 border-r border-gray-100 font-mono">
                                    {item.noche.t2_alm ?? '-'}
                                </td>
                                <td className="px-1 py-2 text-center bg-indigo-50/10 text-gray-500 border-r border-gray-100 font-mono">
                                    {item.noche.t2_most ?? '-'}
                                </td>
                                <td className="px-1 py-2 text-center bg-indigo-50/30 font-black text-indigo-700">
                                    {item.noche.vendido ?? 0}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // --- VISTA TABLA (Resumen Simple - Opción compacta) ---
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-100">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 font-bold sticky left-0 bg-gray-50 z-10 w-1/4">Producto</th>
                        {/* Mañana Resumen */}
                        <th className="px-2 py-3 text-center bg-yellow-100/50 border-l border-yellow-200 text-yellow-900">M. Inicio</th>
                        <th className="px-2 py-3 text-center bg-yellow-100/50 text-yellow-900">M. Final</th>
                        <th className="px-2 py-3 text-center bg-yellow-100/50 text-red-600 font-bold border-r border-yellow-200">M. Venta</th>
                        {/* Noche Resumen */}
                        <th className="px-2 py-3 text-center bg-indigo-100/50 text-indigo-900">N. Inicio</th>
                        <th className="px-2 py-3 text-center bg-indigo-100/50 text-indigo-900">N. Final</th>
                        <th className="px-2 py-3 text-center bg-indigo-100/50 text-red-600 font-bold">N. Venta</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((item, idx) => {
                        // Cálculos para la vista resumida
                        const m_ini = (item.manana.t1_alm || 0) + (item.manana.t1_most || 0);
                        const m_fin = (item.manana.t2_alm ?? '-') === '-' ? '-' : (item.manana.t2_alm + item.manana.t2_most);
                        const n_ini = (item.noche.t1_alm || 0) + (item.noche.t1_most || 0);
                        const n_fin = (item.noche.t2_alm ?? '-') === '-' ? '-' : (item.noche.t2_alm + item.noche.t2_most);

                        return (
                            <tr key={idx} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-3 font-medium text-gray-800 sticky left-0 bg-white border-r border-gray-100">{item.producto}</td>
                                {/* Mañana */}
                                <td className="px-2 py-3 text-center bg-yellow-50/30 font-mono">{m_ini}</td>
                                <td className="px-2 py-3 text-center bg-yellow-50/30 font-mono">{m_fin}</td>
                                <td className="px-2 py-3 text-center font-bold text-red-600 bg-yellow-50/30 border-r border-yellow-100">{item.manana.vendido ?? '-'}</td>
                                {/* Noche */}
                                <td className="px-2 py-3 text-center bg-indigo-50/30 font-mono">{n_ini}</td>
                                <td className="px-2 py-3 text-center bg-indigo-50/30 font-mono">{n_fin}</td>
                                <td className="px-2 py-3 text-center font-bold text-red-600 bg-indigo-50/30">{item.noche.vendido ?? '-'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const SucursalDetail = () => {
  const { id } = useParams();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  
  const [sucursalName, setSucursalName] = useState('Cargando nombre...');
  const [inventoryReport, setInventoryReport] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estado de vista: 'table' (Resumen) | 'detailed' (Detallada) | 'shortage' (Faltante)
  const [viewMode, setViewMode] = useState('detailed'); 

  const fetchData = async () => {
    try {
      setLoading(true);
      try {
          const sucData = await getSucursalById(id);
          setSucursalName(sucData.nombreSucursal);
      } catch (e) { setSucursalName('Sucursal Desconocida'); }

      const [invData, attData] = await Promise.all([
        getInventoryReport(id, selectedDate),
        getAttendanceReport(id, selectedDate)
      ]);
      
      setInventoryReport(invData || []);
      setAttendanceReport(attData || []);
    } catch (error) { console.error("Error cargando datos:", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if (id && selectedDate) fetchData(); }, [id, selectedDate]);

  // Detección de Domingo para advertencias (opcional, ya que el botón siempre está visible ahora)
  const dateObj = new Date(selectedDate + 'T00:00:00'); 
  const isSunday = dateObj.getDay() === 0; 

  const popcornData = inventoryReport.filter(item => item.categoria === 'palomita');
  const otherData = inventoryReport.filter(item => item.categoria !== 'palomita');

  return (
    <div className="space-y-8 p-4 pb-20 max-w-7xl mx-auto">
      
      {/* --- ENCABEZADO --- */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
             <Store size={32} className="text-pink-600" />
             {sucursalName}
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-1">Auditoría Diaria de Operaciones</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0 bg-gray-50 p-2 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={18} />
            <label className="text-xs font-bold uppercase">Fecha:</label>
          </div>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-pink-500 outline-none text-gray-700"
          />
          <button onClick={fetchData} className="bg-pink-600 text-white px-4 py-1 rounded text-sm font-bold hover:bg-pink-700 transition shadow-sm">
            Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 animate-pulse"><p className="text-lg">Cargando auditoría...</p></div>
      ) : (
        <>
          {/* --- SECCIÓN 1: ASISTENCIA --- */}
          {viewMode !== 'shortage' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="text-purple-600" />
                    Asistencia del Personal
                </h2>
                <div className="flex flex-wrap gap-4">
                    {attendanceReport.length === 0 ? (
                        <span className="text-gray-400 italic text-sm px-2">No hay registros de entrada para esta fecha.</span>
                    ) : (
                        attendanceReport.map((record, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 shadow-sm min-w-[200px]">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
                                    {record.nombre.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{record.nombre}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {new Date(record.llegada).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - 
                                        {record.salida === 'En turno' ? <span className="text-green-600 font-bold ml-1">Activo</span> : new Date(record.salida).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
          )}

          {/* --- BARRA DE CONTROL DE VISTAS --- */}
          <div className="flex justify-between items-center border-b pb-4 border-gray-200 flex-wrap gap-4">
                {/* Mensaje de modo */}
                <div className="flex items-center gap-2">
                     {viewMode === 'shortage' && (
                        <button 
                            onClick={() => setViewMode('detailed')} 
                            className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
                        >
                            <ArrowLeft size={16} /> Volver a Inventario
                        </button>
                     )}
                </div>

                <div className="flex gap-2 flex-wrap">
                    {/* Botones Inventario */}
                    <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                        <button 
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1 rounded flex items-center gap-2 text-xs font-bold transition ${viewMode === 'table' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <TableIcon size={16} />
                            Resumen
                        </button>
                        <button 
                            onClick={() => setViewMode('detailed')}
                            className={`px-3 py-1 rounded flex items-center gap-2 text-xs font-bold transition ${viewMode === 'detailed' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <List size={16} />
                            Detallada
                        </button>
                    </div>

                    {/* Botón Faltante de Palomitas (Siempre visible) */}
                    <button 
                        onClick={() => setViewMode('shortage')}
                        className={`px-3 py-1 rounded flex items-center gap-2 text-xs font-bold border transition shadow-sm ${viewMode === 'shortage' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}
                    >
                        <ClipboardList size={16} />
                        Faltante de Palomitas
                    </button>
                </div>
          </div>

          {/* --- CONTENIDO PRINCIPAL (TABLAS) --- */}
          
          {/* MODO FALTANTE */}
          {viewMode === 'shortage' && (
              <div className="space-y-4">
                  <WeeklyShortageTable data={popcornData} date={selectedDate} />
              </div>
          )}

          {/* MODOS NORMALES (INVENTARIOS) */}
          {viewMode !== 'shortage' && (
            <>
                {/* Tabla Palomitas */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-pink-100 pb-2">
                        <Package className="text-pink-600" />
                        <h2 className="text-xl font-bold text-pink-600">Palomitas</h2>
                    </div>
                    <InventoryTable data={popcornData} viewMode={viewMode} colorTheme="pink" />
                </div>

                {/* Tabla Otros */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
                        <IceCream className="text-blue-600" />
                        <h2 className="text-xl font-bold text-blue-600">Otros Productos</h2>
                    </div>
                    <InventoryTable data={otherData} viewMode={viewMode} colorTheme="blue" />
                </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SucursalDetail;