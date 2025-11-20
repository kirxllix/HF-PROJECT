import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getInventoryReport, getAttendanceReport } from '../../api/adminService';

const SucursalDetail = () => {
  const { id } = useParams();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  
  const [inventoryReport, setInventoryReport] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [invData, attData] = await Promise.all([
        getInventoryReport(id, selectedDate),
        getAttendanceReport(id, selectedDate)
      ]);
      setInventoryReport(invData);
      setAttendanceReport(attData);
    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && selectedDate) fetchReports();
  }, [id, selectedDate]);

  // Helper para renderizar filas vacías si no hay datos
  const renderEmptyState = (msg) => (
    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400 italic text-sm">{msg}</td></tr>
  );

  return (
    <div className="space-y-8 p-2">
      {/* --- ENCABEZADO --- */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Auditoría de Sucursal</h1>
          <p className="text-xs text-gray-400 font-mono mt-1">ID: {id}</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
          />
          <button onClick={fetchReports} className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm">
            Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando datos...</div>
      ) : (
        <>
          {/* --- 1. ASISTENCIA (Auditoría Rápida) --- */}
          <div className="bg-white px-6 py-4 rounded-xl shadow-sm border-l-4 border-purple-500 flex flex-wrap items-center gap-6">
            <h2 className="text-sm font-bold text-purple-800 uppercase tracking-wider mr-4">
                Asistencia:
            </h2>
            {attendanceReport.length === 0 ? (
                <span className="text-xs text-gray-400 italic">Sin registros hoy.</span>
            ) : (
                attendanceReport.map((record, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-gray-700">{record.nombre}</span>
                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs">
                            {new Date(record.llegada).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - 
                            {record.salida === 'En turno' ? 'Activo' : new Date(record.salida).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                ))
            )}
          </div>

          <div className="space-y-8">
            
            {/* === TABLA 1: TURNO MAÑANA === */}
            <div className="bg-white rounded-xl shadow-lg border-t-4 border-yellow-400 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-yellow-50/30">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                         Turno Mañana
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs border-b">
                            <tr>
                                <th className="px-6 py-3 font-bold w-1/3">Producto</th>
                                <th className="px-2 py-3 text-center text-yellow-700 bg-yellow-50/50 border-l">Inic. Alm.</th>
                                <th className="px-2 py-3 text-center text-yellow-700 bg-yellow-50/50 border-r border-yellow-100">Inic. Most.</th>
                                <th className="px-2 py-3 text-center text-gray-600">Final Alm.</th>
                                <th className="px-2 py-3 text-center text-gray-600 border-r">Final Most.</th>
                                <th className="px-4 py-3 text-center font-black bg-gray-50 text-gray-800">Vendido</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {inventoryReport.length === 0 ? renderEmptyState("Sin datos.") : (
                                inventoryReport.map((item, idx) => {
                                    if (!item.manana.registrado) return null; // Ocultar si no se abrió turno
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-medium">{item.producto}</td>
                                            <td className="px-2 py-3 text-center bg-yellow-50/20 font-mono border-l">{item.manana.t1_alm}</td>
                                            <td className="px-2 py-3 text-center bg-yellow-50/20 font-mono border-r border-yellow-100">{item.manana.t1_most}</td>
                                            <td className="px-2 py-3 text-center text-gray-500">{item.manana.t2_alm ?? '-'}</td>
                                            <td className="px-2 py-3 text-center text-gray-500 border-r">{item.manana.t2_most ?? '-'}</td>
                                            <td className="px-4 py-3 text-center font-bold bg-gray-50">{item.manana.vendido ?? '...'}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* === TABLA 2: TURNO NOCHE === */}
            <div className="bg-white rounded-xl shadow-lg border-t-4 border-indigo-600 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50/30">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                         Turno Noche
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs border-b">
                            <tr>
                                <th className="px-6 py-3 font-bold w-1/3">Producto</th>
                                <th className="px-2 py-3 text-center text-indigo-700 bg-indigo-50/50 border-l">Inic. Alm.</th>
                                <th className="px-2 py-3 text-center text-indigo-700 bg-indigo-50/50 border-r border-indigo-100">Inic. Most.</th>
                                <th className="px-2 py-3 text-center text-gray-600">Final Alm.</th>
                                <th className="px-2 py-3 text-center text-gray-600 border-r">Final Most.</th>
                                <th className="px-4 py-3 text-center font-black bg-gray-50 text-gray-800">Vendido</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {inventoryReport.length === 0 ? renderEmptyState("Sin datos.") : (
                                inventoryReport.map((item, idx) => {
                                    if (!item.noche.registrado) return null; // Ocultar si no se abrió turno
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-medium">{item.producto}</td>
                                            <td className="px-2 py-3 text-center bg-indigo-50/20 font-mono border-l">{item.noche.t1_alm}</td>
                                            <td className="px-2 py-3 text-center bg-indigo-50/20 font-mono border-r border-indigo-100">{item.noche.t1_most}</td>
                                            <td className="px-2 py-3 text-center text-gray-500">{item.noche.t2_alm ?? '-'}</td>
                                            <td className="px-2 py-3 text-center text-gray-500 border-r">{item.noche.t2_most ?? '-'}</td>
                                            <td className="px-4 py-3 text-center font-bold bg-gray-50">{item.noche.vendido ?? '...'}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default SucursalDetail;