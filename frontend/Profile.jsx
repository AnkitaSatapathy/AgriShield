import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Sprout, Save, Leaf, ChevronDown, CheckCircle } from 'lucide-react';

const FARMING_TYPES = ['Conventional', 'Organic', 'Mixed'];

const Profile = () => {
  const userId = localStorage.getItem('user_id') || 'user_1234';

  const [profile, setProfile] = useState({
    name: '', phone: '', state: '', district: '',
  });
  const [farm, setFarm] = useState({
    total_land: '', main_crop: '', farming_type: 'Conventional',
  });
  const [options, setOptions] = useState({ crops: [], states: [], state_districts: {} });
  const [districts, setDistricts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`http://127.0.0.1:8000/api/users/options/all`).then(r => r.ok ? r.json() : null),
      fetch(`http://127.0.0.1:8000/api/users/${userId}`).then(r => r.ok ? r.json() : null),
      fetch(`http://127.0.0.1:8000/api/users/${userId}/farm`).then(r => r.ok ? r.json() : null),
    ]).then(([opts, user, farmData]) => {
      if (opts) setOptions(opts);
      if (user) {
        setProfile({ name: user.name || '', phone: user.phone || '', state: user.state || '', district: user.district || '' });
        if (user.state && opts?.state_districts?.[user.state]) {
          setDistricts(opts.state_districts[user.state]);
        }
      }
      if (farmData) {
        setFarm({
          total_land: farmData.total_land || '',
          main_crop: farmData.main_crop || '',
          farming_type: farmData.farming_type || 'Conventional',
        });
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (name === 'state') {
      setDistricts(options.state_districts?.[value] || []);
      setProfile(prev => ({ ...prev, state: value, district: '' }));
    }
    setSaved(false);
  };

  const handleFarmChange = (e) => {
    setFarm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg('');
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    try {
      const [profileRes, farmRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/users/${userId}`, {
          method: 'PUT', headers,
          body: JSON.stringify(profile),
        }),
        fetch(`http://127.0.0.1:8000/api/users/${userId}/farm`, {
          method: 'POST', headers,
          body: JSON.stringify(farm),
        }),
      ]);
      if (profileRes.ok && farmRes.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrorMsg('Failed to save some profile data. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2d1a] via-[#1a4a2e] to-[#0d3b22]">
        <div className="flex items-center gap-3 text-emerald-400">
          <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span className="font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2d1a] via-[#1a4a2e] to-[#0d3b22] px-4 py-10 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-green-400/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              My Profile
            </h1>
            <p className="text-emerald-400/70 text-sm">Manage your personal and farm details</p>
          </div>
        </div>

        {/* Success / Error Toast */}
        {saved && (
          <div className="mb-6 px-5 py-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-300 font-medium">
            <CheckCircle className="w-5 h-5 shrink-0" />
            Profile saved successfully!
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 px-5 py-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-sm font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Personal Info Section */}
        <section className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 mb-5 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Personal Information</h2>
              <p className="text-white/40 text-xs">Your basic profile details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Full Name" name="name" icon={<User className="w-4 h-4" />}
              value={profile.name} onChange={handleProfileChange} placeholder="John Doe" />
            <InputField label="Phone Number" name="phone" icon={<Phone className="w-4 h-4" />}
              value={profile.phone} onChange={handleProfileChange} placeholder="+91 9876543210" readOnly />

            {/* State */}
            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold uppercase tracking-widest mb-2">State</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/50 pointer-events-none" />
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <select name="state" value={profile.state} onChange={handleProfileChange}
                  className="w-full border border-white/10 text-white rounded-xl pl-11 pr-10 py-3.5 text-sm focus:outline-none focus:border-emerald-500/60 appearance-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <option value="" className="bg-[#1a4a2e]">Select State</option>
                  {options.states.map(s => <option key={s} value={s} className="bg-[#1a4a2e]">{s}</option>)}
                </select>
              </div>
            </div>

            {/* District */}
            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold uppercase tracking-widest mb-2">District</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/50 pointer-events-none" />
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <select name="district" value={profile.district} onChange={handleProfileChange}
                  disabled={!profile.state}
                  className="w-full border border-white/10 text-white rounded-xl pl-11 pr-10 py-3.5 text-sm focus:outline-none focus:border-emerald-500/60 appearance-none transition-all disabled:opacity-40"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <option value="" className="bg-[#1a4a2e]">Select District</option>
                  {districts.map(d => <option key={d} value={d} className="bg-[#1a4a2e]">{d}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Farm Details Section */}
        <section className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 mb-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Farm Details</h2>
              <p className="text-white/40 text-xs">Tell us about your agricultural operation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Total Land Area (acres)" name="total_land" icon={<Sprout className="w-4 h-4" />}
              value={farm.total_land} onChange={handleFarmChange} placeholder="e.g. 5.5" type="number" />

            {/* Main Crop */}
            <div>
              <label className="block text-emerald-200/70 text-xs font-semibold uppercase tracking-widest mb-2">Main Crop</label>
              <div className="relative">
                <Leaf className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/50 pointer-events-none" />
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <select name="main_crop" value={farm.main_crop} onChange={handleFarmChange}
                  className="w-full border border-white/10 text-white rounded-xl pl-11 pr-10 py-3.5 text-sm focus:outline-none focus:border-emerald-500/60 appearance-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <option value="" className="bg-[#1a4a2e]">Select Crop</option>
                  {options.crops.map(c => <option key={c} value={c} className="bg-[#1a4a2e]">{c}</option>)}
                </select>
              </div>
            </div>

            {/* Farming Type */}
            <div className="sm:col-span-2">
              <label className="block text-emerald-200/70 text-xs font-semibold uppercase tracking-widest mb-3">Farming Type</label>
              <div className="grid grid-cols-3 gap-3">
                {FARMING_TYPES.map((type) => (
                  <button key={type} type="button"
                    onClick={() => { setFarm(prev => ({ ...prev, farming_type: type })); setSaved(false); }}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                      farm.farming_type === type
                        ? 'bg-green-500/20 border-green-500/60 text-green-300'
                        : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                    }`}
                    style={{ background: farm.farming_type === type ? undefined : 'rgba(255,255,255,0.04)' }}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-base tracking-wide flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 transition-all hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Saving...
            </span>
          ) : (
            <><Save className="w-5 h-5" /> Save Profile</>
          )}
        </button>
      </div>
    </div>
  );
};

// Reusable input field component
const InputField = ({ label, name, icon, value, onChange, placeholder, type = 'text', readOnly = false }) => (
  <div>
    <label className="block text-emerald-200/70 text-xs font-semibold uppercase tracking-widest mb-2">{label}</label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400/50">{icon}</span>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} readOnly={readOnly}
        className="w-full border border-white/10 text-white placeholder-white/25 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-emerald-500/60 transition-all read-only:opacity-50 read-only:cursor-not-allowed"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      />
    </div>
  </div>
);

export default Profile;