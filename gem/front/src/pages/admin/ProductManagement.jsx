import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import ProductFormModal from '../../components/admin/ProductFormModal';

// Función para que las categorías se vean "bonitas"
const formatCategoryName = (cat) => {
    switch (cat) {
        case 'helado_sabor': return 'Helado (Sabores)';
        case 'helado_presentacion': return 'Helado (Presentación)';
        case 'icee': return 'Icee';
        case 'palomita': return 'Palomitas';
        case 'slush': return 'Slush';
        case 'topping': return 'Toppings';
        case 'gomita': return 'Gomitas';
        case 'sazonador': return 'Sazonadores';
        default: return cat.charAt(0).toUpperCase() + cat.slice(1);
    }
};

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // --- FILTROS ---
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('active'); // 'all', 'active', 'archived'

    // Cargar productos
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

    // --- ACCIONES ---
    // --- ACCIONES ---
    const handleSaveProduct = async (formData) => {
        // ✅ CORRECCIÓN: Usar .get() porque ahora es un objeto FormData
        const id = formData.get('_id'); 
        const isEditing = Boolean(id);
        
        const url = isEditing ? `/admin/products/${id}` : '/admin/products';
        
        try {
            // Axios detecta automáticamente el FormData y pone las cabeceras correctas
            if (isEditing) {
                await apiClient.put(url, formData);
            } else {
                await apiClient.post(url, formData);
            }
            fetchProducts();
            handleCloseModal();
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || err.message}`);
        }
    };


    const handleArchive = async (product, shouldArchive) => {
         if (!window.confirm(`¿Confirma que desea ${shouldArchive ? 'archivar' : 'reactivar'} "${product.nombreProducto}"?`)) return;
        try {
            await apiClient.put(`/admin/products/${product._id}/archive`, { activo: !shouldArchive });
            fetchProducts();
        } catch (err) {
            alert('Error al actualizar estado');
        }
    };

    const handleDelete = async (product) => {
        if (!window.confirm(`¿ESTÁS SEGURO?\n\nVas a eliminar PERMANENTEMENTE "${product.nombreProducto}".\nEsta acción no se puede deshacer.`)) return;
        
        try {
            await apiClient.delete(`/admin/products/${product._id}`);
            alert('Producto eliminado.');
            fetchProducts();
        } catch (err) {
            alert('Error al eliminar el producto.');
        }
    };
    
    // Modales
    const handleOpenCreateModal = () => { setSelectedProduct(null); setIsModalOpen(true); };
    const handleOpenEditModal = (product) => { setSelectedProduct(product); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedProduct(null); };

    // --- LÓGICA DE FILTRADO ---
    const categories = [...new Set(products.map(p => p.categoria))].sort();

    const filteredProducts = products.filter(product => {
        // 1. Filtro de Categoría
        const matchCategory = categoryFilter === 'all' || product.categoria === categoryFilter;
        
        // 2. Filtro de Estado (Activo/Archivado)
        let matchStatus = true;
        if (statusFilter === 'active') matchStatus = product.activo === true;
        if (statusFilter === 'archived') matchStatus = product.activo === false;

        return matchCategory && matchStatus;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">
                    Gestión de Productos
                </h1>
                
                <button 
                    onClick={handleOpenCreateModal}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow transition transform hover:-translate-y-1"
                >
                    + Crear Nuevo Producto
                </button>
            </div>

            {/* --- BARRA DE FILTROS --- */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-center">
                <span className="text-gray-500 font-semibold text-sm uppercase">Filtrar por:</span>
                
                {/* Filtro Categoría (Bonito) */}
                <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none cursor-pointer"
                >
                    <option value="all">Todas las Categorías</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>
                            {formatCategoryName(cat)}
                        </option>
                    ))}
                </select>

                {/* Filtro Estado */}
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none cursor-pointer"
                >
                    <option value="active">Solo Activos</option>
                    <option value="archived">Solo Archivados</option>
                    <option value="all">Ver Todos</option>
                </select>
                
                <span className="ml-auto text-xs text-gray-400">
                    Mostrando {filteredProducts.length} productos
                </span>
            </div>

            {loading && <p className="text-center text-gray-500 py-10">Cargando catálogo...</p>}
            {error && <p className="text-center text-red-500 py-10">{error}</p>}

            {/* Tabla */}
            {!loading && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">
                                        No se encontraron productos con estos filtros.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className={`hover:bg-gray-50 transition ${!product.activo ? 'bg-gray-50/50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                                product.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {product.activo ? 'Activo' : 'Archivado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{product.nombreProducto}</div>
                                            {!product.activo && <div className="text-xs text-red-400 italic">(No visible para clientes)</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-semibold border border-gray-200">
                                                {formatCategoryName(product.categoria)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenEditModal(product)} 
                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition"
                                                >
                                                    Editar
                                                </button>

                                                {product.activo ? (
                                                    <button 
                                                        onClick={() => handleArchive(product, true)} 
                                                        className="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded transition"
                                                    >
                                                        Archivar
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleArchive(product, false)} 
                                                        className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition"
                                                    >
                                                        Reactivar
                                                    </button>
                                                )}

                                                {/* BOTÓN ELIMINAR */}
                                                <button 
                                                    onClick={() => handleDelete(product)} 
                                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition"
                                                    title="Eliminar permanentemente"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            
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