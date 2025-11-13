// src/components/admin/ProductFormModal.jsx (NUEVO ARCHIVO)

import React, { useState, useEffect } from 'react';

// Opciones de categoría basadas en tu modelo Product.js
const CATEGORIAS = [
    'helado_sabor', 'helado_presentacion', 'palomita', 'icee', 
    'slush', 'topping', 'gomita', 'sazonador'
];

const ProductFormModal = ({ isOpen, onClose, onSave, product }) => {
    const isEditing = Boolean(product && product._id);
    const [formData, setFormData] = useState({});

    // Cargar datos del producto cuando el modal se abre para editar
    useEffect(() => {
        if (isEditing) {
            setFormData(product);
        } else {
            // Estado inicial para un producto nuevo
            setFormData({
                nombreProducto: '',
                descripcion: '',
                imagenUrl: '',
                categoria: 'palomita',
                habilitarVentaOnline: false,
                activo: true,
                variaciones: [{ nombre: 'Regular', precio: 0 }] // Inicia con una variación
            });
        }
    }, [product, isEditing, isOpen]);

    if (!isOpen) return null;

    // --- Manejadores del Formulario ---

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

    // --- Manejadores de Variaciones ---

    const handleVariationChange = (index, field, value) => {
        const newVariaciones = [...formData.variaciones];
        newVariaciones[index][field] = value;
        setFormData(prev => ({ ...prev, variaciones: newVariaciones }));
    };

    const handleAddVariation = () => {
        setFormData(prev => ({
            ...prev,
            variaciones: [...prev.variaciones, { nombre: '', precio: 0 }]
        }));
    };

    const handleRemoveVariation = (index) => {
        const newVariaciones = formData.variaciones.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, variaciones: newVariaciones }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Encabezado */}
                <div className="p-5 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">
                        {isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-extrabold text-2xl">&times;</button>
                </div>

                {/* Formulario (con scroll) */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
                    
                    {/* Campos Principales */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
                        <input type="text" name="nombreProducto" value={formData.nombreProducto || ''} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange} rows="3" className="mt-1 w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">URL de Imagen</label>
                        <input type="text" name="imagenUrl" value={formData.imagenUrl || ''} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-lg p-2" />
                    </div>

                    {/* Fila de Categoría y Venta Online */}
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Categoría</label>
                            <select name="categoria" value={formData.categoria || 'palomita'} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-lg p-2">
                                {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="w-1/2 flex items-end pb-2">
                            <label className="flex items-center">
                                <input type="checkbox" name="habilitarVentaOnline" checked={formData.habilitarVentaOnline || false} onChange={handleChange} className="h-4 w-4 text-pink-600 border-gray-300 rounded" />
                                <span className="ml-2 text-sm text-gray-700">Habilitar Venta Online</span>
                            </label>
                        </div>
                    </div>

                    {/* --- Gestión de Variaciones --- */}
                    <hr />
                    <h4 className="text-lg font-semibold">Variaciones (Precios)</h4>
                    <div className="space-y-3">
                        {formData.variaciones?.map((vari, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <input 
                                    type="text" 
                                    placeholder="Nombre (ej. Chico, Saladas)" 
                                    value={vari.nombre} 
                                    onChange={(e) => handleVariationChange(index, 'nombre', e.target.value)}
                                    className="w-1/2 border border-gray-300 rounded-lg p-2"
                                />
                                <input 
                                    type="number" 
                                    placeholder="Precio" 
                                    value={vari.precio} 
                                    onChange={(e) => handleVariationChange(index, 'precio', parseFloat(e.target.value))}
                                    className="w-1/3 border border-gray-300 rounded-lg p-2"
                                />
                                <button type="button" onClick={() => handleRemoveVariation(index)} className="text-red-500 hover:text-red-700 font-bold p-2">
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={handleAddVariation} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded-lg">
                        + Agregar Variación
                    </button>
                    
                </form>

                {/* Pie de Página con Botón */}
                <div className="flex justify-end space-x-3 p-5 border-t bg-gray-50">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">
                        Cancelar
                    </button>
                    <button type="button" onClick={handleSubmit} className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700">
                        Guardar Producto
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;