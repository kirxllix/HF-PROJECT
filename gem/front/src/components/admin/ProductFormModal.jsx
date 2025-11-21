// src/components/admin/ProductFormModal.jsx

import React, { useState, useEffect } from 'react';
import { X, Edit, Sparkles, Upload, Image as ImageIcon } from 'lucide-react';

const CATEGORIAS = [
    'helado_sabor', 'helado_presentacion', 'palomita', 'icee', 
    'slush', 'topping', 'gomita', 'sazonador'
];

const formatCategoryName = (cat) => {
    if (!cat) return '';
    switch (cat) {
        case 'helado_sabor': return 'Helados (Sabor)';
        case 'helado_presentacion': return 'Presentaciones (Vasos)';
        case 'palomita': return 'Palomitas';
        case 'icee': return 'ICEE';
        case 'slush': return 'Slush';
        case 'topping': return 'Toppings';
        case 'gomita': return 'Gomitas';
        case 'sazonador': return 'Sazonadores';
        default: return cat.charAt(0).toUpperCase() + cat.slice(1);
    }
};

// ✅ Función auxiliar para arreglar URLs rotas o relativas
const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('blob:')) return url; // Si es una previsualización local, dejarla igual
    
    // Corregir URLs del backend
    if (url.includes('undefined/uploads')) {
        return url.replace('undefined', 'http://localhost:5000');
    }
    if (url.startsWith('/uploads') || url.startsWith('uploads')) {
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `http://localhost:5000${cleanPath}`;
    }
    return url;
};

const ProductFormModal = ({ isOpen, onClose, onSave, product }) => {
    const isEditing = Boolean(product && product._id);
    const [formData, setFormData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(''); 

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setFormData({ ...product, variaciones: product.variaciones || [] });
                // ✅ Usamos la función para asegurar que la URL se vea bien
                setPreviewUrl(getImageUrl(product.imagenUrl)); 
            } else {
                setFormData({
                    nombreProducto: '', descripcion: '', categoria: 'palomita',
                    habilitarVentaOnline: false, activo: true, 
                    variaciones: [{ nombre: 'Regular', precio: 0 }]
                });
                setPreviewUrl('');
            }
            setSelectedFile(null);
        }
    }, [product, isEditing, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Previsualización inmediata
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const data = new FormData();
        data.append('nombreProducto', formData.nombreProducto);
        data.append('descripcion', formData.descripcion || '');
        data.append('categoria', formData.categoria);
        data.append('habilitarVentaOnline', formData.habilitarVentaOnline);
        data.append('activo', formData.activo);
        data.append('variaciones', JSON.stringify(formData.variaciones));
        
        // LÓGICA CLAVE PARA IMÁGENES
        if (selectedFile) {
            // A: Si el usuario seleccionó un archivo nuevo, lo enviamos
            data.append('imagen', selectedFile);
        } else if (formData.imagenUrl) {
            // B: Si NO seleccionó archivo, enviamos la URL vieja para no perderla
            data.append('imagenUrl', formData.imagenUrl);
        }

        if (isEditing) data.append('_id', formData._id);

        onSave(data);
    };

    // Variaciones handlers
    const handleVariationChange = (index, field, value) => {
        const newVariaciones = [...formData.variaciones];
        newVariaciones[index][field] = field === 'precio' ? (parseFloat(value) || 0) : value;
        setFormData(prev => ({ ...prev, variaciones: newVariaciones }));
    };
    const handleAddVariation = () => {
        setFormData(prev => ({ ...prev, variaciones: [...prev.variaciones, { nombre: '', precio: 0 }] }));
    };
    const handleRemoveVariation = (index) => {
        const newVariaciones = formData.variaciones.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, variaciones: newVariaciones }));
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                
                <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {isEditing ? <Edit className="text-blue-600"/> : <Sparkles className="text-pink-600"/>}
                        {isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={24}/></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                            <input type="text" name="nombreProducto" value={formData.nombreProducto || ''} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-pink-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
                            <select name="categoria" value={formData.categoria || 'palomita'} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-pink-500 outline-none">
                                {CATEGORIAS.map(cat => (<option key={cat} value={cat}>{formatCategoryName(cat)}</option>))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                        <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-pink-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Imagen del Producto</label>
                            <div className="flex items-center gap-3">
                                {/* Previsualización con fallback */}
                                <div className="h-16 w-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <ImageIcon size={24} className="text-gray-300" />
                                    )}
                                </div>
                                <label className="flex-1 cursor-pointer group">
                                    <div className="flex items-center justify-center w-full px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg group-hover:border-pink-500 transition">
                                        <Upload size={18} className="text-gray-400 group-hover:text-pink-500 mr-2"/>
                                        <span className="text-sm text-gray-500 group-hover:text-pink-600">
                                            {selectedFile ? selectedFile.name : "Click para subir foto"}
                                        </span>
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>
                        </div>
                        <div className="pt-6">
                            <label className="flex items-center cursor-pointer select-none bg-gray-50 p-2 rounded-lg border border-gray-200">
                                <input type="checkbox" name="habilitarVentaOnline" checked={formData.habilitarVentaOnline || false} onChange={handleChange} className="h-5 w-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500" />
                                <span className="ml-2 text-sm font-bold text-gray-700">Venta Online</span>
                            </label>
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-2">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-gray-700 uppercase">Variaciones y Precios</h4>
                            <button type="button" onClick={handleAddVariation} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 py-1 px-3 rounded-full font-semibold transition">+ Agregar</button>
                        </div>
                        <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                            {formData.variaciones?.map((vari, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input type="text" placeholder="Nombre" value={vari.nombre} onChange={(e) => handleVariationChange(index, 'nombre', e.target.value)} className="flex-1 border border-gray-300 rounded p-1.5 text-sm"/>
                                    <div className="relative w-24">
                                        <span className="absolute left-2 top-1.5 text-gray-500 text-sm">$</span>
                                        <input type="number" placeholder="0" value={vari.precio} onChange={(e) => handleVariationChange(index, 'precio', e.target.value)} className="w-full border border-gray-300 rounded p-1.5 pl-5 text-sm"/>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveVariation(index)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"><X size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100">Cancelar</button>
                    <button type="button" onClick={handleSubmit} className="px-6 py-2 bg-pink-600 text-white rounded-lg text-sm font-bold hover:bg-pink-700 shadow-md">Guardar Producto</button>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;