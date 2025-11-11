// hf-frontend/src/pages/admin/PromotionsManagement.jsx

import React, { useState, useEffect } from 'react';
import { getPromotions, createPromotion, updatePromotion, togglePromotionActive } from '../../api/promotionService';
// import { Plus, Trash, Edit, CheckCircle } from 'lucide-react'; // Íconos

const PromotionsManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPromo, setCurrentPromo] = useState(null); // Para editar

  // 1. Obtener datos iniciales
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

  // 2. Manejar Edición/Creación
  const handleSavePromotion = async (formData) => {
    try {
      if (formData._id) {
        // Actualizar
        await updatePromotion(formData._id, formData);
      } else {
        // Crear
        await createPromotion(formData);
      }
      fetchPromotions(); // Recargar la lista
      setIsModalOpen(false);
    } catch (err) {
      setError("Error al guardar la promoción.");
      console.error(err);
    }
  };
  
  // 3. Manejar Activación/Desactivación
  const handleToggleActive = async (promo) => {
    try {
      await togglePromotionActive(promo._id, !promo.activo);
      fetchPromotions(); // Recargar para ver el cambio
    } catch (err) {
      setError("Error al cambiar el estado.");
      console.error(err);
    }
  };

  // 4. Funciones de Modal
  const openCreateModal = () => {
    setCurrentPromo({
        titulo: '', 
        descripcion: '', 
        fecha_inicio: '', 
        fecha_fin: '', 
        activo: true, 
        // IDSUCURSAL debería ser manejado por el backend o el administrador
    });
    setIsModalOpen(true);
  };

  const openEditModal = (promo) => {
    // Asegurar que las fechas estén en formato YYYY-MM-DD para el input type="date"
    setCurrentPromo({
        ...promo,
        fecha_inicio: promo.fecha_inicio ? new Date(promo.fecha_inicio).toISOString().split('T')[0] : '',
        fecha_fin: promo.fecha_fin ? new Date(promo.fecha_fin).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };
  
  if (loading) return <div className="p-8 text-center">Cargando gestión de promociones...</div>;
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          ✨ Gestión de Promociones
        </h1>
        <button 
          onClick={openCreateModal}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center"
        >
          {/* <Plus size={20} className="mr-2" /> */}
          <span>Crear Nueva Promoción</span>
        </button>
      </header>
      
      {error && (
          <p className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
              Error: {error}
          </p>
      )}

      {/* Tabla de Promociones */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(promo.fecha_inicio).toLocaleDateString()} - {new Date(promo.fecha_fin).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${promo.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {promo.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <button 
                        onClick={() => openEditModal(promo)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                    >
                        {/* <Edit size={16} /> */}
                        [Editar]
                    </button>
                    <button 
                        onClick={() => handleToggleActive(promo)}
                        className={promo.activo ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                        title={promo.activo ? "Desactivar" : "Activar"}
                    >
                        {/* <CheckCircle size={16} /> */}
                        [{promo.activo ? 'Desactivar' : 'Activar'}]
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 🚨 Modal de Creación/Edición */}
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

// =================================================================
// Subcomponente Modal para Reutilización
// =================================================================

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl">
                
                {/* Encabezado */}
                <div className="p-5 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">
                        {formData._id ? 'Editar Promoción' : 'Crear Nueva Promoción'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-extrabold">X</button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    
                    {/* Título */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título</label>
                        <input
                            type="text"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                        />
                    </div>
                    
                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            required
                            rows="3"
                            className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                        />
                    </div>

                    {/* Fechas */}
                    <div className="flex space-x-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                            <input
                                type="date"
                                name="fecha_inicio"
                                value={formData.fecha_inicio}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                            <input
                                type="date"
                                name="fecha_fin"
                                value={formData.fecha_fin}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                    </div>
                    
                    {/* Activo (Checkbox) */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="activo"
                            name="activo"
                            checked={formData.activo}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 border-gray-300 rounded"
                        />
                        <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                            Activa (¿Está visible para los clientes?)
                        </label>
                    </div>

                    {/* Pie de Página con Botón */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700">
                            Guardar Promoción
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};