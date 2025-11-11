// hf-frontend/src/components/client/ProductSelectorModal.jsx

import React, { useState, useEffect } from 'react';
import { useCart } from '../../hooks/useCart';
// import { X } from 'lucide-react'; // Icono de cerrar

const ProductSelectorModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  // Estado para la variación seleccionada y la cantidad
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  // Reiniciar estados cuando se abre un nuevo producto
  useEffect(() => {
    if (product && product.variaciones.length > 0) {
      // Selecciona la primera variación por defecto
      setSelectedVariation(product.variaciones[0]); 
      setQuantity(1);
      setError('');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    if (!selectedVariation) {
      setError("Por favor, selecciona una variación.");
      return;
    }
    if (quantity < 1) {
      setError("La cantidad debe ser al menos 1.");
      return;
    }

    // Llama a la función del contexto del carrito
    addToCart(product, selectedVariation, quantity);
    onClose(); // Cierra el modal después de agregar
  };

  const handleVariationChange = (e) => {
    const variationName = e.target.value;
    const variation = product.variaciones.find(v => v.nombre === variationName);
    setSelectedVariation(variation);
    setError('');
  };

  const currentPrice = selectedVariation ? selectedVariation.precio * quantity : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg transform transition-all">
        
        {/* Encabezado del Modal */}
        <div className="p-6 border-b flex justify-between items-center bg-pink-500 text-white rounded-t-lg">
          <h3 className="text-2xl font-bold">{product.nombreProducto}</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            {/* <X size={24} /> */}
            <span className='font-extrabold'>X</span>
          </button>
        </div>

        {/* Cuerpo del Modal: Selector de Variaciones y Cantidad */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">{product.descripcion}</p>

          {/* Selector de Variación */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Seleccionar Variación
            </label>
            <select
              onChange={handleVariationChange}
              value={selectedVariation?.nombre || ''}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-pink-500 focus:border-pink-500 transition"
            >
              {product.variaciones.map((v, index) => (
                <option key={index} value={v.nombre}>
                  {v.nombre} — ${v.precio.toFixed(2)} MXN
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Cantidad */}
          <div className="flex items-center justify-between mb-4">
            <label className="text-gray-700 font-semibold">Cantidad</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 text-center border border-gray-300 rounded-lg p-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm italic mb-4">{error}</p>}
        </div>

        {/* Pie de Página del Modal: Cálculo Total y Botón de Carrito */}
        <div className="p-6 pt-4 bg-gray-50 rounded-b-lg flex justify-between items-center">
          <div className="text-xl font-bold">
            Total: 
            <span className="text-pink-600 ml-2">
              ${currentPrice.toFixed(2)} MXN
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md"
            disabled={!selectedVariation}
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectorModal;