import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

const CalculadoraPage = () => {
  const [ingredients, setIngredients] = useState({ bases: [], sizes: [], toppings: [] });
  const [loading, setLoading] = useState(true);
  
  const [selectedBase, setSelectedBase] = useState(null);   // El Sabor (Taro)
  const [selectedSize, setSelectedSize] = useState(null);   // La Presentación (Vaso Chico)
  const [selectedToppings, setSelectedToppings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await apiClient.get('/client/products'); 
            const allProducts = res.data.data || [];

            const bases = allProducts.filter(p => p.categoria === 'helado_sabor');
            const sizes = allProducts.filter(p => p.categoria === 'helado_presentacion'); 
            const toppings = allProducts.filter(p => p.categoria === 'topping');
            
            setIngredients({ bases, sizes, toppings });
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // --- LÓGICA NUEVA DE PRECIOS ---
 const calculateTotal = () => {
      let total = 0;
      
      if (selectedSize) {
          // 1. Buscamos si el Sabor (Base) tiene una "excepción" de precio para este tamaño
          const precioExcepcion = selectedBase?.variaciones?.find(
              v => v.nombre === selectedSize.nombreProducto
          );

          if (precioExcepcion) {
              // Si hay excepción (ej. Taro), usamos ese precio
              total += precioExcepcion.precio;
          } else {
              // Si NO hay variaciones en el sabor (ej. Limón), usamos el precio del TAMAÑO
              // (Asegúrate de ponerle precio a los tamaños en el Admin)
              total += selectedSize.variaciones?.[0]?.precio || 0;
          }
      }
      
      // 2. Sumar toppings
      selectedToppings.forEach(t => {
          if (t.variaciones?.[0]?.precio) {
              total += t.variaciones[0].precio;
          }
      });

      return total;
  };

  const getDisplayPrice = (size) => {
      // Si ya seleccionó sabor, revisamos si tiene precio especial
      if (selectedBase) {
          const especial = selectedBase.variaciones?.find(v => v.nombre === size.nombreProducto);
          if (especial) return especial.precio;
      }
      // Si no, retornamos el precio base del tamaño
      return size.variaciones?.[0]?.precio || 0;
  };

  const toggleTopping = (topping) => {
      if (selectedToppings.find(t => t._id === topping._id)) {
          setSelectedToppings(selectedToppings.filter(t => t._id !== topping._id));
      } else {
          setSelectedToppings([...selectedToppings, topping]);
      }
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-white">
      <h1 className="text-3xl font-extrabold text-pink-600 mb-2 text-center">Calculadora de Helados</h1>
      <p className="text-center text-gray-500 mb-8">Arma tu combinación perfecta y conoce el precio.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
              
              {/* 1. Elige Sabor (Base) */}
              <div className="bg-pink-50 p-4 rounded-xl border border-pink-100">
                  <h3 className="font-bold text-pink-700 mb-3">1. Elige tu Base (Sabor)</h3>
                  <div className="flex flex-wrap gap-2">
                      {ingredients.bases.map(base => (
                          <button 
                            key={base._id}
                            onClick={() => setSelectedBase(base)}
                            className={`px-3 py-2 rounded-lg text-sm border transition ${selectedBase?._id === base._id ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-600 border-gray-200'}`}
                          >
                              {base.nombreProducto}
                          </button>
                      ))}
                  </div>
              </div>

              {/* 2. Elige Tamaño */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-blue-700 mb-3">2. Elige el Tamaño</h3>
                  <div className="flex flex-wrap gap-2">
                      {ingredients.sizes.map(size => {
                          const priceToShow = getDisplayPrice(size);

                          return (
                              <button 
                                key={size._id}
                                onClick={() => setSelectedSize(size)}
                                className={`px-3 py-2 rounded-lg text-sm border transition ${selectedSize?._id === size._id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
                              >
                                  {size.nombreProducto}
                                  {/* Mostramos el precio inteligente */}
                                  {priceToShow > 0 && <span className="ml-1 opacity-80">(${priceToShow})</span>}
                              </button>
                          );
                      })}
                  </div>
              </div>

              {/* 3. Toppings */}
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <h3 className="font-bold text-yellow-700 mb-3">3. Agrega Toppings</h3>
                  <div className="grid grid-cols-2 gap-2">
                      {ingredients.toppings.map(top => (
                          <label key={top._id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-yellow-100 rounded">
                              <input 
                                type="checkbox" 
                                checked={!!selectedToppings.find(t => t._id === top._id)}
                                onChange={() => toggleTopping(top)}
                                className="accent-yellow-600 w-5 h-5"
                              />
                              <span className="text-sm text-gray-700">
                                  {top.nombreProducto} <span className="text-xs text-gray-500">(+${top.variaciones?.[0]?.precio || 0})</span>
                              </span>
                          </label>
                      ))}
                  </div>
              </div>
          </div>

          {/* RESUMEN */}
          <div>
              <div className="bg-white p-6 rounded-xl shadow-2xl border-t-8 border-pink-500 sticky top-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Tu Creación 🍦</h2>
                  
                  <div className="space-y-4 mb-6">
                      <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Base:</span>
                          <span className="font-bold">{selectedBase?.nombreProducto || '---'}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Tamaño:</span>
                          <span className="font-bold">
                              {selectedSize?.nombreProducto || '---'} 
                          </span>
                      </div>
                      <div>
                          <span className="text-gray-600 block mb-1">Toppings:</span>
                          {selectedToppings.length === 0 ? <span className="text-sm text-gray-400 italic">Sin toppings</span> : (
                              <ul className="text-sm text-gray-700 space-y-1 pl-4 list-disc">
                                  {selectedToppings.map(t => (
                                      <li key={t._id}>{t.nombreProducto} (+${t.variaciones?.[0]?.precio || 0})</li>
                                  ))}
                              </ul>
                          )}
                      </div>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-500 uppercase font-bold">Total Estimado</p>
                      <p className="text-4xl font-black text-pink-600">${calculateTotal().toFixed(2)}</p>
                  </div>

                  <p className="text-xs text-center text-gray-400 mt-4">
                      * Esta calculadora es informativa. Pide tu helado en mostrador.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default CalculadoraPage;