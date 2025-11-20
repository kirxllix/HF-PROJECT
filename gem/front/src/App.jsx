import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// --- LAYOUTS Y COMPONENTES COMPARTIDOS ---
import Navbar from './components/shared/Navbar.jsx'; 
import ProtectedRoute from './components/shared/ProtectedRoute.jsx'; 

// --- PÁGINAS DE AUTENTICACIÓN ---
import LoginScreen from './pages/auth/LoginScreen.jsx'; 

// --- PÁGINAS DE CLIENTE (Públicas y Privadas) ---
import HomePage from './pages/client/HomePage.jsx';
import AboutPage from './pages/client/AboutPage.jsx';
import ClientCatalogPage from './pages/client/ClienteCatalogPage.jsx'; 
import CalculadoraPage from './pages/client/CalculadoraPage.jsx';
import CheckoutPage from './pages/client/CheckOutPage.jsx'; 
import OrdersPage from './pages/client/OrdersPage.jsx';

// --- PÁGINAS DE EMPLEADO ---
import EmployeeDashboard from './pages/employee/EmployeeDashboard.jsx';

// --- PÁGINAS DE ADMINISTRADOR ---
import AdminLayout from './pages/admin/AdminLayout.jsx'; 
import AdminDashboard from './pages/admin/AdminDashboard.jsx'; 
import PromotionsManagement from './pages/admin/PromotionsManagement.jsx';
import AdminReviewModeration from './pages/admin/AdminReviewModeration.jsx'; 
import ReportesPage from './pages/admin/ReportesPage.jsx';
import ProductManagement from './pages/admin/ProductManagement.jsx';
import UserManagement from './pages/admin/UserManagement.jsx';
import SucursalesManagement from './pages/admin/SucursalesManagement.jsx';
import SucursalDetail from './pages/admin/SucursalDetail.jsx';

// ===========================================
// LAYOUT PRINCIPAL (Con Navbar y Carrito)
// ===========================================
const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar /> {/* Barra de navegación visible para todos */}
            <main className="flex-grow">
                <Outlet /> {/* Aquí se renderizan las páginas hijas */}
            </main>
        </div>
    );
};

// ===========================================
// RUTAS DE LA APLICACIÓN
// ===========================================
const App = () => {
    return (
        <Router>
            <Routes>
                
                {/* 1. LOGIN (Ruta independiente) */}
                <Route path="/login" element={<LoginScreen />} />
                
                {/* 2. RUTAS PRINCIPALES (Usan MainLayout) */}
                <Route element={<MainLayout />}>
                   
                   {/* --- ZONA PÚBLICA (Cualquiera puede ver esto) --- */}
                   <Route path="/" element={<HomePage />} /> 
                   <Route path="/about" element={<AboutPage />} />
                   <Route path="/client/catalogo" element={<ClientCatalogPage />} />
                   <Route path="/client/calculadora-helado" element={<CalculadoraPage />} />
                    
                    {/* --- ZONA CLIENTE (Requiere Login) --- */}
                    {/* Si intentan entrar aquí sin sesión, ProtectedRoute los manda al Login */}
                    <Route element={<ProtectedRoute allowedRoles="cliente" />}>
                       <Route path="/client/checkout" element={<CheckoutPage />} />
                       <Route path="/client/pedidos" element={<OrdersPage />} />
                    </Route>

                    {/* --- ZONA EMPLEADO (Requiere Login + Rol Empleado/Admin) --- */}
                    <Route element={<ProtectedRoute allowedRoles="administrador,empleado" />}>
                       <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                    </Route>
                </Route>

                {/* 3. RUTAS DE ADMINISTRADOR (Layout Propio, Sin Carrito) */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles="administrador" />}>
                    <Route element={<AdminLayout />}>
                       <Route path="dashboard" element={<AdminDashboard />} /> 
                       
                       {/* Gestión */}
                       <Route path="productos" element={<ProductManagement />} /> 
                       <Route path="usuarios" element={<UserManagement />} />
                       <Route path="promociones" element={<PromotionsManagement />} />
                       <Route path="reviews" element={<AdminReviewModeration />} /> 
                       
                       {/* Sucursales y Reportes */}
                       <Route path="gestionar-sucursales" element={<SucursalesManagement />} />
                       <Route path="sucursal/:id" element={<SucursalDetail />} />
                       <Route path="reportes" element={<ReportesPage />} />
                       
                       {/* Redirección por defecto al entrar a /admin */}
                       <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>
                </Route>

                {/* 4. MANEJO DE ERRORES (404) */}
                <Route path="*" element={
                    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                        <h1 className="text-6xl font-bold text-pink-600 mb-4">404</h1>
                        <p className="text-xl text-gray-600 mb-8">Ups, no encontramos esa página.</p>
                        <a href="/" className="bg-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-700 transition">
                            Volver al Inicio
                        </a>
                    </div>
                } />

            </Routes>
        </Router>
    );
};

export default App;