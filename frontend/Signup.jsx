import React, { useState, useRef, useEffect } from 'react';
import { User, Phone, Lock, ArrowRight, Leaf, Eye, EyeOff, ShoppingCart, Wheat, ArrowLeftRight } from 'lucide-react';
import { UserAvatar } from './Login';

// ─── Constants ────────────────────────────────────────────────────────────────

const USER_TYPES = [
  { value: 'buyer',  label: 'Buyer',  desc: 'Purchase farm products', Icon: ShoppingCart },
  { value: 'seller', label: 'Seller', desc: 'List & sell produce',     Icon: Wheat },
  { value: 'both',   label: 'Both',   desc: 'Buy and sell',            Icon: ArrowLeftRight },
];

// ─── Phone formatter ──────────────────────────────────────────────────────────

const formatPhone = (raw) => {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
};

const isValidPhone = (formatted) => formatted.replace(/\D/g, '').length === 10;

// ─── Password strength ────────────────────────────────────────────────────────

const getPasswordStrength = (pwd) => {
  if (!pwd) return null;
  const hasUpper   = /[A-Z]/.test(pwd);
  const hasLower   = /[a-z]/.test(pwd);
  const hasNumber  = /[0-9]/.test(pwd);
  const hasSymbol  = /[^A-Za-z0-9]/.test(pwd);
  const long       = pwd.length >= 8;
  const score = [hasUpper, hasLower, hasNumber, hasSymbol, long].filter(Boolean).length;
  if (pwd.length < 6) return { level: 'Weak',   color: '#ef4444', width: '25%' };
  if (score <= 2)     return { level: 'Weak',   color: '#ef4444', width: '30%' };
  if (score === 3)    return { level: 'Fair',   color: '#f59e0b', width: '55%' };
  if (score === 4)    return { level: 'Good',   color: '#10b981', width: '78%' };
  return               { level: 'Strong', color: '#22c55e', width: '100%' };
};

// ─── Validation ───────────────────────────────────────────────────────────────

const validateField = (name, value) => {
  switch (name) {
    case 'fullName': {
      if (!value.trim()) return 'Full name is required.';
      if (value.trim().length < 2) return 'Name must be at least 2 characters.';
      if (!/^[A-Za-z\s'.'-]+$/.test(value)) return 'Name can only contain letters and spaces.';
      return '';
    }
    case 'phone': {
      if (!value) return 'Phone number is required.';
      if (!isValidPhone(value)) return 'Enter a valid 10-digit phone number.';
      return '';
    }
    case 'password': {
      if (!value) return 'Password is required.';
      if (value.length < 6) return 'Password must be at least 6 characters.';
      return '';
    }
    default: return '';
  }
};

// ─── Signup component ─────────────────────────────────────────────────────────

const Signup = ({ onLoginClick }) => {
  const [formData, setFormData] = useState({
    fullName: '', phone: '', password: '', userType: 'buyer',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({ fullName: '', phone: '', password: '' });
  const [touched, setTouched]           = useState({ fullName: false, phone: false, password: false });

  const nameRef = useRef(null);

  useEffect(() => {
    // Autofocus full-name field on mount
    if (nameRef.current) nameRef.current.focus();
  }, []);

  // ── Field change handlers ──────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
    setErrorMsg('');
    if (touched.phone) {
      setFieldErrors((prev) => ({ ...prev, phone: validateField('phone', formatted) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const strength = getPasswordStrength(formData.password);

  const isFormValid =
    !validateField('fullName', formData.fullName) &&
    !validateField('phone',    formData.phone)    &&
    !validateField('password', formData.password);

  const hasName = formData.fullName.trim().length > 0;

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched and validate
    setTouched({ fullName: true, phone: true, password: true });
    const errors = {
      fullName: validateField('fullName', formData.fullName),
      phone:    validateField('phone',    formData.phone),
      password: validateField('password', formData.password),
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setIsLoading(true);
    setErrorMsg('');

    // Build phone for API: strip spaces, prepend +91
    const rawPhone   = formData.phone.replace(/\s/g, '');
    const phoneForApi = rawPhone.startsWith('+91') ? rawPhone : `+91${rawPhone}`;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, phone: phoneForApi }),
      });
      const data = await response.json();
      if (response.ok) {
        if (onLoginClick) onLoginClick({ signupSuccess: true, name: formData.fullName });
      } else {
        setErrorMsg(data.detail || 'Failed to create account. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Is the backend running on port 8000?');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Field style helper ─────────────────────────────────────────────────────

  const inputClass = (name) =>
    `w-full border text-white placeholder-white/25 rounded-xl py-3.5 text-sm focus:outline-none transition-all ${
      touched[name] && fieldErrors[name]
        ? 'border-red-500/60 bg-red-500/5 focus:border-red-500/80'
        : 'border-white/10 focus:border-emerald-500/60 focus:bg-white/10'
    }`;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2d1a] via-[#1a4a2e] to-[#0d3b22] px-4 py-10 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-green-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative w-full max-w-[460px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/30 mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            AgriShield
          </h1>
          <p className="text-emerald-400/80 text-sm font-medium mt-1 tracking-widest uppercase">Join the Community</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">

          {/* ── Live avatar preview ── */}
          <div className="flex items-center gap-4 mb-7">
            <div className="relative">
              <UserAvatar name={formData.fullName || '?'} size={64} />
              {hasName && (
                <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-emerald-400 pointer-events-none" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white leading-tight">
                {hasName ? formData.fullName : 'Create Account'}
              </h2>
              <p className="text-emerald-300/60 text-sm mt-0.5">
                {hasName ? 'This will be your profile photo' : 'Fill in your details to get started'}
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 px-4 py-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-sm font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Full Name */}
            <div>
              <label className="block text-emerald-200/80 text-xs font-semibold uppercase tracking-widest mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/60" />
                <input
                  ref={nameRef}
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Barsha Panda"
                  required
                  className={`${inputClass('fullName')} pl-11 pr-4`}
                  style={!(touched.fullName && fieldErrors.fullName) ? { background: 'rgba(255,255,255,0.06)' } : {}}
                />
              </div>
              {touched.fullName && fieldErrors.fullName && (
                <p className="mt-1.5 text-red-400 text-xs flex items-center gap-1.5">
                  <span>❌</span> {fieldErrors.fullName}
                </p>
              )}
            </div>

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
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onBlur={handleBlur}
                  placeholder="98765 43210"
                  required
                  className={`${inputClass('phone')} pl-[4.5rem] pr-4`}
                  style={!(touched.phone && fieldErrors.phone) ? { background: 'rgba(255,255,255,0.06)' } : {}}
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
              <label className="block text-emerald-200/80 text-xs font-semibold uppercase tracking-widest mb-2">
                Password
              </label>
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
                  className={`${inputClass('password')} pl-11 pr-12`}
                  style={!(touched.password && fieldErrors.password) ? { background: 'rgba(255,255,255,0.06)' } : {}}
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

              {/* Password strength indicator */}
              {formData.password && strength && (
                <div className="mt-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/40">Password strength</span>
                    <span className="text-xs font-semibold" style={{ color: strength.color }}>
                      {strength.level}
                    </span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: strength.width, background: strength.color }}
                    />
                  </div>
                </div>
              )}

              {touched.password && fieldErrors.password && (
                <p className="mt-1.5 text-red-400 text-xs flex items-center gap-1.5">
                  <span>❌</span> {fieldErrors.password}
                </p>
              )}
            </div>

            {/* User Type */}
            <div>
              <label className="block text-emerald-200/80 text-xs font-semibold uppercase tracking-widest mb-3">
                I want to
              </label>
              <div className="grid grid-cols-3 gap-2">
                {USER_TYPES.map(({ value, label, desc, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, userType: value }))}
                    className={`py-3 px-2 rounded-xl border text-center transition-all active:scale-[0.97] ${
                      formData.userType === value
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                        : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                    }`}
                    style={formData.userType !== value ? { background: 'rgba(255,255,255,0.04)' } : {}}
                  >
                    <Icon
                      className={`w-4 h-4 mx-auto mb-1.5 ${
                        formData.userType === value ? 'text-emerald-400' : 'text-white/30'
                      }`}
                    />
                    <div className="font-bold text-sm">{label}</div>
                    <div className="text-xs opacity-70 mt-0.5 leading-tight">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full mt-2 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-base tracking-wide flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-green-500 transition-all hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/8 text-center">
            <p className="text-white/50 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => onLoginClick && onLoginClick()}
                className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;