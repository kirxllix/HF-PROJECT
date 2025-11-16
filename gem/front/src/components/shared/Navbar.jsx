// hf-frontend/src/components/shared/Navbar.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
// import { ShoppingCart, User, LogOut, Home, Settings } from 'lucide-react'; // Iconos

const Navbar = () => {
    const { isLoggedIn, userRole, logout, isClient } = useAuth();
    const { totalItems } = useCart();

   let dashboardLink = '';
    // ✅ CORRECCIÓN: Solo permite el link de dashboard para el administrador
    if (userRole === 'administrador') {
        dashboardLink = '/admin/dashboard';
    }

    return (
        <nav className="bg-pink-600 shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* Logo/Marca */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-white text-2xl font-bold">
                            Happy Factory
                        </Link>
                    </div>

                    {/* Menú Principal y Acciones */}
                    <div className="flex items-center space-x-4">
                        
                        {/* 1. Botón de Dashboard (Solo para Empleado/Admin) */}
                        {dashboardLink && (
                            <Link to={dashboardLink} className="text-white hover:bg-pink-700 p-2 rounded-lg transition duration-150 flex items-center">
                                {/* <Home size={20} className="mr-1" /> */}
                                <span>Dashboard</span>
                            </Link>
                        )}

                        {isClient && (
                            <Link to="/client/catalogo" className="text-white hover:bg-pink-700 p-2 rounded-lg transition duration-150">
                                Catálogo
                            </Link>
                        )}
                        
                        {/* 2. Botón de Carrito (Solo para Cliente) */}
                       {/* 2. Botón de Carrito (Solo para Cliente) */}
                        {isClient && (
                        <Link to="/client/checkout" className="text-white hover:bg-pink-700 p-2 rounded-lg transition duration-150 relative flex items-center">
                            {/* <ShoppingCart size={20} /> */}
                            <span>🛒</span>
                            <span className="ml-1 hidden sm:inline">Carrito</span>
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-yellow-400 text-pink-900 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    )}

                        {/* 3. Login/Logout */}
                        {isLoggedIn ? (
                            <button 
                                onClick={logout} 
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center text-sm"
                            >
                                {/* <LogOut size={18} className="mr-1" /> */}
                                <span>Salir</span>
                            </button>
                        ) : (
                            <Link to="/login" className="bg-white text-pink-600 font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center text-sm">
                                {/* <User size={18} className="mr-1" /> */}
                                <span>Iniciar Sesión</span>
                            </Link>
                        )}

                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;