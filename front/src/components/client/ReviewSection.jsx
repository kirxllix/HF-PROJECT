// hf-frontend/src/components/client/ReviewSection.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // ✅ Importamos Link para la navegación
import { getApprovedReviews, submitReview } from '../../api/reviewService';
import { useAuth } from '../../hooks/useAuth'; 

const ReviewSection = ({ productId }) => {
  const { isLoggedIn } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ calificacion: 5, comentario: '' });
  const [submissionStatus, setSubmissionStatus] = useState(null);
  
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getApprovedReviews(productId);
      
      // ✅ Validación de seguridad para evitar el error "map is not a function"
      const reviewsList = Array.isArray(response) ? response : (response.data || []);
      setReviews(reviewsList);

    } catch (err) {
      console.error("Error al cargar reseñas:", err);
      setReviews([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
        fetchReviews();
    }
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return; // Doble check de seguridad

    try {
      await submitReview(productId, newReview);
      setSubmissionStatus({ type: 'success', message: 'Comentario enviado. Se publicará tras la aprobación del administrador.' });
      setNewReview({ calificacion: 5, comentario: '' }); 
    } catch (err) {
      setSubmissionStatus({ type: 'error', message: err.message || 'Error al enviar el comentario.' });
    }
  };
  
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <span key={i} className={`text-xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                ★
            </span>
        );
    }
    return <div className="flex space-x-0.5">{stars}</div>;
  };

  return (
    <div className="mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6">
        Opiniones de Clientes ({reviews.length})
      </h2>

      {/* --- LÓGICA CONDICIONAL DEL FORMULARIO --- */}
      {isLoggedIn ? (
        // 1. Si está logueado, mostramos el formulario
        <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-pink-50/50">
          <h3 className="text-lg font-semibold mb-3 text-pink-700">Deja tu Calificación</h3>
          
          <div className="flex items-center space-x-4 mb-4">
              <label className="text-sm font-medium text-gray-700">Calificación:</label>
              <select
                  value={newReview.calificacion}
                  onChange={(e) => setNewReview({ ...newReview, calificacion: parseInt(e.target.value) })}
                  className="border border-gray-300 rounded p-1.5 text-sm bg-white focus:ring-2 focus:ring-pink-500 outline-none"
              >
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Estrellas</option>)}
              </select>
          </div>
          
          <textarea
            value={newReview.comentario}
            onChange={(e) => setNewReview({ ...newReview, comentario: e.target.value })}
            placeholder="Escribe tu comentario sobre este producto..."
            required
            rows="3"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 outline-none mb-3 bg-white"
          />
          
          <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg text-sm shadow-md transition transform active:scale-95">
            Enviar Comentario
          </button>
          
          {submissionStatus && (
            <div className={`mt-3 p-2 rounded text-sm font-medium ${submissionStatus.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {submissionStatus.message}
            </div>
          )}
        </form>
      ) : (
        // 2. ✅ NUEVO: Si NO está logueado, mostramos mensaje con link al login
        <div className="mb-8 p-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-gray-600 font-medium mb-2">¿Ya probaste este producto?</p>
            <Link to="/login" className="text-pink-600 font-bold hover:text-pink-800 hover:underline transition">
                Inicia sesión para compartir tu opinión 💬
            </Link>
        </div>
      )}
      
      {/* Listado de Comentarios */}
      <div className="space-y-6">
        {loading && <p className="text-gray-500 text-center py-4">Cargando opiniones...</p>}
        
        {!loading && reviews.length === 0 && (
            <p className="text-gray-400 text-center italic py-4">Sé el primero en dejar una opinión.</p>
        )}
        
        {Array.isArray(reviews) && reviews.map((review) => (
          <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
            <div className="flex justify-between items-center mb-2">
                {renderStars(review.calificacion)}
                <div className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {review.IDUSUARIO?.nombrePila || 'Cliente'}
                </div> 
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{review.comentario}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;