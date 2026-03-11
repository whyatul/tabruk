import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCartItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, variation, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.variation.weight === variation.weight);
      if (existing) {
        return prev.map(item =>
          (item.id === product.id && item.variation.weight === variation.weight)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, variation, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id, weight) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.variation.weight === weight)));
  };

  const updateQuantity = (id, weight, quantity) => {
    if (quantity < 1) return;
    setCartItems(prev => prev.map(item =>
      (item.id === id && item.variation.weight === weight) ? { ...item, quantity } : item
    ));
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.variation.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, isCartOpen, setIsCartOpen, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}
export function useCart() { return useContext(CartContext); }
