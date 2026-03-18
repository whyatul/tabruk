import { Link, useSearchParams } from 'react-router-dom';

const statusConfig = {
  success: {
    title: 'Payment Successful',
    subtitle: 'Your transaction is completed and order has been confirmed.',
    color: 'text-emerald-400',
    border: 'border-emerald-500/40',
  },
  pending: {
    title: 'Payment Pending',
    subtitle: 'Your payment is being processed. Please check order status shortly.',
    color: 'text-amber-300',
    border: 'border-amber-400/40',
  },
  failed: {
    title: 'Payment Failed',
    subtitle: 'The transaction was not completed. You can try again.',
    color: 'text-red-300',
    border: 'border-red-400/40',
  },
};

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const status = (searchParams.get('status') || 'failed').toLowerCase();
  const orderNumber = searchParams.get('orderNumber') || '';
  const paymentOrderId = searchParams.get('paymentOrderId') || '';
  const message = searchParams.get('message') || '';

  const config = statusConfig[status] || statusConfig.failed;

  return (
    <div className="bg-[#111111] min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-2xl mx-auto">
        <div className={`bg-[#1a1a1a] border ${config.border} p-8 space-y-5`}>
          <h1 className={`text-3xl font-display ${config.color}`}>{config.title}</h1>
          <p className="text-white/75">{config.subtitle}</p>

          {message && <p className="text-sm text-white/70">{message}</p>}

          {orderNumber && (
            <p className="text-sm text-white/80">
              Order Number: <span className="text-gold">{orderNumber}</span>
            </p>
          )}

          {paymentOrderId && (
            <p className="text-sm text-white/60">
              Payment Reference: <span className="text-white/80">{paymentOrderId}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-3">
            <Link
              to="/"
              className="px-4 py-2 bg-gold text-[#111111] text-sm uppercase tracking-wider font-semibold"
            >
              Continue Shopping
            </Link>
            <Link
              to="/admin"
              className="px-4 py-2 border border-white/20 text-white/80 text-sm uppercase tracking-wider"
            >
              View Admin Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
