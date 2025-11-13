// hf-frontend/src/hooks/useProducts.js

import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

/**
 * Hook para obtener la lista de productos disponibles para la venta en línea.
 * Esto consume el endpoint de tu clientRoutes.js (ej: /client/products)
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  
  // --- AÑADIR ESTAS LÍNEAS ---
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null);     // Estado de error
  // -------------------------

  const fetchProducts = async () => {
    try {
      setLoading(true); // Esta línea ya no dará error
      setError(null);   // Limpiar errores previos
      
      const response = await apiClient.get('/client/products'); 

      // CORRECCIÓN: Verificar que response.data sea un Array antes de filtrar
      // (Esta lógica ya la tenías y es correcta)
      const onlineProducts = Array.isArray(response.data.data)
        ? response.data.data // <--- FILTRO ELIMINADO
        : [];
      
      // Si la línea de arriba falla, prueba esta (depende de cómo responda tu controller):
      // const onlineProducts = Array.isArray(response.data)
      //   ? response.data.filter(p => p.habilitarVentaOnline)
      //   : [];
      
      setProducts(onlineProducts);
      
    } catch (err) {
      setError(err.message || "Error al cargar los productos."); // Rellenar el error
    } finally {
      setLoading(false); // Detener la carga
    }
  };

  useEffect(() => {
    fetchProducts(); // Llamar a la función
  }, []); 

  return { products, loading, error, refetch: fetchProducts };
};