import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Package, Clock, CheckCircle, XCircle,
  CalendarDays, Layers, Hash, CreditCard, Truck,
  ChevronDown, ChevronUp, MapPin, Phone, RefreshCw,
  ArrowLeft, Leaf, AlertCircle, Star,
} from 'lucide-react';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  delivered: {
    label: 'Delivered', icon: CheckCircle,
    badge: 'mo-badge-delivered', dot: 'mo-dot-delivered',
    track: 4, color: '#10b981',
  },
  accepted: {
    label: 'Accepted', icon: CheckCircle,
    badge: 'mo-badge-accepted', dot: 'mo-dot-accepted',
    track: 2, color: '#3b82f6',
  },
  processing: {
    label: 'Processing', icon: RefreshCw,
    badge: 'mo-badge-accepted', dot: 'mo-dot-accepted',
    track: 2, color: '#3b82f6',
  },
  shipped: {
    label: 'Shipped', icon: Truck,
    badge: 'mo-badge-shipped', dot: 'mo-dot-shipped',
    track: 3, color: '#8b5cf6',
  },
  rejected: {
    label: 'Rejected', icon: XCircle,
    badge: 'mo-badge-rejected', dot: 'mo-dot-rejected',
    track: 0, color: '#ef4444',
  },
  cancelled: {
    label: 'Cancelled', icon: XCircle,
    badge: 'mo-badge-rejected', dot: 'mo-dot-rejected',
    track: 0, color: '#ef4444',
  },
};

const VISIBLE_STATUSES = ['delivered', 'accepted', 'processing', 'shipped', 'rejected', 'cancelled'];
const TRACK_STEPS = ['Order Placed', 'Accepted', 'Shipped', 'Delivered'];

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80',
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80',
  'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&q=80',
];

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const shortId = (id = '') => id ? id.toString().slice(-8).toUpperCase() : '—';

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ order, index }) => {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const statusKey  = (order.status || '').toLowerCase();
  const isVisible  = VISIBLE_STATUSES.includes(statusKey);
  const status     = STATUS_CONFIG[statusKey] || null;
  const StatusIcon = status?.icon || null;
  const trackStep  = status?.track ?? 1;

  // Use the enriched image_url (set from catalogue in normalization).
  // Fall back to a themed fallback only if nothing is available.
  const imageSrc = imgError
    ? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
    : (order.image_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]);

  const displayName = order.product_name && order.product_name.trim()
    ? order.product_name
    : 'Unknown Product';

  return (
    <div className="mo-card" style={{ animationDelay: `${index * 0.07}s` }}>
      {/* ── Image + Status ── */}
      <div className="mo-img-wrap">
        <img
          src={imageSrc}
          alt={displayName}
          className="mo-img"
          onError={() => setImgError(true)}
        />
        <div className="mo-img-overlay" />

        {isVisible && status && StatusIcon && (
          <span className={`mo-badge ${status.badge}`}>
            <span className={`mo-dot ${status.dot}`} />
            <StatusIcon style={{ width: 11, height: 11 }} />
            {status.label}
          </span>
        )}

        {order.category && (
          <span className="mo-category-chip">{order.category}</span>
        )}

        <div className="mo-img-title">
          <h3 className="mo-product-name">{displayName}</h3>
          {order.seller_name && (
            <p className="mo-seller">Sold by {order.seller_name}</p>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mo-body">
        {/* Price + Qty row */}
        <div className="mo-price-row">
          <div>
            <span className="mo-price">₹{Number(order.price || 0).toLocaleString('en-IN')}</span>
            <span className="mo-price-unit"> total</span>
          </div>
          <div className="mo-qty-pill">
            <Layers style={{ width: 12, height: 12 }} />
            {order.quantity} {order.unit || 'units'}
          </div>
        </div>

        {/* Key info chips */}
        <div className="mo-chips">
          <div className="mo-chip" style={{ gridColumn: '1 / -1' }}>
            <Package style={{ width: 12, height: 12, color: 'rgba(52,211,153,0.6)', flexShrink: 0 }} />
            <span className="mo-chip-label">Product</span>
            <span className="mo-chip-value" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
              {displayName}
            </span>
          </div>
          <div className="mo-chip" style={{ gridColumn: '1 / -1' }}>
            <CalendarDays style={{ width: 12, height: 12, color: 'rgba(52,211,153,0.6)', flexShrink: 0 }} />
            <span className="mo-chip-label">Ordered</span>
            <span className="mo-chip-value">{formatDate(order.order_date)}</span>
          </div>
          {/* Order ID chip — always visible on card */}
          <div className="mo-chip" style={{ gridColumn: '1 / -1' }}>
            <Hash style={{ width: 12, height: 12, color: 'rgba(52,211,153,0.6)', flexShrink: 0 }} />
            <span className="mo-chip-label">Order ID</span>
            <span className="mo-chip-value mo-mono" style={{ fontSize: '0.68rem' }}>
              {order.id ? `#${order.id.toString().slice(-10).toUpperCase()}` : '—'}
            </span>
          </div>
        </div>

        {/* ── Tracking bar ── */}
        {trackStep > 0 && (
          <div className="mo-track-wrap">
            <div className="mo-track-bar">
              {TRACK_STEPS.map((step, i) => {
                const done    = i < trackStep;
                const current = i === trackStep - 1;
                return (
                  <React.Fragment key={step}>
                    <div className="mo-track-step">
                      <div className={`mo-track-dot ${done ? 'mo-track-done' : current ? 'mo-track-current' : 'mo-track-idle'}`}>
                        {done && <CheckCircle style={{ width: 9, height: 9 }} />}
                      </div>
                      <span className={`mo-track-label ${done || current ? 'mo-track-label-active' : ''}`}>{step}</span>
                    </div>
                    {i < TRACK_STEPS.length - 1 && (
                      <div className={`mo-track-line ${i < trackStep - 1 ? 'mo-track-line-done' : ''}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled / Rejected notice */}
        {trackStep === 0 && (
          <div className="mo-cancelled-notice">
            <XCircle style={{ width: 13, height: 13 }} />
            This order was {status?.label?.toLowerCase() ?? 'cancelled'}
          </div>
        )}

        {/* ── Expand toggle ── */}
        <button className="mo-expand-btn" onClick={() => setExpanded(e => !e)}>
          {expanded ? 'Hide Details' : 'View Full Details'}
          {expanded
            ? <ChevronUp style={{ width: 14, height: 14 }} />
            : <ChevronDown style={{ width: 14, height: 14 }} />
          }
        </button>

        {/* ── Expanded details ── */}
        {expanded && (
          <div className="mo-expanded">
            <div className="mo-detail-grid">

              {/* Product Name */}
              <div className="mo-detail-row mo-detail-row-full">
                <span className="mo-detail-key"><Package style={{ width: 11, height: 11 }} /> Product Name</span>
                <span className="mo-detail-val" style={{ textAlign: 'left', fontWeight: 700, color: '#a7f3d0' }}>
                  {displayName}
                </span>
              </div>

              {/* Order ID — full value */}
              <div className="mo-detail-row mo-detail-row-full">
                <span className="mo-detail-key"><Hash style={{ width: 11, height: 11 }} /> Order ID</span>
                <span className="mo-detail-val mo-mono" style={{ textAlign: 'left', wordBreak: 'break-all' }}>
                  {order.id || '—'}
                </span>
              </div>

              {/* Transaction ID — full value */}
              {order.transaction_id && (
                <div className="mo-detail-row mo-detail-row-full">
                  <span className="mo-detail-key"><CreditCard style={{ width: 11, height: 11 }} /> Transaction ID</span>
                  <span className="mo-detail-val mo-mono" style={{ textAlign: 'left', wordBreak: 'break-all' }}>
                    {order.transaction_id}
                  </span>
                </div>
              )}

              {/* Payment method */}
              {order.payment_method && (
                <div className="mo-detail-row">
                  <span className="mo-detail-key"><CreditCard style={{ width: 11, height: 11 }} /> Payment</span>
                  <span className="mo-detail-val">{order.payment_method}</span>
                </div>
              )}

              {/* Unit price */}
              <div className="mo-detail-row">
                <span className="mo-detail-key"><Star style={{ width: 11, height: 11 }} /> Unit Price</span>
                <span className="mo-detail-val">
                  ₹{order.unit_price
                    ? Number(order.unit_price).toLocaleString('en-IN')
                    : order.quantity > 0
                      ? Number((order.price / order.quantity)).toLocaleString('en-IN', { maximumFractionDigits: 2 })
                      : '—'}
                </span>
              </div>

              {/* Quantity */}
              <div className="mo-detail-row">
                <span className="mo-detail-key"><Layers style={{ width: 11, height: 11 }} /> Quantity</span>
                <span className="mo-detail-val">{order.quantity} {order.unit || 'units'}</span>
              </div>

              {/* Order date + time */}
              <div className="mo-detail-row">
                <span className="mo-detail-key"><CalendarDays style={{ width: 11, height: 11 }} /> Order Date</span>
                <span className="mo-detail-val">{formatDate(order.order_date)} {formatTime(order.order_date)}</span>
              </div>

              {/* Delivery date */}
              {order.delivered_at && (
                <div className="mo-detail-row">
                  <span className="mo-detail-key"><Truck style={{ width: 11, height: 11 }} /> Delivered On</span>
                  <span className="mo-detail-val">{formatDate(order.delivered_at)}</span>
                </div>
              )}

              {/* Delivery address */}
              {(order.delivery_address || order.address) && (
                <div className="mo-detail-row mo-detail-row-full">
                  <span className="mo-detail-key"><MapPin style={{ width: 11, height: 11 }} /> Delivery Address</span>
                  <span className="mo-detail-val" style={{ textAlign: 'left' }}>{order.delivery_address || order.address}</span>
                </div>
              )}

              {/* Seller phone */}
              {order.seller_phone && (
                <div className="mo-detail-row">
                  <span className="mo-detail-key"><Phone style={{ width: 11, height: 11 }} /> Seller Contact</span>
                  <span className="mo-detail-val">{order.seller_phone}</span>
                </div>
              )}

              {/* Notes */}
              {order.notes && (
                <div className="mo-detail-row mo-detail-row-full">
                  <span className="mo-detail-key"><AlertCircle style={{ width: 11, height: 11 }} /> Notes</span>
                  <span className="mo-detail-val" style={{ textAlign: 'left' }}>{order.notes}</span>
                </div>
              )}
            </div>

            {/* Total summary */}
            <div className="mo-total-row">
              <span className="mo-total-label">Order Total</span>
              <span className="mo-total-val">₹{Number(order.price || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Filter tab ───────────────────────────────────────────────────────────────
const FilterTab = ({ label, count, active, onClick }) => (
  <button className={`mo-filter-tab ${active ? 'mo-filter-tab-active' : ''}`} onClick={onClick}>
    {label}
    {count > 0 && <span className="mo-filter-count">{count}</span>}
  </button>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const MyOrders = ({ onBack }) => {
  const [orders, setOrders]       = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(false);
  const [filter, setFilter]       = useState('all');

  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(false);

      if (!userId) {
        setIsLoading(false);
        setError('not-logged-in');
        return;
      }

      const token   = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // ── Load the product catalogue saved by MarketPlace ──────────────────
      let productMap = {};
      try {
        const saved = localStorage.getItem('agri_product_map');
        if (saved) productMap = JSON.parse(saved);
      } catch (e) {
        console.warn('[MyOrders] Could not parse agri_product_map from localStorage:', e);
      }

      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/marketplace/orders/buyer/${userId}`,
          { headers }
        );

        if (res.ok) {
          const raw = await res.json();

          const normalized = raw.map((o) => {
            // ── Match order to the local product catalogue ──────────────
            // Try every field name the backend might use for the product ID
            const productId =
              o.product_id   ??
              o.productId    ??
              o.item_id      ??
              o.itemId       ??
              o.listing_id   ??
              o.listingId    ??
              null;

            // Look up in the catalogue by both numeric and string keys
            const catalogEntry =
              productId != null
                ? (productMap[productId] || productMap[String(productId)] || null)
                : null;

            // ── Product name: catalogue first, then backend fields ──────
            const resolvedName = (
              catalogEntry?.name   ||
              o.product_name       ||
              o.productName        ||
              o.item_name          ||
              o.itemName           ||
              o.name               ||
              o.product?.name      ||
              o.item?.name         ||
              o.listing_name       ||
              o.listingName        ||
              o.title              ||
              ''
            ).toString().trim() || `Order #${shortId(o.id ?? o.order_id)}`;

            // ── Image: catalogue first, then backend fields ──────────────
            const resolvedImage =
              catalogEntry?.image  ||
              o.image_url          ||
              o.imageUrl           ||
              o.product_image      ||
              o.productImage       ||
              o.item_image         ||
              null;

            // ── Category from catalogue (more reliable than backend) ─────
            const resolvedCategory =
              catalogEntry?.category ||
              o.category             ||
              null;

            // ── Unit from catalogue (more reliable than backend) ─────────
            const resolvedUnit =
              catalogEntry?.unit ||
              o.unit             ||
              'units';

            return {
              ...o,

              // Core identity — cover every possible backend field name
              id: o.id ?? o.orderId ?? o.order_id ?? null,

              // Transaction / payment ID — cover Razorpay and generic names
              transaction_id:
                o.transaction_id      ??
                o.transactionId       ??
                o.razorpay_payment_id ??
                o.razorpayPaymentId   ??
                o.payment_id          ??
                o.paymentId           ??
                null,

              // Status normalisation
              status: (
                o.order_status ||
                o.orderStatus  ||
                o.status       ||
                ''
              ).toLowerCase(),

              // Financials
              price:      o.total_amount ?? o.totalAmount ?? o.price ?? 0,
              unit_price: o.unit_price   ?? o.unitPrice   ?? null,

              // Dates
              order_date:  o.created_at   ?? o.createdAt   ?? o.order_date ?? null,
              delivered_at: o.delivered_at ?? o.deliveredAt ?? null,

              // Enriched product fields
              product_name: resolvedName,
              image_url:    resolvedImage,
              category:     resolvedCategory,
              unit:         resolvedUnit,

              // Quantity
              quantity: o.quantity ?? 1,

              // Seller info
              seller_name:  o.seller_name  ?? o.sellerName  ?? null,
              seller_phone: o.seller_phone ?? o.sellerPhone ?? null,

              // Payment
              payment_method: o.payment_method ?? o.paymentMethod ?? null,

              // Delivery
              delivery_address: o.delivery_address ?? o.deliveryAddress ?? o.address ?? null,

              // Misc
              notes: o.notes ?? null,
            };
          });

          setOrders(normalized);
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

  // Filter counts
  const counts = {
    all:       orders.length,
    active:    orders.filter(o => ['pending', 'accepted', 'processing', 'shipped', ''].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => ['rejected', 'cancelled'].includes(o.status)).length,
  };

  const filtered =
    filter === 'all'       ? orders
    : filter === 'active'    ? orders.filter(o => ['pending', 'accepted', 'processing', 'shipped', ''].includes(o.status))
    : filter === 'delivered' ? orders.filter(o => o.status === 'delivered')
    : orders.filter(o => ['rejected', 'cancelled'].includes(o.status));

  const totalSpent = orders
    .filter(o => !['rejected', 'cancelled'].includes(o.status))
    .reduce((s, o) => s + Number(o.price || 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .mo-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          padding-top: 80px;
          padding-bottom: 60px;
          padding-inline: 1rem;
          position: relative;
          overflow-x: hidden;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%,  rgba(16,185,129,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 100%, rgba(6,95,70,0.2)    0%, transparent 55%),
            linear-gradient(160deg, #071a0f 0%, #0a1f12 45%, #061510 100%);
        }

        .mo-root::before {
          content: '';
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .mo-orb { position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0; animation: mo-drift 16s ease-in-out infinite alternate; }
        .mo-orb-1 { width:460px;height:460px;background:rgba(16,185,129,0.1);top:-15%;left:-12%; }
        .mo-orb-2 { width:340px;height:340px;background:rgba(5,150,105,0.08);bottom:-10%;right:-8%;animation-delay:-6s; }
        .mo-orb-3 { width:240px;height:240px;background:rgba(52,211,153,0.06);top:50%;left:60%;animation-delay:-11s; }
        @keyframes mo-drift { from{transform:translate(0,0) scale(1)} to{transform:translate(25px,-35px) scale(1.06)} }

        .mo-grid {
          position:absolute;inset:0;z-index:0;pointer-events:none;
          background-image: linear-gradient(rgba(52,211,153,0.035) 1px,transparent 1px), linear-gradient(90deg,rgba(52,211,153,0.035) 1px,transparent 1px);
          background-size:48px 48px;
          mask-image:radial-gradient(ellipse 80% 70% at 50% 40%, black 0%,transparent 75%);
        }

        .mo-inner { position:relative;z-index:1;max-width:1200px;margin:0 auto; }

        /* Header */
        .mo-header {
          display:flex;align-items:center;justify-content:space-between;
          flex-wrap:wrap;gap:16px;margin-bottom:32px;
          opacity:0;transform:translateY(16px);
          animation:mo-fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s forwards;
        }
        .mo-header-left { display:flex;align-items:center;gap:16px; }
        .mo-icon-wrap {
          width:52px;height:52px;border-radius:16px;
          background:linear-gradient(135deg,#10b981,#059669);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 8px 24px rgba(16,185,129,0.4);flex-shrink:0;
        }
        .mo-page-title {
          font-family:'Cormorant Garamond',Georgia,serif;
          font-size:2rem;font-weight:700;color:#f0fdf4;
          letter-spacing:-0.02em;margin:0;line-height:1;
        }
        .mo-page-sub { font-size:0.78rem;color:rgba(167,243,208,0.45);margin:5px 0 0; }

        .mo-back-btn {
          display:flex;align-items:center;gap:6px;
          font-size:0.8rem;font-weight:600;color:rgba(167,243,208,0.55);
          background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
          border-radius:10px;padding:8px 14px;cursor:pointer;transition:all 0.2s;
          font-family:'DM Sans',sans-serif;
        }
        .mo-back-btn:hover { color:rgba(167,243,208,0.9);border-color:rgba(52,211,153,0.3);background:rgba(16,185,129,0.08); }

        /* Stats */
        .mo-stats {
          display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;
          opacity:0;transform:translateY(14px);
          animation:mo-fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.12s forwards;
        }
        .mo-stat-card {
          background:linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018));
          border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:16px 18px;
          position:relative;overflow:hidden;
        }
        .mo-stat-card::before {
          content:'';position:absolute;top:0;left:20px;right:20px;height:1px;
          background:linear-gradient(90deg,transparent,rgba(52,211,153,0.35),transparent);
        }
        .mo-stat-val { font-family:'Cormorant Garamond',Georgia,serif;font-size:1.8rem;font-weight:700;color:#ecfdf5;line-height:1; }
        .mo-stat-label { font-size:0.72rem;font-weight:600;color:rgba(167,243,208,0.45);text-transform:uppercase;letter-spacing:0.1em;margin-top:5px; }
        .mo-stat-icon { position:absolute;top:14px;right:14px;opacity:0.18; }

        /* Filters */
        .mo-filters {
          display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px;
          opacity:0;transform:translateY(12px);
          animation:mo-fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.18s forwards;
        }
        .mo-filter-tab {
          display:flex;align-items:center;gap:7px;padding:8px 16px;border-radius:12px;
          font-size:0.8rem;font-weight:600;border:1px solid rgba(255,255,255,0.08);
          background:rgba(255,255,255,0.04);color:rgba(167,243,208,0.45);
          cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;
        }
        .mo-filter-tab:hover { border-color:rgba(52,211,153,0.25);color:rgba(167,243,208,0.7); }
        .mo-filter-tab-active { background:rgba(16,185,129,0.15);border-color:rgba(52,211,153,0.4);color:#6ee7b7; }
        .mo-filter-count {
          background:rgba(52,211,153,0.2);color:#6ee7b7;
          font-size:0.7rem;font-weight:700;padding:1px 6px;border-radius:6px;
        }

        /* Grid */
        .mo-grid-layout { display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px; }

        /* Card */
        .mo-card {
          background:linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02));
          border:1px solid rgba(255,255,255,0.09);border-radius:22px;overflow:hidden;
          transition:transform 0.3s cubic-bezier(0.22,1,0.36,1), border-color 0.25s, box-shadow 0.3s;
          opacity:0;transform:translateY(20px);
          animation:mo-fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) forwards;
          display:flex;flex-direction:column;
        }
        .mo-card:hover {
          transform:translateY(-5px);border-color:rgba(52,211,153,0.22);
          box-shadow:0 20px 50px rgba(0,0,0,0.45),0 4px 16px rgba(16,185,129,0.15);
        }

        /* Image */
        .mo-img-wrap { position:relative;height:180px;overflow:hidden;flex-shrink:0; }
        .mo-img { width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease;display:block; }
        .mo-card:hover .mo-img { transform:scale(1.06); }
        .mo-img-overlay {
          position:absolute;inset:0;
          background:linear-gradient(to top, rgba(7,26,15,0.9) 0%, rgba(7,26,15,0.2) 55%, transparent 100%);
        }

        /* Badge */
        .mo-badge {
          position:absolute;top:12px;right:12px;display:flex;align-items:center;gap:5px;
          padding:4px 10px 4px 7px;border-radius:20px;border:1px solid;
          font-size:0.7rem;font-weight:700;backdrop-filter:blur(10px);
        }
        .mo-dot { width:5px;height:5px;border-radius:50%;flex-shrink:0; }
        .mo-badge-delivered { background:rgba(16,185,129,0.2);border-color:rgba(16,185,129,0.45);color:#6ee7b7; }
        .mo-dot-delivered   { background:#10b981; }
        .mo-badge-accepted  { background:rgba(59,130,246,0.2);border-color:rgba(59,130,246,0.45);color:#93c5fd; }
        .mo-dot-accepted    { background:#3b82f6; }
        .mo-badge-shipped   { background:rgba(139,92,246,0.2);border-color:rgba(139,92,246,0.45);color:#c4b5fd; }
        .mo-dot-shipped     { background:#8b5cf6; }
        .mo-badge-rejected  { background:rgba(239,68,68,0.2);border-color:rgba(239,68,68,0.45);color:#fca5a5; }
        .mo-dot-rejected    { background:#ef4444; }

        .mo-category-chip {
          position:absolute;top:12px;left:12px;
          background:rgba(0,0,0,0.45);backdrop-filter:blur(10px);
          border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.75);
          font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;
          padding:3px 8px;border-radius:8px;
        }
        .mo-img-title { position:absolute;bottom:0;left:0;right:0;padding:14px 16px; }
        .mo-product-name { color:#fff;font-family:'Cormorant Garamond',Georgia,serif;font-size:1.15rem;font-weight:700;margin:0;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
        .mo-seller { color:rgba(255,255,255,0.45);font-size:0.72rem;margin:3px 0 0; }

        /* Body */
        .mo-body { padding:18px 18px 16px;display:flex;flex-direction:column;gap:14px;flex:1; }

        .mo-price-row { display:flex;align-items:center;justify-content:space-between; }
        .mo-price { font-family:'Cormorant Garamond',Georgia,serif;font-size:1.7rem;font-weight:700;color:#ecfdf5; }
        .mo-price-unit { font-size:0.78rem;color:rgba(255,255,255,0.35); }
        .mo-qty-pill {
          display:flex;align-items:center;gap:5px;
          background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.2);
          color:rgba(167,243,208,0.8);font-size:0.75rem;font-weight:600;
          padding:4px 10px;border-radius:20px;
        }

        /* Chips */
        .mo-chips { display:grid;grid-template-columns:1fr 1fr;gap:8px; }
        .mo-chip {
          display:flex;align-items:center;gap:6px;
          background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);
          border-radius:12px;padding:8px 10px;
        }
        .mo-chip-label { font-size:0.67rem;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.06em;flex:1; }
        .mo-chip-value { font-size:0.75rem;font-weight:700;color:rgba(167,243,208,0.85); }

        /* Tracking */
        .mo-track-wrap { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:14px 16px; }
        .mo-track-bar { display:flex;align-items:flex-start;gap:0; }
        .mo-track-step { display:flex;flex-direction:column;align-items:center;flex:0 0 auto; }
        .mo-track-dot { width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        .mo-track-done    { background:rgba(16,185,129,0.25);border:1.5px solid #10b981;color:#10b981; }
        .mo-track-current { background:rgba(245,158,11,0.2);border:1.5px solid #f59e0b;animation:mo-pulse-step 2s infinite; }
        .mo-track-idle    { background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.12); }
        @keyframes mo-pulse-step { 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0.3)} 50%{box-shadow:0 0 0 5px rgba(245,158,11,0)} }
        .mo-track-label { font-size:0.6rem;font-weight:600;color:rgba(255,255,255,0.28);text-align:center;margin-top:5px;white-space:nowrap; }
        .mo-track-label-active { color:rgba(167,243,208,0.7); }
        .mo-track-line { flex:1;height:1.5px;background:rgba(255,255,255,0.1);margin-top:10px;margin-inline:4px; }
        .mo-track-line-done { background:rgba(16,185,129,0.5); }

        .mo-cancelled-notice {
          display:flex;align-items:center;gap:7px;
          background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);
          border-radius:12px;padding:10px 14px;font-size:0.78rem;color:#fca5a5;font-weight:500;
        }

        /* Expand button */
        .mo-expand-btn {
          display:flex;align-items:center;justify-content:center;gap:6px;
          width:100%;padding:9px;border-radius:12px;
          background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
          color:rgba(167,243,208,0.55);font-size:0.78rem;font-weight:600;
          cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;
        }
        .mo-expand-btn:hover { background:rgba(16,185,129,0.08);border-color:rgba(52,211,153,0.25);color:rgba(167,243,208,0.9); }

        /* Expanded detail panel */
        .mo-expanded {
          background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);
          border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:12px;
          animation:mo-slideDown 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes mo-slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        .mo-detail-grid { display:flex;flex-direction:column;gap:8px; }
        .mo-detail-row { display:flex;align-items:flex-start;justify-content:space-between;gap:12px; }
        .mo-detail-row-full { flex-direction:column;gap:4px; }
        .mo-detail-key {
          display:flex;align-items:center;gap:5px;
          font-size:0.7rem;font-weight:700;color:rgba(167,243,208,0.4);
          text-transform:uppercase;letter-spacing:0.08em;flex-shrink:0;white-space:nowrap;
        }
        .mo-detail-val { font-size:0.78rem;color:rgba(255,255,255,0.7);font-weight:500;text-align:right;word-break:break-all; }
        .mo-detail-row-full .mo-detail-val { text-align:left; }
        .mo-mono { font-family:monospace;font-size:0.72rem;color:rgba(167,243,208,0.7); }

        .mo-total-row {
          display:flex;align-items:center;justify-content:space-between;
          padding-top:12px;border-top:1px solid rgba(255,255,255,0.07);
        }
        .mo-total-label { font-size:0.75rem;font-weight:700;color:rgba(167,243,208,0.5);text-transform:uppercase;letter-spacing:0.08em; }
        .mo-total-val { font-family:'Cormorant Garamond',Georgia,serif;font-size:1.4rem;font-weight:700;color:#34d399; }

        /* Empty / error */
        .mo-empty {
          text-align:center;padding:80px 24px;
          background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:24px;
        }
        .mo-empty-icon { width:72px;height:72px;border-radius:20px;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;margin:0 auto 20px; }
        .mo-empty-title { font-family:'Cormorant Garamond',Georgia,serif;font-size:1.5rem;font-weight:700;color:#ecfdf5;margin:0 0 8px; }
        .mo-empty-sub { font-size:0.83rem;color:rgba(255,255,255,0.35); }

        /* Loader */
        .mo-loader { display:flex;align-items:center;justify-content:center;gap:10px;padding:100px 20px;color:rgba(167,243,208,0.6); }
        @keyframes mo-spin { to{transform:rotate(360deg)} }
        .mo-spinner { animation:mo-spin 0.9s linear infinite; }

        @keyframes mo-fadeUp { to{opacity:1;transform:translateY(0)} }

        @media(max-width:768px) {
          .mo-stats { grid-template-columns:repeat(2,1fr); }
          .mo-grid-layout { grid-template-columns:1fr; }
          .mo-page-title { font-size:1.6rem; }
        }
        @media(max-width:480px) {
          .mo-stats { grid-template-columns:repeat(2,1fr); }
          .mo-chips { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="mo-root">
        <div className="mo-orb mo-orb-1" />
        <div className="mo-orb mo-orb-2" />
        <div className="mo-orb mo-orb-3" />
        <div className="mo-grid" />

        <div className="mo-inner">

          {/* Header */}
          <div className="mo-header">
            <div className="mo-header-left">
              <div className="mo-icon-wrap">
                <ShoppingCart style={{ width: 24, height: 24, color: '#fff' }} />
              </div>
              <div>
                <h1 className="mo-page-title">My Orders</h1>
                <p className="mo-page-sub">Track, manage &amp; review your purchases</p>
              </div>
            </div>
            {onBack && (
              <button className="mo-back-btn" onClick={onBack}>
                <ArrowLeft style={{ width: 14, height: 14 }} /> Back
              </button>
            )}
          </div>

          {/* Stats strip */}
          {!isLoading && !error && orders.length > 0 && (
            <div className="mo-stats">
              <div className="mo-stat-card">
                <div className="mo-stat-val">{counts.all}</div>
                <div className="mo-stat-label">Total Orders</div>
                <Package style={{ width: 28, height: 28, color: '#10b981' }} className="mo-stat-icon" />
              </div>
              <div className="mo-stat-card">
                <div className="mo-stat-val">{counts.active}</div>
                <div className="mo-stat-label">Active</div>
                <Clock style={{ width: 28, height: 28, color: '#f59e0b' }} className="mo-stat-icon" />
              </div>
              <div className="mo-stat-card">
                <div className="mo-stat-val">{counts.delivered}</div>
                <div className="mo-stat-label">Delivered</div>
                <CheckCircle style={{ width: 28, height: 28, color: '#10b981' }} className="mo-stat-icon" />
              </div>
              <div className="mo-stat-card">
                <div className="mo-stat-val">₹{Number(totalSpent).toLocaleString('en-IN')}</div>
                <div className="mo-stat-label">Total Spent</div>
                <CreditCard style={{ width: 28, height: 28, color: '#8b5cf6' }} className="mo-stat-icon" />
              </div>
            </div>
          )}

          {/* Filter tabs */}
          {!isLoading && !error && orders.length > 0 && (
            <div className="mo-filters">
              <FilterTab label="All Orders"  count={counts.all}       active={filter === 'all'}       onClick={() => setFilter('all')} />
              <FilterTab label="Active"      count={counts.active}    active={filter === 'active'}    onClick={() => setFilter('active')} />
              <FilterTab label="Delivered"   count={counts.delivered} active={filter === 'delivered'} onClick={() => setFilter('delivered')} />
              <FilterTab label="Cancelled"   count={counts.cancelled} active={filter === 'cancelled'} onClick={() => setFilter('cancelled')} />
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="mo-loader">
              <svg className="mo-spinner" width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading your orders…
            </div>
          )}

          {/* Not logged in */}
          {!isLoading && error === 'not-logged-in' && (
            <div className="mo-empty">
              <div className="mo-empty-icon"><ShoppingCart style={{ width: 32, height: 32, color: 'rgba(255,255,255,0.2)' }} /></div>
              <h3 className="mo-empty-title">Please log in</h3>
              <p className="mo-empty-sub">Log in to view your order history.</p>
            </div>
          )}

          {/* Fetch error */}
          {!isLoading && error && error !== 'not-logged-in' && (
            <div className="mo-empty" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
              <div className="mo-empty-icon"><XCircle style={{ width: 32, height: 32, color: 'rgba(239,68,68,0.5)' }} /></div>
              <h3 className="mo-empty-title">Failed to load orders</h3>
              <p className="mo-empty-sub">Check your connection and try again.</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && filtered.length === 0 && (
            <div className="mo-empty">
              <div className="mo-empty-icon"><Package style={{ width: 32, height: 32, color: 'rgba(255,255,255,0.2)' }} /></div>
              <h3 className="mo-empty-title">{filter === 'all' ? 'No orders yet' : `No ${filter} orders`}</h3>
              <p className="mo-empty-sub">{filter === 'all' ? "You haven't placed any orders yet." : `You have no ${filter} orders.`}</p>
            </div>
          )}

          {/* Orders grid */}
          {!isLoading && !error && filtered.length > 0 && (
            <div className="mo-grid-layout">
              {filtered.map((order, i) => (
                <OrderCard key={order.id || i} order={order} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyOrders;