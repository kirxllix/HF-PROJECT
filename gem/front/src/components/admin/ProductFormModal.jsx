import React, { useState, useEffect } from 'react';
import { X, Edit, Sparkles, Upload, Image as ImageIcon, Star } from 'lucide-react'; // Import Star

const CATEGORIAS = ['helado_sabor', 'helado_presentacion', 'palomita', 'icee', 'slush', 'topping', 'gomita', 'sazonador'];
const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('http')) return url;
    const BACKEND_URL = 'http://localhost:5000';
    if (url.includes('undefined/uploads')) return url.replace('undefined', BACKEND_URL);
    return `${BACKEND_URL}${url.startsWith('/') ? url : '/' + url}`;
};

const ProductFormModal = ({ isOpen, onClose, onSave, product, sucursalesList = [] }) => {
    const isEditing = Boolean(product && product._id);
    const [formData, setFormData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(''); 

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setFormData({ 
                    ...product, 
                    variaciones: product.variaciones || [],
                    sucursales: product.sucursales || [],
                    esFavorito: product.esFavorito || false // ✅ Cargar estado
                });
                setPreviewUrl(getImageUrl(product.imagenUrl)); 
            } else {
                setFormData({
                    nombreProducto: '', descripcion: '', categoria: 'palomita',
                    habilitarVentaOnline: false, activo: true, 
                    esFavorito: false, // ✅ Default false
                    variaciones: [{ nombre: 'Regular', precio: 0 }],
                    sucursales: []
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

    const handleSucursalChange = (id) => {
        const current = formData.sucursales || [];
        if (current.includes(id)) setFormData({ ...formData, sucursales: current.filter(s => s !== id) });
        else setFormData({ ...formData, sucursales: [...current, id] });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
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
        data.append('sucursales', JSON.stringify(formData.sucursales || []));
        
        // ✅ Append Favorito
        data.append('esFavorito', formData.esFavorito);

        if (selectedFile) data.append('imagen', selectedFile);
        else if (formData.imagenUrl) data.append('imagenUrl', formData.imagenUrl);
        if (isEditing) data.append('_id', formData._id);

        onSave(data);
    };

    const handleVariationChange = (index, field, value) => {
        const newV = [...formData.variaciones];
        newV[index][field] = field === 'precio' ? (parseFloat(value) || 0) : value;
        setFormData(prev => ({ ...prev, variaciones: newV }));
    };
    const handleAddVariation = () => setFormData(prev => ({ ...prev, variaciones: [...prev.variaciones, { nombre: '', precio: 0 }] }));
    const handleRemoveVariation = (index) => setFormData(prev => ({ ...prev, variaciones: prev.variaciones.filter((_, i) => i !== index) }));

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {isEditing ? <Edit className="text-blue-600"/> : <Sparkles className="text-pink-600"/>}
                        {isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}
                    </h3>
                    <button onClick={onClose}><X size={24}/></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label><input type="text" name="nombreProducto" value={formData.nombreProducto} onChange={handleChange} required className="w-full border rounded p-2" /></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label><select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full border rounded p-2">{CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    </div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label><textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="2" className="w-full border rounded p-2" /></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Imagen</label>
                            <div className="flex items-center gap-3">
                                <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden shrink-0">{previewUrl ? <img src={previewUrl} className="h-full w-full object-cover"/> : <ImageIcon size={24} className="text-gray-300"/>}</div>
                                <input type="file" accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>
                        <div className="space-y-2 pt-4">
                            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded border">
                                <input type="checkbox" name="habilitarVentaOnline" checked={formData.habilitarVentaOnline || false} onChange={handleChange} className="text-pink-600" />
                                <span className="text-sm font-bold">Venta Online</span>
                            </label>
                            {/* ✅ CHECKBOX FAVORITO */}
                            <label className="flex items-center gap-2 cursor-pointer bg-yellow-50 p-2 rounded border border-yellow-200">
                                <input type="checkbox" name="esFavorito" checked={formData.esFavorito || false} onChange={handleChange} className="text-yellow-500" />
                                <span className="text-sm font-bold text-yellow-700 flex items-center gap-1"><Star size={14} fill="currentColor"/> Mostrar en Home</span>
                            </label>
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sucursales</label><div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">{sucursalesList.map(s => (<label key={s._id} className="flex gap-2"><input type="checkbox" checked={(formData.sucursales||[]).includes(s._id)} onChange={() => handleSucursalChange(s._id)}/> <span className="text-sm">{s.nombreSucursal}</span></label>))}</div></div>
                    <div className="border-t pt-4 mt-2"><div className="flex justify-between mb-3"><h4 className="text-sm font-bold">Precios</h4><button type="button" onClick={handleAddVariation} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded">+ Agregar</button></div><div className="space-y-2 bg-gray-50 p-3 rounded border max-h-40 overflow-y-auto">{formData.variaciones?.map((v, i) => (<div key={i} className="flex gap-2"><input type="text" value={v.nombre} onChange={(e)=>handleVariationChange(i,'nombre',e.target.value)} className="flex-1 border rounded p-1 text-sm"/><input type="number" value={v.precio} onChange={(e)=>handleVariationChange(i,'precio',e.target.value)} className="w-24 border rounded p-1 text-sm"/><button type="button" onClick={()=>handleRemoveVariation(i)}><X size={16}/></button></div>))}</div></div>
                </form>

                <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded">Cancelar</button>
                    <button type="button" onClick={handleSubmit} className="px-6 py-2 bg-pink-600 text-white rounded font-bold">Guardar</button>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;