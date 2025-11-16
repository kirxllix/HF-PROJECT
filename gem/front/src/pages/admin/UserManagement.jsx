// src/pages/admin/UserManagement.jsx (NUEVO ARCHIVO)

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

const UserManagement = () => {
    const [sucursales, setSucursales] = useState([]);
    const [loadingSucursales, setLoadingSucursales] = useState(true);
    const [formData, setFormData] = useState({
        nombrePila: '',
        primerApell: '',
        email: '',
        contrasena: '',
        pin: '',
        rol: 'empleado',
        IDSucursal: ''
    });
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '...' }

    // 1. Cargar las sucursales para el menú desplegable
    useEffect(() => {
        const fetchSucursales = async () => {
            try {
                setLoadingSucursales(true);
                const response = await apiClient.get('/admin/sucursales');
                setSucursales(response.data.data || []);
                // Establecer la primera sucursal como seleccionada por defecto
                if (response.data.data && response.data.data.length > 0) {
                    setFormData(prev => ({ ...prev, IDSucursal: response.data.data[0]._id }));
                }
            } catch (error) {
                console.error("Error al cargar sucursales:", error);
                setStatus({ type: 'error', message: 'No se pudieron cargar las sucursales.' });
            } finally {
                setLoadingSucursales(false);
            }
        };
        fetchSucursales();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);

        // Validación simple de PIN
        if (formData.pin.length !== 4 || !/^\d{4}$/.test(formData.pin)) {
            setStatus({ type: 'error', message: 'El PIN debe ser exactamente 4 números.' });
            return;
        }

        try {
            // 2. Llamar al endpoint del backend que modificamos
            await apiClient.post('/admin/users', formData);
            setStatus({ type: 'success', message: `¡Usuario ${formData.email} creado exitosamente!` });
            // Limpiar formulario (excepto sucursal y rol)
            setFormData(prev => ({
                ...prev,
                nombrePila: '',
                primerApell: '',
                email: '',
                contrasena: '',
                pin: ''
            }));
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Error al crear el usuario.' });
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
                Gestión de Empleados y Administradores
            </h1>

            <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-8 rounded-xl shadow-lg space-y-4">
                
                {/* Alerta de Estado */}
                {status && (
                    <div className={`p-3 rounded-lg ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {status.message}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de Pila</label>
                        <input type="text" name="nombrePila" value={formData.nombrePila} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Primer Apellido</label>
                        <input type="text" name="primerApell" value={formData.primerApell} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-lg p-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">PIN de Asistencia (4 Números)</label>
                        <input type="text" name="pin" value={formData.pin} onChange={handleChange} required maxLength="4" className="mt-1 w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rol</label>
                        <select name="rol" value={formData.rol} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-lg p-2">
                            <option value="empleado">Empleado</option>
                            <option value="administrador">Administrador</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sucursal Asignada</label>
                        <select name="IDSucursal" value={formData.IDSucursal} onChange={handleChange} disabled={loadingSucursales} className="mt-1 w-full border border-gray-300 rounded-lg p-2">
                            {loadingSucursales ? (
                                <option>Cargando sucursales...</option>
                            ) : (
                                sucursales.map(sucursal => (
                                    <option key={sucursal._id} value={sucursal._id}>{sucursal.nombreSucursal}</option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                <div className="pt-4 text-right">
                    <button type="submit" className="bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-pink-700">
                        Crear Usuario
                    </button>
                </div>

            </form>
        </div>
    );
};

export default UserManagement;