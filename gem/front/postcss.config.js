// postcss.config.js (VERSIÓN CORRECTA)

import tailwindcss from '@tailwindcss/postcss'; // <--- 1. Importa el plugin correcto
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss,  // <--- 2. Pasa la variable (en un array)
    autoprefixer,
  ],
}