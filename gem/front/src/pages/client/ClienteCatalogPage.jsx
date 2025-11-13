// hf-frontend/src/pages/client/ClienteCatalogPage.jsx (CÓDIGO COMPLETO)

import React, { useState, useMemo } from 'react';
import ProductCard from '../../components/client/ProductCard';
import ProductSelectorModal from '../../components/client/ProductSelectorModal';
import { useProducts } from '../../hooks/useProducts';
import { Link } from 'react-router-dom';

const formatCategory = (category) => {
  const cat = category || '';
  switch (cat) {
    case 'helado_sabor':
    case 'helado_presentacion':
      return 'Helado';
    case 'palomita':
      return 'Palomitas';
    case 'icee':
      return 'ICEE';
    case 'slush':
      return 'Slush';
    default:
      return cat.charAt(0).toUpperCase() + cat.slice(1);
  }
};

const ClientCatalogPage = () => {
  const { products, loading, error } = useProducts();
  const [categoryFilter, setCategoryFilter] = useState('all');

  // --- ESTADO DEL MODAL (Esto faltaba en tu copia) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- Lógica de filtrado ---
  const catalogProducts = useMemo(() => {
    return products.filter(p => 
      p.categoria !== 'helado_presentacion' && 
      p.categoria !== 'topping'
    );
  }, [products]);

  const categories = useMemo(() => {
    return [...new Set(catalogProducts.map(p => formatCategory(p.categoria)))].sort();
  }, [catalogProducts]);
  
  const filteredProducts = useMemo(() => {
    return catalogProducts.filter(product => {
      if (categoryFilter === 'all') return true;
      return formatCategory(product.categoria) === categoryFilter;
    });
  }, [catalogProducts, categoryFilter]);

  // --- Funciones del Modal (Esto faltaba en tu copia) ---
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
      
      <header className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-pink-600">
          Menú de Productos
        </h1>
        <p className="text-gray-600 mt-2 mb-6">
          Elige tus favoritos.
        </p>
        
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`py-2 px-4 rounded-full font-semibold text-sm ${categoryFilter === 'all' ? 'bg-pink-600 text-white' : 'bg-white text-gray-700 shadow-sm'}`}
          >
            Todos
          </button>
          
          {categories.map(friendlyName => (
             <button
              key={friendlyName}
              onClick={() => setCategoryFilter(friendlyName)}
              className={`py-2 px-4 rounded-full font-semibold text-sm ${
                categoryFilter === friendlyName ? 'bg-pink-600 text-white' : 'bg-white text-gray-700 shadow-sm'
              }`}
            >
              {friendlyName}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm">
          <Link to="/client/calculadora-helado" className="text-pink-600 font-semibold hover:underline">
            Calcula el precio de tu helado perfecto ❤️
          </Link>
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {loading && <div className="text-center col-span-full text-xl text-gray-500">Cargando catálogo...</div>}
        {error && <div className="text-center col-span-full text-xl text-red-500">Error al cargar productos.</div>}
        
        {filteredProducts.map(product => (
          <ProductCard 
            key={product._id} 
            product={product} 
            onSelectProduct={() => handleOpenModal(product)}
          />
        ))}
      </div>

      <ProductSelectorModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ClientCatalogPage;