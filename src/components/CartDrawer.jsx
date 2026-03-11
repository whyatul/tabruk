import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-[#111111] z-[60] flex flex-col shadow-2xl border-l border-white/10"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-display text-gold">Your Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-colors outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-lg font-display text-white">Your cart is empty.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-sm font-inter text-gold uppercase tracking-widest border-b border-gold/50 pb-1 mt-4 hover:border-gold hover:text-gold-light transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map(item => (
                    <div key={`${item.id}-${item.variation.weight}`} className="flex gap-4">
                      <Link to={`/products/${item.id}`} onClick={() => setIsCartOpen(false)} className="w-24 h-24 bg-[#1a1a1a] rounded-sm overflow-hidden border border-white/5 flex-shrink-0 block">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </Link>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-4 mb-1">
                            <Link to={`/products/${item.id}`} onClick={() => setIsCartOpen(false)} className="font-display text-white text-base leading-tight hover:text-gold transition-colors block">{item.name}</Link>
                            <button
                              onClick={() => removeFromCart(item.id, item.variation.weight)}
                              className="text-white/30 hover:text-red-400 transition-colors pt-0.5 outline-none"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs font-inter text-white/50 mb-2">Size: <span className="text-gold/80">{item.variation.weight}</span></p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-white/20 rounded-sm bg-[#1a1a1a]">
                            <button
                              onClick={() => updateQuantity(item.id, item.variation.weight, item.quantity - 1)}
                              className="p-2 text-white/60 hover:text-gold transition-colors outline-none"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-inter font-bold text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.variation.weight, item.quantity + 1)}
                              className="p-2 text-white/60 hover:text-gold transition-colors outline-none"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-sm font-inter text-gold font-medium">
                            Rs. {item.variation.price * item.quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#0a0a0a]">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-inter text-white/70">Subtotal</span>
                  <span className="text-xl font-display text-gold">Rs. {cartTotal}</span>
                </div>
                <p className="text-xs font-inter text-white/40 mb-6 text-center">
                  Shipping and taxes calculated at checkout.
                </p>
                <button className="w-full bg-gold text-[#111111] py-4 text-sm font-inter uppercase tracking-widest hover:bg-gold-light transition-colors duration-300 font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
