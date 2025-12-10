// hf-frontend/src/hooks/useProducts.js
import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const useProducts = (sucursalId) => { // Recibe sucursalId
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    if (!sucursalId) return; // No cargar si no hay sucursal

    try {
      setLoading(true);
      // Enviamos el ID como query param
      const response = await apiClient.get(`/client/products?sucursalId=${sucursalId}`); 
      setProducts(response.data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [sucursalId]); // Se ejecuta cada vez que cambia la sucursal

  return { products, loading, error, refetch: fetchProducts };
};