// hf-frontend/src/pages/auth/LoginScreen.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js'; 
import { Popcorn } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google'; 

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  // 🚨 CORRECCIÓN 1: Traemos 'loginWithGoogle' del contexto
  const { login, loginWithGoogle } = useAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userRole = await login(email, password);
      redirectUser(userRole);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      // 🚨 CORRECCIÓN 2: Ahora sí existe esta función
      const userRole = await loginWithGoogle(credentialResponse.credential);
      redirectUser(userRole);
    } catch (err) {
      console.error(err);
      setError('Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para redirigir según el rol
  const redirectUser = (role) => {
    switch (role) {
      case 'administrador': navigate('/admin/dashboard'); break;
      case 'empleado': navigate('/employee/dashboard'); break;
      case 'cliente': navigate('/client/catalogo'); break;
      default: setError('Rol de usuario no reconocido.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-pink-600 mb-6 flex items-center justify-center gap-2">
          <Popcorn size={36} className="text-pink-600" /> 
          Happy Factory
        </h2>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="su.correo@happyfactory.com"
              required
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-pink-500 transition duration-150"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-pink-500 transition duration-150"
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>
          )}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ease-in-out ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-700 text-white'
              }`}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>

        {/* ✅ SECCIÓN GOOGLE */}
        <div className="mt-6">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">O continúa con</span>
                </div>
            </div>

            <div className="mt-6 flex justify-center">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                        setError('Falló el inicio de sesión con Google');
                    }}
                    useOneTap
                    theme="filled_blue"
                    shape="pill"
                    text="signin_with"
                />
            </div>
        </div>
        
        <p className="text-center text-gray-600 text-sm mt-6">
          ¿Eres un cliente nuevo? 
          <a href="/register" className="text-pink-600 hover:text-pink-800 font-semibold ml-1">
            Regístrate aquí
          </a>
        </p>

      </div>
    </div>
  );
};

export default LoginScreen;