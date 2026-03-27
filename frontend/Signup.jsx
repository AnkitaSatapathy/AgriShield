import React, { useState, useRef, useEffect } from 'react';
import { User, Phone, Lock, ArrowRight, Leaf, Eye, EyeOff } from 'lucide-react';
import { UserAvatar } from './Login';

// ─── Custom Exception Classes ─────────────────────────────────────────────────

class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

class NetworkError extends AppError {
  constructor(message = 'Network error. Is the backend running on port 8000?') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'An account with this phone number already exists.') {
    super(message, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

class ServerError extends AppError {
  constructor(message = 'Something went wrong on our end. Please try again later.') {
    super(message, 'SERVER_ERROR');
    this.name = 'ServerError';
  }
}

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
  const hasUpper  = /[A-Z]/.test(pwd);
  const hasLower  = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
  const long      = pwd.length >= 8;
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
  const [formData, setFormData] = useState({ fullName: '', phone: '', password: '' });
  const [isLoading, setIsLoading]   = useState(false);
  const [errorMsg, setErrorMsg]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({ fullName: '', phone: '', password: '' });
  const [touched, setTouched]           = useState({ fullName: false, phone: false, password: false });

  const nameRef = useRef(null);

  useEffect(() => {
    if (nameRef.current) nameRef.current.focus();
  }, []);

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

  const strength  = getPasswordStrength(formData.password);
  const hasName   = formData.fullName.trim().length > 0;
  const isFormValid =
    !validateField('fullName', formData.fullName) &&
    !validateField('phone',    formData.phone)    &&
    !validateField('password', formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    const rawPhone    = formData.phone.replace(/\s/g, '');
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
        if (response.status === 409 || response.status === 422) {
          throw new ConflictError(data.detail || 'An account with this phone number already exists.');
        } else if (response.status >= 500) {
          throw new ServerError(data.detail || 'Something went wrong on our end. Please try again later.');
        } else {
          throw new AppError(data.detail || 'Failed to create account. Please try again.', 'REQUEST_ERROR');
        }
      }
    } catch (err) {
      if (err instanceof AppError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(new NetworkError().message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .signup-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          padding-top: 80px;
          padding-bottom: 2.5rem;
          padding-inline: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(ellipse 70% 50% at 10% 0%,  rgba(16,185,129,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 100%, rgba(6,95,70,0.22)   0%, transparent 55%),
            linear-gradient(160deg, #071a0f 0%, #0a1f12 45%, #061510 100%);
        }

        /* Grain overlay */
        .signup-root::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.045;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* Bokeh orbs */
        .su-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          animation: su-drift 14s ease-in-out infinite alternate;
        }
        .su-orb-1 { width: 420px; height: 420px; background: rgba(16,185,129,0.12); top: -15%; left: -12%; animation-delay: 0s; }
        .su-orb-2 { width: 320px; height: 320px; background: rgba(5,150,105,0.09);  bottom: -10%; right: -8%; animation-delay: -5s; }
        .su-orb-3 { width: 220px; height: 220px; background: rgba(52,211,153,0.07);  top: 55%; left: 68%; animation-delay: -9s; }
        @keyframes su-drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, -40px) scale(1.08); }
        }

        /* Grid */
        .su-grid {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(52,211,153,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 0%, transparent 75%);
        }

        /* Card */
        .su-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 460px;
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
          animation: su-cardIn 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
        }
        .su-card::before {
          content: '';
          position: absolute;
          top: 0; left: 32px; right: 32px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(52,211,153,0.5), transparent);
        }
        @keyframes su-cardIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Logo */
        .su-logo-icon {
          width: 60px; height: 60px;
          border-radius: 18px;
          background: linear-gradient(135deg, #10b981, #059669);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 28px rgba(16,185,129,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset;
          margin: 0 auto 18px;
          animation: su-pulse 3s ease-in-out infinite;
        }
        @keyframes su-pulse {
          0%,100% { box-shadow: 0 8px 28px rgba(16,185,129,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset; }
          50%      { box-shadow: 0 8px 40px rgba(16,185,129,0.65), 0 0 0 1px rgba(255,255,255,0.15) inset; }
        }

        .su-logo-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 2.1rem; font-weight: 700;
          color: #f0fdf4;
          letter-spacing: -0.02em; line-height: 1;
          margin: 0; text-align: center;
        }
        .su-logo-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.68rem; font-weight: 600;
          color: rgba(52,211,153,0.55);
          letter-spacing: 0.22em; text-transform: uppercase;
          text-align: center; margin: 6px 0 0;
        }

        /* Divider */
        .su-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          margin: 24px 0 22px;
        }

        /* Avatar preview */
        .su-avatar-row {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 22px;
          opacity: 0; transform: translateY(10px);
          animation: su-fieldIn 0.5s cubic-bezier(0.22,1,0.36,1) 0.2s forwards;
        }
        .su-avatar-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.45rem; font-weight: 600;
          color: #ecfdf5; line-height: 1.1; margin: 0;
        }
        .su-avatar-hint {
          font-size: 0.78rem; color: rgba(167,243,208,0.45);
          margin: 5px 0 0; font-weight: 400;
        }
        .su-ping {
          position: absolute; inset: 0; border-radius: 50%;
          background: rgba(52,211,153,0.2);
          animation: su-ping 1.8s ease-in-out infinite;
        }
        @keyframes su-ping {
          0%   { transform: scale(1);    opacity: 0.4; }
          70%  { transform: scale(1.25); opacity: 0;   }
          100% { transform: scale(1.25); opacity: 0;   }
        }

        /* Error banner */
        .su-error {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 15px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 14px;
          color: #fca5a5; font-size: 0.82rem; font-weight: 500;
          margin-bottom: 20px;
        }
        .su-error-dot { width: 6px; height: 6px; border-radius: 50%; background: #f87171; flex-shrink: 0; }

        /* Field label */
        .su-label {
          display: block; margin-bottom: 9px;
          font-size: 0.68rem; font-weight: 700;
          color: rgba(167,243,208,0.5);
          letter-spacing: 0.14em; text-transform: uppercase;
        }

        /* Input */
        .su-input-wrap { position: relative; }
        .su-field-input {
          width: 100%;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 13px 14px;
          color: #ecfdf5;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 400;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .su-field-input::placeholder { color: rgba(255,255,255,0.18); }
        .su-field-input:focus {
          border-color: rgba(52,211,153,0.45);
          background: rgba(16,185,129,0.07);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        .su-field-input.has-error { border-color: rgba(239,68,68,0.5); background: rgba(239,68,68,0.05); }
        .su-field-input.has-error:focus { border-color: rgba(239,68,68,0.7); box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }

        /* name field */
        .su-name-input { padding-left: 44px; }

        /* phone field */
        .su-phone-input { padding-left: 5.2rem; }
        .su-phone-prefix {
          position: absolute; left: 0; top: 0; bottom: 0;
          display: flex; align-items: center; padding: 0 14px; gap: 8px;
          pointer-events: none;
          border-right: 1px solid rgba(255,255,255,0.07);
        }
        .su-phone-prefix-text { font-size: 0.88rem; color: rgba(167,243,208,0.55); font-weight: 600; }

        /* password field */
        .su-pw-input { padding-left: 44px; padding-right: 46px; }
        .su-icon-left {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(52,211,153,0.4); pointer-events: none; display: flex;
        }
        .su-pw-toggle {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(52,211,153,0.4);
          background: none; border: none; cursor: pointer; padding: 2px;
          display: flex; align-items: center; transition: color 0.15s;
        }
        .su-pw-toggle:hover { color: rgba(52,211,153,0.75); }

        /* Field error */
        .su-field-error {
          display: flex; align-items: center; gap: 5px;
          margin-top: 7px; font-size: 0.74rem; color: #fca5a5;
        }

        /* Strength bar */
        .su-strength-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 10px; margin-bottom: 5px;
        }
        .su-strength-label { font-size: 0.72rem; color: rgba(255,255,255,0.35); }
        .su-strength-level { font-size: 0.72rem; font-weight: 700; }
        .su-strength-track {
          width: 100%; height: 3px; border-radius: 99px;
          background: rgba(255,255,255,0.08); overflow: hidden;
        }
        .su-strength-fill {
          height: 100%; border-radius: 99px;
          transition: width 0.5s cubic-bezier(0.22,1,0.36,1), background 0.4s;
        }

        /* Submit */
        .su-submit-btn {
          width: 100%; margin-top: 24px; padding: 14px;
          border-radius: 14px; border: none;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ecfdf5;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.92rem; font-weight: 700; letter-spacing: 0.04em;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 6px 24px rgba(16,185,129,0.35);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          position: relative; overflow: hidden;
        }
        .su-submit-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          border-radius: inherit; pointer-events: none;
        }
        .su-submit-btn:hover:not(:disabled) {
          opacity: 0.92; transform: translateY(-1px);
          box-shadow: 0 10px 32px rgba(16,185,129,0.5);
        }
        .su-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .su-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Footer */
        .su-footer {
          margin-top: 24px; padding-top: 22px;
          border-top: 1px solid rgba(255,255,255,0.06);
          text-align: center;
          font-size: 0.82rem; color: rgba(255,255,255,0.35);
        }
        .su-signin-link {
          color: #34d399; font-weight: 600;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: inherit;
          transition: color 0.15s; padding: 0;
        }
        .su-signin-link:hover { color: #6ee7b7; }

        /* Leaf watermark */
        .su-leaf-watermark {
          position: absolute; bottom: -28px; right: -22px;
          opacity: 0.035; pointer-events: none; z-index: 0;
        }

        /* Field stagger */
        .su-field-row {
          opacity: 0; transform: translateY(12px);
          animation: su-fieldIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .su-field-row:nth-child(1) { animation-delay: 0.28s; }
        .su-field-row:nth-child(2) { animation-delay: 0.38s; }
        .su-field-row:nth-child(3) { animation-delay: 0.48s; }
        @keyframes su-fieldIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Spinner */
        @keyframes su-spin { to { transform: rotate(360deg); } }
        .su-spinner { animation: su-spin 0.9s linear infinite; }

        /* Responsive */
        @media (max-width: 480px) {
          .su-card { padding: 32px 22px 28px; border-radius: 22px; }
          .su-logo-title { font-size: 1.8rem; }
        }
      `}</style>

      <div className="signup-root">
        {/* Bokeh orbs */}
        <div className="su-orb su-orb-1" />
        <div className="su-orb su-orb-2" />
        <div className="su-orb su-orb-3" />
        <div className="su-grid" />

        {/* Card */}
        <div className="su-card">
          <Leaf className="su-leaf-watermark" style={{ width: 140, height: 140 }} />

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="su-logo-icon">
              <Leaf style={{ width: 28, height: 28, color: '#fff' }} />
            </div>
            <h1 className="su-logo-title">AgriShield</h1>
            <p className="su-logo-sub">Join the Community</p>
          </div>

          <div className="su-divider" />

          <div style={{ position: 'relative', zIndex: 1 }}>

            {/* Live avatar preview */}
            <div className="su-avatar-row">
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <UserAvatar name={formData.fullName || '?'} size={64} />
                {hasName && <div className="su-ping" />}
              </div>
              <div>
                <h2 className="su-avatar-name">
                  {hasName ? formData.fullName : 'Create Account'}
                </h2>
                <p className="su-avatar-hint">
                  {hasName ? 'This will be your profile photo' : 'Fill in your details to get started'}
                </p>
              </div>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="su-error">
                <span className="su-error-dot" />
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Full Name */}
              <div className="su-field-row">
                <label className="su-label">Full Name</label>
                <div className="su-input-wrap">
                  <span className="su-icon-left">
                    <User style={{ width: 15, height: 15 }} />
                  </span>
                  <input
                    ref={nameRef}
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Barsha Panda"
                    required
                    className={`su-field-input su-name-input${touched.fullName && fieldErrors.fullName ? ' has-error' : ''}`}
                  />
                </div>
                {touched.fullName && fieldErrors.fullName && (
                  <div className="su-field-error"><span>❌</span> {fieldErrors.fullName}</div>
                )}
              </div>

              {/* Phone */}
              <div className="su-field-row">
                <label className="su-label">Phone Number</label>
                <div className="su-input-wrap">
                  <div className="su-phone-prefix">
                    <Phone style={{ width: 14, height: 14, color: 'rgba(52,211,153,0.4)' }} />
                    <span className="su-phone-prefix-text">+91</span>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onBlur={handleBlur}
                    placeholder="98765 43210"
                    required
                    className={`su-field-input su-phone-input${touched.phone && fieldErrors.phone ? ' has-error' : ''}`}
                  />
                </div>
                {touched.phone && fieldErrors.phone && (
                  <div className="su-field-error"><span>❌</span> {fieldErrors.phone}</div>
                )}
              </div>

              {/* Password */}
              <div className="su-field-row">
                <label className="su-label">Password</label>
                <div className="su-input-wrap">
                  <span className="su-icon-left">
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
                    className={`su-field-input su-pw-input${touched.password && fieldErrors.password ? ' has-error' : ''}`}
                  />
                  <button
                    type="button"
                    className="su-pw-toggle"
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

                {/* Strength bar */}
                {formData.password && strength && (
                  <div style={{ marginTop: 10 }}>
                    <div className="su-strength-row">
                      <span className="su-strength-label">Password strength</span>
                      <span className="su-strength-level" style={{ color: strength.color }}>{strength.level}</span>
                    </div>
                    <div className="su-strength-track">
                      <div className="su-strength-fill" style={{ width: strength.width, background: strength.color }} />
                    </div>
                  </div>
                )}

                {touched.password && fieldErrors.password && (
                  <div className="su-field-error"><span>❌</span> {fieldErrors.password}</div>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={isLoading || !isFormValid} className="su-submit-btn">
                {isLoading ? (
                  <>
                    <svg className="su-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account…
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="su-footer">
              Already have an account?{' '}
              <button onClick={() => onLoginClick && onLoginClick()} className="su-signin-link">
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;