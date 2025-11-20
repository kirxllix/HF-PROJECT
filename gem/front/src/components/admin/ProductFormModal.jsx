// src/components/admin/ProductFormModal.jsx

import React, { useState, useEffect } from 'react';

// Opciones de categoría crudas
const CATEGORIAS = [
    'helado_sabor', 'helado_presentacion', 'palomita', 'icee', 
    'slush', 'topping', 'gomita', 'sazonador'
];

// 1. FUNCIÓN PARA FORMATO DE TEXTO (Bonito)
const formatCategoryName = (category) => {
    switch (category) {
        case 'helado_sabor': return 'Helados (Sabor)';
        case 'helado_presentacion': return 'Presentaciones (Vasos)';
        case 'palomita': return 'Palomitas';
        case 'icee': return 'ICEE';
        case 'slush': return 'Slush';
        case 'topping': return 'Toppings';
        case 'gomita': return 'Gomitas';
        case 'sazonador': return 'Sazonadores';
        default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
};

const ProductFormModal = ({ isOpen, onClose, onSave, product }) => {
    const isEditing = Boolean(product && product._id);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (isEditing) {
            setFormData({
                ...product,
                variaciones: product.variaciones || []
            });
        } else {
            setFormData({
                nombreProducto: '',
                descripcion: '',
                imagenUrl: '',
                categoria: 'palomita',
                habilitarVentaOnline: false,
                activo: true,
                variaciones: [{ nombre: 'Regular', precio: 0 }]
            });
        }
    }, [product, isEditing, isOpen]);

    if (!isOpen) return null;

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

    const handleVariationChange = (index, field, value) => {
        const newVariaciones = [...formData.variaciones];
        newVariaciones[index][field] = field === 'precio' ? (parseFloat(value) || 0) : value;
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
        // 2. CAMBIO DE ESTILO: backdrop-blur-sm y fondo más ligero
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all scale-100">
                
                {/* Encabezado */}
                <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-800">
                        {isEditing ? '✏️ Editar Producto' : '✨ Crear Nuevo Producto'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-2xl transition">&times;</button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Producto</label>
                            <input type="text" name="nombreProducto" value={formData.nombreProducto || ''} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-pink-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
                            {/* 3. USO DE LA FUNCIÓN DE FORMATO EN LAS OPCIONES */}
                            <select name="categoria" value={formData.categoria || 'palomita'} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-pink-500 outline-none">
                                {CATEGORIAS.map(cat => (
                                    <option key={cat} value={cat}>
                                        {formatCategoryName(cat)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                        <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-pink-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL de Imagen</label>
                            <input type="text" name="imagenUrl" value={formData.imagenUrl || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" placeholder="https://..." />
                        </div>
                        <div className="pb-2">
                            <label className="flex items-center cursor-pointer select-none">
                                <input type="checkbox" name="habilitarVentaOnline" checked={formData.habilitarVentaOnline || false} onChange={handleChange} className="h-5 w-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500" />
                                <span className="ml-2 text-sm font-medium text-gray-700">Venta Online</span>
                            </label>
                        </div>
                    </div>

                    {/* Sección de Variaciones */}
                    <div className="border-t pt-4 mt-2">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-gray-700 uppercase">Variaciones y Precios</h4>
                            <button type="button" onClick={handleAddVariation} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 py-1 px-3 rounded-full font-semibold transition">
                                + Agregar Variación
                            </button>
                        </div>
                        
                        <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                            {formData.variaciones?.map((vari, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input 
                                        type="text" 
                                        placeholder="Nombre (ej. Grande)" 
                                        value={vari.nombre} 
                                        onChange={(e) => handleVariationChange(index, 'nombre', e.target.value)}
                                        className="flex-1 border border-gray-300 rounded p-1.5 text-sm"
                                    />
                                    <div className="relative w-24">
                                        <span className="absolute left-2 top-1.5 text-gray-500 text-sm">$</span>
                                        <input 
                                            type="number" 
                                            placeholder="0" 
                                            value={vari.precio} 
                                            onChange={(e) => handleVariationChange(index, 'precio', e.target.value)}
                                            className="w-full border border-gray-300 rounded p-1.5 pl-5 text-sm"
                                        />
                                    </div>
                                    <button type="button" onClick={() => handleRemoveVariation(index)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50">&times;</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Pie de Página */}
                <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
                        Cancelar
                    </button>
                    <button type="button" onClick={handleSubmit} className="px-6 py-2 bg-pink-600 text-white rounded-lg text-sm font-bold hover:bg-pink-700 shadow-md transition transform active:scale-95">
                        Guardar Producto
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;