import React, { useState, useEffect } from 'react';
import {
  User, Phone, MapPin, Sprout, Save, Leaf, ChevronDown, CheckCircle,
  Package, Edit3, X, Home, Hash, Navigation,
  ShoppingBag, Loader2, ArrowRight, Wheat, TrendingUp,
} from 'lucide-react';

/* ─── CONSTANTS ─────────────────────────────────────────────── */
const FARMING_TYPES = ['Conventional', 'Organic', 'Mixed'];

/* ─── FONTS ─────────────────────────────────────────────────── */
const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --soil: #1a1208;
      --bark: #2d1f0e;
      --moss: #1b2d1a;
      --leaf: #3a7d44;
      --sage: #8aad6e;
      --mist: #c8dfc1;
      --cream: #f2ead8;
      --amber: #d4a853;
      --clay: #b8714e;
      --sky: #7ab8c8;
      --frost: rgba(242,234,216,0.06);
      --border: rgba(138,173,110,0.18);
      --border-soft: rgba(242,234,216,0.08);
    }

    * { box-sizing: border-box; }

    .profile-root {
      font-family: 'DM Sans', sans-serif;
      min-height: 100vh;
      background:
        radial-gradient(ellipse 80% 50% at 20% 10%, rgba(58,125,68,0.12) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 80%, rgba(212,168,83,0.07) 0%, transparent 55%),
        linear-gradient(160deg, #0d1a0b 0%, #111909 40%, #100e07 100%);
    }

    /* Noise grain overlay */
    .profile-root::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      opacity: 0.04;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }

    .serif { font-family: 'Cormorant Garamond', Georgia, serif; }

    /* Glass card */
    .glass-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.042) 0%, rgba(255,255,255,0.018) 100%);
      backdrop-filter: blur(24px);
      border: 1px solid var(--border-soft);
      border-radius: 20px;
      position: relative;
      overflow: hidden;
    }
    .glass-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(135deg, rgba(138,173,110,0.06) 0%, transparent 50%);
      pointer-events: none;
    }

    /* Top accent line on cards */
    .card-accent::after {
      content: '';
      position: absolute;
      top: 0; left: 24px; right: 24px;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--sage), transparent);
      opacity: 0.4;
    }

    /* Hero banner */
    .hero-banner {
      background:
        linear-gradient(135deg, rgba(58,125,68,0.22) 0%, rgba(212,168,83,0.08) 100%);
      border: 1px solid rgba(138,173,110,0.22);
      border-radius: 24px;
      padding: 28px 32px;
      position: relative;
      overflow: hidden;
    }
    .hero-banner::before {
      content: '';
      position: absolute;
      top: -40px; right: -40px;
      width: 200px; height: 200px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(58,125,68,0.15) 0%, transparent 70%);
    }
    .hero-banner::after {
      content: '';
      position: absolute;
      bottom: -30px; left: 30%;
      width: 150px; height: 150px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%);
    }

    /* Avatar ring */
    .avatar-ring {
      width: 72px; height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--leaf), var(--amber));
      padding: 2px;
      flex-shrink: 0;
    }
    .avatar-inner {
      width: 100%; height: 100%;
      border-radius: 50%;
      background: linear-gradient(135deg, #1d2e1b, #2a1e0e);
      display: flex; align-items: center; justify-content: center;
    }

    /* Stat pill */
    .stat-pill {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px;
      padding: 14px 12px;
      text-align: center;
      transition: border-color 0.2s, background 0.2s;
    }
    .stat-pill:hover {
      background: rgba(138,173,110,0.07);
      border-color: rgba(138,173,110,0.22);
    }

    /* Input */
    .field-input {
      width: 100%;
      background: rgba(255,255,255,0.035);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 12px 14px 12px 42px;
      color: var(--cream);
      font-family: 'DM Sans', sans-serif;
      font-size: 13.5px;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
      -webkit-appearance: none;
    }
    .field-input::placeholder { color: rgba(242,234,216,0.2); }
    .field-input:focus {
      border-color: rgba(138,173,110,0.4);
      background: rgba(138,173,110,0.05);
    }
    .field-input:disabled, .field-input[readonly] {
      opacity: 0.38;
      cursor: not-allowed;
    }

    /* Section divider label */
    .section-eyebrow {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 18px;
    }
    .eyebrow-line {
      flex: 1; height: 1px;
      background: linear-gradient(90deg, var(--border-soft), transparent);
    }

    /* Farming type toggle */
    .farm-type-btn {
      border-radius: 12px;
      padding: 10px 8px;
      border: 1px solid rgba(255,255,255,0.07);
      background: rgba(255,255,255,0.025);
      color: rgba(242,234,216,0.3);
      font-family: 'DM Sans', sans-serif;
      font-size: 13px; font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .farm-type-btn:disabled { cursor: not-allowed; opacity: 0.32; }
    .farm-type-btn.active {
      background: linear-gradient(135deg, rgba(58,125,68,0.25), rgba(58,125,68,0.1));
      border-color: rgba(138,173,110,0.45);
      color: var(--sage);
    }
    .farm-type-btn:not(.active):not(:disabled):hover {
      border-color: rgba(255,255,255,0.14);
      color: rgba(242,234,216,0.55);
    }

    /* Save button */
    .save-btn {
      width: 100%;
      margin-top: 20px;
      padding: 13px;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--leaf) 0%, #2d6e3a 100%);
      color: #e8f5e4;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px; font-weight: 700;
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: opacity 0.2s, transform 0.1s;
      box-shadow: 0 4px 20px rgba(58,125,68,0.3);
      letter-spacing: 0.3px;
    }
    .save-btn:hover { opacity: 0.88; transform: translateY(-1px); }
    .save-btn:active { transform: translateY(0); }
    .save-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

    /* Edit/Cancel button */
    .edit-btn {
      display: flex; align-items: center; gap: 5px;
      font-size: 12px; font-weight: 600;
      font-family: 'DM Sans', sans-serif;
      padding: 7px 14px;
      border-radius: 10px;
      border: 1px solid rgba(138,173,110,0.22);
      background: rgba(138,173,110,0.06);
      color: rgba(138,173,110,0.8);
      cursor: pointer;
      transition: all 0.18s;
      letter-spacing: 0.2px;
    }
    .edit-btn:hover {
      border-color: rgba(138,173,110,0.45);
      background: rgba(138,173,110,0.12);
      color: var(--sage);
    }
    .cancel-btn {
      display: flex; align-items: center; gap: 5px;
      font-size: 12px; font-weight: 600;
      font-family: 'DM Sans', sans-serif;
      padding: 7px 14px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.08);
      background: transparent;
      color: rgba(242,234,216,0.3);
      cursor: pointer;
      transition: all 0.18s;
    }
    .cancel-btn:hover {
      border-color: rgba(255,255,255,0.14);
      color: rgba(242,234,216,0.5);
    }

    /* Toast */
    .saved-toast {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; font-weight: 600;
      color: var(--sage);
      background: rgba(58,125,68,0.1);
      border: 1px solid rgba(138,173,110,0.22);
      border-radius: 10px;
      padding: 8px 12px;
      margin-bottom: 14px;
    }

    /* View orders strip */
    .orders-strip {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px;
      border-radius: 14px;
      border: 1px solid rgba(122,184,200,0.2);
      background: rgba(122,184,200,0.05);
      cursor: pointer;
      transition: all 0.2s;
    }
    .orders-strip:hover {
      border-color: rgba(122,184,200,0.38);
      background: rgba(122,184,200,0.09);
    }

    /* Decorative leaf watermark */
    .leaf-watermark {
      position: absolute;
      right: -20px; bottom: -20px;
      opacity: 0.04;
      pointer-events: none;
    }

    /* Address preview pill */
    .addr-preview {
      display: flex; align-items: flex-start; gap: 10px;
      margin-top: 14px;
      padding: 10px 14px;
      border-radius: 12px;
      background: rgba(122,184,200,0.04);
      border: 1px solid rgba(122,184,200,0.1);
    }

    select option { background: #131a10; }

    @media (max-width: 600px) {
      .hero-banner { padding: 22px 20px; }
    }
  `}</style>
);

/* ─── PRIMITIVES ────────────────────────────────────────────── */
const FieldLabel = ({ children }) => (
  <label style={{
    display: 'block',
    color: 'rgba(138,173,110,0.55)',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 7,
  }}>{children}</label>
);

const InputField = ({ label, name, icon, value, onChange, placeholder, type = 'text', readOnly = false, disabled = false }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(138,173,110,0.35)', display: 'flex' }}>{icon}</span>
      <input type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} readOnly={readOnly} disabled={disabled}
        className="field-input" />
    </div>
  </div>
);

const SelectField = ({ label, icon, name, value, onChange, disabled, children }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(138,173,110,0.35)', display: 'flex', pointerEvents: 'none' }}>
        {React.cloneElement(icon, { style: { width: 16, height: 16 } })}
      </span>
      <ChevronDown style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }} />
      <select name={name} value={value} onChange={onChange} disabled={disabled}
        className="field-input" style={{ paddingRight: 36 }}>
        {children}
      </select>
    </div>
  </div>
);

const SectionHead = ({ icon: Icon, iconBg, title, subtitle, tag, editing, onEdit, onCancel }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon style={{ width: 18, height: 18, color: 'var(--cream)' }} />
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 className="serif" style={{ color: 'var(--cream)', fontWeight: 700, fontSize: 17, lineHeight: 1, margin: 0 }}>{title}</h2>
          {tag && (
            <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sage)', background: 'rgba(58,125,68,0.15)', border: '1px solid rgba(138,173,110,0.22)', borderRadius: 6, padding: '2px 7px' }}>{tag}</span>
          )}
        </div>
        <p style={{ color: 'rgba(242,234,216,0.28)', fontSize: 11.5, margin: '3px 0 0' }}>{subtitle}</p>
      </div>
    </div>
    {!editing
      ? <button onClick={onEdit} className="edit-btn"><Edit3 style={{ width: 11, height: 11 }} /> Edit</button>
      : <button onClick={onCancel} className="cancel-btn"><X style={{ width: 11, height: 11 }} /> Cancel</button>
    }
  </div>
);

const SavedToast = () => (
  <div className="saved-toast">
    <CheckCircle style={{ width: 13, height: 13, flexShrink: 0 }} />
    Saved successfully
  </div>
);

const SaveBtn = ({ saving, onClick }) => (
  <button onClick={onClick} disabled={saving} className="save-btn">
    {saving
      ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />Saving…</>
      : <><Save style={{ width: 15, height: 15 }} />Save Changes</>
    }
  </button>
);

/* ─── ORDER STATS ───────────────────────────────────────────── */
const OrderStats = ({ onViewOrders }) => {
  const [stats, setStats] = useState({ total: 0, delivered: 0, spent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const token  = localStorage.getItem('token');
    if (!userId) { setLoading(false); return; }
    fetch(`http://127.0.0.1:8000/api/marketplace/orders/buyer/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(r => r.ok ? r.json() : [])
      .then(orders => {
        const total     = orders.length;
        const delivered = orders.filter(o => (o.order_status || '').toLowerCase() === 'delivered').length;
        const spent     = orders
          .filter(o => (o.order_status || '').toLowerCase() !== 'rejected')
          .reduce((s, o) => s + (o.total_amount || 0), 0);
        setStats({ total, delivered, spent });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statsData = [
    { label: 'Total Orders', value: loading ? '—' : stats.total,   icon: Package,     color: 'var(--sage)' },
    { label: 'Delivered',    value: loading ? '—' : stats.delivered, icon: CheckCircle, color: '#7fd48a' },
    { label: 'Total Spent',  value: loading ? '—' : `₹${Number(stats.spent).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'var(--amber)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {statsData.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-pill">
            <Icon style={{ width: 16, height: 16, color, margin: '0 auto 8px', display: 'block' }} />
            <div style={{ color: 'var(--cream)', fontWeight: 700, fontSize: 17, lineHeight: 1 }}>{value}</div>
            <div style={{ color: 'rgba(242,234,216,0.28)', fontSize: 10.5, marginTop: 5, lineHeight: 1.2 }}>{label}</div>
          </div>
        ))}
      </div>

      <button onClick={onViewOrders} className="orders-strip">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(122,184,200,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShoppingBag style={{ width: 16, height: 16, color: 'var(--sky)' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ color: 'rgba(122,184,200,0.9)', fontWeight: 700, fontSize: 13.5, margin: 0 }}>View My Orders</p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, margin: '3px 0 0' }}>Track deliveries & history</p>
          </div>
        </div>
        <ArrowRight style={{ width: 15, height: 15, color: 'rgba(122,184,200,0.45)' }} />
      </button>
    </div>
  );
};

/* ─── MAIN ──────────────────────────────────────────────────── */
const Profile = ({ onViewOrders }) => {
  const userId = localStorage.getItem('user_id') || '';

  const [profile,   setProfile]   = useState({ name: '', phone: '', state: '', district: '' });
  const [address,   setAddress]   = useState({ street: '', city: '', pincode: '', landmark: '' });
  const [farm,      setFarm]      = useState({ total_land: '', main_crop: '', farming_type: 'Conventional' });
  const [options,   setOptions]   = useState({ crops: [], states: [], state_districts: {} });
  const [districts, setDistricts] = useState([]);

  const [editingP, setEditingP] = useState(false);
  const [editingA, setEditingA] = useState(false);
  const [editingF, setEditingF] = useState(false);

  const [draftP, setDraftP] = useState(null);
  const [draftA, setDraftA] = useState(null);
  const [draftF, setDraftF] = useState(null);

  const [saving, setSaving] = useState('');
  const [saved,  setSaved]  = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setIsLoading(false); return; }
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    Promise.all([
      fetch(`http://127.0.0.1:8000/api/users/options/all`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`http://127.0.0.1:8000/api/users/${userId}`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`http://127.0.0.1:8000/api/users/${userId}/farm`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([opts, user, farmData]) => {
      if (opts) setOptions(opts);
      if (user) {
        setProfile({ name: user.name || '', phone: user.phone || '', state: user.state || '', district: user.district || '' });
        setAddress({ street: user.address?.street || '', city: user.address?.city || '', pincode: user.address?.pincode || '', landmark: user.address?.landmark || '' });
        if (user.state && opts?.state_districts?.[user.state]) setDistricts(opts.state_districts[user.state]);
      }
      if (farmData) setFarm({ total_land: farmData.total_land || '', main_crop: farmData.main_crop || '', farming_type: farmData.farming_type || 'Conventional' });
      setIsLoading(false);
    });
  }, [userId]);

  const startEdit = s => {
    if (s === 'p') { setDraftP({...profile}); setEditingP(true); }
    if (s === 'a') { setDraftA({...address}); setEditingA(true); }
    if (s === 'f') { setDraftF({...farm});    setEditingF(true); }
  };
  const cancelEdit = s => {
    if (s === 'p') { setProfile(draftP); setEditingP(false); }
    if (s === 'a') { setAddress(draftA); setEditingA(false); }
    if (s === 'f') { setFarm(draftF);    setEditingF(false); }
  };

  const handleSave = async (section) => {
    setSaving(section);
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    try {
      if (section !== 'f') {
        await fetch(`http://127.0.0.1:8000/api/users/${userId}`, {
          method: 'PUT', headers, body: JSON.stringify({ ...profile, address })
        });
      } else {
        await fetch(`http://127.0.0.1:8000/api/users/${userId}/farm`, {
          method: 'POST', headers, body: JSON.stringify(farm)
        });
      }
    } catch (_) {}
    setSaving(''); setSaved(section); setTimeout(() => setSaved(''), 2500);
    if (section === 'p') setEditingP(false);
    if (section === 'a') setEditingA(false);
    if (section === 'f') setEditingF(false);
  };

  const handleProfileChange = e => {
    const { name, value } = e.target;
    if (name === 'state') {
      setDistricts(options.state_districts?.[value] || []);
      setProfile(p => ({...p, state: value, district: ''}));
    } else {
      setProfile(p => ({...p, [name]: value}));
    }
  };

  const handleViewOrders = () => {
    if (onViewOrders) onViewOrders();
    else window.location.hash = '#/my-orders';
  };

  if (isLoading) return (
    <>
      <FontImport />
      <div className="profile-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(138,173,110,0.7)' }}>
          <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>Loading profile…</span>
        </div>
      </div>
    </>
  );

  const initials = profile.name
    ? profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AG';

  return (
    <>
      <FontImport />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-card { animation: fadeSlideUp 0.45s ease both; }
        .anim-card:nth-child(1) { animation-delay: 0s; }
        .anim-card:nth-child(2) { animation-delay: 0.08s; }
        .anim-card:nth-child(3) { animation-delay: 0.14s; }
        .anim-card:nth-child(4) { animation-delay: 0.2s; }
        .anim-card:nth-child(5) { animation-delay: 0.26s; }
      `}</style>

      {/* ── CHANGED: padding-top increased from 40px → 80px to clear fixed header ── */}
      <div className="profile-root" style={{ padding: '80px 20px 60px', position: 'relative' }}>
        <div style={{ position: 'relative', maxWidth: 660, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── HERO BANNER ── */}
          <div className="hero-banner anim-card">
            {/* decorative watermark */}
            <Wheat className="leaf-watermark" style={{ width: 160, height: 160 }} />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div className="avatar-ring">
                <div className="avatar-inner">
                  <span className="serif" style={{ color: 'var(--sage)', fontSize: 24, fontWeight: 700 }}>{initials}</span>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 160 }}>
                <p style={{ color: 'rgba(138,173,110,0.55)', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 4px' }}>AgriMart Account</p>
                <h1 className="serif" style={{ color: 'var(--cream)', fontSize: 28, fontWeight: 700, margin: '0 0 4px', lineHeight: 1.1 }}>
                  {profile.name || 'Your Profile'}
                </h1>
                {(profile.district || profile.state) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin style={{ width: 11, height: 11, color: 'rgba(212,168,83,0.55)' }} />
                    <span style={{ color: 'rgba(242,234,216,0.35)', fontSize: 12 }}>
                      {[profile.district, profile.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Farmer badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 13px',
                borderRadius: 20,
                background: 'rgba(212,168,83,0.1)',
                border: '1px solid rgba(212,168,83,0.22)',
                flexShrink: 0,
              }}>
                <Leaf style={{ width: 13, height: 13, color: 'var(--amber)' }} />
                <span style={{ color: 'rgba(212,168,83,0.85)', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em' }}>
                  {farm.farming_type || 'Farmer'}
                </span>
              </div>
            </div>
          </div>

          {/* ── ORDER STATS ── */}
          <div className="glass-card card-accent anim-card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Package style={{ width: 14, height: 14, color: 'var(--sage)' }} />
              <span style={{ color: 'rgba(138,173,110,0.65)', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Orders</span>
            </div>
            <OrderStats onViewOrders={handleViewOrders} />
          </div>

          {/* ── PERSONAL INFO ── */}
          <div className="glass-card card-accent anim-card" style={{ padding: '24px 28px' }}>
            <SectionHead icon={User} iconBg="linear-gradient(135deg,rgba(58,125,68,0.5),rgba(58,125,68,0.2))"
              title="Personal Information" subtitle="Name, location & contact" tag="Identity"
              editing={editingP} onEdit={() => startEdit('p')} onCancel={() => cancelEdit('p')} />
            {saved === 'p' && <SavedToast />}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
              <InputField label="Full Name" name="name" icon={<User style={{ width: 16, height: 16 }} />}
                value={profile.name} onChange={handleProfileChange} placeholder="e.g. Ramesh Kumar" disabled={!editingP} />
              <InputField label="Phone Number" name="phone" icon={<Phone style={{ width: 16, height: 16 }} />}
                value={profile.phone} onChange={() => {}} placeholder="+91 9876543210" readOnly />
              <SelectField label="State" name="state" icon={<MapPin style={{ width: 16, height: 16 }} />}
                value={profile.state} onChange={handleProfileChange} disabled={!editingP}>
                <option value="">Select State</option>
                {options.states.map(s => <option key={s} value={s}>{s}</option>)}
              </SelectField>
              <SelectField label="District" name="district" icon={<MapPin style={{ width: 16, height: 16 }} />}
                value={profile.district} onChange={handleProfileChange} disabled={!editingP || !profile.state}>
                <option value="">Select District</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </SelectField>
            </div>
            {editingP && <SaveBtn saving={saving === 'p'} onClick={() => handleSave('p')} />}
          </div>

          {/* ── DELIVERY ADDRESS ── */}
          <div className="glass-card card-accent anim-card" style={{ padding: '24px 28px' }}>
            <SectionHead icon={Home} iconBg="linear-gradient(135deg,rgba(122,184,200,0.4),rgba(122,184,200,0.15))"
              title="Delivery Address" subtitle="Where your orders will arrive"
              editing={editingA} onEdit={() => startEdit('a')} onCancel={() => cancelEdit('a')} />
            {saved === 'a' && <SavedToast />}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <InputField label="Street / Village" name="street" icon={<Home style={{ width: 16, height: 16 }} />}
                  value={address.street} onChange={e => setAddress(p => ({...p, street: e.target.value}))}
                  placeholder="e.g. 12 Main Road, Sector 4" disabled={!editingA} />
              </div>
              <InputField label="City / Town" name="city" icon={<Navigation style={{ width: 16, height: 16 }} />}
                value={address.city} onChange={e => setAddress(p => ({...p, city: e.target.value}))}
                placeholder="e.g. Bhubaneswar" disabled={!editingA} />
              <InputField label="PIN Code" name="pincode" icon={<Hash style={{ width: 16, height: 16 }} />}
                value={address.pincode} onChange={e => setAddress(p => ({...p, pincode: e.target.value}))}
                placeholder="751001" type="number" disabled={!editingA} />
              <div style={{ gridColumn: '1 / -1' }}>
                <InputField label="Landmark (optional)" name="landmark" icon={<MapPin style={{ width: 16, height: 16 }} />}
                  value={address.landmark} onChange={e => setAddress(p => ({...p, landmark: e.target.value}))}
                  placeholder="e.g. Near Post Office" disabled={!editingA} />
              </div>
            </div>

            {!editingA && (address.street || address.city || address.pincode) && (
              <div className="addr-preview">
                <MapPin style={{ width: 13, height: 13, color: 'rgba(122,184,200,0.5)', flexShrink: 0, marginTop: 1 }} />
                <p style={{ color: 'rgba(122,184,200,0.45)', fontSize: 12, margin: 0, lineHeight: 1.55 }}>
                  {[address.street, address.city, profile.district, profile.state, address.pincode].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
            {editingA && <SaveBtn saving={saving === 'a'} onClick={() => handleSave('a')} />}
          </div>

          {/* ── FARM DETAILS ── */}
          <div className="glass-card card-accent anim-card" style={{ padding: '24px 28px' }}>
            <SectionHead icon={Sprout} iconBg="linear-gradient(135deg,rgba(212,168,83,0.4),rgba(212,168,83,0.12))"
              title="Farm Details" subtitle="Your agricultural operation" tag="Farm"
              editing={editingF} onEdit={() => startEdit('f')} onCancel={() => cancelEdit('f')} />
            {saved === 'f' && <SavedToast />}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
              <InputField label="Total Land (acres)" name="total_land" icon={<Sprout style={{ width: 16, height: 16 }} />}
                value={farm.total_land} onChange={e => setFarm(p => ({...p, total_land: e.target.value}))}
                placeholder="e.g. 5.5" type="number" disabled={!editingF} />
              <SelectField label="Main Crop" name="main_crop" icon={<Leaf style={{ width: 16, height: 16 }} />}
                value={farm.main_crop} onChange={e => setFarm(p => ({...p, main_crop: e.target.value}))} disabled={!editingF}>
                <option value="">Select Crop</option>
                {options.crops.map(c => <option key={c} value={c}>{c}</option>)}
              </SelectField>

              <div style={{ gridColumn: '1 / -1' }}>
                <FieldLabel>Farming Type</FieldLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 2 }}>
                  {FARMING_TYPES.map(type => (
                    <button key={type} type="button" disabled={!editingF}
                      onClick={() => editingF && setFarm(p => ({...p, farming_type: type}))}
                      className={`farm-type-btn ${farm.farming_type === type ? 'active' : ''}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {editingF && <SaveBtn saving={saving === 'f'} onClick={() => handleSave('f')} />}
          </div>

          {/* Footer note */}
          <p style={{ textAlign: 'center', color: 'rgba(242,234,216,0.14)', fontSize: 11, margin: '4px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
            AgriMart · Your trusted farm-to-market partner
          </p>

        </div>
      </div>
    </>
  );
};

export default Profile;