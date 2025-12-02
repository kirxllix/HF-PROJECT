import React from 'react';
// ✅ Importar
import { Rocket, Eye, Gem } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 1. Encabezado Hero */}
      <div className="bg-pink-600 py-20 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Sobre Happy Factory
        </h1>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">
          Más que helados, fabricamos momentos de felicidad.
        </p>
      </div>

      {/* 2. Contenido Principal */}
      <div className="max-w-6xl mx-auto p-6 -mt-10">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Tarjeta Misión */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 border-t-8 border-pink-500">
                <div className="mb-4 text-pink-500"><Rocket size={40} /></div> {/* ✅ ICONO */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Nuestra Misión</h2>
                <p className="text-gray-600 leading-relaxed">
                    Brindar experiencias inolvidables a través de sabores únicos y deliciosos, 
                    utilizando ingredientes de la más alta calidad para llenar de alegría el día de nuestros clientes.
                </p>
            </div>

            {/* Tarjeta Visión */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 border-t-8 border-blue-500">
                <div className="mb-4 text-blue-500"><Eye size={40} /></div> {/* ✅ ICONO */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Nuestra Visión</h2>
                <p className="text-gray-600 leading-relaxed">
                    Queremos que Happy Factory sea mucho más que una heladería:
                    buscamos convertirnos en un referente de calidad e innovación en
                    México y Latinoamérica. Nuestra meta es sencilla pero ambiciosa:
                    hacer que cada visita sea un momento feliz y cada cliente, un
                    embajador de esa alegría
                </p>
            </div>

            {/* Tarjeta Valores */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 border-t-8 border-yellow-400">
                <div className="mb-4 text-yellow-500"><Gem size={40} /></div> {/* ✅ ICONO */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Nuestros Valores</h2>
                <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-pink-500 rounded-full"></span> Fe y Gratitud
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-pink-500 rounded-full"></span> Creatividad
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-pink-500 rounded-full"></span> Calidad y Excelencia
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-pink-500 rounded-full"></span>  Honestidad
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-pink-500 rounded-full"></span>  Perseverancia
                    </li>
                </ul>
            </div>
        </div>

        {/* 3. Historia o Texto Adicional */}
        <div className="mt-16 bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Nuestra Historia</h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-4xl mx-auto">
                Happy Factory nació con un sueño simple: transformar un día común en uno extraordinario. 
                Desde nuestro primer carrito de helados hasta nuestras sucursales actuales, 
                siempre hemos creído que el secreto está en ponerle corazón a cada preparación.
            </p>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;