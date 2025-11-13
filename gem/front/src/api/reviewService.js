// hf-frontend/src/api/reviewService.js

import apiClient from './apiClient';

const REVIEWS_URL = '/client/reviews'; // Ruta para el cliente

/**
 * Obtiene todos los comentarios APROBADOS para un producto específico.
 */
export const getApprovedReviews = async (productId) => {
  // El backend debe filtrar por IDPRODUCTO y estado 'aprobado'
  const response = await apiClient.get(`${REVIEWS_URL}/${productId}`); 
  return response.data; // Devolverá solo las reseñas aprobadas
};

/**
 * Permite al cliente registrar un nuevo comentario/calificación.
 * El backend debe asignar el IDUSUARIO (del JWT) y el estado 'pendiente'.
 */
export const submitReview = async (productId, reviewData) => {
  const dataToSend = {
    ...reviewData,
    IDPRODUCTO: productId,
    // El estado 'pendiente' será asignado por el backend para moderación
  };
  // Esta ruta debe ser protegida con el JWT del cliente
  const response = await apiClient.post(REVIEWS_URL, dataToSend); 
  return response.data;
};

// =================================================================
// Lógica para el ADMIN (Moderación) - (Se usaría en el AdminDashboard)
// =================================================================
const ADMIN_REVIEWS_URL = '/admin/reviews';

/**
 * Obtiene todas las reseñas PENDIENTES de moderación.
 */
export const getPendingReviews = async () => {
    const response = await apiClient.get(ADMIN_REVIEWS_URL + '/pending');
    return response.data;
};

/**
 * Modera una reseña, cambiando su estado a 'aprobado' o 'rechazado'.
 */
export const moderateReview = async (reviewId, newStatus) => {
    // newStatus puede ser 'aprobado' o 'rechazado' [cite: 324, 326]
    const response = await apiClient.put(`${ADMIN_REVIEWS_URL}/${reviewId}/status`, { estado: newStatus });
    return response.data;
};