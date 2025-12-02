import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google'; 

const GOOGLE_CLIENT_ID ="204143588198-gcl9hj0f6an2i7bq6p37bpi81fo6gvl0.apps.googleusercontent.com"; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolvemos toda la app con el proveedor de Google */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> 
      <AuthProvider>
        <CartProvider> 
          <App />
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);