import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
// 1. Importar íconos de Lucide
import { UserPlus, UserCog, Users, Edit, Trash2, Shield, User, Briefcase } from 'lucide-react';

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
        <div className="min-h-screen p-6 bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center gap-3">
                <Briefcase className="text-pink-600" size={32} />
                Gestión de Personal
            </h1>
            
            {status && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                    <span className="font-bold">{status.type === 'success' ? '✓' : '⚠'}</span>
                    {status.message}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
                <div className="xl:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                            {isEditing ? <UserCog className="text-blue-600" /> : <UserPlus className="text-green-600" />}
                            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                                    <input type="text" name="nombrePila" value={formData.nombrePila} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Ej. Juan" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Apellido</label>
                                    <input type="text" name="primerApell" value={formData.primerApell} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Ej. Pérez" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Corporativo</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none" placeholder="usuario@happyfactory.com" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        {isEditing ? 'Nueva Contraseña' : 'Contraseña'}
                                    </label>
                                    <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required={!isEditing} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none" placeholder={isEditing ? "Opcional" : "********"} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        {isEditing ? 'Nuevo PIN' : 'PIN (4 dígitos)'}
                                    </label>
                                    <input type="text" maxLength="4" name="pin" value={formData.pin} onChange={handleChange} required={!isEditing} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-mono text-center tracking-widest" placeholder={isEditing ? "****" : "1234"} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rol</label>
                                    <div className="relative">
                                        <select name="rol" value={formData.rol} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none appearance-none bg-white">
                                            <option value="empleado">Empleado</option>
                                            <option value="administrador">Administrador</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                            <Shield size={14} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sucursal Asignada</label>
                                    <select name="IDSucursal" value={formData.IDSucursal} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none bg-white">
                                        {sucursales.map(s => (
                                            <option key={s._id} value={s._id}>{s.nombreSucursal}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-2">
                                <button type="submit" className={`flex-1 text-white font-bold py-2.5 px-4 rounded-lg hover:shadow-lg transition transform active:scale-95 flex justify-center items-center gap-2 ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-600 hover:bg-pink-700'}`}>
                                    {isEditing ? <UserCog size={18} /> : <UserPlus size={18} />}
                                    {isEditing ? 'Actualizar Datos' : 'Crear Usuario'}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={handleCancelEdit} className="bg-gray-100 text-gray-600 font-bold py-2.5 px-4 rounded-lg hover:bg-gray-200 transition border border-gray-200">
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* --- COLUMNA DERECHA: LISTA DE USUARIOS --- */}
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                        {/* Header de la Tabla + Filtro */}
                        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Users className="text-gray-500" size={20} />
                                Lista de Empleados
                            </h2>
                            
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Filtrar:</label>
                                <select 
                                    value={filterSucursal} 
                                    onChange={(e) => setFilterSucursal(e.target.value)}
                                    className="border border-gray-300 rounded-lg p-1.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none bg-white"
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
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">Nombre</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3 text-center">Rol</th>
                                        <th className="px-6 py-3 text-center">Sucursal</th>
                                        <th className="px-6 py-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="5" className="text-center py-10 text-gray-400 animate-pulse">Cargando personal...</td></tr>
                                    ) : users.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-10 text-gray-400 italic">No se encontraron usuarios registrados.</td></tr>
                                    ) : (
                                        users.map(user => (
                                            <tr key={user._id} className="hover:bg-gray-50 transition group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                            {user.nombrePila.charAt(0)}{user.primerApell.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{user.nombrePila} {user.primerApell}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${user.rol === 'administrador' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                        {user.rol}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center text-gray-600">
                                                    {user.IDSucursal?.nombreSucursal || <span className="text-gray-400 italic">Sin asignar</span>}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => handleEdit(user)}
                                                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition border border-transparent hover:border-blue-200"
                                                            title="Editar"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(user._id)}
                                                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-200"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
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