// src/pages/admin/AdminLayout.jsx (ACTUALIZADO)

import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../hooks/useAuth';
// Importamos el ícono de Menú para el botón de toggle
import { Menu } from 'lucide-react';

const AdminLayout = () => {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  
  //  ESTADO NUEVO: Controla si el sidebar está visible o guardado
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/sucursales');
        setSucursales(response.data.data || []);
      } catch (error) {
        console.error("Error al cargar sucursales:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSucursales();
  }, []);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      
      {/* --- Sidebar (Colapsable) --- */}
      <nav 
        className={`bg-white shadow-md flex flex-col transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'w-64 p-4' : 'w-0 p-0 overflow-hidden border-none'
        }`}
      >
        {/* Contenedor interno de ancho fijo para evitar que el texto se deforme al cerrar */}
        <div className="w-60">
            <h2 className="text-xl font-bold text-pink-600 mb-4 px-3 whitespace-nowrap">
                Happy Factory
            </h2>
            
            {/* Link Principal */}
            <Link 
                to="/admin/dashboard" 
                className={`block py-2 px-3 rounded font-medium whitespace-nowrap ${isActive('/admin/dashboard') ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'}`}
            >
                Inicio (KPIs)
            </Link>
            
            {/* Grupo de Gestión */}
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mt-4 mb-2 whitespace-nowrap">
                Gestión
            </h3>
            <Link 
                to="/admin/productos" 
                className={`block py-2 px-3 rounded whitespace-nowrap ${isActive('/admin/productos') ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'}`}
            >
                Productos
            </Link>
            <Link 
                to="/admin/usuarios"
                className={`block py-2 px-3 rounded whitespace-nowrap ${isActive('/admin/usuarios') ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'}`}
            >
                Empleados (Usuarios)
            </Link>
            <Link 
                to="/admin/promociones" 
                className={`block py-2 px-3 rounded whitespace-nowrap ${isActive('/admin/promociones') ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'}`}
            >
                Promociones
            </Link>
            <Link 
                to="/admin/reviews" 
                className={`block py-2 px-3 rounded whitespace-nowrap ${isActive('/admin/reviews') ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'}`}
            >
                Moderación (Reviews)
            </Link>

            {/* Grupo de Sucursales */}
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mt-4 mb-2 whitespace-nowrap">
                Sucursales
            {/* Botón rápido de + */}
                <Link to="/admin/gestionar-sucursales" className="text-pink-600 hover:text-pink-800 text-lg font-bold ml-2" title="Agregar Sucursal">+</Link>
            </h3>
            <Link 
                to="/admin/gestionar-sucursales"
                className={`block py-2 px-3 rounded text-sm whitespace-nowrap ${isActive('/admin/gestionar-sucursales') ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100 text-gray-600'}`}
            >
                Gestionar (Crear)
            </Link>
            {loading ? <p className="text-xs text-gray-400 px-3">Cargando...</p> : (
                sucursales.map(sucursal => (
                <Link 
                    key={sucursal._id}
                    to={`/admin/sucursal/${sucursal._id}`}
                    className={`block py-2 px-3 rounded text-sm whitespace-nowrap ${isActive(`/admin/sucursal/${sucursal._id}`) ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'}`}
                >
                    {sucursal.nombreSucursal}
                </Link>
                ))
            )}

            {/* Footer del Sidebar */}
            <div className="mt-10">
                <hr className="my-2" />
                <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block py-2 px-3 rounded text-sm text-gray-600 hover:bg-gray-100 whitespace-nowrap"
                >
                    Cursos (Drive)
                </a>
            </div>
        </div>
      </nav>

      {/* --- Contenido Principal --- */}
      <div className="flex-1 flex flex-col min-w-0"> {/* min-w-0 previene desbordes en flex */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-4">
            
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
                title={isSidebarOpen ? "Ocultar menú" : "Mostrar menú"}
            >
                <Menu size={24} />
            </button>

            <h1 className="text-xl font-semibold text-gray-800">Panel de Administración</h1>
            
            <Link 
              to="/admin/reportes"
              className={`text-sm font-medium ml-4 hidden sm:block ${isActive('/admin/reportes') ? 'text-pink-600' : 'text-gray-600 hover:text-black'}`}
            >
              Reportes
            </Link>
          </div>

          <button 
            onClick={logout} 
            className="bg-pink-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-pink-700 transition"
          >
            Salir
          </button>
        </header>
        
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;