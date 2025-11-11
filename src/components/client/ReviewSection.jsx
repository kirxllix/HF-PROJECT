// hf-frontend/src/components/client/ReviewSection.jsx

import React, { useState, useEffect } from 'react';
import { getApprovedReviews, submitReview } from '../../api/reviewService';
import { useAuth } from '../../hooks/useAuth'; 
// import { Star } from 'lucide-react'; // Ícono de estrella

const ReviewSection = ({ productId }) => {
  const { isLoggedIn } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ calificacion: 5, comentario: '' });
  const [submissionStatus, setSubmissionStatus] = useState(null);
  
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getApprovedReviews(productId);
      setReviews(data);
    } catch (err) {
      console.error("Error al cargar reseñas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setSubmissionStatus({ type: 'error', message: 'Debes iniciar sesión para comentar.' });
      return;
    }
    try {
      await submitReview(productId, newReview);
      setSubmissionStatus({ type: 'success', message: 'Comentario enviado. Se publicará tras la aprobación del administrador.' });
      setNewReview({ calificacion: 5, comentario: '' }); // Limpiar formulario
    } catch (err) {
      setSubmissionStatus({ type: 'error', message: err.message || 'Error al enviar el comentario.' });
    }
  };
  
  // Función para generar estrellas de calificación
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <span key={i} className={`text-xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                {/* <Star size={18} fill={i <= rating ? 'currentColor' : 'none'} /> */}
                ★
            </span>
        );
    }
    return <div className="flex space-x-0.5">{stars}</div>;
  };

  return (
    <div className="mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6">
        Opiniones de Clientes ({reviews.length})
      </h2>

      {/* Formulario para Nuevo Comentario */}
      {isLoggedIn && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">Deja tu Calificación</h3>
          
          <div className="flex items-center space-x-4 mb-4">
              <label className="text-sm font-medium">Calificación:</label>
              {/* Selector de Estrellas */}
              <select
                  value={newReview.calificacion}
                  onChange={(e) => setNewReview({ ...newReview, calificacion: parseInt(e.target.value) })}
                  className="border rounded p-1 text-sm"
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
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-pink-500 focus:border-pink-500 mb-3"
          />
          
          <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">
            Enviar Comentario
          </button>
          
          {submissionStatus && (
            <p className={`mt-2 text-sm ${submissionStatus.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
              {submissionStatus.message}
            </p>
          )}
        </form>
      )}
      
      {/* Listado de Comentarios Aprobados */}
      <div className="space-y-6">
        {loading && <p className="text-gray-500">Cargando opiniones...</p>}
        {!loading && reviews.length === 0 && <p className="text-gray-500">Sé el primero en dejar una opinión.</p>}
        
        {reviews.map((review) => (
          <div key={review._id} className="border-b pb-4">
            <div className="flex justify-between items-center mb-1">
                {renderStars(review.calificacion)}
                {/* 🚨 NOTA: El Backend debe incluir el nombre del usuario o dejarlo anónimo */}
                <p className="text-xs text-gray-500">Cliente ID: {review.IDUSUARIO.slice(-6).toUpperCase()}</p> 
            </div>
            <p className="text-gray-700">{review.comentario}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;