import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { backendApi } from '../api/backend';

function loadPaytmScript(scriptUrl) {
  return new Promise((resolve, reject) => {
    if (window.Paytm?.CheckoutJS) {
      resolve();
      return;
    }

    const existing = document.querySelector(`script[data-paytm-checkout="true"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Paytm script.')));
      return;
    }

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.dataset.paytmCheckout = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paytm script.'));
    document.body.appendChild(script);
  });
}

function invokePaytmCheckout({ orderId, amount, txnToken, mid }) {
  return new Promise((resolve, reject) => {
    const CheckoutJS = window.Paytm?.CheckoutJS;

    if (!CheckoutJS) {
      reject(new Error('Paytm checkout is unavailable.'));
      return;
    }

    let isSettled = false;

    const settle = (callback, value) => {
      if (isSettled) return;
      isSettled = true;
      callback(value);
    };

    CheckoutJS.init({
      root: '',
      flow: 'DEFAULT',
      data: {
        orderId,
        token: txnToken,
        tokenType: 'TXN_TOKEN',
        amount: String(amount),
      },
      handler: {
        notifyMerchant: (eventName, data) => {
          if (eventName === 'APP_CLOSED') {
            settle(reject, new Error('Payment window was closed before completion.'));
          }

          if (eventName === 'TRANSACTION_COMPLETED') {
            settle(resolve, data);
          }
        },
      },
    })
      .then(() => {
        CheckoutJS.invoke();
      })
      .catch((error) => {
        settle(reject, new Error(error?.message || 'Unable to start Paytm checkout.'));
      });

    const fallbackTimeout = setTimeout(() => {
      settle(reject, new Error('Payment verification timeout. Please retry.'));
    }, 120000);

    const originalResolve = resolve;
    const originalReject = reject;

    resolve = (value) => {
      clearTimeout(fallbackTimeout);
      originalResolve(value);
    };

    reject = (error) => {
      clearTimeout(fallbackTimeout);
      originalReject(error);
    };
  });
}

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', address: '', notes: '' });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');

  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true);
      setOrderError('');
      setOrderSuccess('');

      const paymentInit = await backendApi.initiatePaytmPayment({
        amount: cartTotal,
        customer: customerForm,
        items: cartItems,
      });

      await loadPaytmScript(paymentInit.checkoutScriptUrl);

      await invokePaytmCheckout({
        orderId: paymentInit.orderId,
        amount: paymentInit.amount,
        txnToken: paymentInit.txnToken,
        mid: paymentInit.mid,
      });

      const verification = await backendApi.verifyPaytmPayment(paymentInit.orderId);
      const txnStatus = verification?.body?.resultInfo?.resultStatus;

      if (txnStatus !== 'TXN_SUCCESS') {
        const failedMessage = verification?.body?.resultInfo?.resultMsg || 'Payment failed or is pending.';
        const nextStatus = txnStatus === 'PENDING' ? 'pending' : 'failed';

        navigate(
          `/payment-status?status=${encodeURIComponent(nextStatus)}&paymentOrderId=${encodeURIComponent(paymentInit.orderId)}&message=${encodeURIComponent(failedMessage)}`,
        );
        setIsCartOpen(false);
        return;
      }

      const order = await backendApi.createOrder({
        customer: customerForm,
        items: cartItems,
        payment: {
          gateway: 'paytm',
          orderId: paymentInit.orderId,
          transactionId: verification?.body?.txnId || '',
          status: txnStatus,
        },
      });

      clearCart();
      setCustomerForm({ name: '', phone: '', address: '', notes: '' });
      setOrderSuccess(`Order placed successfully. Order No: ${order.orderNumber}`);
      navigate(
        `/payment-status?status=success&orderNumber=${encodeURIComponent(order.orderNumber)}&paymentOrderId=${encodeURIComponent(paymentInit.orderId)}`,
      );
      setIsCartOpen(false);
    } catch (error) {
      const message = error.message || 'Failed to place order';
      setOrderError(message);
      navigate(`/payment-status?status=failed&message=${encodeURIComponent(message)}`);
      setIsCartOpen(false);
    } finally {
      setIsPlacingOrder(false);
    }
  };

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
                <div className="space-y-3 mb-4">
                  <input
                    value={customerForm.name}
                    onChange={(event) => setCustomerForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Customer name"
                    className="w-full bg-[#111111] border border-white/20 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={customerForm.phone}
                    onChange={(event) => setCustomerForm((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="Phone"
                    className="w-full bg-[#111111] border border-white/20 px-3 py-2 text-sm outline-none"
                  />
                  <textarea
                    value={customerForm.address}
                    onChange={(event) => setCustomerForm((prev) => ({ ...prev, address: event.target.value }))}
                    placeholder="Delivery address"
                    rows={2}
                    className="w-full bg-[#111111] border border-white/20 px-3 py-2 text-sm outline-none"
                  />
                  <textarea
                    value={customerForm.notes}
                    onChange={(event) => setCustomerForm((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Notes (optional)"
                    rows={2}
                    className="w-full bg-[#111111] border border-white/20 px-3 py-2 text-sm outline-none"
                  />
                </div>

                {orderError && <p className="text-xs text-red-400 mb-3">{orderError}</p>}
                {orderSuccess && <p className="text-xs text-green-400 mb-3">{orderSuccess}</p>}

                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full bg-gold text-[#111111] py-4 text-sm font-inter uppercase tracking-widest hover:bg-gold-light transition-colors duration-300 font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-70"
                >
                  {isPlacingOrder ? 'Processing Payment...' : 'Pay with Paytm'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
