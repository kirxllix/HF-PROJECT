// hf-frontend/src/main.jsx (ACTUALIZADO con AuthProvider y CartProvider)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx'; //  IMPORTAR CartProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      {/* ENVOLVER CON EL PROVEEDOR DEL CARRITO */}
      <CartProvider> 
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
);