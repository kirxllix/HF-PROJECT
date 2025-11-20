// hf-frontend/src/pages/employee/EmployeeDashboard.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getPendingOrdersBySucursal, updateOrderStatus } from '../../api/employeeService'; 
import apiClient from '../../api/apiClient';
import { useAuth } from '../../hooks/useAuth';

// --- Subcomponente Modal de PIN ---
const PinModal = ({ action, onClose, onSubmit, loading }) => {
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

const EmployeeDashboard = () => {
  const { userRole } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
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

    const intervalId = setInterval(() => {
        if (!loadingOrders && !loadingInventory) {
            getPendingOrdersBySucursal()
                .then(data => setOrders(data))
                .catch(err => console.error("Error actualizando órdenes:", err));
        }
    }, 10000); 

    return () => clearInterval(intervalId);

  }, [fetchCurrentInventory]);

  // --- Lógica Secuencial ---
  const turnoField = turnoSeleccionado === 'Mañana' ? 'turnoManana' : 'turnoNoche';

  const getProductStatus = (productId) => {
    const record = currentInventoryData[productId];
    if (!record) return { isT1Complete: false, isT2Complete: false };
    
    const turnData = record[turnoField]; 
    if (!turnData) return { isT1Complete: false, isT2Complete: false };
    
    const isT1Complete = turnData.t1_almacen !== undefined && turnData.t1_almacen !== null;
    const isT2Complete = turnData.IDEmpleado_Cierre !== undefined && turnData.IDEmpleado_Cierre !== null;
    return { isT1Complete, isT2Complete };
  };
  
  const overallTurnStatus = useMemo(() => {
      if (products.length === 0) return { isT1Ready: false, isT2Ready: false };
      const allT1Complete = products.every(p => getProductStatus(p._id).isT1Complete);
      const allT2Complete = products.every(p => getProductStatus(p._id).isT2Complete);
      return { 
          isT1Ready: !allT1Complete, 
          isT2Ready: allT1Complete && !allT2Complete
      };
  }, [products, currentInventoryData, turnoSeleccionado]); 

  const handleInventoryChange = (productId, field, value) => {
    setInventoryState(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: parseInt(value) || 0
      }
    }));
  };

  const handleInventorySubmit = async (e, type) => {
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
          setError('Error al registrar el inventario.');
          console.error(err.response?.data || err.message);
      } finally {
          setLoadingInventory(false);
          setLastAction(null);
      }
  };

  const handlePinSubmit = async (pin) => {
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

  const handleUpdateStatus = async (orderId, action) => {
    if (!window.confirm(`¿Estás seguro de ${action === 'approve' ? 'APROBAR' : 'RECHAZAR'} este pedido?`)) return;
    try {
      const response = await updateOrderStatus(orderId, action);
      alert(response.message);
      fetchOrders(); 
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar el pedido.');
    }
  };

  // --- HELPER: Renderizar Tablas ---
  const renderInventoryTable = (productList) => (
    <div className="overflow-x-auto max-h-[500px] mb-6 border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 bg-green-50">T1 Almacén</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 bg-green-50">T1 Mostrador</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 bg-blue-50">T2 Almacén</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 bg-blue-50">T2 Mostrador</th>
            
            {/* SOLO COLUMNAS ESENCIALES */}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Venta Online</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Venta Calc.</th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {productList.map((product) => {
            const state = inventoryState[product._id] || {};
            const { isT1Complete, isT2Complete } = getProductStatus(product._id);
            const isT1Active = overallTurnStatus.isT1Ready && !isT1Complete;
            const isT2Active = overallTurnStatus.isT2Ready && isT1Complete && !isT2Complete;
            
            const record = currentInventoryData[product._id];
            const turnData = record?.[turnoField];

            let ventaCalculada = 0;
            // Lógica de Venta Online (Mañana vs Noche)
            let ventaOnlineTurno = 0;
            if (record) {
                ventaOnlineTurno = turnoSeleccionado === 'Mañana' 
                    ? record.ventasOnlineManana 
                    : record.ventasOnlineNoche;
            }

            // Cálculo de consumo físico (Inventario Inicial - Inventario Final)
            if (isT2Complete && turnData) {
                const t1_total = (turnData.t1_almacen || 0) + (turnData.t1_mostrador || 0);
                const t2_total = (turnData.t2_almacen || 0) + (turnData.t2_mostrador || 0);
                ventaCalculada = t1_total - t2_total;
            }

            return (
                <tr key={product._id} className={isT1Complete && isT2Complete ? 'bg-green-50' : ''}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.nombreProducto}</td>
                
                {/* T1 ALMACEN */}
                <td className={!isT1Active && !isT1Complete ? '' : 'bg-green-50/50'}>
                    {isT1Complete ? <span className="font-bold">{turnData.t1_almacen}</span> : (
                        <input type="number" min="0" value={isT1Active ? state.almacen : ''} onChange={(e) => handleInventoryChange(product._id, 'almacen', e.target.value)} disabled={!isT1Active} className="w-full border rounded p-1 text-center" />
                    )}
                </td>
                {/* T1 MOSTRADOR */}
                <td className={!isT1Active && !isT1Complete ? '' : 'bg-green-50/50'}>
                    {isT1Complete ? <span className="font-bold">{turnData.t1_mostrador}</span> : (
                        <input type="number" min="0" value={isT1Active ? state.mostrador : ''} onChange={(e) => handleInventoryChange(product._id, 'mostrador', e.target.value)} disabled={!isT1Active} className="w-full border rounded p-1 text-center" />
                    )}
                </td>

                {/* T2 ALMACEN */}
                <td className={!isT2Active && !isT2Complete ? '' : 'bg-blue-50/50'}>
                    {isT2Complete ? <span className="font-bold">{turnData.t2_almacen}</span> : (
                        <input type="number" min="0" value={isT2Active ? state.almacen : ''} onChange={(e) => handleInventoryChange(product._id, 'almacen', e.target.value)} disabled={!isT2Active} className="w-full border rounded p-1 text-center" />
                    )}
                </td>
                {/* T2 MOSTRADOR */}
                <td className={!isT2Active && !isT2Complete ? '' : 'bg-blue-50/50'}>
                    {isT2Complete ? <span className="font-bold">{turnData.t2_mostrador}</span> : (
                        <input type="number" min="0" value={isT2Active ? state.mostrador : ''} onChange={(e) => handleInventoryChange(product._id, 'mostrador', e.target.value)} disabled={!isT2Active} className="w-full border rounded p-1 text-center" />
                    )}
                </td>

                {/* VENTA ONLINE */}
                <td className={`bg-gray-50 text-center`}>
                    <span className="font-bold text-blue-600">{ventaOnlineTurno || 0}</span>
                </td>
                
                {/* VENTA CALCULADA (Consumo real) */}
                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-800 text-center">
                    {isT2Complete ? <span className="font-bold">{ventaCalculada}</span> : <span className="text-gray-400">...</span>}
                </td>
                
                {/* 🚫 SIN COLUMNA DE DIFERENCIA */}
                </tr>
            )
            })}
        </tbody>
        </table>
    </div>
  );
  
  const popcornProducts = products.filter(p => p.categoria === 'palomita');
  const otherProducts = products.filter(p => p.categoria !== 'palomita');

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

      <header className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-3xl font-bold text-pink-600">Dashboard Operativo</h1>
      </header>

      {/* SECCIÓN DE ASISTENCIA */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h2 className="text-xl font-bold text-gray-800">Control de Asistencia</h2>
            <p className="text-gray-500 text-sm">Registra tu entrada o salida usando tu PIN.</p>
         </div>
          <div className="flex gap-3">
              <button onClick={() => setPinModalAction('check-in')} disabled={loadingShift} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow disabled:opacity-50">
                Entrada
              </button>
              <button onClick={() => setPinModalAction('check-out')} disabled={loadingShift} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow disabled:opacity-50">
                Salida
              </button>
          </div>
      </div>

      {/* SECCIÓN DE INVENTARIO */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-t-4 border-pink-500"> 
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
             <h2 className="text-2xl font-bold text-gray-800">Inventario: {turnoSeleccionado}</h2>
             <p className="text-sm text-gray-500">
                {!overallTurnStatus.isT1Ready && !overallTurnStatus.isT2Ready 
                    ? "Todo listo por hoy." 
                    : "Registra los conteos de apertura (T1) o cierre (T2)."}
             </p>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-lg">
            <select
              value={turnoSeleccionado}
              onChange={(e) => setTurnoSeleccionado(e.target.value)}
              disabled={loadingInventory} 
              className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="Mañana">Turno Mañana</option>
              <option value="Noche">Turno Noche</option>
            </select>
            
            <div className="h-6 w-px bg-gray-300 mx-1"></div>

            <button 
                onClick={(e) => handleInventorySubmit(e, 'apertura')}
                disabled={loadingInventory || !overallTurnStatus.isT1Ready} 
                className={`font-semibold py-2 px-4 rounded-lg text-sm transition shadow-sm ${
                    !overallTurnStatus.isT1Ready
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
                {loadingInventory && lastAction === 'apertura' ? 'Guardando...' : 'Guardar T1 (Apertura)'}
            </button>
            <button 
                onClick={(e) => handleInventorySubmit(e, 'cierre')}
                disabled={loadingInventory || !overallTurnStatus.isT2Ready} 
                className={`font-semibold py-2 px-4 rounded-lg text-sm transition shadow-sm ${
                    !overallTurnStatus.isT2Ready
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
                {loadingInventory && lastAction === 'cierre' ? 'Guardando...' : 'Guardar T2 (Cierre)'}
            </button>
          </div>
        </div>
        
        {error && <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-center font-medium mb-4">{error}</div>}

        {/* --- TABLA 1: PALOMITAS --- */}
        <h3 className="text-lg font-bold text-pink-600 mb-3 flex items-center gap-2">
            Palomitas
            <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">{popcornProducts.length} items</span>
        </h3>
        {renderInventoryTable(popcornProducts)}

        {/* --- TABLA 2: OTROS --- */}
        <h3 className="text-lg font-bold text-blue-600 mb-3 mt-8 flex items-center gap-2">
            Otros Productos
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{otherProducts.length} items</span>
        </h3>
        {renderInventoryTable(otherProducts)}

      </div>
      
      {/* SECCIÓN DE ÓRDENES */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-yellow-400">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between">
          <span>Pedidos Pendientes</span>
          {orders.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">{orders.length} nuevos</span>}
        </h2>
        {loadingOrders ? (
          <div className='text-gray-500 py-4 text-center italic'>Buscando pedidos nuevos...</div>
        ) : orders.length === 0 ? (
          <div className='text-green-600 font-medium py-8 text-center bg-green-50 rounded-lg border border-green-100'>
              No hay pedidos pendientes por ahora.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map(order => (
              <div key={order._id} className="border border-yellow-200 bg-yellow-50 p-4 rounded-xl shadow-sm hover:shadow-md transition relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                <div className="pl-3">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="font-bold text-lg text-gray-800">#{order._id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-gray-500 uppercase font-semibold">{order.tipoPedido}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-black text-gray-800">${order.total}</p>
                        </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4">
                        <p>👤 <span className="font-medium">{order.IDUSUARIO.nombrePila} {order.IDUSUARIO.primerApell}</span></p>
                        <p className="mt-1 text-xs text-gray-500">{new Date(order.fecha).toLocaleTimeString()}</p>
                    </div>

                    <div className="flex gap-2 mt-2">
                    <button 
                        onClick={() => handleUpdateStatus(order._id, 'approve')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold shadow-sm transition"
                    >
                        Aprobar
                    </button>
                    <button 
                        onClick={() => handleUpdateStatus(order._id, 'reject')}
                        className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-bold shadow-sm transition"
                    >
                        Rechazar
                    </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;