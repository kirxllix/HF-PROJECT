import React, { useState, useEffect } from 'react';
import { getPendingReviews, moderateReview } from '../../api/reviewService';
import apiClient from '../../api/apiClient'; 
import { Check, X, Star, MessageSquare, User, Trash2 } from 'lucide-react';

const AdminReviewModeration = () => {
    const [reviews, setReviews] = useState([]); // Ya no solo pendientes
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            // Usamos la ruta que trae TODAS las reseñas
            const response = await apiClient.get('/admin/reviews/pending'); 
            const data = Array.isArray(response.data) ? response.data : (response.data || []);
            setReviews(data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleModeration = async (reviewId, newStatus) => {
        try {
            await moderateReview(reviewId, newStatus);
            fetchReviews(); 
        } catch (err) { alert('Error al moderar'); }
    };

    // ✅ Función Borrar
    const handleDelete = async (reviewId) => {
        if (!window.confirm("¿Eliminar esta reseña permanentemente?")) return;
        try {
            await apiClient.delete(`/admin/reviews/${reviewId}`);
            fetchReviews();
        } catch (err) { alert('Error al eliminar'); }
    };
    
    const renderStars = (rating) => {
        return <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < rating ? "currentColor" : "none"} className={i >= rating ? "text-gray-300" : ""} />)}</div>;
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <MessageSquare className="text-pink-600" /> Moderación de Reseñas
            </h1>
            
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review._id} className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 ${review.estado === 'pendiente' ? 'border-yellow-400' : 'border-gray-200'}`}>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                {review.estado === 'pendiente' && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">Pendiente</span>}
                                {review.estado === 'rechazado' && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold">Rechazado</span>}
                                <span className="font-bold text-pink-600 text-sm">{review.IDPRODUCTO?.nombreProducto || 'Producto Eliminado'}</span>
                                {renderStars(review.calificacion)}
                            </div>
                            <p className="text-gray-800 mb-2">"{review.comentario}"</p>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                <User size={12}/> {review.IDUSUARIO?.nombrePila || 'Anónimo'}
                            </div>
                        </div>

                        <div className="flex gap-2 items-center">
                            {review.estado === 'pendiente' && (
                                <>
                                    <button onClick={() => handleModeration(review._id, 'aprobado')} className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200" title="Aprobar"><Check size={18}/></button>
                                    <button onClick={() => handleModeration(review._id, 'rechazado')} className="bg-orange-100 text-orange-700 p-2 rounded hover:bg-orange-200" title="Rechazar"><X size={18}/></button>
                                </>
                            )}
                            {/* ✅ Botón Borrar siempre visible */}
                            <button onClick={() => handleDelete(review._id)} className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200" title="Eliminar"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminReviewModeration;