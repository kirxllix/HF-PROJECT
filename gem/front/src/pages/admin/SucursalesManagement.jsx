import React, { useState, useEffect } from 'react';
import { getSucursales, createSucursal, updateSucursal, deleteSucursal } from '../../api/adminService';
// 1. Importar íconos de Lucide
import { Store, Edit, Trash2, MapPin, Phone, CheckCircle, XCircle, Plus } from 'lucide-react';

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

  const handleEdit = (sucursal) => {
    setIsEditing(true);
    setEditId(sucursal._id);
    
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
      setIsEditing(false);
      setEditId(null);
      setFormData(initialFormState);
      setStatus(null);
  };

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
            await updateSucursal(editId, dataToSend);
            setStatus({ type: 'success', message: '¡Sucursal actualizada exitosamente!' });
            handleCancel();
        } else {
            await createSucursal(dataToSend);
            setStatus({ type: 'success', message: '¡Sucursal creada exitosamente!' });
            setFormData(initialFormState);
        }
        fetchData();
    } catch (err) {
        setStatus({ type: 'error', message: err.response?.data?.message || 'Error en la operación.' });
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
       <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center gap-3">
          <Store className="text-pink-600" size={32} />
          Gestión de Sucursales
       </h1>

       {status && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                {status.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                {status.message}
            </div>
        )}

       <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* --- IZQUIERDA: FORMULARIO --- */}
            <div className="xl:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-6">
                    <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                        {isEditing ? <Edit className="text-blue-600" /> : <Plus className="text-green-600" />}
                        {isEditing ? 'Editar Sucursal' : 'Nueva Sucursal'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de Sucursal</label>
                            <input type="text" name="nombreSucursal" value={formData.nombreSucursal} onChange={handleChange} required placeholder="Ej: Otay, Centro..." className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-bold text-gray-500 mb-3 uppercase flex items-center gap-1">
                                <MapPin size={14} /> Dirección
                            </p>
                            <div className="space-y-3">
                                <input type="text" name="calle" value={formData.calle} onChange={handleChange} required placeholder="Calle y Número" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" name="colonia" value={formData.colonia} onChange={handleChange} required placeholder="Colonia" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                                    <input type="text" name="cp" value={formData.cp} onChange={handleChange} required placeholder="C.P." className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                                </div>
                                <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} required placeholder="Ciudad" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono</label>
                                <div className="relative">
                                    <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 pl-8 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                                    <Phone className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
                                <select name="estado" value={formData.estado} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none bg-white">
                                    <option value="activo">Activa</option>
                                    <option value="inactivo">Inactiva</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button type="submit" className={`flex-1 text-white font-bold py-2.5 px-4 rounded-lg transition shadow-md hover:shadow-lg transform active:scale-95 ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-600 hover:bg-pink-700'}`}>
                                {isEditing ? 'Actualizar' : 'Crear Sucursal'}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={handleCancel} className="bg-gray-100 text-gray-600 font-bold py-2.5 px-4 rounded-lg hover:bg-gray-200 transition border border-gray-200">
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* --- DERECHA: LISTA --- */}
            <div className="xl:col-span-2">
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <MapPin className="text-gray-500" size={20} />
                            Sucursales Existentes
                        </h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-3">Nombre</th>
                                    <th className="px-6 py-3">Dirección</th>
                                    <th className="px-6 py-3">Teléfono</th>
                                    <th className="px-6 py-3 text-center">Estado</th>
                                    <th className="px-6 py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-10 text-gray-400 animate-pulse">Cargando sucursales...</td></tr>
                                ) : sucursales.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-10 text-gray-400 italic">No hay sucursales registradas.</td></tr>
                                ) : (
                                    sucursales.map(suc => (
                                        <tr key={suc._id} className="hover:bg-gray-50 transition group">
                                            <td className="px-6 py-4 font-bold text-gray-800">{suc.nombreSucursal}</td>
                                            <td className="px-6 py-4 text-gray-600 text-xs">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{suc.direccion.calle}</span>
                                                    <span className="text-gray-400">{suc.direccion.colonia}, CP {suc.direccion.cp}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-mono text-xs">{suc.telefono || 'N/A'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${suc.estado === 'activo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                    {suc.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleEdit(suc)}
                                                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition border border-transparent hover:border-blue-200"
                                                        title="Editar"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(suc._id)}
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

export default SucursalesManagement;