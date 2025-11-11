import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient'; // Importamos el cliente de Axios seguro

// 1. Crear el Contexto
export const AuthContext = createContext();

// Función auxiliar para obtener el rol almacenado (para persistencia al refrescar)
const getInitialAuthState = () => {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');
  
  if (token && role) {
    // Aquí podrías añadir lógica para validar si el token es válido/no expirado
    return { 
      token, 
      userRole: role, 
      isLoggedIn: true 
    };
  }
  return { 
    token: null, 
    userRole: null, 
    isLoggedIn: false 
  };
};

// 2. Crear el Proveedor (Provider)
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(getInitialAuthState);

  // Función de Login (consumida por LoginScreen)
  const login = async (email, password) => {
    try {
      // 🚨 CAMBIO CRÍTICO AQUÍ 🚨
      // Enviamos 'contrasena' (como espera el backend) usando el valor de 'password' (del formulario)
      const response = await apiClient.post('/auth/login', { 
        email: email, 
        contrasena: password 
      }); 
      
      // Asumimos que el backend responde con 'rol' (basado en authController.js)
      const { token, rol } = response.data; 

      // Almacenar el token y rol para persistir la sesión
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', rol);

      setAuthState({
        token,
        userRole: rol,
        isLoggedIn: true,
      });

      return rol; // Retorna el rol para la redirección en LoginScreen
    } catch (error) {
      // Loguea el error real de la API (ej: 401 Credenciales inválidas)
      console.error('Login fallido:', error.response?.data?.message || 'Error de conexión');
      // Propaga el error para que LoginScreen.jsx lo atrape y muestre
      throw error; 
    }
  };

  // Función de Logout
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setAuthState({
      token: null,
      userRole: null,
      isLoggedIn: false,
    });
    // Forzar redirección al login
    window.location.href = '/login'; 
  };

  // 3. Objeto de Contexto que se proveerá a toda la app
  const contextValue = {
    ...authState,
    login,
    logout,
    // Funciones de conveniencia para verificar roles
    isAdmin: authState.userRole === 'administrador',
    isEmployee: authState.userRole === 'empleado',
    isClient: authState.userRole === 'cliente',
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};