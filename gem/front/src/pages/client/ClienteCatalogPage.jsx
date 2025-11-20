// hf-frontend/src/pages/client/ClienteCatalogPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from '../../components/client/ProductCard';
import ProductSelectorModal from '../../components/client/ProductSelectorModal';
import { useProducts } from '../../hooks/useProducts';
import apiClient from '../../api/apiClient';
import { Link } from 'react-router-dom';

const formatCategory = (category) => {
  const cat = category || '';
  switch (cat) {
    case 'helado_sabor': return 'Helados (Sabor)';
    case 'helado_presentacion': return 'Presentaciones';
    case 'palomita': return 'Palomitas';
    case 'icee': return 'ICEE';
    case 'slush': return 'Slush';
    case 'topping': return 'Toppings';
    case 'gomita': return 'Gomitas';
    case 'sazonador': return 'Sazonadores';
    default: return cat.charAt(0).toUpperCase() + cat.slice(1);
  }
};

const ClientCatalogPage = () => {
  const [sucursales, setSucursales] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  
  // Hook que recarga productos cuando cambia selectedBranch
  const { products, loading, error } = useProducts(selectedBranch);
  
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 1. Cargar sucursales al inicio
  useEffect(() => {
    const fetchSucursales = async () => {
        try {
            const res = await apiClient.get('/client/sucursales');
            const lista = res.data.data || [];
            setSucursales(lista);
            // Seleccionar la primera por defecto si hay
            if (lista.length > 0 && !selectedBranch) setSelectedBranch(lista[0]._id);
        } catch (e) { console.error("Error sucursales", e); }
    };
    fetchSucursales();
  }, []);

  // --- Filtros ---
  const catalogProducts = useMemo(() => {
    // Ocultamos presentaciones y toppings del catálogo principal
    return products.filter(p => p.categoria !== 'helado_presentacion' && p.categoria !== 'topping');
  }, [products]);

  // 2. LÓGICA HÍBRIDA: Extraemos los tamaños estándar para pasarlos al modal
  const standardSizes = useMemo(() => {
      return products.filter(p => p.categoria === 'helado_presentacion');
  }, [products]);

  const categories = useMemo(() => {
    return [...new Set(catalogProducts.map(p => p.categoria))].sort();
  }, [catalogProducts]);
  
  const filteredProducts = useMemo(() => {
    return catalogProducts.filter(product => {
      if (categoryFilter === 'all') return true;
      return product.categoria === categoryFilter;
    });
  }, [catalogProducts, categoryFilter]);

  // --- Manejo del Modal ---
  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <header className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-pink-600 mb-4">Menú de Productos</h1>
        
        {/* Selector de Sucursal */}
        <div className="inline-flex items-center bg-white p-2 rounded-lg shadow-sm mb-6 border border-gray-200">
            <span className="text-gray-500 font-bold px-3 text-sm">📍 Sucursal:</span>
            <select 
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent font-bold text-pink-600 outline-none cursor-pointer"
            >
                {sucursales.map(suc => (
                    <option key={suc._id} value={suc._id}>{suc.nombreSucursal}</option>
                ))}
            </select>
        </div>

        {/* Filtros de Categoría */}
        <div className="flex justify-center gap-2 flex-wrap mb-6">
          <button onClick={() => setCategoryFilter('all')} className={`py-2 px-5 rounded-full font-bold text-sm transition-all shadow-sm ${categoryFilter === 'all' ? 'bg-pink-600 text-white transform scale-105' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
            Todos
          </button>
          {categories.map(cat => (
             <button key={cat} onClick={() => setCategoryFilter(cat)} className={`py-2 px-5 rounded-full font-bold text-sm transition-all shadow-sm ${categoryFilter === cat ? 'bg-pink-600 text-white transform scale-105' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
                {formatCategory(cat)}
             </button>
          ))}
        </div>

        <Link to="/client/calculadora-helado" className="text-pink-600 font-semibold hover:underline text-sm">
          🍦 Calculadora de Helados
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {loading && <div className="col-span-full text-center text-gray-500">Cargando menú...</div>}
        {!loading && filteredProducts.length === 0 && <div className="col-span-full text-center text-gray-500">No hay productos en esta categoría.</div>}
        
        {filteredProducts.map(product => (
          <ProductCard key={product._id} product={product} onSelectProduct={() => handleOpenModal(product)} />
        ))}
      </div>

      {/* 3. PASAMOS 'standardSizes' AL MODAL */}
      <ProductSelectorModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        standardSizes={standardSizes} 
      />
    </div>
  );
};

export default ClientCatalogPage;