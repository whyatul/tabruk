import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { backendApi } from '../api/backend';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', address: '', notes: '' });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  
  // New State for QR Checkout Flow
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'qr'
  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const handlePlaceOrder = async () => {
    try {
      if (!customerForm.name || !customerForm.phone || !customerForm.address) {
        setOrderError('Please fill in required fields (Name, Phone, Address)');
        return;
      }
      setIsPlacingOrder(true);
      setOrderError('');

      const order = await backendApi.createOrder({
        customer: customerForm,
        items: cartItems,
        payment: {
          gateway: 'manual_qr',
          status: 'PENDING',
        },
      });

      setCreatedOrder(order);
      setPaymentAmount(cartTotal);
      setCheckoutStep('qr');
      clearCart();
    } catch (error) {
      setOrderError(error.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const resetDrawer = () => {
    setIsCartOpen(false);
    // Reset back to cart if they close and reopen later (only matters if they add items again)
    setTimeout(() => {
      setCheckoutStep('cart');
      setCustomerForm({ name: '', phone: '', address: '', notes: '' });
      setOrderError('');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetDrawer}
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
              <h2 className="text-xl font-display text-gold">
                 {checkoutStep === 'qr' ? 'Complete Payment' : 'Your Cart'}
              </h2>
              <button
                onClick={resetDrawer}
                className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-colors outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkoutStep === 'qr' ? (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center space-y-8">
                <div className="text-center space-y-2 w-full">
                  <div className="inline-block px-3 py-1 bg-green-500/10 text-green-400 font-inter text-xs rounded-full border border-green-500/20 mb-2">Order Created Successfully</div>
                  <h3 className="text-2xl font-display text-white">Scan to Pay</h3>
                  <p className="text-white/50 font-inter text-sm">Order No: <span className="text-gold">{createdOrder?.orderNumber}</span></p>
                </div>
                
                <div className="bg-white p-5 rounded-2xl shadow-xl border-4 border-gold">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=6005944378@hdfc%26pn=INAYAT%20MUSHTAQ%26am=${paymentAmount}%26cu=INR`} 
                    alt="UPI QR Code - INAYAT MUSHTAQ" 
                    className="w-48 h-48"
                  />
                </div>
                
                <div className="text-center space-y-4 w-full">
                  <p className="text-white/80 font-inter text-base leading-relaxed">
                    Please scan this QR code with any UPI app (GPay, PhonePe, Paytm, etc.) to pay <strong className="text-gold">Rs. {paymentAmount}</strong>.
                  </p>
                  
                  <div className="bg-white/5 p-5 rounded-xl border border-white/10 text-sm text-white/70 space-y-3 mt-4">
                    <p className="font-semibold text-white">Payment Instructions:</p>
                    <ul className="list-decimal text-left pl-5 space-y-2">
                      <li>Scan the QR code and complete the payment.</li>
                      <li>Take a <strong className="text-white">screenshot</strong> of the confirmed payment screen.</li>
                      <li>Send the screenshot via <strong className="text-white">WhatsApp</strong> with your name.</li>
                    </ul>
                  </div>
                </div>

                <div className="w-full mt-4 pb-6">
                  <a 
                    href={`https://wa.me/916005944378?text=Hello,%20I%20have%20made%20a%20payment%20of%20Rs.%20${paymentAmount}%20for%20my%20Order%20No:%20${createdOrder?.orderNumber}.%20My%20name%20is%20${customerForm.name}.%20Here%20is%20my%20screenshot:`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={resetDrawer}
                    className="w-full bg-[#25D366] text-white py-4 px-6 rounded text-sm font-inter uppercase tracking-widest font-bold flex flex-row items-center justify-center gap-3 hover:bg-[#128C7E] transition-colors shadow-lg"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.46-1.761-1.633-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    Send Screenshot via WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <>
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
                        onClick={resetDrawer}
                        className="text-sm font-inter text-gold uppercase tracking-widest border-b border-gold/50 pb-1 mt-4 hover:border-gold hover:text-gold-light transition-colors"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {cartItems.map(item => (
                        <div key={`${item.id}-${item.variation.weight}`} className="flex gap-4">
                          <Link to={`/products/${item.id}`} onClick={resetDrawer} className="w-24 h-24 bg-[#1a1a1a] rounded-sm overflow-hidden border border-white/5 flex-shrink-0 block">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </Link>

                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-4 mb-1">
                                <Link to={`/products/${item.id}`} onClick={resetDrawer} className="font-display text-white text-base leading-tight hover:text-gold transition-colors block">{item.name}</Link>
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
                    <div className="space-y-3 mb-4">
                      <input
                        value={customerForm.name}
                        onChange={(event) => setCustomerForm((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Customer name"
                        className="w-full bg-[#111111] border border-white/20 px-3 py-2 text-sm outline-none text-white placeholder-white/30"
                      />
                      <input
                        type="tel"
                        value={customerForm.phone}
                        onChange={(event) => {
                          const numericValue = event.target.value.replace(/\D/g, '');
                          setCustomerForm((prev) => ({ ...prev, phone: numericValue }));
                        }}
                        placeholder="Phone"
                        className="w-full bg-[#111111] border border-white/20 px-3 py-2 text-sm outline-none text-white placeholder-white/30"
                      />
                      <textarea
                        value={customerForm.address}
                        onChange={(event) => setCustomerForm((prev) => ({ ...prev, address: event.target.value }))}
                        placeholder="Delivery address"
                        rows={2}
                        className="w-full bg-[#111111] border border-white/20 px-3 py-2 text-sm outline-none text-white placeholder-white/30"
                      />
                      <textarea
                        value={customerForm.notes}
                        onChange={(event) => setCustomerForm((prev) => ({ ...prev, notes: event.target.value }))}
                        placeholder="Notes (optional)"
                        rows={2}
                        className="w-full bg-[#111111] border border-white/20 px-3 py-2 text-sm outline-none text-white placeholder-white/30"
                      />
                    </div>

                    {orderError && <p className="text-xs text-red-400 mb-3 text-center bg-red-400/10 py-2 rounded">{orderError}</p>}

                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="w-full bg-gold text-[#111111] py-4 text-sm font-inter uppercase tracking-widest hover:bg-gold-light transition-colors duration-300 font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-70"
                    >
                      {isPlacingOrder ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
