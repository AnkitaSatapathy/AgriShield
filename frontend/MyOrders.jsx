import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Clock, CheckCircle, XCircle, CalendarDays, Tag, Layers } from 'lucide-react';

const STATUS_CONFIG = {
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    className: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    dot: 'bg-emerald-400',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
    dot: 'bg-yellow-400',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-red-500/20 border-red-500/40 text-red-300',
    dot: 'bg-red-400',
  },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const userId = localStorage.getItem('user_id') || 'user_1234';

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(false);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/marketplace/orders/user/${userId}`, { headers });
        if (res.ok) {
          setOrders(await res.json());
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2d1a] via-[#1a4a2e] to-[#0d3b22] px-4 py-10 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-green-400/8 rounded-full blur-3xl pointer-events-none" />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1
              className="text-3xl font-black text-white tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              My Orders
            </h1>
            <p className="text-emerald-400/70 text-sm">View your previous purchases</p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-24 text-emerald-400">
            <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="font-medium">Loading orders...</span>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="text-center py-24 bg-red-500/5 border border-red-500/15 rounded-3xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-400/60" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Failed to load orders.</h3>
            <p className="text-white/40 text-sm">Please check your connection and try again.</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && orders.length === 0 && (
          <div className="text-center py-24 bg-white/3 border border-white/8 rounded-3xl">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Package className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
            <p className="text-white/40 text-sm">You haven't placed any orders on the marketplace.</p>
          </div>
        )}

        {/* Orders Grid */}
        {!isLoading && !error && orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {orders.map((order) => {
              const statusKey = (order.status || 'pending').toLowerCase();
              const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
              const StatusIcon = status.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:shadow-xl hover:shadow-emerald-900/40 hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={
                        order.image_url ||
                        'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?w=400&h=300&fit=crop'
                      }
                      alt={order.product_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />

                    {/* Status Badge */}
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 backdrop-blur-md ${status.className}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot} inline-block`} />
                      {status.label}
                    </span>

                    {/* Product Name */}
                    <h3 className="absolute bottom-3 left-4 right-4 text-white font-bold text-base truncate drop-shadow-md">
                      {order.product_name}
                    </h3>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col gap-4 flex-grow">
                    {/* Price */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">₹{order.price}</span>
                      <span className="text-white/40 text-sm">/ {order.unit || 'unit'}</span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      {/* Quantity */}
                      <div className="flex items-center gap-2 text-sm text-white/60 bg-white/5 rounded-xl px-3 py-2.5 border border-white/8">
                        <Layers className="w-4 h-4 text-emerald-400/70 shrink-0" />
                        <span>
                          Quantity:{' '}
                          <span className="text-white/85 font-semibold">
                            {order.quantity} {order.unit || 'units'}
                          </span>
                        </span>
                      </div>

                      {/* Order Date */}
                      <div className="flex items-center gap-2 text-sm text-white/60 bg-white/5 rounded-xl px-3 py-2.5 border border-white/8">
                        <CalendarDays className="w-4 h-4 text-emerald-400/70 shrink-0" />
                        <span>
                          Ordered on:{' '}
                          <span className="text-white/85 font-semibold">{formatDate(order.order_date)}</span>
                        </span>
                      </div>

                      {/* Status row */}
                      <div className={`flex items-center gap-2 text-sm rounded-xl px-3 py-2.5 border ${status.className}`}>
                        <StatusIcon className="w-4 h-4 shrink-0" />
                        <span className="font-semibold">Status: {status.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;