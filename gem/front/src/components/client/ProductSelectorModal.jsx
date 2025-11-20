// hf-frontend/src/components/client/ProductSelectorModal.jsx

import React, { useState, useEffect } from 'react';
import { useCart } from '../../hooks/useCart';
import ReviewSection from './ReviewSection';

// Recibimos 'standardSizes' como prop
const ProductSelectorModal = ({ product, isOpen, onClose, standardSizes = [] }) => {
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

  // --- LÓGICA DE NEGOCIO ---
  // Solo las palomitas se pueden comprar en línea (según tu regla actual)
  const isPurchasable = product.categoria === 'palomita';
  const hasMultipleVariations = product.variaciones.length > 1;

  // --- Handlers ---
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

  // --- 1. LÓGICA INTELIGENTE DE PRECIOS ---
  const renderPrices = () => {
      // Caso A: El producto tiene sus propios precios específicos (ej. Taro, Palomitas)
      if (product.variaciones && product.variaciones.length > 0) {
          return product.variaciones.sort((a, b) => a.precio - b.precio).map((v, index) => (
            <div key={index} className="flex justify-between items-center text-sm border border-gray-100 p-3 rounded-lg hover:bg-gray-50 transition">
                <span className="text-gray-700 font-medium">{v.nombre}</span>
                <span className="font-bold text-pink-600">${v.precio.toFixed(2)}</span>
            </div>
          ));
      } 
      
      // Caso B: El producto NO tiene precios propios (ej. Vainilla), usamos los Estándar
      // Solo aplica si es un helado de sabor y tenemos los tamaños estándar disponibles
      else if (product.categoria === 'helado_sabor' && standardSizes.length > 0) {
          return standardSizes.map((size, index) => {
             // Obtenemos el precio base del tamaño
             const precioBase = size.variaciones?.[0]?.precio || 0;
             return (
                <div key={index} className="flex justify-between items-center text-sm border border-gray-100 p-3 rounded-lg hover:bg-gray-50 transition">
                    <span className="text-gray-700 font-medium">{size.nombreProducto}</span>
                    <span className="font-bold text-blue-600">${precioBase.toFixed(2)}</span>
                </div>
             );
          });
      }

      // Caso C: No hay información disponible
      return <p className="text-gray-400 text-sm text-center italic">Precios variables en mostrador.</p>;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg m-auto flex flex-col max-h-[90vh]">
        
        {/* Encabezado */}
        <div className="p-5 border-b flex justify-between items-center bg-pink-600 text-white rounded-t-xl shrink-0">
          <h3 className="text-xl font-bold">{product.nombreProducto}</h3>
          <button onClick={onClose} className="text-white hover:text-pink-200 transition">
            <span className='font-bold text-2xl'>&times;</span>
          </button>
        </div>

        {/* Cuerpo Scrollable */}
        <div className="p-6 overflow-y-auto">
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">{product.descripcion}</p>
          
          {/* --- A. SI SE PUEDE COMPRAR --- */}
          {isPurchasable && (
            <div className="bg-pink-50 p-4 rounded-lg border border-pink-100 mb-6">
              {hasMultipleVariations ? (
                <div className="mb-4">
                  <label className="block text-pink-800 font-bold text-xs uppercase mb-1">Seleccionar Variación</label>
                  <select onChange={handleVariationChange} value={selectedVariation?.nombre || ''} className="w-full border border-pink-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none bg-white">
                    {product.variaciones.map((v, index) => (
                      <option key={index} value={v.nombre}>
                        {v.nombre} — ${v.precio.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-pink-800 font-bold text-xs uppercase mb-1">Variación</label>
                  <div className="w-full bg-white border border-pink-200 rounded-lg p-2 text-sm text-gray-700">
                    {selectedVariation?.nombre} — ${selectedVariation?.precio.toFixed(2)}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <label className="text-pink-800 font-bold text-xs uppercase">Cantidad</label>
                <div className="flex items-center bg-white rounded-lg border border-pink-200">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 text-pink-600 hover:bg-pink-100 font-bold">-</button>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 text-center border-0 text-sm focus:ring-0 p-1"
                    />
                    <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 text-pink-600 hover:bg-pink-100 font-bold">+</button>
                </div>
              </div>
              {error && <p className="text-red-500 text-xs font-bold mt-2 text-right">{error}</p>}
            </div>
          )}
          
          {/* --- B. SI ES INFORMATIVO (Lista de Precios) --- */}
          {!isPurchasable && (
            <div className="mb-8">
              <label className="block text-gray-500 font-bold text-xs uppercase mb-2">
                Precios Disponibles
              </label>
              <div className="grid grid-cols-1 gap-2">
                {renderPrices()} {/* Llamada a la función inteligente */}
              </div>
            </div>
          )}

          {/* 2. SECCIÓN DE RESEÑAS */}
          <hr className="border-gray-200 mb-6" />
          <ReviewSection productId={product._id} />

        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 rounded-b-xl shrink-0">
            {isPurchasable ? (
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-bold">Total a Pagar</span>
                        <span className="text-2xl font-black text-gray-800">
                            ${currentPrice.toFixed(2)}
                        </span>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform active:scale-95 transition"
                    >
                        Agregar al Carrito
                    </button>
                </div>
            ) : (
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition"
                    >
                        Cerrar
                    </button>
                </div>
            )}
        </div>
        
      </div>
    </div>
  );
};

export default ProductSelectorModal;