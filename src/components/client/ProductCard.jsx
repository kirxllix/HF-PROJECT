// hf-frontend/src/components/client/ProductCard.jsx (FINAL Y CORREGIDO)

import React from 'react';
// Si usas lucide-react (librería de íconos), descomentarías esta línea:
// import { ShoppingCart } from 'lucide-react'; 

/**
 * Tarjeta de Producto para el Catálogo del Cliente.
 * * @param {object} product - Objeto del producto de la API de MongoDB.
 * @param {function} onSelectProduct - Función que abre el modal de selección
 * al hacer clic en el botón.
 */
const ProductCard = ({ product, onSelectProduct }) => {
  // Encuentra el precio más bajo para mostrarlo como referencia
  const basePrice = product.variaciones.length > 0 
    ? Math.min(...product.variaciones.map(v => v.precio)) 
    : 0;

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      
      {/* Sección de Imagen/Tipo de Producto */}
      <div className="p-4 bg-pink-100">
        <span className={`inline-block text-xs font-semibold py-1 px-3 rounded-full uppercase ${
            // Lógica de colores para diferenciar categorías
            product.categoria === 'palomita' ? 'bg-red-500 text-white' : 
            product.categoria === 'helado' ? 'bg-blue-400 text-white' : 
            'bg-gray-500 text-white'
        }`}>
          {product.categoria}
        </span>
        {/* Placeholder para la imagen o icono  */}
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="p-5 flex flex-col justify-between h-full">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {product.nombreProducto}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {product.descripcion}
          </p>

          {/* Precio y Variaciones */}
          <p className="text-2xl font-extrabold text-pink-600 mb-4">
            ${basePrice.toFixed(2)} MXN 
            <span className="text-sm font-normal text-gray-500 ml-1">
              {product.variaciones.length > 1 ? 'desde' : ''}
            </span>
          </p>
        </div>
        
        {/* Botón de Acción - Ahora llama a la función de la prop */}
        <button
          // 🚨 CLAVE: Llama a la función onSelectProduct que recibe la página de catálogo.
          onClick={onSelectProduct} 
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
        >
          {/* Si usas ShoppingCart: <ShoppingCart size={20} className="mr-2" /> */}
          <span>Seleccionar Variación</span> 
        </button>
      </div>
    </div>
  );
};

export default ProductCard;