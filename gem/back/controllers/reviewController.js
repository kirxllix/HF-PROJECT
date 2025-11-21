const Review = require('../models/review');

// @desc    Obtener reseñas aprobadas de un producto
// @route   GET /api/v1/client/reviews/:productId
exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ 
            IDPRODUCTO: req.params.productId, 
            estado: 'aprobado' 
        }).populate('IDUSUARIO', 'nombrePila');
        
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener reseñas.' });
    }
};

// @desc    Crear una nueva reseña
// @route   POST /api/v1/client/reviews
exports.createReview = async (req, res) => {
    const { IDPRODUCTO, calificacion, comentario } = req.body;
    const IDUSUARIO = req.user.id; // Viene del token

    try {
        // Opcional: Verificar si ya compró el producto antes de dejar review
        
        const review = await Review.create({
            IDPRODUCTO,
            IDUSUARIO,
            calificacion,
            comentario,
            estado: 'pendiente' // Siempre pendiente hasta que admin apruebe
        });

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ message: 'Error al guardar la reseña.' });
    }
};