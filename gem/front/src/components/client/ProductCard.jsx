// src/components/client/ProductCard.jsx (NUEVA VERSIÓN SIMPLIFICADA)

import React from 'react';

// --- Función de Ayuda para Categorías ---
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

const ProductCard = ({ product, onSelectProduct }) => {
  
  if (!product) {
    return null; // Protección contra errores
  }
  
  const isHelado = product.categoria?.startsWith('helado') || false;

  // 1. Ahora es un <button> para accesibilidad, estilizado como una tarjeta
  return (
    <button
      onClick={onSelectProduct}
      className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col text-left cursor-pointer"
    >
      
      {/* Sección de Imagen */}
      <div className="p-4 bg-pink-100 h-48 relative">
        <img 
          src={product.imagenUrl}
          alt={product.nombreProducto}
          className="h-full w-full object-cover rounded-md text-gray-500 text-sm flex items-center justify-center" 
        />
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          {/* Etiqueta de Categoría */}
          <span className={`inline-block text-xs font-semibold py-1 px-3 rounded-full mb-2 ${
              isHelado ? 'bg-blue-400 text-white' : 
              product.categoria === 'palomita' ? 'bg-red-500 text-white' : 
              'bg-gray-500 text-white'
          }`}>
            {formatCategory(product.categoria)}
          </span>
          
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {product.nombreProducto}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {product.descripcion}
          </p>
        </div>
        
        {/* 2. Lógica de precio y botones ELIMINADA */}
        
        {/* 3. NUEVO: Un indicador visual para el clic */}
        <div className="mt-4">
          <span className="text-sm font-semibold text-pink-600">
            Ver Opciones &rarr;
          </span>
        </div>
      </div>
    </button>
  );
};

export default ProductCard;