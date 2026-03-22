import React, { useState, useRef, useEffect } from 'react';
import { Phone, Lock, ArrowRight, Leaf, Eye, EyeOff } from 'lucide-react';

// ─── Avatar helpers (exported so App.jsx / navbar can reuse) ──────────────────

const AVATAR_GRADIENTS = [
  ['#10b981', '#065f46'],
  ['#3b82f6', '#1e40af'],
  ['#f59e0b', '#92400e'],
  ['#ec4899', '#9d174d'],
  ['#8b5cf6', '#5b21b6'],
  ['#14b8a6', '#115e59'],
  ['#f97316', '#9a3412'],
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
        fontFamily: "'Cormorant Garamond', Georgia, serif",
      }}
    >
      {getInitials(name)}
    </div>
  );
};

// ─── Phone formatter ──────────────────────────────────────────────────────────

const formatPhone = (raw) => {
  const digits = raw.replace(/\D/g, '');
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
  const [mounted, setMounted] = useState(false);

  const phoneRef = useRef(null);

  useEffect(() => {
    setMounted(true);
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
    setTouched({ phone: true, password: true });
    const phoneErr = validateField('phone', formData.phone);
    const passErr = validateField('password', formData.password);
    setFieldErrors({ phone: phoneErr, password: passErr });
    if (phoneErr || passErr) return;

    setIsLoading(true);
    setErrorMsg('');

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

      localStorage.setItem('token', data.token);
      localStorage.setItem('user_id', data.user_id);

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .login-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          /* ── gap below any fixed header ── */
          padding-top: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-inline: 1rem;
          padding-bottom: 2rem;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%,  rgba(16,185,129,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 100%, rgba(6,95,70,0.22)   0%, transparent 55%),
            linear-gradient(160deg, #071a0f 0%, #0a1f12 45%, #061510 100%);
        }

        /* ── Animated grain overlay ── */
        .login-root::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.045;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* ── Floating bokeh orbs ── */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          animation: drift 14s ease-in-out infinite alternate;
        }
        .orb-1 { width: 420px; height: 420px; background: rgba(16,185,129,0.12); top: -15%; left: -12%; animation-delay: 0s; }
        .orb-2 { width: 320px; height: 320px; background: rgba(5,150,105,0.09);  bottom: -10%; right: -8%; animation-delay: -5s; }
        .orb-3 { width: 220px; height: 220px; background: rgba(52,211,153,0.07);  top: 60%; left: 65%; animation-delay: -9s; }

        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, -40px) scale(1.08); }
        }

        /* ── Subtle grid ── */
        .login-grid {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(52,211,153,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 0%, transparent 75%);
        }

        /* ── Card ── */
        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.022) 100%);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 28px;
          padding: 40px 40px 36px;
          box-shadow:
            0 0 0 1px rgba(16,185,129,0.08) inset,
            0 32px 80px rgba(0,0,0,0.55),
            0 4px 24px rgba(0,0,0,0.35);
          opacity: 0;
          transform: translateY(24px);
          animation: cardIn 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
        }

        /* top shimmer line */
        .login-card::before {
          content: '';
          position: absolute;
          top: 0; left: 32px; right: 32px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(52,211,153,0.5), transparent);
        }

        @keyframes cardIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Logo area ── */
        .logo-icon {
          width: 60px; height: 60px;
          border-radius: 18px;
          background: linear-gradient(135deg, #10b981, #059669);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 28px rgba(16,185,129,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset;
          margin: 0 auto 18px;
          animation: pulse-ring 3s ease-in-out infinite;
        }

        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 8px 28px rgba(16,185,129,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset; }
          50%       { box-shadow: 0 8px 40px rgba(16,185,129,0.65), 0 0 0 1px rgba(255,255,255,0.15) inset; }
        }

        .logo-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 2.1rem;
          font-weight: 700;
          color: #f0fdf4;
          letter-spacing: -0.02em;
          line-height: 1;
          margin: 0;
          text-align: center;
        }

        .logo-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.68rem;
          font-weight: 600;
          color: rgba(52,211,153,0.55);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          text-align: center;
          margin: 6px 0 0;
        }

        /* ── Divider ── */
        .card-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          margin: 28px 0 26px;
        }

        /* ── Heading ── */
        .card-heading {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.65rem;
          font-weight: 600;
          color: #ecfdf5;
          margin: 0 0 6px;
          letter-spacing: -0.01em;
        }

        .card-sub {
          font-size: 0.82rem;
          color: rgba(167,243,208,0.45);
          margin: 0 0 26px;
          font-weight: 400;
        }

        /* ── Error banner ── */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 15px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 14px;
          color: #fca5a5;
          font-size: 0.82rem;
          font-weight: 500;
          margin-bottom: 20px;
        }
        .error-dot { width: 6px; height: 6px; border-radius: 50%; background: #f87171; flex-shrink: 0; }

        /* ── Field label ── */
        .field-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 9px;
        }
        .field-label-text {
          font-size: 0.68rem;
          font-weight: 700;
          color: rgba(167,243,208,0.5);
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        /* ── Input wrapper ── */
        .input-wrap { position: relative; }

        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 13px 14px;
          color: #ecfdf5;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 400;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.18); }
        .field-input:focus {
          border-color: rgba(52,211,153,0.45);
          background: rgba(16,185,129,0.07);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        .field-input.has-error {
          border-color: rgba(239,68,68,0.5);
          background: rgba(239,68,68,0.05);
        }
        .field-input.has-error:focus {
          border-color: rgba(239,68,68,0.7);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }

        /* phone prefix */
        .phone-input { padding-left: 5.2rem; }
        .phone-prefix {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          display: flex; align-items: center;
          padding: 0 14px;
          gap: 8px;
          pointer-events: none;
          border-right: 1px solid rgba(255,255,255,0.07);
        }
        .phone-prefix-text {
          font-size: 0.88rem;
          color: rgba(167,243,208,0.55);
          font-weight: 600;
        }

        /* password suffix */
        .pw-input { padding-left: 44px; padding-right: 46px; }
        .input-icon-left {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(52,211,153,0.4);
          pointer-events: none;
          display: flex;
        }
        .pw-toggle {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(52,211,153,0.4);
          background: none; border: none; cursor: pointer; padding: 2px;
          display: flex; align-items: center;
          transition: color 0.15s;
        }
        .pw-toggle:hover { color: rgba(52,211,153,0.75); }

        /* ── Field error ── */
        .field-error {
          display: flex; align-items: center; gap: 5px;
          margin-top: 7px;
          font-size: 0.74rem;
          color: #fca5a5;
        }

        /* ── Forgot link ── */
        .forgot-link {
          font-size: 0.74rem;
          color: rgba(52,211,153,0.5);
          background: none; border: none; cursor: pointer;
          padding: 0;
          transition: color 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .forgot-link:hover { color: rgba(52,211,153,0.85); }

        /* ── Submit button ── */
        .submit-btn {
          width: 100%;
          margin-top: 24px;
          padding: 14px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ecfdf5;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.92rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 6px 24px rgba(16,185,129,0.35);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          border-radius: inherit;
          pointer-events: none;
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 10px 32px rgba(16,185,129,0.5);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Footer ── */
        .card-footer {
          margin-top: 24px;
          padding-top: 22px;
          border-top: 1px solid rgba(255,255,255,0.06);
          text-align: center;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.35);
        }
        .signup-link {
          color: #34d399;
          font-weight: 600;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: inherit;
          transition: color 0.15s;
          padding: 0;
        }
        .signup-link:hover { color: #6ee7b7; }

        /* ── Toast ── */
        .success-toast {
          position: fixed;
          top: 88px; /* clears header + small gap */
          left: 50%; transform: translateX(-50%);
          z-index: 9999;
          display: flex; align-items: center; gap: 12px;
          background: rgba(6,78,59,0.92);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(52,211,153,0.3);
          color: #ecfdf5;
          padding: 14px 20px;
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.45);
          white-space: nowrap;
          animation: toastIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translate(-50%, -14px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }

        /* ── Spinner ── */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.9s linear infinite; }

        /* ── Field stagger ── */
        .field-row {
          opacity: 0;
          transform: translateY(12px);
          animation: fieldIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .field-row:nth-child(1) { animation-delay: 0.25s; }
        .field-row:nth-child(2) { animation-delay: 0.35s; }
        @keyframes fieldIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Decorative leaf watermark ── */
        .leaf-watermark {
          position: absolute;
          bottom: -30px; right: -24px;
          opacity: 0.035;
          pointer-events: none;
          z-index: 0;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .login-card { padding: 32px 24px 28px; border-radius: 22px; }
          .logo-title { font-size: 1.8rem; }
        }
      `}</style>

      <div className="login-root">
        {/* Decorative elements */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="login-grid" />

        {/* Toast */}
        {toast && (
          <div className="success-toast">
            <span style={{ fontSize: '1.1rem' }}>✅</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Account created!</div>
              <div style={{ fontSize: '0.74rem', color: 'rgba(167,243,208,0.7)', marginTop: 2 }}>Please sign in to continue.</div>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="login-card">
          {/* Leaf watermark */}
          <Leaf className="leaf-watermark" style={{ width: 140, height: 140 }} />

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="logo-icon">
              <Leaf style={{ width: 28, height: 28, color: '#fff' }} />
            </div>
            <h1 className="logo-title">AgriShield</h1>
            <p className="logo-sub">Farm · to · Market</p>
          </div>

          <div className="card-divider" />

          {/* Heading */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="card-heading">Welcome back</h2>
            <p className="card-sub">Sign in to continue to your dashboard</p>

            {/* Error */}
            {errorMsg && (
              <div className="error-banner">
                <span className="error-dot" />
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Phone */}
              <div className="field-row">
                <div className="field-label">
                  <span className="field-label-text">Phone Number</span>
                </div>
                <div className="input-wrap">
                  <div className="phone-prefix">
                    <Phone style={{ width: 14, height: 14, color: 'rgba(52,211,153,0.4)' }} />
                    <span className="phone-prefix-text">+91</span>
                  </div>
                  <input
                    ref={phoneRef}
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onBlur={handleBlur}
                    placeholder="98765 43210"
                    required
                    className={`field-input phone-input${touched.phone && fieldErrors.phone ? ' has-error' : ''}`}
                  />
                </div>
                {touched.phone && fieldErrors.phone && (
                  <div className="field-error">
                    <span>❌</span> {fieldErrors.phone}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="field-row">
                <div className="field-label">
                  <span className="field-label-text">Password</span>
                  <button type="button" className="forgot-link">Forgot password?</button>
                </div>
                <div className="input-wrap">
                  <span className="input-icon-left">
                    <Lock style={{ width: 15, height: 15 }} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    required
                    className={`field-input pw-input${touched.password && fieldErrors.password ? ' has-error' : ''}`}
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword
                      ? <EyeOff style={{ width: 15, height: 15 }} />
                      : <Eye style={{ width: 15, height: 15 }} />
                    }
                  </button>
                </div>
                {touched.password && fieldErrors.password && (
                  <div className="field-error">
                    <span>❌</span> {fieldErrors.password}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={isLoading} className="submit-btn">
                {isLoading ? (
                  <>
                    <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="card-footer">
              Don't have an account?{' '}
              <button onClick={onSignupClick} className="signup-link">Create one</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;