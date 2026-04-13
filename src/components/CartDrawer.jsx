import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { backendApi } from '../api/backend';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  
  // New State for Checkout Flow
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'qr' | 'cod_success'
  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const shippingCharge = cartTotal >= 999 ? 0 : (cartTotal > 0 ? 90 : 0);
  const finalTotal = cartTotal + shippingCharge;

  const handlePlaceOrder = async () => {
    try {
      if (!customerForm.name || !customerForm.phone || !customerForm.address || !customerForm.city || !customerForm.state || !customerForm.pincode) {
        setOrderError('Please fill in all required fields (Name, Phone, Address, City, State, Pincode)');
        return;
      }
      setIsPlacingOrder(true);
      setOrderError('');

      const fullAddress = `${customerForm.address}, ${customerForm.city}, ${customerForm.state} - ${customerForm.pincode}`;
      const combinedNotes = `[Payment: ${paymentMethod.toUpperCase()}] ${customerForm.notes ? `\nNotes: ${customerForm.notes}` : ''}`;
      
      const modifiedItems = [...cartItems];
      if (shippingCharge > 0) {
        modifiedItems.push({
          id: 'shipping-charge',
          name: 'Shipping Charge',
          weight: 'Flat',
          variation: { weight: 'Flat', price: shippingCharge },
          quantity: 1,
        });
      }

      const order = await backendApi.createOrder({
        customer: {
          name: customerForm.name,
          phone: customerForm.phone,
          address: fullAddress,
          notes: combinedNotes
        },
        items: modifiedItems,
      });

      setCreatedOrder(order);
      setPaymentAmount(finalTotal);
      
      if (paymentMethod === 'cod') {
        setCheckoutStep('cod_success');
      } else {
        setCheckoutStep('qr');
      }
      
      clearCart();
    } catch (error) {
      setOrderError(error.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const resetDrawer = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      setCheckoutStep('cart');
      setCustomerForm({ name: '', phone: '', address: '', city: '', state: '', pincode: '', notes: '' });
      setPaymentMethod('cod');
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
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <h2 className="text-xl font-display text-gold">
                 {checkoutStep === 'qr' ? 'Complete Payment' : checkoutStep === 'cod_success' ? 'Order Confirmed' : 'Your Cart'}
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
            ) : checkoutStep === 'cod_success' ? (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center space-y-6 text-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-display text-white">Order Placed!</h3>
                <p className="text-white/60 font-inter text-sm">
                  Your order <span className="text-gold font-medium">{createdOrder?.orderNumber}</span> has been confirmed.
                </p>
                <div className="bg-white/5 p-5 rounded-xl border border-white/10 w-full mt-4">
                  <p className="text-sm text-white/80 leading-relaxed mb-3">
                    You will pay <strong className="text-gold text-lg">Rs. {paymentAmount}</strong> upon delivery.
                  </p>
                  <p className="text-xs text-white/50">
                    We'll contact you at {customerForm.phone} for delivery updates.
                  </p>
                </div>
                <button
                  onClick={resetDrawer}
                  className="mt-6 text-sm font-inter text-gold uppercase tracking-widest border-b border-gold/50 pb-1 hover:border-gold hover:text-gold-light transition-colors block mx-auto"
                >
                  Continue Shopping
                </button>
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
                  <div className="p-6 border-t border-white/10 bg-[#0a0a0a] shrink-0">
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-inter text-white/70">Subtotal</span>
                        <span className="font-medium text-white">Rs. {cartTotal}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-inter text-white/70">Shipping</span>
                        {shippingCharge === 0 ? (
                            <span className="font-medium text-green-400">Free</span>
                        ) : (
                            <span className="font-medium text-white">Rs. {shippingCharge}</span>
                        )}
                      </div>
                      {cartTotal < 999 && (
                        <p className="text-xs text-gold/60 text-right mt-1">Add Rs. {999 - cartTotal} more for free shipping!</p>
                      )}
                      <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                        <span className="font-inter text-white font-medium">Total</span>
                        <span className="text-xl font-display text-gold">Rs. {finalTotal}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                      <p className="text-xs font-inter text-white/40 uppercase tracking-wider mb-2">Delivery Details</p>
                      <input
                        value={customerForm.name}
                        onChange={(event) => setCustomerForm((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Full Name"
                        className="w-full bg-[#111111] border border-white/20 px-3 py-2.5 rounded-md text-sm outline-none text-white placeholder-white/30 focus:border-gold/50 transition-colors"
                      />
                      <input
                        type="tel"
                        value={customerForm.phone}
                        onChange={(event) => {
                          const numericValue = event.target.value.replace(/\D/g, '');
                          setCustomerForm((prev) => ({ ...prev, phone: numericValue }));
                        }}
                        placeholder="Phone Number"
                        className="w-full bg-[#111111] border border-white/20 px-3 py-2.5 rounded-md text-sm outline-none text-white placeholder-white/30 focus:border-gold/50 transition-colors"
                      />
                      <textarea
                        value={customerForm.address}
                        onChange={(event) => setCustomerForm((prev) => ({ ...prev, address: event.target.value }))}
                        placeholder="Street Address (House No, Building, Area)"
                        rows={2}
                        className="w-full bg-[#111111] border border-white/20 px-3 py-2.5 rounded-md text-sm outline-none text-white placeholder-white/30 focus:border-gold/50 transition-colors"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={customerForm.city}
                          onChange={(event) => setCustomerForm((prev) => ({ ...prev, city: event.target.value }))}
                          placeholder="City"
                          className="w-full bg-[#111111] border border-white/20 px-3 py-2.5 rounded-md text-sm outline-none text-white placeholder-white/30 focus:border-gold/50 transition-colors"
                        />
                        <input
                          value={customerForm.pincode}
                          onChange={(event) => setCustomerForm((prev) => ({ ...prev, pincode: event.target.value }))}
                          placeholder="Pincode"
                          className="w-full bg-[#111111] border border-white/20 px-3 py-2.5 rounded-md text-sm outline-none text-white placeholder-white/30 focus:border-gold/50 transition-colors"
                        />
                      </div>
                      <input
                        value={customerForm.state}
                        onChange={(event) => setCustomerForm((prev) => ({ ...prev, state: event.target.value }))}
                        placeholder="State"
                        className="w-full bg-[#111111] border border-white/20 px-3 py-2.5 rounded-md text-sm outline-none text-white placeholder-white/30 focus:border-gold/50 transition-colors"
                      />
                      <textarea
                        value={customerForm.notes}
                        onChange={(event) => setCustomerForm((prev) => ({ ...prev, notes: event.target.value }))}
                        placeholder="Notes (optional)"
                        rows={1}
                        className="w-full bg-[#111111] border border-white/20 px-3 py-2.5 rounded-md text-sm outline-none text-white placeholder-white/30 focus:border-gold/50 transition-colors"
                      />

                      <div className="mt-4 pt-4 border-t border-white/10">
                         <p className="text-xs font-inter text-white/40 uppercase tracking-wider mb-3">Payment Method</p>
                         <div className="space-y-2">
                           <label className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-gold bg-gold/10' : 'border-white/10 hover:border-white/20'}`}>
                             <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-gold' : 'border-white/40'}`}>
                                {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-gold"></div>}
                             </div>
                             <input type="radio" className="hidden" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                             <span className="text-sm text-white font-medium">Cash on Delivery (COD)</span>
                           </label>
                           <label className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${paymentMethod === 'qr' ? 'border-gold bg-gold/10' : 'border-white/10 hover:border-white/20'}`}>
                             <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'qr' ? 'border-gold' : 'border-white/40'}`}>
                                {paymentMethod === 'qr' && <div className="w-2 h-2 rounded-full bg-gold"></div>}
                             </div>
                             <input type="radio" className="hidden" name="paymentMethod" value="qr" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} />
                             <span className="text-sm text-white font-medium">Online Payment (UPI/QR)</span>
                           </label>
                         </div>
                      </div>
                    </div>

                    {orderError && <p className="text-xs text-red-400 mb-3 text-center bg-red-400/10 py-2 rounded">{orderError}</p>}

                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="w-full bg-gold text-[#111111] py-4 text-sm font-inter uppercase tracking-widest hover:bg-gold-light transition-colors duration-300 font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-70 rounded-md"
                    >
                      {isPlacingOrder ? 'Processing...' : 'Place Order'}
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

