// hf-frontend/src/components/client/ProductCard.jsx

import React, { useState } from 'react';
// ✅ Importamos un ícono para cuando no haya imagen
import { Image as ImageIcon } from 'lucide-react'; 

const formatCategory = (category) => {
  const cat = category || '';
  switch (cat) {
    case 'helado_sabor': return 'Helado';
    case 'helado_presentacion': return 'Helado';
    case 'palomita': return 'Palomitas';
    case 'icee': return 'ICEE';
    case 'slush': return 'Slush';
    default: return cat.charAt(0).toUpperCase() + cat.slice(1);
  }
};

const ProductCard = ({ product, onSelectProduct }) => {
  // Estado local para controlar si la imagen falló
  const [imgError, setImgError] = useState(false);

  if (!product) return null;
  
  const isHelado = product.categoria?.startsWith('helado') || false;

  // Función para intentar arreglar URLs rotas del backend
  const getImageUrl = (url) => {
      if (!url) return null;
      
      // Corrige error común 'undefined/uploads'
      if (url.includes('undefined/uploads')) {
          return url.replace('undefined', 'http://localhost:5000');
      }
      
      // Corrige rutas relativas agregando el dominio
      if (url.startsWith('/uploads') || url.startsWith('uploads')) {
          const cleanPath = url.startsWith('/') ? url : `/${url}`;
          return `http://localhost:5000${cleanPath}`;
      }
      
      return url;
  };

  const finalUrl = getImageUrl(product.imagenUrl);

  return (
    <button
      onClick={onSelectProduct}
      className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col text-left cursor-pointer group"
    >
      
      {/* Sección de Imagen */}
      <div className="bg-gray-100 h-48 relative overflow-hidden flex items-center justify-center">
        
        {/* Lógica: Si hay URL y no ha dado error, mostramos la imagen. Si no, el ícono. */}
        {finalUrl && !imgError ? (
            <img 
              src={finalUrl}
              alt={product.nombreProducto}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImgError(true)} // Si falla, activamos el estado de error
            />
        ) : (
            // 🎨 Fallback Visual Local (Sin peticiones de red)
            <div className="flex flex-col items-center text-gray-400">
                <ImageIcon size={40} strokeWidth={1.5} />
                <span className="text-xs mt-1 font-medium">Imagen no disponible</span>
            </div>
        )}
        
        {/* Overlay sutil al pasar el mouse */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <span className={`inline-block text-xs font-bold py-1 px-3 rounded-full mb-2 uppercase tracking-wide ${
              isHelado ? 'bg-blue-100 text-blue-600' : 
              product.categoria === 'palomita' ? 'bg-red-100 text-red-600' : 
              'bg-gray-100 text-gray-600'
          }`}>
            {formatCategory(product.categoria)}
          </span>
          
          <h3 className="text-xl font-black text-gray-800 mb-1 leading-tight">
            {product.nombreProducto}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {product.descripcion}
          </p>
        </div>
        
        <div className="mt-4 flex items-center text-pink-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
            Ver Opciones &rarr;
        </div>
      </div>
    </button>
  );
};

export default ProductCard;