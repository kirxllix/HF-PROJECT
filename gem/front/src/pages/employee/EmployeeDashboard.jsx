// hf-frontend/src/pages/employee/EmployeeDashboard.jsx (ACTUALIZADO)

import React, { useState, useEffect } from 'react';
import { getPendingOrdersBySucursal, updateOrderStatus, registerInventory } from '../../api/employeeService';
import apiClient from '../../api/apiClient'; // 🚨 Importar apiClient para cargar productos
import { useAuth } from '../../hooks/useAuth';

const EmployeeDashboard = () => {
  const { userRole, logout } = useAuth();
  
  // Estados para Órdenes
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // 🚨 Estados para el NUEVO formulario de inventario
  const [products, setProducts] = useState([]); // Lista de todos los productos
  const [inventoryState, setInventoryState] = useState({}); // Objeto para guardar los inputs
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('Mañana'); // Requerido por el backend
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [error, setError] = useState(null);

  // --- Carga de Datos Inicial ---
  
  // 1. Cargar Órdenes Pendientes (esto ya lo tenías)
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await getPendingOrdersBySucursal(); 
      setOrders(data);
    } catch (err) {
      setError("Error al cargar las órdenes pendientes.");
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // 2. 🚨 NUEVO: Cargar todos los productos para la tabla
  const fetchProducts = async () => {
    try {
      // Usamos la ruta del cliente que lista todos los productos
      const response = await apiClient.get('/client/products');
      // Asumiendo que la data está en response.data.data o response.data
      const productData = response.data.data || response.data || [];
      setProducts(productData);
      
      // Inicializar el estado del inventario
      const initialState = {};
      productData.forEach(p => {
        initialState[p._id] = {
          t1_almacen: 0,
          t1_mostrador: 0,
          t2_almacen: 0,
          t2_mostrador: 0,
          ventasSistemaPOS: 0 // Campo para el ticket
        };
      });
      setInventoryState(initialState);
      
    } catch (err) {
      setError("Error al cargar los productos para el inventario.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  // --- Manejadores de Eventos ---

  // Para aprobar/rechazar órdenes (sin cambios)
  const handleUpdateStatus = async (orderId, action) => {
    // ... (Tu lógica existente) ...
  };
  
  // 🚨 NUEVO: Manejador para actualizar la tabla de inventario
  const handleInventoryChange = (productId, field, value) => {
    setInventoryState(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: parseInt(value) || 0 // Convertir a número
      }
    }));
  };

  // 🚨 NUEVO: Manejador para enviar el formulario de inventario
  const handleInventorySubmit = async (e) => {
      e.preventDefault();
      setLoadingInventory(true);
      setError(null);

      // 1. Transformar el estado (objeto) al formato de array que el backend espera
      const registros = Object.keys(inventoryState).map(productId => {
        const item = inventoryState[productId];
        return {
          IDProducto: productId,
          t1_almacen: item.t1_almacen,
          t1_mostrador: item.t1_mostrador,
          t2_almacen: item.t2_almacen,
          t2_mostrador: item.t2_mostrador,
          // El backend espera 'ventasSistemaPOS' como un objeto en un array
          ventasSistemaPOS: {
            cantidadVendida: item.ventasSistemaPOS 
          }
        };
      });

      // 2. Crear el cuerpo de la petición
      const dataToSend = {
          turnoSeleccionado: turnoSeleccionado, // 'Mañana' o 'Noche'
          registros: registros
      };

      try {
          // 3. Llamar a la API (POST a /employee/inventory)
          // Asumimos que es un cierre de turno (no 'apertura') ya que mandamos T1 y T2
          await registerInventory(dataToSend);
          alert('Registro de inventario de CIERRE exitoso!');
      } catch (err) {
          setError('Error al registrar el inventario.');
          console.error(err.response?.data || err.message);
      } finally {
          setLoadingInventory(false);
      }
  };
  
  const isEmployee = userRole === 'empleado';
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-pink-600 mb-6 border-b pb-3">
        {isEmployee ? '📋 Dashboard de Operaciones' : '🔑 Dashboard de Supervisión'}
      </h1>
      <button onClick={logout} className="absolute top-4 right-4 bg-red-500 text-white py-1 px-3 rounded-lg text-sm">
          Cerrar Sesión
      </button>

      {/* --- NUEVO FORMULARIO DE INVENTARIO --- */}
      <form onSubmit={handleInventorySubmit} className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Control de Inventario (Cierre de Turno)
          </h2>
          <div className="flex gap-4">
            <select
              value={turnoSeleccionado}
              onChange={(e) => setTurnoSeleccionado(e.target.value)}
              className="border border-gray-300 rounded-lg p-2"
            >
              <option value="Mañana">Turno Mañana</option>
              <option value="Noche">Turno Noche</option>
            </select>
            <button 
              type="submit" 
              disabled={loadingInventory} 
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400"
            >
              {loadingInventory ? 'Guardando...' : 'Guardar Inventario'}
            </button>
          </div>
        </div>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Tabla de Productos */}
        <div className="overflow-x-auto max-h-[500px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">T1 Almacén</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">T1 Mostrador</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">T2 Almacén</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">T2 Mostrador</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venta Ticket (Sistema)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venta (Calculada)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const state = inventoryState[product._id] || {};
                const t1_total = (state.t1_almacen || 0) + (state.t1_mostrador || 0);
                const t2_total = (state.t2_almacen || 0) + (state.t2_mostrador || 0);
                const ventaCalculada = t1_total - t2_total;

                return (
                  <tr key={product._id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.nombreProducto}</td>
                    
                    {/* --- Inputs --- */}
                    <td><input type="number" min="0" value={state.t1_almacen} onChange={(e) => handleInventoryChange(product._id, 't1_almacen', e.target.value)} className="w-20 border rounded p-1" /></td>
                    <td><input type="number" min="0" value={state.t1_mostrador} onChange={(e) => handleInventoryChange(product._id, 't1_mostrador', e.target.value)} className="w-20 border rounded p-1" /></td>
                    <td><input type="number" min="0" value={state.t2_almacen} onChange={(e) => handleInventoryChange(product._id, 't2_almacen', e.target.value)} className="w-20 border rounded p-1" /></td>
                    <td><input type="number" min="0" value={state.t2_mostrador} onChange={(e) => handleInventoryChange(product._id, 't2_mostrador', e.target.value)} className="w-20 border rounded p-1" /></td>
                    
                    {/* --- Venta del Ticket (POS) --- */}
                    <td><input type="number" min="0" value={state.ventasSistemaPOS} onChange={(e) => handleInventoryChange(product._id, 'ventasSistemaPOS', e.target.value)} className="w-20 border rounded p-1 bg-yellow-50" /></td>
                    
                    {/* --- Total Calculado (Display) --- */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-800">{ventaCalculada}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </form>
      
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
                {/* ... (Tu JSX existente para mostrar las órdenes) ... */}
                <div className="mb-2 sm:mb-0">
                  <p className="font-semibold text-lg">
                      Pedido #{order._id.slice(-6).toUpperCase()} ({order.tipoPedido})
                  </p>
                  <p className="text-sm text-gray-600">Total: ${order.total.toFixed(2)} MXN | Estado: <span className="font-medium text-yellow-700">{order.estado.replace('_', ' ')}</span></p>
                  <p className="text-xs text-gray-500">Cliente: {order.IDUSUARIO.nombrePila || 'N/A'}</p>
                </div>
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