// hf-frontend/src/api/promotionService.js

import apiClient from './apiClient';

// 🚨 Rutas Asumidas: Deben coincidir con tus adminRoutes.js
const PROMOTION_URL = '/admin/promotions';

/**
 * Obtiene todas las promociones del backend.
 */
export const getPromotions = async () => {
  const response = await apiClient.get(PROMOTION_URL);
  return response.data;
};

/**
 * Crea una nueva promoción.
 */
export const createPromotion = async (data) => {
  // Aseguramos que la IDSUCURSAL se envíe correctamente si es necesaria
  // El backend debería obtenerla del JWT si aplica la restricción de sucursal.
  const response = await apiClient.post(PROMOTION_URL, data);
  return response.data;
};

/**
 * Actualiza una promoción existente.
 */
export const updatePromotion = async (id, data) => {
  const response = await apiClient.put(`${PROMOTION_URL}/${id}`, data);
  return response.data;
};

/**
 * Desactiva una promoción (lo más seguro es usar el campo 'activo: boolean').
 */
export const togglePromotionActive = async (id, isActive) => {
  // Llama a una ruta PUT para actualizar solo el campo 'activo'
  const response = await apiClient.put(`${PROMOTION_URL}/${id}/toggle`, { activo: isActive });
  return response.data;
};