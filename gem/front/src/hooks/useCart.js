// hf-frontend/src/hooks/useCart.js

import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

/**
 * Hook personalizado para acceder fácilmente a los estados y funciones del carrito.
 */
export const useCart = () => {
  return useContext(CartContext);
};