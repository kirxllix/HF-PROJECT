// src/pages/admin/AdminLayout.jsx (ACTUALIZADO)

import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../hooks/useAuth';

const AdminLayout = () => {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
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
    <div className="flex min-h-screen bg-gray-100">
      
      {/* --- Sidebar (Basado en tu Figma) --- */}
      <nav className="w-64 bg-white shadow-md p-4 flex flex-col">
        <div>
          <h2 className="text-xl font-bold text-pink-600 mb-4 px-3">
            Happy Factory
          </h2>
          
          {/* Link Principal */}
          <Link 
            to="/admin/dashboard" 
            className={`block py-2 px-3 rounded font-medium ${isActive('/admin/dashboard') ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'}`}
          >
            Inicio (KPIs)
          </Link>
          
          {/* Grupo de Gestión */}
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mt-4 mb-2">
            Gestión
          </h3>
          <Link 
            to="/admin/productos" // Ruta nueva
            className={`block py-2 px-3 rounded ${isActive('/admin/productos') ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'}`}
          >
            Productos
          </Link>
          <Link 
            to="/admin/usuarios"
            className={`block py-2 px-3 rounded ${isActive('/admin/usuarios') ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'}`}
          >
            Empleados (Usuarios)
          </Link>
          <Link 
            to="/admin/promociones" 
            className={`block py-2 px-3 rounded ${isActive('/admin/promociones') ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'}`}
          >
            Promociones
          </Link>
          <Link 
            to="/admin/reviews" 
            className={`block py-2 px-3 rounded ${isActive('/admin/reviews') ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'}`}
          >
            Moderación (Reviews)
          </Link>

          {/* Grupo de Sucursales */}
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mt-4 mb-2">
            Sucursales
          {/* Botón rápido de + */}
            <Link to="/admin/gestionar-sucursales" className="text-pink-600 hover:text-pink-800 text-lg font-bold" title="Agregar Sucursal">+</Link>
          </h3>
          {/* Enlace explícito si prefieres */}
          <Link 
            to="/admin/gestionar-sucursales"
            className={`block py-2 px-3 rounded text-sm ${isActive('/admin/gestionar-sucursales') ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100 text-gray-600'}`}
          >
             Gestionar (Crear)
          </Link>
          {loading ? <p className="text-xs text-gray-400 px-3">Cargando...</p> : (
            sucursales.map(sucursal => (
              <Link 
                key={sucursal._id}
                to={`/admin/sucursal/${sucursal._id}`}
                className={`block py-2 px-3 rounded text-sm ${isActive(`/admin/sucursal/${sucursal._id}`) ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'}`}
              >
                {sucursal.nombreSucursal}
              </Link>
            ))
          )}
        </div>
        
        {/* Footer del Sidebar (Cursos) */}
        <div className="mt-auto">
           <hr className="my-2" />
           {/* Reemplaza 'TU_LINK_DE_GOOGLE_DRIVE' con tu enlace real */}
           <a 
            href="TU_LINK_DE_GOOGLE_DRIVE" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block py-2 px-3 rounded text-sm text-gray-600 hover:bg-gray-100"
          >
            Cursos (Drive)
          </a>
        </div>
      </nav>

      {/* --- Contenido Principal --- */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold">Panel de Administración</h1>
            {/* Link de Reportes en el Header */}
            <Link 
              to="/admin/reportes"
              className={`text-sm font-medium ${isActive('/admin/reportes') ? 'text-pink-600' : 'text-gray-600 hover:text-black'}`}
            >
              Reportes
            </Link>
          </div>
          <button 
            onClick={logout} 
            className="bg-pink-600 text-white text-sm font-semibold py-2 px-4 rounded-lg"
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