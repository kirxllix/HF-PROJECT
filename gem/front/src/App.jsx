// hf-frontend/src/App.jsx (CORREGIDO Y REESTRUCTURADO)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Shared / Layout
import Navbar from './components/shared/Navbar.jsx'; 
import ProtectedRoute from './components/shared/ProtectedRoute.jsx'; 

// Auth
import LoginScreen from './pages/auth/LoginScreen.jsx'; 

// Cliente
import ClientCatalogPage from './pages/client/ClienteCatalogPage.jsx'; 
import CheckoutPage from './pages/client/CheckOutPage.jsx'; 
import HomePage from './pages/client/HomePage.jsx';
import CalculadoraPage from './pages/client/CalculadoraPage.jsx';

// Empleado
import EmployeeDashboard from './pages/employee/EmployeeDashboard.jsx';

// Administrador
import AdminLayout from './pages/admin/AdminLayout.jsx'; // <--- Layout de Admin
import AdminDashboard from './pages/admin/AdminDashboard.jsx'; 
import PromotionsManagement from './pages/admin/PromotionsManagement.jsx';
import AdminReviewModeration from './pages/admin/AdminReviewModeration.jsx'; 
import ReportesPage from './pages/admin/ReportesPage.jsx';
import ProductManagement from './pages/admin/ProductManagement.jsx';

// ===========================================
// LAYOUT PARA CLIENTE/EMPLEADO (CON CARRITO)
// ===========================================
const MainLayout = () => {
    return (
        <>
            <Navbar /> {/* <-- La barra con el carrito */}
            <main>
                <Outlet />
            </main>
        </>
    );
};

// ===========================================
// COMPONENTE APP CON ENRUTAMIENTO CORREGIDO
// ===========================================
const App = () => {
    return (
        <Router>
            <Routes>
                
                {/* 1. Ruta de Login (Sin layout) */}
                <Route path="/login" element={<LoginScreen />} />
                
                {/* 2. Rutas de Cliente y Empleado (Usan MainLayout con carrito) */}
                <Route element={<MainLayout />}>
                   <Route path="/" element={<HomePage />} /> {/* <--- RUTA CAMBIADA */}
                <Route path="/client/catalogo" element={<ClientCatalogPage />} />
                <Route path="/client/calculadora-helado" element={<CalculadoraPage />} />
                    
                    <Route element={<ProtectedRoute allowedRoles="cliente" />}>
                       <Route path="/client/checkout" element={<CheckoutPage />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles="administrador,empleado" />}>
                       <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                    </Route>
                </Route>

                {/* 3. Rutas de Administrador (Usan AdminLayout, SIN carrito) */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles="administrador" />}>
                    <Route element={<AdminLayout />}> {/* <-- El Layout de Admin envuelve SUS rutas */}
                       <Route path="dashboard" element={<AdminDashboard />} /> 
                       <Route path="promociones" element={<PromotionsManagement />} />
                       <Route path="reviews" element={<AdminReviewModeration />} /> 
                       <Route path="reportes" element={<ReportesPage />} />
                       <Route path="productos" element={<ProductManagement />} /> 
                       
                       {/* Redirección por defecto para /admin */}
                       <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>
                </Route>

                {/* Manejo de Ruta No Encontrada (404) */}
                <Route path="*" element={<div className="text-center p-20 text-3xl">Página no encontrada (404)</div>} />

            </Routes>
        </Router>
    );
};

export default App;