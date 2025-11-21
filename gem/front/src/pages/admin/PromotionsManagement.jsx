// hf-frontend/src/pages/admin/PromotionsManagement.jsx

import React, { useState, useEffect } from 'react';
import { getPromotions, createPromotion, updatePromotion, togglePromotionActive, deletePromotion } from '../../api/promotionService';
// ✅ Importamos los íconos de Lucide
import { Plus, Trash2, Edit, Eye, EyeOff, X } from 'lucide-react';

const PromotionsManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPromo, setCurrentPromo] = useState(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const data = await getPromotions();
      setPromotions(data);
    } catch (err) {
      setError("Error al cargar las promociones.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleSavePromotion = async (formData) => {
    try {
      if (formData._id) {
        await updatePromotion(formData._id, formData);
      } else {
        await createPromotion(formData);
      }
      fetchPromotions();
      setIsModalOpen(false);
    } catch (err) {
      setError("Error al guardar la promoción.");
      console.error(err);
    }
  };
  
  const handleToggleActive = async (promo) => {
    try {
      await togglePromotionActive(promo._id, !promo.activo);
      fetchPromotions();
    } catch (err) {
      setError("Error al cambiar el estado.");
      console.error(err);
    }
  };

  // ✅ Nueva función para eliminar
  const handleDelete = async (id) => {
      if(!window.confirm("¿Estás seguro de eliminar esta promoción? Esta acción no se puede deshacer.")) return;
      try {
          await deletePromotion(id);
          fetchPromotions();
      } catch (err) {
          setError("Error al eliminar la promoción.");
          console.error(err);
      }
  };

  const openCreateModal = () => {
    setCurrentPromo({
        titulo: '', descripcion: '', fecha_inicio: '', fecha_fin: '', activo: true, 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (promo) => {
    setCurrentPromo({
        ...promo,
        fecha_inicio: promo.fecha_inicio ? new Date(promo.fecha_inicio).toISOString().split('T')[0] : '',
        fecha_fin: promo.fecha_fin ? new Date(promo.fecha_fin).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };
  
  if (loading) return <div className="p-8 text-center animate-pulse">Cargando gestión de promociones...</div>;
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
           Gestión de Promociones
        </h1>
        <button 
          onClick={openCreateModal}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center gap-2 transition"
        >
          <Plus size={20} />
          <span>Nueva Promoción</span>
        </button>
      </header>
      
      {error && (
          <p className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4 flex items-center gap-2">
              <X size={18} /> {error}
          </p>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigencia</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {promotions.map((promo) => (
              <tr key={promo._id} className={!promo.activo ? 'bg-gray-50 opacity-75' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{promo.titulo}</div>
                    <div className="text-xs text-gray-500">{promo.descripcion.substring(0, 50)}...</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(promo.fecha_inicio).toLocaleDateString()} - {new Date(promo.fecha_fin).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${promo.activo ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                    {promo.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center gap-3">
                        <button 
                            onClick={() => openEditModal(promo)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition"
                            title="Editar"
                        >
                            <Edit size={18} />
                        </button>
                        <button 
                            onClick={() => handleToggleActive(promo)}
                            className={`${promo.activo ? "text-orange-500 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-900 hover:bg-green-50"} p-1 rounded transition`}
                            title={promo.activo ? "Desactivar" : "Activar"}
                        >
                            {promo.activo ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        
                        {/* ✅ Botón de Eliminar */}
                        <button 
                            onClick={() => handleDelete(promo._id)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                            title="Eliminar permanentemente"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isModalOpen && currentPromo && (
        <PromotionModal 
            promo={currentPromo} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSavePromotion}
        />
      )}
    </div>
  );
};

export default PromotionsManagement;

// Subcomponente Modal
const PromotionModal = ({ promo, onClose, onSave }) => {
    const [formData, setFormData] = useState(promo);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all scale-100">
                
                <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {formData._id ? <Edit size={20} className="text-blue-600"/> : <Plus size={20} className="text-green-600"/>}
                        {formData._id ? 'Editar Promoción' : 'Nueva Promoción'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                        <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Ej. 2x1 en Palomitas"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} required rows="3" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-pink-500 outline-none" placeholder="Detalles de la promoción..."/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Inicio</label>
                            <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-pink-500 outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fin</label>
                            <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-pink-500 outline-none"/>
                        </div>
                    </div>
                    
                    <div className="flex items-center pt-2">
                        <input type="checkbox" id="activo" name="activo" checked={formData.activo} onChange={handleChange} className="h-5 w-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"/>
                        <label htmlFor="activo" className="ml-2 text-sm font-medium text-gray-700">
                            Activar promoción inmediatamente
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t mt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                            Cancelar
                        </button>
                        <button type="submit" className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-bold shadow-lg active:scale-95 transition">
                            Guardar
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};