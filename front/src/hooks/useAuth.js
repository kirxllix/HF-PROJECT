// hf-frontend/src/hooks/useAuth.js

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Hook personalizado para acceder fácilmente a los estados y funciones de autenticación.
 * * Permite usar en cualquier componente: 
 * const { isLoggedIn, userRole, login, logout, isAdmin } = useAuth();
 */
export const useAuth = () => {
  return useContext(AuthContext);
};