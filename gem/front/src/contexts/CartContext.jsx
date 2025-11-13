// hf-frontend/src/contexts/CartContext.jsx

import React, { createContext, useState, useEffect } from 'react';

// 1. Crear el Contexto
export const CartContext = createContext();

// 2. Crear el Proveedor (Provider)
export const CartProvider = ({ children }) => {
  // Inicializa el carrito desde localStorage para mantenerlo al refrescar
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('happyFactoryCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Persistencia: Guarda el carrito en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem('happyFactoryCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Función para agregar o actualizar un producto en el carrito
  const addToCart = (product, variation, quantity) => {
    // Generamos un ID único para la línea del carrito (útil para variaciones)
    const cartItemId = `${product._id}-${variation.nombre}`; 
    
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.cartItemId === cartItemId);

      if (existingItemIndex > -1) {
        // El producto ya existe, actualiza la cantidad
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      } else {
        // Es un producto nuevo
        return [
          ...prevItems,
          {
            cartItemId,
            productId: product._id,
            productName: product.nombreProducto,
            variationName: variation.nombre,
            price: variation.precio,
            category: product.categoria,
            quantity: quantity,
          },
        ];
      }
    });
  };

  // Función para remover completamente un producto
  const removeItem = (cartItemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
  };
  
  // Función para vaciar todo el carrito
  const clearCart = () => {
    setCartItems([]);
  };

  // 3. Cálculo del Subtotal y del Tipo de Pedido (Menudeo/Mayoreo)
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Lógica de validación Menudeo/Mayoreo (basada en la regla de 32 unidades [cite: 458])
  const totalPopcornUnits = cartItems
      .filter(item => item.category === 'palomita')
      .reduce((acc, item) => acc + item.quantity, 0);
      
  const isMayoreo = totalPopcornUnits > 32;

  // 4. Objeto de Contexto que se proveerá a la app
  const contextValue = {
    cartItems,
    addToCart,
    removeItem,
    clearCart,
    subtotal: subtotal,
    totalItems: cartItems.length,
    isMayoreo,
    totalPopcornUnits,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};