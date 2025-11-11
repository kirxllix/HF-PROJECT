// hf-frontend/src/pages/client/ClientCatalogPage.jsx (ACTUALIZADO)

import React, { useState } from 'react';
import ProductCard from '../../components/client/ProductCard';
import ProductSelectorModal from '../../components/client/ProductSelectorModal'; // 🚨 Importar Modal
import { useProducts } from '../../hooks/useProducts';

const ClientCatalogPage = () => {
  const { products, loading, error } = useProducts();
  
  // 🚨 Estados para manejar el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // ... (El resto de la lógica de loading y error es la misma)

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-pink-600">
          Nuestro Catálogo de Dulces
        </h1>
        <p className="text-gray-600 mt-2">
          Palomitas, Helados y más. ¡Encuentra tu sabor favorito!
        </p>
      </header>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {loading && <div className="text-center col-span-full text-xl text-gray-500">Cargando catálogo...</div>}
        
        {products.map(product => (
          // 🚨 Pasar la función de abrir el modal a la tarjeta
          <ProductCard 
            key={product._id} 
            product={product} 
            onSelectProduct={() => handleOpenModal(product)}
          />
        ))}
      </div>

      {/* 🚨 Renderizar el Modal */}
      <ProductSelectorModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ClientCatalogPage;