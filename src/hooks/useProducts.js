// hf-frontend/src/hooks/useProducts.js

import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

/**
 * Hook para obtener la lista de productos disponibles para la venta en línea.
 * Esto consume el endpoint de tu clientRoutes.js (ej: /client/products)
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
// ... (código existente)

  const fetchProducts = async () => {
    try {
      setLoading(true);
// ... (código existente)
      const response = await apiClient.get('/client/products'); 

      // 🚨 CORRECCIÓN: Verificar que response.data sea un Array antes de filtrar
      // Esto previene el error "TypeError: response.data.filter is not a function"
      const onlineProducts = Array.isArray(response.data)
        ? response.data.filter(p => p.habilitarVentaOnline)
        : []; // Si no es un array, devuelve un array vacío
      
      setProducts(onlineProducts);
      
    } catch (err) {
// ... (código existente)
    } finally {
// ... (código existente)
    }
  };

  useEffect(() => {
// ... (código existente)
  }, []); 

  return { products, loading, error, refetch: fetchProducts };
};
