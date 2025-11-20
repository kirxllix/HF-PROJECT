import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import apiClient from '../../api/apiClient'; // Para llamar a las nuevas rutas

// Función auxiliar para renderizar estrellas
const renderStars = (rating) => {
    return (
        <div className="flex text-yellow-400 text-lg">
            {'★'.repeat(rating)}
            <span className="text-gray-300">{'★'.repeat(5 - rating)}</span>
        </div>
    );
};

const ProductPreviewCard = ({ product }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="h-48 overflow-hidden bg-pink-50 relative group">
        <img 
          src={product.imagenUrl} 
          alt={product.nombreProducto} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{product.nombreProducto}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{product.descripcion}</p>
        <Link to="/client/catalogo" className="text-pink-600 font-bold text-sm hover:underline">
            ¡Lo quiero! &rarr;
        </Link>
      </div>
    </div>
);

const HomePage = () => {
  const { products, loading: loadingProducts } = useProducts();
  const [promotions, setPromotions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingExtras, setLoadingExtras] = useState(true);

  // Cargar Promos y Reviews al iniciar
  useEffect(() => {
      const fetchData = async () => {
          try {
              const [promosRes, reviewsRes] = await Promise.all([
                  apiClient.get('/client/promotions/active'),
                  apiClient.get('/client/reviews/recent')
              ]);
              setPromotions(promosRes.data.data || []);
              setReviews(reviewsRes.data.data || []);
          } catch (err) {
              console.error("Error cargando datos del home", err);
          } finally {
              setLoadingExtras(false);
          }
      };
      fetchData();
  }, []);

  // Filtrar "Helados Estrella" (Ej: los primeros 3 helados de sabor)
  const heladosEstrella = products
    .filter(p => p.categoria === 'helado_sabor')
    .slice(0, 3);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      
      {/* 1. BANNER HERO */}
      <div className="relative h-[500px] flex items-center justify-center text-center text-white px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-90 z-10"></div>
        <video 
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/banner-video.mp4" type="video/mp4" />
        </video>
        
        <div className="relative z-20 max-w-3xl animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg tracking-tight">
            Happy Factory
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light opacity-90">
            Donde la felicidad tiene sabor a helado 🍦
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/client/catalogo" className="bg-white text-pink-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transform hover:-translate-y-1 transition">
              Ver Menú
            </Link>
            <Link to="/login" className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-pink-600 transition">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>

      {/* 2. PROMOCIONES ACTIVAS (Dinámico) */}
      {promotions.length > 0 && (
        <section className="py-12 bg-yellow-50 border-b border-yellow-100">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">🔥 Promociones del Mes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {promotions.map(promo => (
                        <div key={promo._id} className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-pink-500 flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-pink-600 mb-2">{promo.titulo}</h3>
                                <p className="text-gray-600 mb-4">{promo.descripcion}</p>
                            </div>
                            <p className="text-xs text-gray-400 font-mono mt-2">
                                Válido hasta: {new Date(promo.fecha_fin).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      )}

      {/* 3. HELADOS ESTRELLA */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Nuestros Favoritos</h2>
        <p className="text-gray-500 mb-12 max-w-xl mx-auto">
            Descubre los sabores que están enamorando a todos. Hechos con ingredientes naturales y mucho amor.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loadingProducts ? (
            <p className="col-span-3 text-gray-400 animate-pulse">Preparando vitrina...</p>
          ) : (
            heladosEstrella.map(product => (
              <ProductPreviewCard key={product._id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* 4. RESEÑAS (Dinámico) */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">
                Lo que dicen nuestros Happy Clientes ❤️
            </h2>
            
            {loadingExtras ? (
                <p className="text-center text-gray-400">Cargando opiniones...</p>
            ) : reviews.length === 0 ? (
                <div className="text-center p-8 bg-pink-50 rounded-xl">
                    <p className="text-pink-600 font-medium">¡Sé el primero en dejarnos tu opinión!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map(review => (
                        <div key={review._id} className="bg-gray-50 p-8 rounded-2xl shadow-sm relative">
                            <div className="absolute -top-4 left-8 text-6xl text-pink-200">"</div>
                            <div className="mb-4 relative z-10">
                                {renderStars(review.calificacion)}
                            </div>
                            <p className="text-gray-700 italic mb-6 relative z-10">
                                {review.comentario}
                            </p>
                            <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
                                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">
                                    {review.IDUSUARIO?.nombrePila?.charAt(0) || 'C'}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900">{review.IDUSUARIO?.nombrePila || 'Cliente Feliz'}</p>
                                    <p className="text-xs text-gray-500">Sobre: {review.IDPRODUCTO?.nombreProducto || 'General'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </section>

      {/* 5. CTA FINAL */}
      <section className="bg-pink-600 py-16 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">¿Listo para tu dosis de felicidad?</h2>
          <p className="mb-8 opacity-90">Haz tu pedido en línea y pasa a recogerlo sin filas.</p>
          <Link to="/client/catalogo" className="bg-white text-pink-600 font-bold py-3 px-10 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105 inline-block">
              Ordenar Ahora
          </Link>
      </section>

    </div>
  );
};

export default HomePage;