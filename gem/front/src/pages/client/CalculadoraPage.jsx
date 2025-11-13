// src/pages/client/CalculadoraPage.jsx (NUEVO ARCHIVO)

import React from 'react';

const CalculadoraPage = () => {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-extrabold text-pink-600 mb-4">
        Calculadora de Helados
      </h1>
      <p className="text-gray-700">
        ¡Próximamente! Aquí podrás armar tu helado perfecto y ver el precio.
      </p>
      <p className="text-gray-500 mt-4">
        (Necesitaremos cargar los productos de categoría 'helado_sabor', 'helado_presentacion' y 'topping' para que esto funcione).
      </p>
    </div>
  );
};

export default CalculadoraPage;