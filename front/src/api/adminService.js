import apiClient from './apiClient';

// ... (Tus funciones existentes) ...
export const getDashboardStats = async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
};
export const getPendingWholesaleOrders = async () => {
    const response = await apiClient.get('/admin/orders/mayoreo/pending');
    return response.data.data; 
};
export const moderateWholesaleOrder = async (orderId, action) => {
    const response = await apiClient.put(`/admin/orders/${orderId}/action`, { action });
    return response.data;
};
export const getInventoryReport = async (sucursalId, date) => {
    const response = await apiClient.get(`/admin/reports/inventory/${sucursalId}/${date}`);
    return response.data.data;
};
export const getAttendanceReport = async (sucursalId, date) => {
    const response = await apiClient.get(`/admin/reports/times/${sucursalId}/${date}`);
    return response.data.data;
};
export const getSucursales = async () => {
    const response = await apiClient.get('/admin/sucursales');
    return response.data.data;
};
export const createSucursal = async (sucursalData) => {
    const response = await apiClient.post('/admin/sucursales', sucursalData);
    return response.data;
};
export const updateSucursal = async (id, sucursalData) => {
    const response = await apiClient.put(`/admin/sucursales/${id}`, sucursalData);
    return response.data;
};
export const deleteSucursal = async (id) => {
    const response = await apiClient.delete(`/admin/sucursales/${id}`);
    return response.data;
};
export const getSucursalById = async (id) => {
    const response = await apiClient.get(`/admin/sucursales/${id}`);
    return response.data.data;
};

// ✅ NUEVAS FUNCIONES
export const deleteReview = async (id) => {
    const response = await apiClient.delete(`/admin/reviews/${id}`);
    return response.data;
};

export const getGlobalConfig = async (key) => {
    const response = await apiClient.get(`/admin/config/${key}`);
    return response.data;
};

export const updateGlobalConfig = async (key, value) => {
    const response = await apiClient.put('/admin/config', { key, value });
    return response.data;
};