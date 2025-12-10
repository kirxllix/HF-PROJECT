import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { IceCream, Flame, Heart, Star, MapPin } from 'lucide-react';

// Función para arreglar URLs
const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    const BACKEND_URL = 'http://localhost:5000';
    if (url.includes('undefined/uploads')) return url.replace('undefined', BACKEND_URL);
    return `${BACKEND_URL}${url.startsWith('/') ? url : '/' + url}`;
};

const ProductPreviewCard = ({ product }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="h-48 overflow-hidden bg-pink-50 relative">
        <img 
          src={getImageUrl(product.imagenUrl)} 
          alt={product.nombreProducto} 
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" 
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{product.nombreProducto}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{product.descripcion}</p>
        <Link to="/client/catalogo" className="text-pink-600 font-bold text-sm hover:underline">¡Lo quiero! &rarr;</Link>
      </div>
    </div>
);

const HomePage = () => {
  const [promotions, setPromotions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [sectionTitle, setSectionTitle] = useState('Nuestros Favoritos');
  const [loading, setLoading] = useState(true);
  
  // Estado para el carrusel de promociones
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
      const fetchData = async () => {
          try {
              // ✅ Usamos la nueva ruta unificada
              const res = await apiClient.get('/client/home-data');
              const { promotions, favorites, sectionTitle, reviews } = res.data.data;
              
              setPromotions(promotions || []);
              setFavorites(favorites || []);
              setSectionTitle(sectionTitle);
              setReviews(reviews || []);
          } catch (err) { console.error("Error home", err); } 
          finally { setLoading(false); }
      };
      fetchData();
  }, []);

  // ✅ Rotación del Banner
  useEffect(() => {
      if (promotions.length <= 1) return;
      const interval = setInterval(() => {
          setCurrentPromoIndex((prev) => (prev + 1) % promotions.length);
      }, 5000); // Cambia cada 5 segundos
      return () => clearInterval(interval);
  }, [promotions]);

  const activePromo = promotions[currentPromoIndex];

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      
      {/* 1. BANNER VIDEO */}
      <div className="relative h-[500px] flex items-center justify-center text-center text-white px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-90 z-10"></div>
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0"><source src="/banner-video.mp4" type="video/mp4" /></video>
        <div className="relative z-20 max-w-3xl flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg tracking-tight">Happy Factory</h1>
          <p className="text-xl md:text-2xl mb-8 font-light opacity-90 flex items-center gap-2"> Descubre la felicidad
en cada detalle <IceCream size={28} /></p>
          <div className="flex justify-center gap-4">
            <Link to="/client/catalogo" className="bg-white text-pink-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transform hover:-translate-y-1 transition">Ver Menú</Link>
            <Link to="/login" className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-pink-600 transition">Iniciar Sesión</Link>
          </div>
        </div>
      </div>

      {/*  2. BANNER DE PROMOCIONES (CARRUSEL) */}  
      {promotions.length > 0 && activePromo && (
        <section className="bg-yellow-400 text-yellow-900 py-4 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-center">
                <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left animate-fade-in">
                    <div className="bg-white p-2 rounded-full shadow-sm"><Flame className="text-orange-500" size={24} /></div>
                    <div>
                        <h3 className="font-black text-xl uppercase tracking-wide">{activePromo.titulo}</h3>
                        <p className="text-sm font-medium opacity-90">{activePromo.descripcion}</p>
                    </div>
                    <div className="bg-yellow-800/10 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-yellow-800/20">
                        <MapPin size={12}/> 
                        {activePromo.IDSucursal ? `Solo en: ${activePromo.IDSucursal.nombreSucursal}` : 'Válida en TODAS las sucursales'}
                    </div>
                </div>
            </div>
            {/* Indicadores de puntitos si hay más de una */}
            {promotions.length > 1 && (
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
                    {promotions.map((_, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentPromoIndex ? 'bg-yellow-900' : 'bg-yellow-900/30'}`} />
                    ))}
                </div>
            )}
        </section>
      )}

      {/* 3. FAVORITOS DINÁMICOS */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        {/* Título Configurable desde Admin */}
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{sectionTitle}</h2>
        <p className="text-gray-500 mb-12 max-w-xl mx-auto">Nuestra selección especial para ti.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <p className="col-span-3 text-gray-400 animate-pulse">Preparando vitrina...</p>
          ) : favorites.length === 0 ? (
             <div className="col-span-3 p-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                 El administrador aún no ha seleccionado favoritos.
             </div>
          ) : (
            favorites.map(product => (
              <ProductPreviewCard key={product._id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* 4. RESEÑAS (Igual que antes) */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center flex items-center justify-center gap-2">Lo que dicen nuestros Happy Clientes <Heart className="text-red-500" fill="currentColor" /></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {reviews.map(review => (
                    <div key={review._id} className="bg-gray-50 p-8 rounded-2xl shadow-sm relative">
                        <div className="absolute -top-4 left-8 text-6xl text-pink-200">"</div>
                        <div className="flex text-yellow-400 mb-4">{[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < review.calificacion ? "currentColor" : "none"} className={i >= review.calificacion ? "text-gray-300" : ""} />)}</div>
                        <p className="text-gray-700 italic mb-6 relative z-10">{review.comentario}</p>
                        <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
                            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">{review.IDUSUARIO?.nombrePila?.charAt(0) || 'C'}</div>
                            <div>
                                <p className="font-bold text-sm text-gray-900">{review.IDUSUARIO?.nombrePila || 'Cliente Feliz'}</p>
                                <p className="text-xs text-gray-500">Sobre: {review.IDPRODUCTO?.nombreProducto || 'General'}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-pink-600 py-16 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">¿Listo para tu dosis de felicidad?</h2>
          <Link to="/client/catalogo" className="bg-white text-pink-600 font-bold py-3 px-10 rounded-full shadow-lg hover:scale-105 inline-block transition">Ordenar Ahora</Link>
      </section>
    </div>
  );
};

export default HomePage;