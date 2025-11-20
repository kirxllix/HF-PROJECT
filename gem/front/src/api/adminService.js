// hf-frontend/src/api/adminService.js
import apiClient from './apiClient';

/**
 * Obtiene estadísticas para el dashboard.
 */
export const getDashboardStats = async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
};

/**
 * Obtiene solo los pedidos de MAYOREO pendientes de aprobación.
 */
export const getPendingWholesaleOrders = async () => {
    const response = await apiClient.get('/admin/orders/mayoreo/pending');
    return response.data.data; // El backend devuelve { success: true, data: [...] }
};

/**
 * Aprueba o rechaza un pedido de mayoreo.
 * @param {string} orderId 
 * @param {string} action 'approve' | 'reject'
 */
export const moderateWholesaleOrder = async (orderId, action) => {
    const response = await apiClient.put(`/admin/orders/${orderId}/action`, { action });
    return response.data;
};

// ... (código anterior)

/**
 * Obtiene el reporte de inventario (Mermas/Faltantes) para una sucursal y fecha.
 * GET /api/v1/admin/reports/inventory/:sucursalId/:date
 */
export const getInventoryReport = async (sucursalId, date) => {
    const response = await apiClient.get(`/admin/reports/inventory/${sucursalId}/${date}`);
    return response.data.data;
};

/**
 * Obtiene el reporte de tiempos (Asistencia) para una sucursal y fecha.
 * GET /api/v1/admin/reports/times/:sucursalId/:date
 */
export const getAttendanceReport = async (sucursalId, date) => {
    const response = await apiClient.get(`/admin/reports/times/${sucursalId}/${date}`);
    return response.data.data;
};

// ... (código anterior)

/**
 * Obtener todas las sucursales (para la tabla de gestión)
 */
export const getSucursales = async () => {
    const response = await apiClient.get('/admin/sucursales');
    return response.data.data;
};

/**
 * Crear una nueva sucursal
 */
export const createSucursal = async (sucursalData) => {
    const response = await apiClient.post('/admin/sucursales', sucursalData);
    return response.data;
};

// ... (código anterior)

/**
 * Actualizar sucursal
 */
export const updateSucursal = async (id, sucursalData) => {
    const response = await apiClient.put(`/admin/sucursales/${id}`, sucursalData);
    return response.data;
};

/**
 * Eliminar sucursal
 */
export const deleteSucursal = async (id) => {
    const response = await apiClient.delete(`/admin/sucursales/${id}`);
    return response.data;
};