// src/pages/client/HomePage.jsx (ACTUALIZADO con productos reales)

import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts'; // 1. Importar el hook

const formatCategory = (category) => {
  switch (category) {
    case 'helado_sabor':
    case 'helado_presentacion':
      return 'Helado';
    case 'palomita':
      return 'Palomitas';
    case 'icee':
      return 'ICEE';
    case 'slush':
      return 'Slush';
    case 'topping':
      return 'Topping';
    case 'gomita':
      return 'Gomitas';
    case 'sazonador':
      return 'Sazonador';
    default:
      // Si no coincide, solo pone la primera letra en mayúscula
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
};
// ------------------------------------

// Componente ProductPreviewCard (ahora usará la función)
const ProductPreviewCard = ({ product }) => {
  // ... (código de description1 y description2) ...
  const description1 = product.variaciones[0]?.nombre || product.descripcion;
  const description2 = product.variaciones[1]?.nombre || '';
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      {/* ... (código de la imagen) ... */}
      <div className="bg-gray-200 h-48">
        <img 
          src={product.imagenUrl} 
          alt={product.nombreProducto} 
          className="h-full w-full object-cover" 
        />
      </div>
      <div className="p-5 text-left flex-1 flex flex-col justify-between">
        
        {/* --- AQUÍ ESTÁ EL CAMBIO --- */}
        <p className="text-xs font-semibold text-pink-600 uppercase">
          {formatCategory(product.categoria)}
        </p>
        
        <h3 className="text-xl font-bold text-gray-800 mb-1">{product.nombreProducto}</h3>
        <div>
          <p className="text-sm text-gray-600">{description1}</p>
          <p className="text-sm text-gray-800 font-bold">{description2}</p>
        </div>
      </div>
    </div>
  );
};


const HomePage = () => {
  // 3. Llamar al hook para obtener los productos
  const { products, loading } = useProducts();

  // 4. Filtrar la lista para "Helados Estrella"
  const heladosEstrella = products
    .filter(p => 
      p.categoria === 'helado_sabor' || 
      p.categoria === 'helado_presentacion' // Categorías del modelo
    )
    .slice(0, 3); // Tomar solo los primeros 3

  return (
    <div className="bg-blue-50">
      
      {/* --- Sección "Bienvenidos" (Banner de Video) --- */}
      <div 
        className="relative overflow-hidden"
        style={{ height: '500px' }}
      >
        <video 
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          {/* Recuerda poner tu video en la carpeta /public/ */}
          <source src="/banner-video.mp4" type="video/mp4" />
          Tu navegador no soporta videos.
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-60 z-10"></div>
        <div className="relative z-20 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
          <h1 className="text-5xl font-extrabold mb-4 text-white">
            ¡Bienvenidos a Happy Factory!
          </h1>
          <p className="text-lg text-gray-200 max-w-lg">
            Descubre nuestros irresistibles helados, ubicaciones y promociones especiales.
          </p>
        </div>
      </div>

      {/* --- 5. Sección "Helados Estrella" (Actualizada) --- */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-3">Helados Estrella</h2>
        <p className="text-gray-600 mb-8">¡Prueba nuestros helados de yogurt!</p>
        
        {/* Renderizado dinámico de productos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {loading ? (
            <p className="col-span-3 text-gray-500">Cargando helados...</p>
          ) : (
            heladosEstrella.map(product => (
              <ProductPreviewCard key={product._id} product={product} />
            ))
          )}
        </div>
        
        <Link to="/client/catalogo" className="bg-black text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors">
          Ver Más
        </Link>
      </section>

      {/* --- Sección "Promociones Especiales" (sin cambios) --- */}
      <section className="bg-white">
        {/* ... (Tu sección de promos) ... */}
      </section>

      {/* --- Sección "Lo Que Dicen Nuestros Clientes" (sin cambios) --- */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        {/* ... (Tu sección de reviews) ... */}
      </section>

    </div>
  );
};

export default HomePage;