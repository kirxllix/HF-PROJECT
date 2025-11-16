// hf-frontend/src/components/client/ProductSelectorModal.jsx (ACTUALIZADO CON LÓGICA)

import React, { useState, useEffect } from 'react';
import { useCart } from '../../hooks/useCart';

const ProductSelectorModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product && product.variaciones?.length > 0) {
      setSelectedVariation(product.variaciones[0]); 
      setQuantity(1);
      setError('');
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  // --- 1. LÓGICA DE NEGOCIO ---
  // Solo las palomitas se pueden comprar en línea
  const isPurchasable = product.categoria === 'palomita';
  const hasMultipleVariations = product.variaciones.length > 1;

  // --- Handlers (solo se usan si es 'isPurchasable') ---
  const handleAddToCart = () => {
    if (!selectedVariation) {
      setError("Por favor, selecciona una variación.");
      return;
    }
    if (quantity < 1) {
      setError("La cantidad debe ser al menos 1.");
      return;
    }
    addToCart(product, selectedVariation, quantity);
    onClose();
  };

  const handleVariationChange = (e) => {
    const variationName = e.target.value;
    const variation = product.variaciones.find(v => v.nombre === variationName);
    setSelectedVariation(variation);
    setError('');
  };

  const currentPrice = selectedVariation ? selectedVariation.precio * quantity : 0;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all">
        
        {/* Encabezado (sin cambios) */}
        <div className="p-6 border-b flex justify-between items-center bg-pink-500 text-white rounded-t-lg">
          <h3 className="text-2xl font-bold">{product.nombreProducto}</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <span className='font-extrabold text-2xl'>&times;</span>
          </button>
        </div>

        {/* --- 2. CUERPO CONDICIONAL --- */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">{product.descripcion}</p>
          
          {/* --- A. SI ES COMPRABLE (Palomitas) --- */}
          {isPurchasable && (
            <>
              {hasMultipleVariations ? (
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Seleccionar Variación</label>
                  <select onChange={handleVariationChange} value={selectedVariation?.nombre || ''} className="w-full border border-gray-300 rounded-lg p-3">
                    {product.variaciones.map((v, index) => (
                      <option key={index} value={v.nombre}>
                        {v.nombre} — ${v.precio.toFixed(2)} MXN
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Variación</label>
                  <p className="w-full border bg-gray-100 border-gray-300 rounded-lg p-3 text-gray-700">
                    {selectedVariation?.nombre} — ${selectedVariation?.precio.toFixed(2)} MXN
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <label className="text-gray-700 font-semibold">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 text-center border border-gray-300 rounded-lg p-2"
                />
              </div>
              {error && <p className="text-red-500 text-sm italic mb-4">{error}</p>}
            </>
          )}
          
          {/* --- B. SI ES INFORMATIVO (Helado, Icee) --- */}
          {!isPurchasable && (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              <label className="block text-gray-700 font-semibold mb-2">
                Presentaciones y Precios
              </label>
              {product.variaciones.sort((a, b) => a.precio - b.precio).map((v, index) => (
                <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-700">{v.nombre}</span>
                  <span className="font-bold text-pink-600 text-base">${v.precio.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- 3. FOOTER CONDICIONAL --- */}
        {isPurchasable ? (
          // Footer para Comprar
          <div className="p-6 pt-4 bg-gray-50 rounded-b-lg flex justify-between items-center">
            <div className="text-xl font-bold">
              Total: 
              <span className="text-pink-600 ml-2">
                ${currentPrice.toFixed(2)} MXN
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md"
            >
              Agregar al Carrito
            </button>
          </div>
        ) : (
          // Footer para Informar
          <div className="p-6 pt-4 bg-gray-50 rounded-b-lg flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700"
            >
              Cerrar
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default ProductSelectorModal;