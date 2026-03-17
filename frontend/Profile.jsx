import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  User, Phone, MapPin, Sprout, Save, Leaf, ChevronDown, CheckCircle,
  Package, Clock, Edit3, X, Home, Hash, Navigation,
  ShoppingBag, Truck, RotateCcw, Calendar,
  BadgeCheck, Ban, Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────── */
const FARMING_TYPES = ['Conventional', 'Organic', 'Mixed'];
const COLLAPSED_W   = 56;   // px — icon-only strip
const MIN_W         = 240;  // px — min when expanded
const MAX_W         = 480;  // px — max drag

const STATUS = {
  delivered:  { label: 'Delivered',  textColor: 'text-emerald-300', pillBg: 'bg-emerald-500/20 border-emerald-400/40', dot: 'bg-emerald-400',  icon: BadgeCheck },
  shipped:    { label: 'Shipped',    textColor: 'text-sky-300',     pillBg: 'bg-sky-500/20 border-sky-400/40',         dot: 'bg-sky-400',      icon: Truck      },
  processing: { label: 'Processing', textColor: 'text-amber-300',   pillBg: 'bg-amber-500/20 border-amber-400/40',     dot: 'bg-amber-400',    icon: Clock      },
  cancelled:  { label: 'Cancelled',  textColor: 'text-red-300',     pillBg: 'bg-red-500/20 border-red-400/40',         dot: 'bg-red-400',      icon: X          },
};

const MOCK_ORDERS = [
  {
    id: 'ORD-8821', status: 'delivered', date: 'Mar 10, 2025', total: 2650,
    items: [{ name: 'DAP 18-46-0', qty: 1, price: 1450, unit: '50 kg bag' }, { name: 'Urea 46% N', qty: 1, price: 1200, unit: '50 kg bag' }],
    address: '12 Main Road, Sector 4, Bhubaneswar — 751001',
    deliveryDate: 'Delivered Mar 14, 2025',
  },
  {
    id: 'ORD-7743', status: 'shipped', date: 'Mar 15, 2025', total: 1770,
    items: [{ name: 'Zinc Sulphate', qty: 1, price: 850, unit: '25 kg bag' }, { name: 'Magnesium Sulphate', qty: 2, price: 460, unit: '25 kg bag' }],
    address: '12 Main Road, Sector 4, Bhubaneswar — 751001',
    deliveryDate: 'Expected Mar 20, 2025',
  },
  {
    id: 'ORD-6612', status: 'processing', date: 'Mar 17, 2025', total: 950,
    items: [{ name: 'Muriate of Potash', qty: 1, price: 950, unit: '50 kg bag' }],
    address: '12 Main Road, Sector 4, Bhubaneswar — 751001',
    deliveryDate: 'Expected Mar 22, 2025',
  },
  {
    id: 'ORD-5501', status: 'cancelled', date: 'Feb 28, 2025', total: 1600,
    items: [{ name: 'NPK 20-20-0', qty: 1, price: 1600, unit: '50 kg bag' }],
    address: '12 Main Road, Sector 4, Bhubaneswar — 751001',
    deliveryDate: '—',
  },
];

/* ─────────────────────────────────────────────────────────────────────
   SHARED PRIMITIVES  (unchanged)
───────────────────────────────────────────────────────────────────── */
const FieldLabel = ({ children }) => (
  <label className="block text-emerald-200/55 text-[10px] font-bold uppercase tracking-widest mb-1.5">{children}</label>
);

const InputField = ({ label, name, icon, value, onChange, placeholder, type = 'text', readOnly = false, disabled = false }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/35">{icon}</span>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} readOnly={readOnly} disabled={disabled}
        className="w-full border border-white/[0.09] text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500/45 transition-all disabled:opacity-35 disabled:cursor-not-allowed read-only:opacity-40 read-only:cursor-not-allowed"
        style={{ background: 'rgba(255,255,255,0.045)' }}
      />
    </div>
  </div>
);

const SelectField = ({ label, icon, name, value, onChange, disabled, children }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <div className="relative">
      {React.cloneElement(icon, { className: 'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/35 pointer-events-none' })}
      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
      <select name={name} value={value} onChange={onChange} disabled={disabled}
        className="w-full border border-white/[0.09] text-white rounded-xl pl-10 pr-9 py-3 text-sm focus:outline-none focus:border-emerald-500/45 appearance-none transition-all disabled:opacity-35 disabled:cursor-not-allowed"
        style={{ background: 'rgba(255,255,255,0.045)' }}>
        {children}
      </select>
    </div>
  </div>
);

const SectionCard = ({ children }) => (
  <div className="bg-white/[0.035] backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6 shadow-xl">
    {children}
  </div>
);

const SectionHead = ({ icon: Icon, iconColor, title, subtitle, editing, onEdit, onCancel }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.06]">
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <h2 className="text-white font-bold text-base leading-tight">{title}</h2>
        <p className="text-white/30 text-xs">{subtitle}</p>
      </div>
    </div>
    {!editing ? (
      <button onClick={onEdit}
        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400/75 border border-emerald-500/20 hover:border-emerald-500/45 hover:text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-all">
        <Edit3 className="w-3 h-3" /> Edit
      </button>
    ) : (
      <button onClick={onCancel}
        className="flex items-center gap-1.5 text-xs font-semibold text-white/35 border border-white/[0.08] hover:border-white/15 px-3 py-1.5 rounded-lg transition-all">
        <X className="w-3 h-3" /> Cancel
      </button>
    )}
  </div>
);

const SavedToast = () => (
  <div className="mb-4 flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> Saved successfully!
  </div>
);

const SaveBtn = ({ saving, onClick }) => (
  <button onClick={onClick} disabled={saving}
    className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 transition-all disabled:opacity-50 shadow-lg shadow-emerald-950/40">
    {saving
      ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
      : <><Save className="w-4 h-4" /> Save Changes</>}
  </button>
);

/* ─────────────────────────────────────────────────────────────────────
   ORDER HISTORY ACCORDION  (logic unchanged, visuals upgraded)
───────────────────────────────────────────────────────────────────── */
const OrderHistory = ({ orders }) => {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-2.5">
      {orders.map(order => {
        const s = STATUS[order.status];
        const SI = s.icon;
        const isOpen = expanded === order.id;

        return (
          <div key={order.id}
            className={`rounded-2xl border transition-all duration-250 overflow-hidden ${
              isOpen ? 'border-emerald-500/50' : 'border-white/[0.09] hover:border-white/[0.16]'
            }`}
            style={{
              background: isOpen
                ? 'linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(22,163,74,0.05) 100%)'
                : 'rgba(255,255,255,0.04)',
              boxShadow: isOpen ? '0 4px 24px rgba(52,211,153,0.08)' : 'none',
            }}>

            {/* ── Header row ── */}
            <button onClick={() => setExpanded(isOpen ? null : order.id)}
              className="w-full text-left px-3.5 py-3.5 flex items-center gap-3 group">

              {/* colored left bar */}
              <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${s.dot} opacity-80`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-white font-bold text-[13px] tracking-tight">{order.id}</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.pillBg} ${s.textColor}`}>
                    <SI className="w-2.5 h-2.5" />{s.label}
                  </span>
                </div>
                <p className="text-white/45 text-[11px] truncate leading-tight">{order.items.map(i => i.name).join(', ')}</p>
              </div>

              <div className="text-right flex-shrink-0 ml-1">
                <div className="text-white text-sm font-black">₹{order.total.toLocaleString()}</div>
                <div className="text-white/35 text-[10px] mt-0.5">{order.date}</div>
              </div>

              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                isOpen ? 'bg-emerald-500/20 rotate-180' : 'bg-white/[0.06] group-hover:bg-white/[0.1]'
              }`}>
                <ChevronDown className={`w-3.5 h-3.5 transition-colors ${isOpen ? 'text-emerald-400' : 'text-white/40'}`} />
              </div>
            </button>

            {/* ── Expanded detail ── */}
            {isOpen && (
              <div className="mx-3.5 mb-3.5 rounded-xl overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>

                {/* items list */}
                <div className="px-3.5 pt-3 pb-2 space-y-2.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-white/90 text-xs font-semibold leading-snug">{item.name}</p>
                        <p className="text-white/35 text-[10px] mt-0.5">{item.unit} · qty {item.qty}</p>
                      </div>
                      <span className="text-emerald-300/80 text-xs font-bold flex-shrink-0 tabular-nums">
                        ₹{(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* total row */}
                <div className="flex justify-between items-center px-3.5 py-2.5 border-t border-white/[0.07]"
                  style={{ background: 'rgba(52,211,153,0.05)' }}>
                  <span className="text-white/50 text-[11px] font-medium">Order Total</span>
                  <span className="text-emerald-300 font-black text-sm tabular-nums">₹{order.total.toLocaleString()}</span>
                </div>

                {/* meta info */}
                <div className="px-3.5 py-3 space-y-1.5 border-t border-white/[0.07]">
                  <div className="flex items-center gap-2 text-[11px] text-white/45">
                    <Calendar className="w-3 h-3 text-white/30 flex-shrink-0" />
                    <span>Ordered {order.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-white/45">
                    <Truck className="w-3 h-3 text-white/30 flex-shrink-0" />
                    <span>{order.deliveryDate}</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-white/40">
                    <MapPin className="w-3 h-3 text-white/30 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{order.address}</span>
                  </div>
                </div>

                {/* reorder */}
                {order.status === 'delivered' && (
                  <div className="px-3.5 pb-3.5">
                    <button className="w-full py-2 rounded-xl border border-emerald-500/30 text-emerald-400 text-[11px] font-bold hover:bg-emerald-500/15 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-1.5"
                      style={{ background: 'rgba(52,211,153,0.05)' }}>
                      <RotateCcw className="w-3 h-3" /> Reorder Items
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   ORDER SIDEBAR  (new — fixed overlay, collapsible, resizable)
───────────────────────────────────────────────────────────────────── */
const OrderSidebar = ({ orders }) => {
  const [open, setOpen]           = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isDragging, setIsDragging]     = useState(false);
  const dragStartX  = useRef(0);
  const dragStartW  = useRef(0);

  /* drag-to-resize handlers */
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragStartX.current = e.clientX;
    dragStartW.current = sidebarWidth;
    setIsDragging(true);
  }, [sidebarWidth]);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e) => {
      const delta = e.clientX - dragStartX.current;
      const next  = Math.min(MAX_W, Math.max(MIN_W, dragStartW.current + delta));
      setSidebarWidth(next);
    };
    const onMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  const currentWidth = open ? sidebarWidth : COLLAPSED_W;

  /* pending / in-progress count badge */
  const activeCount = orders.filter(o => o.status === 'processing' || o.status === 'shipped').length;

  return (
    <>
      {/* ── Sidebar panel ── */}
      <div
        className="fixed left-0 top-0 h-screen z-40 flex flex-col"
        style={{
          width: currentWidth,
          transition: isDragging ? 'none' : 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          background: 'linear-gradient(180deg, rgba(7,28,18,0.96) 0%, rgba(9,32,20,0.94) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(52,211,153,0.12)',
          boxShadow: open ? '4px 0 40px rgba(0,0,0,0.5), 2px 0 12px rgba(52,211,153,0.06)' : '2px 0 16px rgba(0,0,0,0.4)',
        }}
      >
        {/* ── Top header ── */}
        <div className="flex items-center gap-3 px-3 pt-5 pb-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Icon trigger */}
          <button
            onClick={() => setOpen(o => !o)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group"
            style={{
              background: open ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
              border: open ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-amber-500 rounded-full text-[9px] font-black text-white flex items-center justify-center leading-none shadow-lg shadow-amber-900/40">
                {activeCount}
              </span>
            )}
          </button>

          {/* Title — only when open */}
          {open && (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <div className="min-w-0">
                <p className="text-white font-bold text-sm leading-tight">Order History</p>
                <p className="text-emerald-400/50 text-[10px] mt-0.5">{orders.length} orders · {activeCount} active</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-white/50" />
              </button>
            </div>
          )}
        </div>

        {/* ── Status summary pills — shown when open ── */}
        {open && (
          <div className="flex gap-1.5 px-3 py-2.5 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {Object.entries(
              orders.reduce((acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }), {})
            ).map(([status, count]) => {
              const s = STATUS[status];
              if (!s) return null;
              return (
                <span key={status}
                  className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full border ${s.pillBg} ${s.textColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {count} {s.label}
                </span>
              );
            })}
          </div>
        )}

        {/* ── Order list ── */}
        {open && (
          <div className="flex-1 overflow-y-auto px-2.5 py-3"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(52,211,153,0.15) transparent',
            }}>
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-white/20">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Package className="w-6 h-6" />
                </div>
                <span className="text-xs">No orders yet</span>
              </div>
            ) : (
              <OrderHistory orders={orders} />
            )}
          </div>
        )}

        {/* ── Collapsed: centered icon column ── */}
        {!open && (
          <div className="flex-1 flex flex-col items-center pt-4 gap-4">
            {/* mini status dots */}
            {orders.slice(0, 4).map(order => {
              const s = STATUS[order.status];
              return (
                <button key={order.id} onClick={() => setOpen(true)}
                  title={`${order.id} — ${s.label}`}
                  className="w-2 h-2 rounded-full transition-all hover:scale-150"
                  style={{ background: s.dot.replace('bg-', '').includes('emerald') ? '#34d399' : s.dot.replace('bg-', '').includes('sky') ? '#38bdf8' : s.dot.replace('bg-', '').includes('amber') ? '#fbbf24' : '#f87171' }}
                />
              );
            })}
            <button onClick={() => setOpen(true)}
              className="mt-auto mb-6 flex flex-col items-center gap-1.5 group"
            >
              <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-emerald-400/60 group-hover:translate-x-0.5 transition-all" />
              <span className="text-[9px] font-bold text-white/20 group-hover:text-white/40 transition-colors"
                style={{ writingMode: 'vertical-rl', letterSpacing: '0.12em' }}>
                ORDERS
              </span>
            </button>
          </div>
        )}

        {/* ── Drag resize handle ── */}
        {open && (
          <div
            onMouseDown={onMouseDown}
            className="absolute right-0 top-0 h-full w-2 cursor-col-resize z-10 flex items-center justify-center group"
          >
            <div className="absolute inset-0 transition-colors duration-150"
              style={{ background: isDragging ? 'rgba(52,211,153,0.2)' : 'transparent' }}
              onMouseEnter={e => !isDragging && (e.currentTarget.style.background = 'rgba(52,211,153,0.1)')}
              onMouseLeave={e => !isDragging && (e.currentTarget.style.background = 'transparent')}
            />
            <div className="w-0.5 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(52,211,153,0.5)' }} />
          </div>
        )}
      </div>

      {/* ── Drag capture overlay ── */}
      {isDragging && <div className="fixed inset-0 z-50 cursor-col-resize" />}
    </>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   MAIN PROFILE COMPONENT
───────────────────────────────────────────────────────────────────── */
const Profile = () => {
  const userId = localStorage.getItem('user_id') || 'user_1234';

  const [profile,   setProfile]   = useState({ name: '', phone: '', state: '', district: '' });
  const [address,   setAddress]   = useState({ street: '', city: '', pincode: '', landmark: '' });
  const [farm,      setFarm]      = useState({ total_land: '', main_crop: '', farming_type: 'Conventional' });
  const [orders,    setOrders]    = useState([]);
  const [options,   setOptions]   = useState({ crops: [], states: [], state_districts: {} });
  const [districts, setDistricts] = useState([]);

  const [editingP, setEditingP] = useState(false);
  const [editingA, setEditingA] = useState(false);
  const [editingF, setEditingF] = useState(false);

  const [draftP, setDraftP] = useState(null);
  const [draftA, setDraftA] = useState(null);
  const [draftF, setDraftF] = useState(null);

  const [saving,    setSaving]    = useState('');
  const [saved,     setSaved]     = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`http://127.0.0.1:8000/api/users/options/all`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`http://127.0.0.1:8000/api/users/${userId}`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`http://127.0.0.1:8000/api/users/${userId}/farm`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`http://127.0.0.1:8000/api/users/${userId}/orders`).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([opts, user, farmData, orderData]) => {
      if (opts) setOptions(opts);
      if (user) {
        setProfile({ name: user.name || '', phone: user.phone || '', state: user.state || '', district: user.district || '' });
        setAddress({ street: user.address?.street || '', city: user.address?.city || '', pincode: user.address?.pincode || '', landmark: user.address?.landmark || '' });
        if (user.state && opts?.state_districts?.[user.state]) setDistricts(opts.state_districts[user.state]);
      }
      if (farmData) setFarm({ total_land: farmData.total_land || '', main_crop: farmData.main_crop || '', farming_type: farmData.farming_type || 'Conventional' });
      setOrders(orderData || MOCK_ORDERS);
      setIsLoading(false);
    });
  }, []);

  const startEdit  = s => {
    if (s==='p') { setDraftP({...profile}); setEditingP(true); }
    if (s==='a') { setDraftA({...address}); setEditingA(true); }
    if (s==='f') { setDraftF({...farm});    setEditingF(true); }
  };
  const cancelEdit = s => {
    if (s==='p') { setProfile(draftP); setEditingP(false); }
    if (s==='a') { setAddress(draftA); setEditingA(false); }
    if (s==='f') { setFarm(draftF);    setEditingF(false); }
  };

  const handleSave = async (section) => {
    setSaving(section);
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    try {
      if (section !== 'f') await fetch(`http://127.0.0.1:8000/api/users/${userId}`, { method: 'PUT', headers, body: JSON.stringify({ ...profile, address }) });
      else await fetch(`http://127.0.0.1:8000/api/users/${userId}/farm`, { method: 'POST', headers, body: JSON.stringify(farm) });
    } catch (_) {}
    setSaving(''); setSaved(section); setTimeout(() => setSaved(''), 2500);
    if (section==='p') setEditingP(false);
    if (section==='a') setEditingA(false);
    if (section==='f') setEditingF(false);
  };

  const handleProfileChange = e => {
    const { name, value } = e.target;
    if (name === 'state') { setDistricts(options.state_districts?.[value] || []); setProfile(p => ({...p, state: value, district: ''})); }
    else setProfile(p => ({...p, [name]: value}));
  };

  const stats = {
    total:     orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    spent:     orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#09201a,#0d2e1a,#091e12)' }}>
      <div className="flex items-center gap-3 text-emerald-400/80">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading profile…</span>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Fixed left sidebar — outside layout flow, never shifts main content ── */}
      <OrderSidebar orders={orders} />

      {/* ── Full-page background ── */}
      <div
        className="min-h-screen px-4 py-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #09201a 0%, #0d2e1a 50%, #091e12 100%)' }}
      >
        {/* bg atmosphere */}
        <div className="absolute top-0 left-[-20%] w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-20%] w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(74,222,128,1) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* ── Main content — always centered, never affected by sidebar ── */}
        <div className="relative max-w-2xl mx-auto space-y-4">

          {/* Page header */}
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #34d399, #16a34a)' }}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>My Profile</h1>
              <p className="text-white/30 text-xs">{profile.name || 'AgriMart account'}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Orders', value: stats.total,                        icon: Package     },
              { label: 'Delivered',    value: stats.delivered,                    icon: CheckCircle },
              { label: 'Total Spent',  value: `₹${stats.spent.toLocaleString()}`, icon: ShoppingBag },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center rounded-xl p-3.5 border border-white/[0.06]"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Icon className="w-4 h-4 text-emerald-400/60 mx-auto mb-1.5" />
                <div className="text-white font-bold text-base leading-none">{value}</div>
                <div className="text-white/25 text-[10px] mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* ── SECTION 1: Personal ── */}
          <SectionCard>
            <SectionHead icon={User} iconColor="text-emerald-400"
              title="Personal Information" subtitle="Name, location and contact"
              editing={editingP} onEdit={() => startEdit('p')} onCancel={() => cancelEdit('p')} />
            {saved === 'p' && <SavedToast />}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Full Name" name="name" icon={<User className="w-4 h-4" />}
                value={profile.name} onChange={handleProfileChange} placeholder="e.g. Ramesh Kumar" disabled={!editingP} />
              <InputField label="Phone Number" name="phone" icon={<Phone className="w-4 h-4" />}
                value={profile.phone} onChange={() => {}} placeholder="+91 9876543210" readOnly />
              <SelectField label="State" name="state" icon={<MapPin className="w-4 h-4" />}
                value={profile.state} onChange={handleProfileChange} disabled={!editingP}>
                <option value="" className="bg-[#0d2e1a]">Select State</option>
                {options.states.map(s => <option key={s} value={s} className="bg-[#0d2e1a]">{s}</option>)}
              </SelectField>
              <SelectField label="District" name="district" icon={<MapPin className="w-4 h-4" />}
                value={profile.district} onChange={handleProfileChange} disabled={!editingP || !profile.state}>
                <option value="" className="bg-[#0d2e1a]">Select District</option>
                {districts.map(d => <option key={d} value={d} className="bg-[#0d2e1a]">{d}</option>)}
              </SelectField>
            </div>
            {editingP && <SaveBtn saving={saving === 'p'} onClick={() => handleSave('p')} />}
          </SectionCard>

          {/* ── SECTION 2: Delivery Address ── */}
          <SectionCard>
            <SectionHead icon={Home} iconColor="text-sky-400"
              title="Delivery Address" subtitle="Where your orders will be shipped"
              editing={editingA} onEdit={() => startEdit('a')} onCancel={() => cancelEdit('a')} />
            {saved === 'a' && <SavedToast />}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <InputField label="Street / Village" name="street" icon={<Home className="w-4 h-4" />}
                  value={address.street} onChange={e => setAddress(p => ({...p, street: e.target.value}))}
                  placeholder="e.g. 12 Main Road, Sector 4" disabled={!editingA} />
              </div>
              <InputField label="City / Town" name="city" icon={<Navigation className="w-4 h-4" />}
                value={address.city} onChange={e => setAddress(p => ({...p, city: e.target.value}))}
                placeholder="e.g. Bhubaneswar" disabled={!editingA} />
              <InputField label="PIN Code" name="pincode" icon={<Hash className="w-4 h-4" />}
                value={address.pincode} onChange={e => setAddress(p => ({...p, pincode: e.target.value}))}
                placeholder="e.g. 751001" type="number" disabled={!editingA} />
              <div className="sm:col-span-2">
                <InputField label="Landmark (optional)" name="landmark" icon={<MapPin className="w-4 h-4" />}
                  value={address.landmark} onChange={e => setAddress(p => ({...p, landmark: e.target.value}))}
                  placeholder="e.g. Near Post Office" disabled={!editingA} />
              </div>
            </div>
            {!editingA && (address.street || address.city || address.pincode) && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3 border border-sky-500/12"
                style={{ background: 'rgba(14,165,233,0.05)' }}>
                <MapPin className="w-3.5 h-3.5 text-sky-400/50 mt-0.5 flex-shrink-0" />
                <p className="text-sky-200/50 text-xs leading-relaxed">
                  {[address.street, address.city, profile.district, profile.state, address.pincode].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
            {editingA && <SaveBtn saving={saving === 'a'} onClick={() => handleSave('a')} />}
          </SectionCard>

          {/* ── SECTION 3: Farm Details ── */}
          <SectionCard>
            <SectionHead icon={Sprout} iconColor="text-green-400"
              title="Farm Details" subtitle="Your agricultural operation"
              editing={editingF} onEdit={() => startEdit('f')} onCancel={() => cancelEdit('f')} />
            {saved === 'f' && <SavedToast />}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Total Land (acres)" name="total_land" icon={<Sprout className="w-4 h-4" />}
                value={farm.total_land} onChange={e => setFarm(p => ({...p, total_land: e.target.value}))}
                placeholder="e.g. 5.5" type="number" disabled={!editingF} />
              <SelectField label="Main Crop" name="main_crop" icon={<Leaf className="w-4 h-4" />}
                value={farm.main_crop} onChange={e => setFarm(p => ({...p, main_crop: e.target.value}))} disabled={!editingF}>
                <option value="" className="bg-[#0d2e1a]">Select Crop</option>
                {options.crops.map(c => <option key={c} value={c} className="bg-[#0d2e1a]">{c}</option>)}
              </SelectField>
              <div className="sm:col-span-2">
                <FieldLabel>Farming Type</FieldLabel>
                <div className="grid grid-cols-3 gap-2.5 mt-0.5">
                  {FARMING_TYPES.map(type => (
                    <button key={type} type="button" disabled={!editingF}
                      onClick={() => editingF && setFarm(p => ({...p, farming_type: type}))}
                      className={`py-2.5 rounded-xl border text-sm font-bold transition-all disabled:cursor-not-allowed ${
                        farm.farming_type === type
                          ? 'bg-green-500/18 border-green-500/45 text-green-300'
                          : 'border-white/[0.07] text-white/30 disabled:opacity-35'
                      } ${editingF && farm.farming_type !== type ? 'hover:border-white/15 hover:text-white/50' : ''}`}
                      style={{ background: farm.farming_type === type ? undefined : 'rgba(255,255,255,0.03)' }}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {editingF && <SaveBtn saving={saving === 'f'} onClick={() => handleSave('f')} />}
          </SectionCard>

        </div>
      </div>
    </>
  );
};

export default Profile;