// hf-frontend/src/pages/employee/EmployeeDashboard.jsx

import React, { useState, useEffect } from 'react';
import { getPendingOrdersBySucursal, updateOrderStatus } from '../../api/employeeService';
import { useAuth } from '../../hooks/useAuth'; 
// import { Clock, Check, X, Package } from 'lucide-react'; // Íconos

const EmployeeDashboard = () => {
  const { userRole, logout } = useAuth(); // Usamos el contexto para el rol/logout
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🚨 Simulación de estado de Inventario (para un formulario simple)
  const [inventoryStock, setInventoryStock] = useState({
      productoId: 'somePopcornId', // Usar un selector en la app real
      t1_mostrador: 0,
      t1_almacen: 0
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Solo el Empleado y el Admin tienen acceso aquí gracias al ProtectedRoute
      const data = await getPendingOrdersBySucursal(); 
      setOrders(data);
    } catch (err) {
      setError("Error al cargar las órdenes pendientes. Verifique la conexión con el backend.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 3. Manejar Aprobación/Rechazo de Pedidos
  const handleUpdateStatus = async (orderId, action) => {
    try {
      await updateOrderStatus(orderId, action);
      // Refrescar la lista de órdenes
      fetchOrders(); 
    } catch (err) {
      alert(`Error al ${action} la orden. Intente de nuevo.`);
      console.error(err);
    }
  };
  
  // 4. Manejar el Registro de Inventario
  const handleInventorySubmit = (e) => {
      e.preventDefault();
      // 🚨 NOTA: Aquí se llamaría a registerInventory(inventoryStock) del employeeService
      console.log('Registrando Inventario:', inventoryStock);
      alert('Registro de inventario simulado exitoso!');
      setInventoryStock({ productoId: 'somePopcornId', t1_mostrador: 0, t1_almacen: 0 });
  };
  
  const isEmployee = userRole === 'empleado';
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-pink-600 mb-6 border-b pb-3">
        {isEmployee ? '📋 Dashboard de Operaciones' : '🔑 Dashboard de Supervisión'}
      </h1>

      {/* Botón de Logout */}
      <button onClick={logout} className="absolute top-4 right-4 bg-red-500 text-white py-1 px-3 rounded-lg text-sm">
          Cerrar Sesión
      </button>

      {/* Grid de Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna 1: Registro de Inventario por Turno (Objetivo Tesis) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
            Control de Inventario (Turno)
          </h2>
          <form onSubmit={handleInventorySubmit} className="space-y-4">
              <p className="text-sm text-gray-500">Registra el stock para auditoría (INVENTARIO)</p>
              
              {/* Campo para t1_mostrador */}
              <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Mostrador (t1)</label>
                  <input
                      type="number"
                      min="0"
                      name="t1_mostrador"
                      value={inventoryStock.t1_mostrador}
                      onChange={(e) => setInventoryStock({...inventoryStock, t1_mostrador: parseInt(e.target.value)})}
                      className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                  />
              </div>

              {/* Campo para t1_almacen */}
              <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Almacén (t1)</label>
                  <input
                      type="number"
                      min="0"
                      name="t1_almacen"
                      value={inventoryStock.t1_almacen}
                      onChange={(e) => setInventoryStock({...inventoryStock, t1_almacen: parseInt(e.target.value)})}
                      className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                  />
              </div>

              <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg">
                  Registrar Inventario
              </button>
          </form>
        </div>
        
        {/* Columna 2 y 3: Órdenes Pendientes de Aprobación/Preparación */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
            Órdenes Asignadas (Pendientes)
          </h2>
          {loading ? (
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
                    <p className="text-sm text-gray-600">Total: ${order.subtotal.toFixed(2)} MXN | Estado: <span className="font-medium text-yellow-700">{order.estado.replace('_', ' ')}</span></p>
                    <p className="text-xs text-gray-500">Cliente: {order.nombreCliente || 'N/A'}</p>
                  </div>
                  <div className="flex space-x-2">
                    {/* Botón de Aprobación */}
                    <button 
                      onClick={() => handleUpdateStatus(order._id, 'approve')}
                      className="bg-green-500 text-white py-1 px-3 rounded-lg text-sm hover:bg-green-600"
                    >
                      {/* <Check size={16} /> */}
                      Aprobar/Listo
                    </button>
                    {/* Botón de Rechazo (si es necesario) */}
                    <button 
                      onClick={() => handleUpdateStatus(order._id, 'reject')}
                      className="bg-red-500 text-white py-1 px-3 rounded-lg text-sm hover:bg-red-600"
                    >
                      {/* <X size={16} /> */}
                      Rechazar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default EmployeeDashboard;