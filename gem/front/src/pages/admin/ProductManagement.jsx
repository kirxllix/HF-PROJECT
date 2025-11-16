// src/pages/admin/ProductManagement.jsx (ACTUALIZADO CON FILTRO)

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import ProductFormModal from '../../components/admin/ProductFormModal';

const ProductManagement = () => {
    const [products, setProducts] = useState([]); // Lista completa de la API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // --- 1. NUEVO ESTADO PARA EL FILTRO ---
    const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' = mostrar todo

    // Cargar todos los productos
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/products'); 
            setProducts(response.data.data || []);
        } catch (err) {
            setError('Error al cargar productos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // ... (Tus funciones handleSaveProduct y handleArchive no cambian) ...
    const handleSaveProduct = async (formData) => {
        const isEditing = Boolean(formData._id);
        const url = isEditing ? `/admin/products/${formData._id}` : '/admin/products';
        try {
            if (isEditing) {
                await apiClient.put(url, formData);
            } else {
                await apiClient.post(url, formData);
            }
            fetchProducts();
            handleCloseModal();
        } catch (err) {
            alert(`Error al guardar el producto: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleArchive = async (product, shouldArchive) => {
         if (!window.confirm(`¿Estás seguro de ${shouldArchive ? 'archivar' : 'reactivar'} "${product.nombreProducto}"?`)) {
            return;
        }
        try {
            await apiClient.put(`/admin/products/${product._id}/archive`, { 
                activo: !shouldArchive 
            });
            fetchProducts();
        } catch (err) {
            alert('Error al actualizar el producto');
        }
    };
    
    const handleOpenCreateModal = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    // --- 2. LÓGICA DEL FILTRO ---
    
    // Obtener categorías únicas de la lista de productos
    const categories = [...new Set(products.map(p => p.categoria))].sort();

    // Aplicar el filtro ANTES de renderizar la tabla
    const filteredProducts = products.filter(product => {
        if (categoryFilter === 'all') {
            return true; // Mostrar todos si 'all' está seleccionado
        }
        return product.categoria === categoryFilter; // Mostrar solo la categoría
    });


    return (
        <div>
            {/* --- 3. SECCIÓN DEL HEADER ACTUALIZADA --- */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Gestión de Productos
                </h1>
                
                {/* Contenedor para los botones y el filtro */}
                <div className="flex items-center gap-4">
                    {/* El nuevo menú desplegable del filtro */}
                    <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-white border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                        <option value="all">Todas las Categorías</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)} {/* Pone la primera letra en mayúscula */}
                            </option>
                        ))}
                    </select>

                    <button 
                        onClick={handleOpenCreateModal}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                    >
                        Crear Nuevo Producto
                    </button>
                </div>
            </div>

            {loading && <p>Cargando productos...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {/* Tabla de Productos */}
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {/* ... (tu <thead> no cambia) ... */}
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* --- 4. USAR LA LISTA FILTRADA --- */}
                        {filteredProducts.map((product) => (
                            <tr key={product._id} className={!product.activo ? 'bg-gray-100 opacity-60' : ''}>
                                {/* ... (tus <td> no cambian) ... */}
                                <td className="px-6 py-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        product.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {product.activo ? 'Activo' : 'Archivado'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.nombreProducto}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.categoria}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                    <button 
                                        onClick={() => handleOpenEditModal(product)} 
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        [Editar]
                                    </button>
                                    {product.activo ? (
                                        <button onClick={() => handleArchive(product, true)} className="text-red-600 hover:text-red-900">[Archivar]</button>
                                    ) : (
                                        <button onClick={() => handleArchive(product, false)} className="text-green-600 hover:text-green-900">[Reactivar]</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <ProductFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveProduct}
                product={selectedProduct}
            />
        </div>
    );
};

export default ProductManagement;