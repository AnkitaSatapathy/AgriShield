import React, { useState, useRef, useEffect } from 'react';
import { Phone, Lock, ArrowRight, Leaf, Eye, EyeOff } from 'lucide-react';

// ─── Avatar helpers (exported so App.jsx / navbar can reuse) ──────────────────

const AVATAR_GRADIENTS = [
  ['#10b981', '#065f46'], // emerald
  ['#3b82f6', '#1e40af'], // blue
  ['#f59e0b', '#92400e'], // amber
  ['#ec4899', '#9d174d'], // pink
  ['#8b5cf6', '#5b21b6'], // violet
  ['#14b8a6', '#115e59'], // teal
  ['#f97316', '#9a3412'], // orange
];

export const getAvatarGradient = (seed = '') => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

export const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * UserAvatar — default profile photo generated from the user's name initials.
 * Props:
 *   name    {string}  Full name (e.g. "Barsha Panda")
 *   size    {number}  Diameter in px (default 48)
 *   className {string}
 */
export const UserAvatar = ({ name = '', size = 48, className = '' }) => {
  const [from, to] = getAvatarGradient(name || '?');
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold select-none shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        fontSize: Math.round(size * 0.36),
        color: '#fff',
        letterSpacing: '0.04em',
        boxShadow: `0 0 0 2.5px rgba(255,255,255,0.15), 0 4px 16px rgba(0,0,0,0.35)`,
        fontFamily: "'Playfair Display', Georgia, serif",
      }}
    >
      {getInitials(name)}
    </div>
  );
};

// ─── Phone formatter ──────────────────────────────────────────────────────────

const formatPhone = (raw) => {
  // Strip everything except digits
  const digits = raw.replace(/\D/g, '');
  // Limit to 10 digits
  const trimmed = digits.slice(0, 10);
  if (trimmed.length === 0) return '';
  if (trimmed.length <= 5) return trimmed;
  return `${trimmed.slice(0, 5)} ${trimmed.slice(5)}`;
};

const isValidPhone = (formatted) => {
  const digits = formatted.replace(/\D/g, '');
  return digits.length === 10;
};

// ─── Login component ──────────────────────────────────────────────────────────

const Login = ({ onSignupClick, onLoginSuccess, signupToast }) => {
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ phone: '', password: '' });
  const [touched, setTouched] = useState({ phone: false, password: false });
  const [toast, setToast] = useState(signupToast || null);

  const phoneRef = useRef(null);

  useEffect(() => {
    // Autofocus phone field on mount
    if (phoneRef.current) phoneRef.current.focus();
  }, []);

  useEffect(() => {
    if (signupToast) {
      setToast(signupToast);
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [signupToast]);

  const validateField = (name, value) => {
    if (name === 'phone') {
      if (!value) return 'Phone number is required.';
      if (!isValidPhone(value)) return 'Enter a valid 10-digit phone number.';
    }
    if (name === 'password') {
      if (!value) return 'Password is required.';
      if (value.length < 6) return 'Password must be at least 6 characters.';
    }
    return '';
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
    setErrorMsg('');
    if (touched.phone) {
      setFieldErrors((prev) => ({ ...prev, phone: validateField('phone', formatted) }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMsg('');
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const isFormValid = isValidPhone(formData.phone) && formData.password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mark all touched
    setTouched({ phone: true, password: true });
    const phoneErr = validateField('phone', formData.phone);
    const passErr = validateField('password', formData.password);
    setFieldErrors({ phone: phoneErr, password: passErr });
    if (phoneErr || passErr) return;

    setIsLoading(true);
    setErrorMsg('');

    // Build the phone value sent to backend: strip spaces, prepend +91
    const rawPhone = formData.phone.replace(/\s/g, '');
    const phoneForApi = rawPhone.startsWith('+91') ? rawPhone : `+91${rawPhone}`;

    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneForApi, password: formData.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.detail || 'Invalid credentials. Please try again.');
        return;
      }

      localStorage.setItem('token',    data.token);
      localStorage.setItem('user_id',  data.user_id);

      try {
        const profileRes = await fetch(`http://127.0.0.1:8000/api/users/${data.user_id}`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          const name = profile.name || '';
          localStorage.setItem('user_name', name);
          data.name = name;
        }
      } catch {
        // Non-fatal
      }

      if (onLoginSuccess) onLoginSuccess(data);
    } catch {
      setErrorMsg('Network error. Is the backend running on port 8000?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2d1a] via-[#1a4a2e] to-[#0d3b22] px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-green-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Signup success toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-emerald-600/90 backdrop-blur-md border border-emerald-400/30 text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-emerald-900/40 animate-[fadeInDown_0.4s_ease]">
          <span className="text-lg">✅</span>
          <div>
            <div className="font-semibold text-sm">Account created successfully!</div>
            <div className="text-emerald-200/80 text-xs">Please sign in to continue.</div>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/30 mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            AgriShield
          </h1>
          <p className="text-emerald-400/80 text-sm font-medium mt-1 tracking-widest uppercase">Farm to Market</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-emerald-300/70 text-sm mb-7">Sign in to continue to your dashboard</p>

          {errorMsg && (
            <div className="mb-5 px-4 py-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-sm font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Phone */}
            <div>
              <label className="block text-emerald-200/80 text-xs font-semibold uppercase tracking-widest mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/60" />
                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-emerald-400/60 text-sm font-medium pointer-events-none select-none">
                  +91
                </span>
                <input
                  ref={phoneRef}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onBlur={handleBlur}
                  placeholder="98765 43210"
                  required
                  className={`w-full border text-white placeholder-white/25 rounded-xl pl-[4.5rem] pr-4 py-3.5 text-sm focus:outline-none transition-all ${
                    touched.phone && fieldErrors.phone
                      ? 'border-red-500/60 bg-red-500/5 focus:border-red-500/80'
                      : 'border-white/10 focus:border-emerald-500/60 focus:bg-white/10'
                  }`}
                  style={{ background: touched.phone && fieldErrors.phone ? undefined : 'rgba(255,255,255,0.06)' }}
                />
              </div>
              {touched.phone && fieldErrors.phone && (
                <p className="mt-1.5 text-red-400 text-xs flex items-center gap-1.5">
                  <span>❌</span> {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-emerald-200/80 text-xs font-semibold uppercase tracking-widest">
                  Password
                </label>
                <button
                  type="button"
                  className="text-emerald-400/70 text-xs hover:text-emerald-300 transition-colors"
                  onClick={() => {/* TODO: hook up forgot-password flow */}}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  required
                  className={`w-full border text-white placeholder-white/25 rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none transition-all ${
                    touched.password && fieldErrors.password
                      ? 'border-red-500/60 bg-red-500/5 focus:border-red-500/80'
                      : 'border-white/10 focus:border-emerald-500/60 focus:bg-white/10'
                  }`}
                  style={{ background: touched.password && fieldErrors.password ? undefined : 'rgba(255,255,255,0.06)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400/60 hover:text-emerald-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {touched.password && fieldErrors.password && (
                <p className="mt-1.5 text-red-400 text-xs flex items-center gap-1.5">
                  <span>❌</span> {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-base tracking-wide flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 transition-all hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/8 text-center">
            <p className="text-white/50 text-sm">
              Don't have an account?{' '}
              <button onClick={onSignupClick} className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translate(-50%, -16px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

export default Login;