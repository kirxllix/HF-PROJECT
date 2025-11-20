// src/pages/admin/UserManagement.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

const UserManagement = () => {
    // Datos base
    const [sucursales, setSucursales] = useState([]);
    const [users, setUsers] = useState([]);
    
    // Estados de carga y filtro
    const [loading, setLoading] = useState(true);
    const [filterSucursal, setFilterSucursal] = useState('todas');

    // Estado del Formulario
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        nombrePila: '', primerApell: '', email: '',
        contrasena: '', pin: '', rol: 'empleado', IDSucursal: ''
    });
    
    const [status, setStatus] = useState(null);

    // 1. Cargar Sucursales y Usuarios al inicio
    useEffect(() => {
        fetchInitialData();
    }, []);

    // 2. Recargar usuarios cuando cambia el filtro
    useEffect(() => {
        fetchUsers();
    }, [filterSucursal]);

    const fetchInitialData = async () => {
        try {
            const resSucursales = await apiClient.get('/admin/sucursales');
            setSucursales(resSucursales.data.data || []);
            
            // Set default sucursal for form
            if (resSucursales.data.data?.length > 0) {
                setFormData(prev => ({ ...prev, IDSucursal: resSucursales.data.data[0]._id }));
            }
            fetchUsers();
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const endpoint = filterSucursal === 'todas' 
                ? '/admin/users' 
                : `/admin/users?sucursal=${filterSucursal}`;
            
            const response = await apiClient.get(endpoint);
            setUsers(response.data.data || []);
        } catch (error) {
            console.error("Error cargando usuarios", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (user) => {
        setIsEditing(true);
        setEditId(user._id);
        setFormData({
            nombrePila: user.nombrePila,
            primerApell: user.primerApell,
            email: user.email,
            contrasena: '', // Dejar vacía para no cambiar
            pin: '', // Dejar vacía para no cambiar
            rol: user.rol,
            IDSucursal: user.IDSucursal?._id || ''
        });
        setStatus(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({
            nombrePila: '', primerApell: '', email: '',
            contrasena: '', pin: '', rol: 'empleado', 
            IDSucursal: sucursales.length > 0 ? sucursales[0]._id : ''
        });
        setStatus(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
        try {
            await apiClient.delete(`/admin/users/${id}`);
            fetchUsers();
            setStatus({ type: 'success', message: 'Usuario eliminado.' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Error al eliminar.' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);

        // Validación básica de PIN (si se escribió algo)
        if (formData.pin && (formData.pin.length !== 4 || !/^\d{4}$/.test(formData.pin))) {
            setStatus({ type: 'error', message: 'El PIN debe ser de 4 números.' });
            return;
        }

        try {
            if (isEditing) {
                // Modo Edición
                await apiClient.put(`/admin/users/${editId}`, formData);
                setStatus({ type: 'success', message: 'Usuario actualizado correctamente.' });
                handleCancelEdit(); // Resetear form
            } else {
                // Modo Creación
                await apiClient.post('/admin/users', formData);
                setStatus({ type: 'success', message: 'Usuario creado exitosamente.' });
                setFormData(prev => ({
                    ...prev, nombrePila: '', primerApell: '', email: '', contrasena: '', pin: ''
                }));
            }
            fetchUsers(); // Refrescar tabla
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Error en la operación.' });
        }
    };

    return (
        <div className="min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
                Gestión de Personal
            </h1>
            
            {status && (
                <div className={`mb-4 p-3 rounded-lg ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {status.message}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
                <div className="xl:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg sticky top-6">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">
                            {isEditing ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600">Nombre</label>
                                    <input type="text" name="nombrePila" value={formData.nombrePila} onChange={handleChange} required className="w-full border rounded p-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600">Apellido</label>
                                    <input type="text" name="primerApell" value={formData.primerApell} onChange={handleChange} required className="w-full border rounded p-2 text-sm" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border rounded p-2 text-sm" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600">
                                        {isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                                    </label>
                                    <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required={!isEditing} className="w-full border rounded p-2 text-sm" placeholder={isEditing ? "Sin cambios" : ""} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600">
                                        {isEditing ? 'Nuevo PIN (Opcional)' : 'PIN (4 dígitos)'}
                                    </label>
                                    <input type="text" maxLength="4" name="pin" value={formData.pin} onChange={handleChange} required={!isEditing} className="w-full border rounded p-2 text-sm" placeholder={isEditing ? "****" : ""} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600">Rol</label>
                                    <select name="rol" value={formData.rol} onChange={handleChange} className="w-full border rounded p-2 text-sm">
                                        <option value="empleado">Empleado</option>
                                        <option value="administrador">Administrador</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600">Sucursal</label>
                                    <select name="IDSucursal" value={formData.IDSucursal} onChange={handleChange} className="w-full border rounded p-2 text-sm">
                                        {sucursales.map(s => (
                                            <option key={s._id} value={s._id}>{s.nombreSucursal}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-2">
                                <button type="submit" className={`flex-1 text-white font-bold py-2 px-4 rounded hover:opacity-90 transition ${isEditing ? 'bg-blue-600' : 'bg-pink-600'}`}>
                                    {isEditing ? 'Actualizar' : 'Crear'}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={handleCancelEdit} className="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-400 transition">
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* --- COLUMNA DERECHA: LISTA DE USUARIOS --- */}
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg border-t-4 border-gray-600 overflow-hidden">
                        {/* Header de la Tabla + Filtro */}
                        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="text-lg font-bold text-gray-800">👥 Lista de Empleados</h2>
                            
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">Filtrar por Sucursal:</label>
                                <select 
                                    value={filterSucursal} 
                                    onChange={(e) => setFilterSucursal(e.target.value)}
                                    className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                                >
                                    <option value="todas">Todas las Sucursales</option>
                                    {sucursales.map(s => (
                                        <option key={s._id} value={s._id}>{s.nombreSucursal}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Tabla */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Nombre</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3 text-center">Rol</th>
                                        <th className="px-4 py-3 text-center">Sucursal</th>
                                        <th className="px-4 py-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="5" className="text-center py-8 text-gray-500">Cargando...</td></tr>
                                    ) : users.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-8 text-gray-500 italic">No se encontraron usuarios.</td></tr>
                                    ) : (
                                        users.map(user => (
                                            <tr key={user._id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {user.nombrePila} {user.primerApell}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.rol === 'administrador' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {user.rol}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-600">
                                                    {user.IDSucursal?.nombreSucursal || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-center flex justify-center gap-2">
                                                    <button 
                                                        onClick={() => handleEdit(user)}
                                                        className="bg-blue-50 text-blue-600 p-2 rounded hover:bg-blue-100 transition"
                                                        title="Editar"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(user._id)}
                                                        className="bg-red-50 text-red-600 p-2 rounded hover:bg-red-100 transition"
                                                        title="Eliminar"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserManagement;