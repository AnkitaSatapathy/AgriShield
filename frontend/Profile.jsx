import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  User, Phone, MapPin, Sprout, Save, Leaf, ChevronDown, CheckCircle,
  Package, Edit3, X, Home, Hash, Navigation,
  ShoppingBag, Loader2, ArrowRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────── */
const FARMING_TYPES = ['Conventional', 'Organic', 'Mixed'];

/* ─────────────────────────────────────────────────────────────────────
   SHARED PRIMITIVES
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
   ORDER STATS — fetches real data from API
───────────────────────────────────────────────────────────────────── */
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

  return (
    <div className="space-y-3">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Orders', value: loading ? '…' : stats.total,                                   icon: Package     },
          { label: 'Delivered',    value: loading ? '…' : stats.delivered,                               icon: CheckCircle },
          { label: 'Total Spent',  value: loading ? '…' : `₹${Number(stats.spent).toLocaleString('en-IN')}`, icon: ShoppingBag },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="text-center rounded-xl p-3.5 border border-white/[0.06]"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <Icon className="w-4 h-4 text-emerald-400/60 mx-auto mb-1.5" />
            <div className="text-white font-bold text-base leading-none">{value}</div>
            <div className="text-white/25 text-[10px] mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* View Orders button */}
      <button
        onClick={onViewOrders}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-emerald-500/25 hover:border-emerald-500/50 transition-all group"
        style={{ background: 'rgba(52,211,153,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(52,211,153,0.15)' }}>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-left">
            <p className="text-emerald-300 font-bold text-sm">View My Orders</p>
            <p className="text-white/30 text-[10px] mt-0.5">Track deliveries & order history</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-emerald-400/50 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   MAIN PROFILE COMPONENT
───────────────────────────────────────────────────────────────────── */
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

  const [saving,    setSaving]    = useState('');
  const [saved,     setSaved]     = useState('');
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
          method: 'PUT', headers,
          body: JSON.stringify({ ...profile, address })
        });
      } else {
        await fetch(`http://127.0.0.1:8000/api/users/${userId}/farm`, {
          method: 'POST', headers,
          body: JSON.stringify(farm)
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

  // Handle "View My Orders" — use prop if provided (App.jsx mode), else hash navigation
  const handleViewOrders = () => {
    if (onViewOrders) {
      onViewOrders();
    } else {
      window.location.hash = '#/my-orders';
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#09201a,#0d2e1a,#091e12)' }}>
      <div className="flex items-center gap-3 text-emerald-400/80">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading profile…</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #09201a 0%, #0d2e1a 50%, #091e12 100%)' }}>

      {/* Background atmosphere */}
      <div className="absolute top-0 left-[-20%] w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] right-[-20%] w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(rgba(74,222,128,1) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

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

        {/* ── ORDER STATS + VIEW ORDERS ── */}
        <OrderStats onViewOrders={handleViewOrders} />

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
  );
};

export default Profile;