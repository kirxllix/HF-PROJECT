import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
// 1. Importamos los íconos
import { ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
    const { isLoggedIn, userRole, logout, isClient, isEmployee } = useAuth();
    const { totalItems } = useCart();

   let dashboardLink = '';
    if (userRole === 'administrador') {
        dashboardLink = '/admin/dashboard';
    }

    return (
        <nav className="bg-pink-600 shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-white text-2xl font-bold">
                            Happy Factory
                        </Link>
                    </div>

                    {/* Menú Principal */}
                    <div className="flex items-center space-x-4">

                        {/* Ocultar "Nosotros" a empleados */}
                        {!isEmployee && (
                            <Link to="/about" className="text-white hover:bg-pink-700 p-2 rounded-lg transition duration-150 font-medium">
                                Nosotros
                            </Link>
                        )}
                        
                        {/* Dashboard Admin */}
                        {dashboardLink && (
                            <Link to={dashboardLink} className="text-white hover:bg-pink-700 p-2 rounded-lg transition duration-150 flex items-center gap-2">
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </Link>
                        )}

                        {isClient && (
                            <>
                                <Link to="/client/catalogo" className="text-white hover:bg-pink-700 p-2 rounded-lg transition duration-150">
                                    Catálogo
                                </Link>
                                <Link to="/client/pedidos" className="text-white hover:bg-pink-700 p-2 rounded-lg transition duration-150">
                                    Mis Pedidos
                                </Link>
                            </>
                        )}
                        
                        {/* Botón de Carrito (Con Ícono Lucide) */}
                        {isClient && (
                        <Link to="/client/checkout" className="text-white hover:bg-pink-700 p-2 rounded-lg transition duration-150 relative flex items-center gap-1">
                            <ShoppingCart size={20} />
                            <span className="hidden sm:inline font-medium">Carrito</span>
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-2 bg-yellow-400 text-pink-900 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    )}

                        {/* Login/Logout (Con Íconos Lucide) */}
                        {isLoggedIn ? (
                            <button 
                                onClick={logout} 
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center gap-2 text-sm"
                            >
                                <LogOut size={18} />
                                <span>Salir</span>
                            </button>
                        ) : (
                            <Link to="/login" className="bg-white text-pink-600 font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center gap-2 text-sm">
                                <User size={18} />
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