// hf-frontend/src/App.jsx (CORREGIDO - Arreglando mayúsculas y nombres de archivo)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// ===========================================
// 🚨 1. IMPORTACIONES CORREGIDAS 🚨
// ===========================================

// Shared / Layout
import Navbar from './components/shared/Navbar.jsx'; 
import ProtectedRoute from './components/shared/ProtectedRoute.jsx'; 

// Auth
import LoginScreen from './pages/auth/LoginScreen.jsx'; 

// Cliente
// 🚨 CORRECCIÓN 1: El archivo se llama 'ClienteCatalogPage.jsx' (con 'e')
import ClientCatalogPage from './pages/client/ClienteCatalogPage.jsx'; 
// 🚨 CORRECCIÓN 2: El archivo se llama 'CheckOutPage.jsx' (con 'O' mayúscula)
import CheckoutPage from './pages/client/CheckOutPage.jsx'; 

// Empleado
import EmployeeDashboard from './pages/employee/EmployeeDashboard.jsx';

// Administrador
import AdminDashboard from './pages/admin/AdminDashboard.jsx'; 
import PromotionsManagement from './pages/admin/PromotionsManagement.jsx';
import AdminReviewModeration from './pages/admin/AdminReviewModeration.jsx'; 

// ===========================================
// 2. LAYOUT PRINCIPAL (Contiene la Navbar)
// ===========================================

const MainLayout = () => {
    return (
        <>
            <Navbar />
            <main>
                <Outlet /> {/* Aquí se renderiza el contenido de la ruta */}
            </main>
        </>
    );
};

// ===========================================
// 3. COMPONENTE APP CON ENRUTAMIENTO
// ===========================================

const App = () => {
    return (
        <Router>
            <Routes>
                
                {/* 1. Rutas de Autenticación (Sin Navbar) */}
                <Route path="/login" element={<LoginScreen />} />
                
                {/* 2. Rutas con Navbar (Anidadas bajo MainLayout) */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Navigate to="/client/catalogo" replace />} /> 
                    
                    {/* Rutas del Cliente (Públicas/Autenticadas) */}
                    <Route path="/client/catalogo" element={<ClientCatalogPage />} /> 
                    
                    {/* Rutas Protegidas del Cliente (Checkout) */}
                    <Route element={<ProtectedRoute allowedRoles="cliente" />}>
                       <Route path="/client/checkout" element={<CheckoutPage />} />
                    </Route>

                    {/* Rutas Protegidas de Empleado/Admin */}
                    <Route element={<ProtectedRoute allowedRoles="administrador,empleado" />}>
                       <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                    </Route>

                    {/* Rutas SOLO de Administrador */}
                    <Route element={<ProtectedRoute allowedRoles="administrador" />}>
                       <Route path="/admin/dashboard" element={<AdminDashboard />} />
                       <Route path="/admin/promociones" element={<PromotionsManagement />} />
                       <Route path="/admin/reviews" element={<AdminReviewModeration />} /> 
                    </Route>
                </Route>

                {/* Manejo de Ruta No Encontrada (404) */}
                <Route path="*" element={<div className="text-center p-20 text-3xl">Página no encontrada (404)</div>} />

            </Routes>
        </Router>
    );
};

export default App;