import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

// 1. Crear el Contexto
export const AuthContext = createContext();

// Función auxiliar para obtener el rol almacenado
const getInitialAuthState = () => {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');
  
  if (token && role) {
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

  // --- LOGIN NORMAL ---
  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { 
        email: email, 
        contrasena: password 
      }); 
      
      const { token, rol } = response.data; 
      handleSessionSuccess(token, rol);
      return rol;
    } catch (error) {
      console.error('Login fallido:', error.response?.data?.message || 'Error de conexión');
      throw error; 
    }
  };

  // --- LOGIN CON GOOGLE (NUEVO) ---
  const loginWithGoogle = async (googleToken) => {
    try {
      // Enviamos el token de Google al backend para verificarlo
      const response = await apiClient.post('/auth/google', { token: googleToken });
      
      const { token, rol } = response.data; 
      handleSessionSuccess(token, rol);
      return rol; 
    } catch (error) {
      console.error('Google Login fallido:', error);
      throw error;
    }
  };

  // Función auxiliar para guardar sesión
  const handleSessionSuccess = (token, rol) => {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', rol);
      setAuthState({
        token,
        userRole: rol,
        isLoggedIn: true,
      });
  };

  // --- LOGOUT (CORREGIDO) ---
  const logout = () => {
    // 1. Limpiar credenciales
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    
    // 2. 🚨 CORRECCIÓN: Limpiar el carrito al salir
    localStorage.removeItem('happyFactoryCart'); 

    // 3. Resetear estado
    setAuthState({
      token: null,
      userRole: null,
      isLoggedIn: false,
    });
    
    // 4. Redirigir y forzar recarga para que el CartContext se reinicie limpio
    window.location.href = '/login'; 
  };

  // 3. Objeto de Contexto
  const contextValue = {
    ...authState,
    login,
    loginWithGoogle, 
    logout,
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