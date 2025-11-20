import React, { useState, useEffect } from 'react';
// 1. Importar las nuevas funciones del servicio
import { getSucursales, createSucursal, updateSucursal, deleteSucursal } from '../../api/adminService';

const SucursalesManagement = () => {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar Edición
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialFormState = {
    nombreSucursal: '',
    telefono: '',
    calle: '',
    colonia: '',
    ciudad: 'Tijuana',
    cp: '',
    estado: 'activo'
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getSucursales();
      setSucursales(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 2. Función para cargar datos en el formulario (Editar) ---
  const handleEdit = (sucursal) => {
    setIsEditing(true);
    setEditId(sucursal._id);
    
    // Aplanamos el objeto (sacamos los datos de 'direccion' al nivel principal)
    setFormData({
        nombreSucursal: sucursal.nombreSucursal,
        telefono: sucursal.telefono || '',
        estado: sucursal.estado,
        calle: sucursal.direccion.calle,
        colonia: sucursal.direccion.colonia,
        ciudad: sucursal.direccion.ciudad,
        cp: sucursal.direccion.cp
    });
    
    setStatus(null);
    // Scroll arriba para ver el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 3. Función para cancelar edición ---
  const handleCancel = () => {
      setIsEditing(false);
      setEditId(null);
      setFormData(initialFormState);
      setStatus(null);
  };

  // --- 4. Función para eliminar ---
  const handleDelete = async (id) => {
      if (!window.confirm('¿Estás seguro de eliminar esta sucursal?')) return;
      try {
          await deleteSucursal(id);
          setStatus({ type: 'success', message: 'Sucursal eliminada.' });
          fetchData();
      } catch (err) {
          setStatus({ type: 'error', message: 'Error al eliminar.' });
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    // Construir objeto para backend
    const dataToSend = {
        nombreSucursal: formData.nombreSucursal,
        telefono: formData.telefono,
        estado: formData.estado,
        direccion: {
            calle: formData.calle,
            colonia: formData.colonia,
            ciudad: formData.ciudad,
            cp: formData.cp
        }
    };

    try {
        if (isEditing) {
            // MODO ACTUALIZAR
            await updateSucursal(editId, dataToSend);
            setStatus({ type: 'success', message: '¡Sucursal actualizada exitosamente!' });
            handleCancel(); // Limpiar y salir de modo edición
        } else {
            // MODO CREAR
            await createSucursal(dataToSend);
            setStatus({ type: 'success', message: '¡Sucursal creada exitosamente!' });
            setFormData(initialFormState);
        }
        fetchData(); // Recargar tabla
    } catch (err) {
        setStatus({ type: 'error', message: err.response?.data?.message || 'Error en la operación.' });
    }
  };

  return (
    <div className="min-h-screen">
       <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
          Gestión de Sucursales
       </h1>

       {status && (
            <div className={`mb-4 p-3 rounded-lg ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {status.message}
            </div>
        )}

       <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* --- IZQUIERDA: FORMULARIO --- */}
            <div className="xl:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-lg sticky top-6">
                    <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                        {isEditing ? '✏️ Editar Sucursal' : '🏪 Nueva Sucursal'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600">Nombre de Sucursal</label>
                            <input type="text" name="nombreSucursal" value={formData.nombreSucursal} onChange={handleChange} required placeholder="Ej: Otay, Centro..." className="w-full border rounded p-2 text-sm" />
                        </div>

                        <div className="p-3 bg-gray-50 rounded border border-gray-200">
                            <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Dirección</p>
                            <div className="space-y-3">
                                <input type="text" name="calle" value={formData.calle} onChange={handleChange} required placeholder="Calle y Número" className="w-full border rounded p-2 text-sm" />
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" name="colonia" value={formData.colonia} onChange={handleChange} required placeholder="Colonia" className="w-full border rounded p-2 text-sm" />
                                    <input type="text" name="cp" value={formData.cp} onChange={handleChange} required placeholder="C.P." className="w-full border rounded p-2 text-sm" />
                                </div>
                                <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} required placeholder="Ciudad" className="w-full border rounded p-2 text-sm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-600">Teléfono</label>
                                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full border rounded p-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600">Estado</label>
                                <select name="estado" value={formData.estado} onChange={handleChange} className="w-full border rounded p-2 text-sm">
                                    <option value="activo">Activa</option>
                                    <option value="inactivo">Inactiva</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button type="submit" className={`flex-1 text-white font-bold py-2 px-4 rounded transition ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-600 hover:bg-pink-700'}`}>
                                {isEditing ? 'Actualizar' : 'Crear'}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={handleCancel} className="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-400 transition">
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* --- DERECHA: LISTA --- */}
            <div className="xl:col-span-2">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-pink-500">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">📍 Sucursales Existentes</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Nombre</th>
                                    <th className="px-4 py-3">Dirección</th>
                                    <th className="px-4 py-3">Teléfono</th>
                                    <th className="px-4 py-3 text-center">Estado</th>
                                    <th className="px-4 py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-8 text-gray-500">Cargando...</td></tr>
                                ) : sucursales.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-8 text-gray-500">No hay sucursales registradas.</td></tr>
                                ) : (
                                    sucursales.map(suc => (
                                        <tr key={suc._id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 font-bold text-gray-800">{suc.nombreSucursal}</td>
                                            <td className="px-4 py-3 text-gray-600 text-xs">
                                                {suc.direccion.calle}, {suc.direccion.colonia}, {suc.direccion.cp}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{suc.telefono || 'N/A'}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${suc.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {suc.estado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center flex justify-center gap-2">
                                                <button 
                                                    onClick={() => handleEdit(suc)}
                                                    className="bg-blue-50 text-blue-600 p-2 rounded hover:bg-blue-100 transition"
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(suc._id)}
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

export default SucursalesManagement;