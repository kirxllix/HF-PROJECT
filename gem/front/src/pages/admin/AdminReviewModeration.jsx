// hf-frontend/src/pages/admin/AdminReviewModeration.jsx

import React, { useState, useEffect } from 'react';
import { getPendingReviews, moderateReview } from '../../api/reviewService';
// import { Check, X, Star } from 'lucide-react'; // Íconos

const AdminReviewModeration = () => {
    const [pendingReviews, setPendingReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPendingReviews = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPendingReviews(); // Llama a la API de admin/reviews/pending
            setPendingReviews(data);
        } catch (err) {
            setError("Error al cargar las reseñas pendientes.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    const handleModeration = async (reviewId, newStatus) => {
        try {
            await moderateReview(reviewId, newStatus);
            // Mostrar un mensaje de éxito y actualizar la lista
            alert(`Reseña ${newStatus} exitosamente.`);
            fetchPendingReviews(); 
        } catch (err) {
            setError(`Error al ${newStatus} la reseña.`);
            console.error(err);
        }
    };
    
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={`text-xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                    {/* <Star size={16} fill={i <= rating ? 'currentColor' : 'none'} /> */}
                    ★
                </span>
            );
        }
        return <div className="flex space-x-0.5">{stars}</div>;
    };


    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
                Comentarios Pendientes de Moderación
            </h1>
            
            {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">Error: {error}</div>}

            <div className="space-y-4">
                {loading && <p className="text-gray-500">Cargando reseñas...</p>}

                {!loading && pendingReviews.length === 0 && (
                    <div className="p-10 text-center bg-white rounded-xl shadow-lg">
                        <p className="text-xl text-green-600 font-semibold"> ¡No hay reseñas pendientes de moderación!</p> 
                    </div>
                )}
                
                {pendingReviews.map((review) => (
                    <div key={review._id} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-pink-500 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="flex-1 mb-4 md:mb-0">
                            <p className="font-semibold text-sm text-gray-500">Producto ID: {review.IDPRODUCTO}</p>
                            <p className="font-semibold text-lg">{review.comentario}</p>
                            <div className="mt-1">{renderStars(review.calificacion)}</div>
                            <p className="text-xs text-gray-500 mt-2">Enviado por Cliente ID: {review.IDUSUARIO}</p>
                        </div>

                        <div className="flex space-x-3">
                            <button 
                                onClick={() => handleModeration(review._id, 'aprobado')}
                                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center text-sm"
                            >
                                {/* <Check size={18} className="mr-1" /> */}
                                Aprobar
                            </button>
                            <button 
                                onClick={() => handleModeration(review._id, 'rechazado')}
                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center text-sm"
                            >
                                {/* <X size={18} className="mr-1" /> */}
                                Rechazar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminReviewModeration;