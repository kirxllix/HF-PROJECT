// hf-frontend/src/pages/employee/EmployeeDashboard.jsx (CON BOTONES DE PEDIDO CONECTADOS)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
// ✅ 1. Importar 'updateOrderStatus'
import { getPendingOrdersBySucursal, updateOrderStatus } from '../../api/employeeService'; 
import apiClient from '../../api/apiClient';
import { useAuth } from '../../hooks/useAuth';

// --- Subcomponente Modal de PIN ---
const PinModal = ({ action, onClose, onSubmit, loading }) => {
    // ... (Código del Modal de PIN - Sin cambios)
    const [pin, setPin] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(pin);
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-2xl w-full max-w-sm">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-800">
                        Asistencia: {action === 'check-in' ? 'Registrar Llegada' : 'Registrar Salida'}
                    </h3>
                    <p className="text-sm text-gray-600">Introduce tu PIN de empleado (4 dígitos).</p>
                </div>
                <div className="p-6">
                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 text-center text-2xl tracking-widest"
                        maxLength="4"
                        autoFocus
                    />
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading || pin.length < 4} className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? 'Registrando...' : 'Confirmar'}
                    </button>
                </div>
            </form>
        </div>
    );
};
// --- Fin del Modal ---


const EmployeeDashboard = () => {
  const { userRole, logout } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // ... (Estados de Inventario - Sin cambios)
  const [products, setProducts] = useState([]); 
  const [inventoryState, setInventoryState] = useState({}); 
  const [currentInventoryData, setCurrentInventoryData] = useState({});
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('Mañana');
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [error, setError] = useState(null);

  const [pinModalAction, setPinModalAction] = useState(null); 
  const [loadingShift, setLoadingShift] = useState(false);

  // --- Funciones de Carga ---
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await getPendingOrdersBySucursal(); 
      setOrders(data);
    } catch (err) {
      console.error("Error al cargar las órdenes pendientes:", err);
    } finally {
      setLoadingOrders(false);
    }
  };
  
  const fetchCurrentInventory = useCallback(async () => {
      try {
          const response = await apiClient.get('/employee/inventory/today');
          setCurrentInventoryData(response.data.data || {});
          setError(null); 
          return response.data.data || {};
      } catch (err) {
          setError("Error al cargar el estado actual del inventario.");
          console.error("Error fetching current inventory:", err);
          return {};
      }
  }, []);

  const checkDayStatus = (productList, inventoryData) => {
      if (productList.length === 0) return 'Mañana'; 

      const allMananaComplete = productList.every(p => {
          const record = inventoryData[p._id];
          const turnData = record?.['turnoManana'];
          return turnData?.IDEmpleado_Cierre !== undefined && turnData.IDEmpleado_Cierre !== null;
      });

      if (allMananaComplete) {
          setTurnoSeleccionado('Noche');
      } else {
          setTurnoSeleccionado('Mañana');
      }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/client/products'); 
      let productData = response.data.data || response.data || [];
      
      const inventoryProducts = productData.filter(p => 
          p.categoria !== 'helado_sabor' && 
          p.categoria !== 'topping'
      );

      setProducts(inventoryProducts);
      
      const initialState = {};
      inventoryProducts.forEach(p => {
        initialState[p._id] = {
          almacen: 0,
          mostrador: 0,
          ventasSistemaPOS: 0
        };
      });
      setInventoryState(initialState);
      
      const inventoryData = await fetchCurrentInventory();
      checkDayStatus(inventoryProducts, inventoryData);
      
    } catch (err) {
      setError("Error al cargar los productos para el inventario.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [fetchCurrentInventory]); 

  // --- Lógica Secuencial y Estado del Formulario ---
  const turnoField = turnoSeleccionado === 'Mañana' ? 'turnoManana' : 'turnoNoche';

  const getProductStatus = (productId) => {
    // ... (Lógica de getProductStatus - Sin cambios)
    const record = currentInventoryData[productId];
    if (!record) {
        return { isT1Complete: false, isT2Complete: false };
    }
    const turnData = record[turnoField]; 
    if (!turnData) {
        return { isT1Complete: false, isT2Complete: false };
    }
    const isT1Complete = turnData.t1_almacen !== undefined && turnData.t1_almacen !== null;
    const isT2Complete = turnData.IDEmpleado_Cierre !== undefined && turnData.IDEmpleado_Cierre !== null;
    return { isT1Complete, isT2Complete };
  };
  
  const overallTurnStatus = useMemo(() => {
    // ... (Lógica de overallTurnStatus - Sin cambios)
      if (products.length === 0) return { isT1Ready: false, isT2Ready: false };
      const allT1Complete = products.every(p => getProductStatus(p._id).isT1Complete);
      const allT2Complete = products.every(p => getProductStatus(p._id).isT2Complete);
      return { 
          isT1Ready: !allT1Complete, 
          isT2Ready: allT1Complete && !allT2Complete
      };
  }, [products, currentInventoryData, turnoSeleccionado]); 

  const handleInventoryChange = (productId, field, value) => {
    // ... (Lógica de handleInventoryChange - Sin cambios)
    setInventoryState(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: parseInt(value) || 0
      }
    }));
  };

  const handleInventorySubmit = async (e, type) => {
    // ... (Lógica de handleInventorySubmit - Sin cambios)
      e.preventDefault();
      if (type === 'apertura' && !overallTurnStatus.isT1Ready) { return; }
      if (type === 'cierre' && !overallTurnStatus.isT2Ready) { return; }
      setLoadingInventory(true);
      setError(null);
      setLastAction(type);

      const registros = products.map(product => {
        const item = inventoryState[product._id] || {};
        const baseRegistro = {
            IDProducto: product._id,
            almacen: item.almacen, 
            mostrador: item.mostrador,
        };
        if (type === 'cierre') {
            baseRegistro.ventasSistemaPOS = item.ventasSistemaPOS;
        }
        return baseRegistro;
      });

      const dataToSend = {
          turnoSeleccionado: turnoSeleccionado,
          registros: registros
      };

      try {
          const response = await apiClient.post(`/employee/inventory?type=${type}`, dataToSend);
          alert(response.data.message);
          const inventoryData = await fetchCurrentInventory(); 
          if (type === 'cierre' && turnoSeleccionado === 'Mañana') {
              checkDayStatus(products, inventoryData);
          }
      } catch (err) {
          setError('Error al registrar el inventario. Verifique la consola para detalles.');
          console.error(err.response?.data || err.message);
      } finally {
          setLoadingInventory(false);
          setLastAction(null);
      }
  };


  const handlePinSubmit = async (pin) => {
    // ... (Lógica de handlePinSubmit - Sin cambios)
    if (!pinModalAction) return;
    setLoadingShift(true);
    const endpoint = pinModalAction === 'check-in' ? '/employee/check-in-pin' : '/employee/check-out-pin';
    const method = pinModalAction === 'check-in' ? 'post' : 'put';
    try {
        const response = await apiClient[method](endpoint, { pin: pin });
        alert(response.data.message); 
        setPinModalAction(null); 
    } catch (err) {
        alert(err.response?.data?.message || 'Error al registrar la asistencia.');
    } finally {
        setLoadingShift(false);
    }
  };

  // ✅ 2. NUEVA FUNCIÓN PARA MANEJAR PEDIDOS
  const handleUpdateStatus = async (orderId, action) => {
    if (!window.confirm(`¿Estás seguro de ${action === 'approve' ? 'APROBAR' : 'RECHAZAR'} este pedido?`)) {
      return;
    }
    
    try {
      // Llamamos a la función del servicio (que ya existía)
      const response = await updateOrderStatus(orderId, action);
      alert(response.message); // Muestra "Pedido aprobado/rechazado exitosamente"
      
      // Refresca la lista de órdenes pendientes
      fetchOrders(); 
      
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar el pedido.');
      console.error(err);
    }
  };
  
  if (products.length === 0 && loadingOrders) return <div className="p-8 text-center">Cargando dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {pinModalAction && (
          <PinModal
            action={pinModalAction}
            onClose={() => setPinModalAction(null)}
            onSubmit={handlePinSubmit}
            loading={loadingShift}
          />
      )}

      <h1 className="text-3xl font-bold text-pink-600 mb-6 border-b pb-3">
        📋 Dashboard de Operaciones (Tablet de Sucursal)
      </h1>
      <button onClick={logout} className="absolute top-4 right-4 bg-red-500 text-white py-1 px-3 rounded-lg text-sm">
          Cerrar Sesión (Empleado Actual)
      </button>

      {/* --- SECCIÓN DE ASISTENCIA POR PIN --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6 flex justify-between items-center">
        {/* ... (Contenido de Asistencia - Sin cambios) ... */}
         <h2 className="text-xl font-bold text-gray-800">
            Control de Asistencia (Por PIN)
          </h2>
          <div className="flex gap-4">
              <button 
                onClick={() => setPinModalAction('check-in')} 
                disabled={loadingShift} 
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400"
              >
                Registrar Llegada (Check-in)
              </button>
              <button 
                onClick={() => setPinModalAction('check-out')} 
                disabled={loadingShift} 
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400"
              >
                Registrar Salida (Check-out)
              </button>
          </div>
      </div>

      {/* --- FORMULARIO DE INVENTARIO --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6"> 
        {/* ... (Contenido del Formulario de Inventario - Sin cambios) ... */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Control de Inventario - {turnoSeleccionado}
          </h2>
          <div className="flex items-center gap-4">
            <select
              value={turnoSeleccionado}
              onChange={(e) => setTurnoSeleccionado(e.target.value)}
              disabled={loadingInventory} 
              className="border border-gray-300 rounded-lg p-2"
            >
              <option value="Mañana">Turno Mañana (Día)</option>
              <option value="Noche">Turno Noche (Tarde)</option>
            </select>
            <button 
                onClick={(e) => handleInventorySubmit(e, 'apertura')}
                disabled={loadingInventory || !overallTurnStatus.isT1Ready} 
                className={`font-semibold py-2 px-4 rounded-lg transition ${
                    !overallTurnStatus.isT1Ready
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
                {loadingInventory && lastAction === 'apertura' ? 'Registrando...' : 'T1. Apertura / Llegada'}
            </button>
            <button 
                onClick={(e) => handleInventorySubmit(e, 'cierre')}
                disabled={loadingInventory || !overallTurnStatus.isT2Ready} 
                className={`font-semibold py-2 px-4 rounded-lg transition ${
                    !overallTurnStatus.isT2Ready
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
                {loadingInventory && lastAction === 'cierre' ? 'Registrando...' : 'T2. Cierre / Cambio'}
            </button>
          </div>
        </div>
        {error && <p className="p-3 bg-red-100 text-red-500 rounded-lg text-center font-medium">{error}</p>}
        {!overallTurnStatus.isT1Ready && !overallTurnStatus.isT2Ready && (
             <p className="p-3 bg-green-100 text-green-700 rounded-lg text-center font-medium">✅ El inventario de {turnoSeleccionado} está completo para hoy.</p>
        )}
        <div className="overflow-x-auto max-h-[500px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">T1 Almacén (Apertura)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">T1 Mostrador (Apertura)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">T2 Almacén (Cierre)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">T2 Mostrador (Cierre)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Venta Ticket (POS)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Venta Online (App)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Venta Calculada (Sistema)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Diferencia (Auditoría)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const state = inventoryState[product._id] || {};
                const { isT1Complete, isT2Complete } = getProductStatus(product._id);
                
                const isT1Active = overallTurnStatus.isT1Ready && !isT1Complete;
                const isT2Active = overallTurnStatus.isT2Ready && isT1Complete && !isT2Complete;
                
                const record = currentInventoryData[product._id];
                const turnData = record?.[turnoField];

                let ventaCalculada = 0;
                let ventaRegistradaPOS = 0;
                let ventaRegistradaOnline = record?.ventasOnlineCalculadas || 0; 
                let diferencia = 0;

                if (isT2Complete && turnData) {
                    const t1_total = (turnData.t1_almacen || 0) + (turnData.t1_mostrador || 0);
                    const t2_total = (turnData.t2_almacen || 0) + (turnData.t2_mostrador || 0);
                    ventaCalculada = t1_total - t2_total;
                    
                    if (Array.isArray(record.ventasSistemaPOS)) { 
                         ventaRegistradaPOS = record.ventasSistemaPOS.reduce((sum, v) => sum + v.cantidadVendida, 0);
                    }
                    
                    const ventaTotalRegistrada = ventaRegistradaPOS + ventaRegistradaOnline;
                    diferencia = ventaCalculada - ventaTotalRegistrada;
                }

                return (
                  <tr key={product._id} className={isT1Complete && isT2Complete ? 'bg-green-50' : ''}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.nombreProducto}</td>
                    
                    <td className={!isT1Active && !isT1Complete ? '' : 'bg-gray-100'}>
                        {isT1Complete ? <span className="font-bold">{turnData.t1_almacen}</span> : (
                            <input type="number" min="0" value={isT1Active ? state.almacen : ''} onChange={(e) => handleInventoryChange(product._id, 'almacen', e.target.value)} disabled={!isT1Active} className="w-full border rounded p-1" />
                        )}
                    </td>
                    <td className={!isT1Active && !isT1Complete ? '' : 'bg-gray-100'}>
                        {isT1Complete ? <span className="font-bold">{turnData.t1_mostrador}</span> : (
                            <input type="number" min="0" value={isT1Active ? state.mostrador : ''} onChange={(e) => handleInventoryChange(product._id, 'mostrador', e.target.value)} disabled={!isT1Active} className="w-full border rounded p-1" />
                        )}
                    </td>

                    <td className={!isT2Active && !isT2Complete ? '' : 'bg-gray-100'}>
                        {isT2Complete ? <span className="font-bold">{turnData.t2_almacen}</span> : (
                            <input type="number" min="0" value={isT2Active ? state.almacen : ''} onChange={(e) => handleInventoryChange(product._id, 'almacen', e.target.value)} disabled={!isT2Active} className="w-full border rounded p-1" />
                        )}
                    </td>
                    <td className={!isT2Active && !isT2Complete ? '' : 'bg-gray-100'}>
                         {isT2Complete ? <span className="font-bold">{turnData.t2_mostrador}</span> : (
                            <input type="number" min="0" value={isT2Active ? state.mostrador : ''} onChange={(e) => handleInventoryChange(product._id, 'mostrador', e.target.value)} disabled={!isT2Active} className="w-full border rounded p-1" />
                        )}
                    </td>

                    <td className={`bg-yellow-50 ${!isT2Active && !isT2Complete ? '' : 'bg-gray-100'}`}>
                         {isT2Complete ? <span className="font-bold">{ventaRegistradaPOS}</span> : (
                            <input type="number" min="0" value={isT2Active ? state.ventasSistemaPOS : ''} onChange={(e) => handleInventoryChange(product._id, 'ventasSistemaPOS', e.target.value)} disabled={!isT2Active} className="w-full border rounded p-1 bg-yellow-50" />
                         )}
                    </td>

                    <td className={`bg-blue-50 ${!isT2Active && !isT2Complete ? '' : 'bg-gray-100'}`}>
                         {isT1Complete || isT2Complete ? (
                            <span className="font-bold">{ventaRegistradaOnline}</span> 
                         ) : (
                            <span className="text-gray-400">...</span>
                         )}
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-800">
                        {isT2Complete ? (
                            <span className="font-bold">{ventaCalculada}</span>
                        ) : (
                            <span className="text-gray-400">...</span>
                        )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold">
                        {isT2Complete ? (
                            <span className={
                                diferencia === 0 ? 'text-green-600' : // OK
                                diferencia > 0 ? 'text-red-500' : // Faltante
                                'text-blue-500' // Sobrante
                            }>
                                {diferencia === 0 && 'OK'}
                                {diferencia > 0 && `Faltante: ${diferencia}`}
                                {diferencia < 0 && `Sobrante: ${Math.abs(diferencia)}`}
                            </span>
                        ) : (
                            <span className="text-gray-400">...</span>
                        )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* --- SECCIÓN DE ÓRDENES ASIGNADAS --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Órdenes Asignadas (Pendientes)
        </h2>
        {loadingOrders ? (
          <div className='text-gray-500'>Cargando órdenes de la sucursal...</div>
        ) : orders.length === 0 ? (
          <div className='text-green-600 font-semibold'>🚀 ¡Todas las órdenes han sido procesadas!</div>
        ) : (
          <ul className="space-y-4">
            {orders.map(order => (
              <li key={order._id} className="border p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-yellow-50 transition duration-150">
                <div className="mb-2 sm:mb-0">
                  <p className="font-semibold text-lg">
                      Pedido #{order._id.slice(-6).toUpperCase()} ({order.tipoPedido})
                  </p>
                  <p className="text-sm text-gray-600">Total: ${order.total.toFixed(2)} MXN | Estado: <span className="font-medium text-yellow-700">{order.estado.replace('_', ' ')}</span></p>
                  <p className="text-xs text-gray-500">Cliente: {order.IDUSUARIO.nombrePila || 'N/A'}</p>
                </div>
                {/* ✅ 3. CONECTAR LOS BOTONES ONCLICK */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleUpdateStatus(order._id, 'approve')}
                    className="bg-green-500 text-white py-1 px-3 rounded-lg text-sm hover:bg-green-600"
                  >
                    Aprobar/Listo
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(order._id, 'reject')}
                    className="bg-red-500 text-white py-1 px-3 rounded-lg text-sm hover:bg-red-600"
                  >
                    Rechazar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;