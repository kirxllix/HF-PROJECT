// hf-frontend/src/pages/admin/AdminReviewModeration.jsx

import React, { useState, useEffect } from 'react';
import { getPendingReviews, moderateReview } from '../../api/reviewService';
// ✅ 1. Importamos los íconos correctos
import { Check, X, Star, MessageSquare, User } from 'lucide-react';

const AdminReviewModeration = () => {
    const [pendingReviews, setPendingReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPendingReviews = async () => {
        try {
            setLoading(true);
            setError(null);
            // NOTA: El backend devuelve { success: true, data: [...] } o un array directo.
            // Validamos la respuesta para evitar errores.
            const response = await getPendingReviews();
            const data = Array.isArray(response) ? response : (response.data || []);
            
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
                <Star 
                    key={i} 
                    size={16} 
                    fill={i <= rating ? "#fbbf24" : "none"} 
                    className={i <= rating ? "text-yellow-400" : "text-gray-300"} 
                />
            );
        }
        return <div className="flex space-x-1">{stars}</div>;
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center gap-3">
                <MessageSquare className="text-pink-600" size={32} />
                Moderación de Reseñas
            </h1>
            
            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4 flex items-center gap-2 border border-red-200">
                    <X size={18} /> Error: {error}
                </div>
            )}

            <div className="space-y-4">
                {loading && <p className="text-gray-500 animate-pulse text-center py-10">Cargando reseñas...</p>}

                {!loading && pendingReviews.length === 0 && (
                    <div className="p-10 text-center bg-white rounded-xl shadow-sm border border-gray-200">
                        <Check className="mx-auto text-green-500 mb-2" size={48} />
                        <p className="text-xl text-gray-800 font-semibold">¡Todo al día!</p>
                        <p className="text-gray-500">No hay reseñas pendientes de moderación.</p>
                    </div>
                )}
                
                {pendingReviews.map((review) => (
                    <div key={review._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col md:flex-row justify-between items-start gap-4">
                        
                        {/* Contenido de la Reseña */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-1 rounded-md">
                                    {/* 🚨 CORRECCIÓN: Accedemos a .nombreProducto */}
                                    {review.IDPRODUCTO?.nombreProducto || 'Producto Desconocido'}
                                </span>
                                <span className="text-gray-400 text-xs">•</span>
                                <div className="flex items-center">{renderStars(review.calificacion)}</div>
                            </div>

                            <p className="font-medium text-gray-800 text-lg mb-2">"{review.comentario}"</p>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <User size={14} />
                                {/* 🚨 CORRECCIÓN: Accedemos a .nombrePila */}
                                <span>Enviado por: <strong>{review.IDUSUARIO?.nombrePila || 'Anónimo'}</strong></span>
                            </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex gap-2 shrink-0">
                            <button 
                                onClick={() => handleModeration(review._id, 'aprobado')}
                                className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-2 px-4 rounded-lg flex items-center gap-2 text-sm font-bold transition"
                            >
                                <Check size={18} /> Aprobar
                            </button>
                            <button 
                                onClick={() => handleModeration(review._id, 'rechazado')}
                                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-2 px-4 rounded-lg flex items-center gap-2 text-sm font-bold transition"
                            >
                                <X size={18} /> Rechazar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminReviewModeration;