// hf-frontend/src/components/shared/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Componente que envuelve las rutas que requieren autenticación y un rol específico.
 * @param {string} allowedRoles - Cadena de roles separados por comas (ej: "administrador,empleado")
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { isLoggedIn, userRole, logout } = useAuth();
  const requiredRoles = allowedRoles.split(',').map(role => role.trim());

  // 1. Verificar si el usuario está logueado
  if (!isLoggedIn) {
    // Si no está logueado, redirigir a la página de Login
    return <Navigate to="/login" replace />;
  }
  
  // 2. Verificar si el rol del usuario está permitido
  if (isLoggedIn && requiredRoles.includes(userRole)) {
    // Si el rol es correcto, renderizar el componente hijo (la ruta solicitada)
    return <Outlet />;
  }

  // 3. Si está logueado pero el rol es incorrecto (ej: Empleado intenta ver Admin)
  // Redirigir a una página de acceso denegado o a un dashboard seguro
  console.warn(`Acceso denegado: El rol '${userRole}' no puede acceder a esta ruta.`);
  
  // Opcional: Redirigir al dashboard por defecto de su rol o a una página 403
  // Podríamos redirigir a su propio dashboard
  if (userRole === 'empleado') {
      return <Navigate to="/employee/dashboard" replace />;
  }
  if (userRole === 'administrador') {
      return <Navigate to="/admin/dashboard" replace />;
  }
  
  // En caso de error o rol inesperado, lo mandamos al login para re-autenticar.
  return <Navigate to="/login" replace />; 
};

export default ProtectedRoute;