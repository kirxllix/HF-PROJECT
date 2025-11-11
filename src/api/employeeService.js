// hf-frontend/src/api/employeeService.js

import apiClient from './apiClient';

const EMPLOYEE_URL = '/employee'; 

/**
 * Obtiene órdenes asignadas a la sucursal del empleado con estado "pendiente_aprobacion".
 */
export const getPendingOrdersBySucursal = async () => {
  // El backend debe usar el IDSucursal del JWT del empleado para filtrar la respuesta.
  const response = await apiClient.get(`${EMPLOYEE_URL}/orders/pending`); 
  return response.data;
};

/**
 * Aprueba o rechaza una orden.
 * @param {string} orderId - ID de la orden.
 * @param {string} action - 'approve' o 'reject'.
 */
export const updateOrderStatus = async (orderId, action) => {
  const response = await apiClient.put(`${EMPLOYEE_URL}/orders/${orderId}/status`, { action });
  return response.data;
};

/**
 * Registra el inventario del turno para un producto específico (colección INVENTARIO).
 * @param {object} inventoryData - Datos del inventario (t1_almacen, t1_mostrador, etc.).
 */
export const registerInventory = async (inventoryData) => {
  // 🚨 Esta ruta debe coincidir con la de tu employeeRoutes.js (POST /inventory)
  const response = await apiClient.post(`${EMPLOYEE_URL}/inventory`, inventoryData);
  return response.data;
};