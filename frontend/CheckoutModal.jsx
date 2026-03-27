import React, { useState, useEffect, useRef } from 'react';
import {
  XCircle, Receipt, MapPin, Loader2, ArrowRight, ArrowLeft,
  Smartphone, CheckCircle, AlertCircle, Truck,
  IndianRupee, Package, Info, CreditCard, ShieldCheck, Lock, Wifi,
  KeyRound, RefreshCw, MessageSquare
} from 'lucide-react';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const MERCHANT_UPI_ID = '8249196843@ybl';
const MERCHANT_NAME   = 'AgriShield';
const MERCHANT_CODE   = 'AGRISHIELD001';
const API_BASE        = 'http://127.0.0.1:8000';   // your FastAPI base URL

const buildUPIUri = (upiId, name, amount, txnRef, note) =>
  `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}` +
  `&mc=${MERCHANT_CODE}&tid=${txnRef}&tr=${txnRef}` +
  `&tn=${encodeURIComponent(note)}&am=${amount}&cu=INR`;

// ─── Real Scannable QR ────────────────────────────────────────────────────────
const UPIQRCode = ({ amount, txnRef }) => {
  const upiUri = buildUPIUri(MERCHANT_UPI_ID, MERCHANT_NAME, amount, txnRef, `AgriShield Order ${txnRef}`);
  const qrUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}&bgcolor=ffffff&color=1a1a2e&qzone=1&format=png`;
  const [imgOk, setImgOk] = React.useState(true);
  return (
    <div style={{ position:'relative', display:'inline-block' }}>
      <div style={{ padding:8, background:'#fff', borderRadius:16, boxShadow:'0 4px 20px rgba(0,0,0,0.12)', border:'3px solid #16a34a' }}>
        {imgOk ? (
          <img src={qrUrl} alt="UPI QR Code" width={180} height={180} style={{ display:'block', borderRadius:8 }} onError={() => setImgOk(false)} />
        ) : (
          <div style={{ width:180, height:180, background:'#f0fdf4', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8, color:'#16a34a', fontSize:12, fontWeight:600, textAlign:'center', padding:16 }}>
            <Package size={32} />
            <span>Pay to:<br /><strong style={{ fontFamily:'monospace' }}>{MERCHANT_UPI_ID}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Mock Card Gateway Simulator ─────────────────────────────────────────────
const mockCardToUPITransfer = async (cardLast4, amount, merchantUPI, onStepUpdate) => {
  const steps = [
    { id:'auth',       label:'Authenticating card',             detail:`Verifying card ending ••••${cardLast4}`,                 duration:1200 },
    { id:'bank',       label:'Contacting issuing bank',         detail:'Establishing secure TLS connection to bank...',           duration:1500 },
    { id:'funds',      label:'Checking available balance',      detail:`Validating funds for ₹${amount.toLocaleString('en-IN')}`, duration:1000 },
    { id:'debit',      label:'Debiting from card account',      detail:`Deducting ₹${amount.toLocaleString('en-IN')} from card`,  duration:1400 },
    { id:'bridge',     label:'Routing via NPCI UPI bridge',     detail:'Card ↔ UPI inter-op channel established',                 duration:1300 },
    { id:'transfer',   label:`Transferring to ${merchantUPI}`,  detail:`Crediting merchant UPI ID: ${merchantUPI}`,               duration:1600 },
    { id:'settlement', label:'Settlement initiated',            detail:'Bank settlement queued (T+1 business day)',               duration:900  },
    { id:'complete',   label:'Payment confirmed',               detail:'Transaction complete. Receipt generated.',                duration:800  },
  ];
  for (let i = 0; i < steps.length; i++) {
    await new Promise(r => setTimeout(r, steps[i].duration));
    onStepUpdate(i + 1, steps[i]);
  }
  return {
    rrn:      `RRN${Date.now().toString().slice(-10)}`,
    authCode: `AUTH${Math.random().toString(36).slice(2,8).toUpperCase()}`,
    bankRef:  `BANKREF${Date.now().toString().slice(-8)}`,
  };
};

// ─── Card Payment Gateway Screen ─────────────────────────────────────────────
const CardGatewayScreen = ({ cardLast4, amount, merchantUPI, txnRef, onComplete }) => {
  const [currentStep,   setCurrentStep]   = useState(0);
  const [currentLabel,  setCurrentLabel]  = useState('Initialising payment gateway...');
  const [currentDetail, setCurrentDetail] = useState('');
  const totalSteps = 8;
  useEffect(() => {
    mockCardToUPITransfer(cardLast4, amount, merchantUPI, (stepNum, stepInfo) => {
      setCurrentStep(stepNum); setCurrentLabel(stepInfo.label); setCurrentDetail(stepInfo.detail);
    }).then(result => setTimeout(() => onComplete(result), 1200));
  }, []);
  const progress = Math.round((currentStep / totalSteps) * 100);
  const milestones = [{ label:'Card Auth', at:2 },{ label:'Bank Debit', at:4 },{ label:'UPI Credit', at:6 },{ label:'Confirmed', at:8 }];
  return (
    <div style={{ padding:'24px 22px', display:'flex', flexDirection:'column', gap:18, minHeight:340, justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:20, padding:'6px 14px', marginBottom:12 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#16a34a', animation:'gw-pulse 1s infinite' }} />
          <span style={{ fontSize:11, fontWeight:700, color:'#166534', letterSpacing:'0.05em' }}>SECURE PAYMENT GATEWAY</span>
          <Lock size={10} color="#16a34a" />
        </div>
        <div style={{ fontSize:13, fontWeight:800, color:'#111827' }}>Processing Card Payment</div>
        <div style={{ fontSize:11, color:'#6b7280', marginTop:3 }}>Card ••••{cardLast4} → {merchantUPI}</div>
      </div>
      <div style={{ background:'linear-gradient(135deg,#166534,#15803d)', borderRadius:12, padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.7)', marginBottom:2 }}>Transferring</div>
          <div style={{ fontSize:22, fontWeight:900, color:'#fff' }}>₹{amount.toLocaleString('en-IN')}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.7)', marginBottom:2 }}>To Merchant</div>
          <div style={{ fontSize:11, fontWeight:700, color:'#86efac', fontFamily:'monospace' }}>{merchantUPI}</div>
        </div>
      </div>
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
          {milestones.map(m => (
            <div key={m.label} style={{ textAlign:'center', flex:1 }}>
              <div style={{ width:18, height:18, borderRadius:'50%', margin:'0 auto 4px', background: currentStep>=m.at ? '#16a34a':'#e5e7eb', border:`2px solid ${currentStep>=m.at?'#16a34a':'#d1d5db'}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.4s' }}>
                {currentStep>=m.at && <CheckCircle size={10} color="#fff" />}
              </div>
              <div style={{ fontSize:9, color:currentStep>=m.at?'#16a34a':'#9ca3af', fontWeight:currentStep>=m.at?700:400 }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ height:6, background:'#e5e7eb', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', borderRadius:3, transition:'width 0.6s ease', width:`${progress}%`, background:'linear-gradient(90deg,#16a34a,#22c55e)', boxShadow:'0 0 8px rgba(22,163,74,0.5)' }} />
        </div>
        <div style={{ textAlign:'right', fontSize:10, color:'#9ca3af', marginTop:3 }}>{progress}%</div>
      </div>
      <div style={{ background:'#f9fafb', border:'1.5px solid #e5e7eb', borderRadius:10, padding:'10px 13px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          {currentStep < totalSteps
            ? <Loader2 size={13} color="#16a34a" style={{ animation:'spin 1s linear infinite', flexShrink:0 }} />
            : <CheckCircle size={13} color="#16a34a" style={{ flexShrink:0 }} />}
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{currentLabel}</div>
            {currentDetail && <div style={{ fontSize:10, color:'#6b7280', marginTop:2 }}>{currentDetail}</div>}
          </div>
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#9ca3af' }}>
        <span>TXN REF: <span style={{ fontFamily:'monospace', color:'#374151' }}>{txnRef}</span></span>
        <span style={{ display:'flex', alignItems:'center', gap:3 }}><ShieldCheck size={10} color="#16a34a" /> 256-bit SSL</span>
      </div>
      <style>{`@keyframes gw-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

// ─── OTP Verification Screen ──────────────────────────────────────────────────
const OTPScreen = ({ maskedPhone, amount, cardLast4, txnRef, onVerified, onBack }) => {
  const [otp,         setOtp]         = useState(['','','','','','']);
  const [otpErr,      setOtpErr]      = useState('');
  const [verifying,   setVerifying]   = useState(false);
  const [resending,   setResending]   = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [verified,    setVerified]    = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer(r => r - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    const v = value.replace(/\D/g,'').slice(0,1);
    const next = [...otp]; next[index] = v; setOtp(next); setOtpErr('');
    if (v && index < 5) inputRefs.current[index+1]?.focus();
  };
  const handleKeyDown = (index, e) => {
    if (e.key==='Backspace' && !otp[index] && index > 0) inputRefs.current[index-1]?.focus();
  };
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (pasted.length===6) { setOtp(pasted.split('')); setOtpErr(''); inputRefs.current[5]?.focus(); }
    e.preventDefault();
  };

  const handleVerify = async () => {
    const entered = otp.join('');
    if (entered.length < 6) { setOtpErr('Please enter all 6 digits'); return; }
    setVerifying(true); setOtpErr('');
    try {
      const res  = await fetch(`${API_BASE}/api/otp/verify`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ txn_ref:txnRef, entered_otp:entered }) });
      const data = await res.json();
      if (data.success) { setVerified(true); setTimeout(() => onVerified(), 700); }
      else { setOtpErr(data.error || 'Incorrect OTP. Please try again.'); setOtp(['','','','','','']); inputRefs.current[0]?.focus(); }
    } catch { setOtpErr('Network error. Please check your connection.'); }
    finally { setVerifying(false); }
  };

  const handleResend = async () => {
    setResending(true); setOtpErr(''); setOtp(['','','','','','']);
    try {
      await fetch(`${API_BASE}/api/otp/resend`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ txn_ref:txnRef, amount }) });
      setResendTimer(30);
    } catch { setOtpErr('Failed to resend OTP. Please try again.'); }
    finally { setResending(false); }
  };

  return (
    <div style={{ padding:'24px 22px', display:'flex', flexDirection:'column', gap:18, minHeight:340, justifyContent:'center' }}>
      {/* Header */}
      <div style={{ textAlign:'center' }}>
        <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#dbeafe,#bfdbfe)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
          <KeyRound size={26} color="#1d4ed8" />
        </div>
        <div style={{ fontSize:15, fontWeight:800, color:'#111827' }}>OTP Verification</div>
        <div style={{ fontSize:11, color:'#6b7280', marginTop:5, lineHeight:1.6 }}>
          A 6-digit OTP has been sent via SMS to<br />
          <span style={{ fontWeight:700, color:'#111827', fontFamily:'monospace' }}>{maskedPhone}</span>
          {' '}— the number registered to card ••••{cardLast4}
        </div>
      </div>

      {/* SMS hint */}
      <div style={{ background:'linear-gradient(135deg,#1e293b,#334155)', borderRadius:12, padding:'11px 14px', display:'flex', gap:10, alignItems:'center' }}>
        <div style={{ width:32, height:32, borderRadius:8, background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <MessageSquare size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'#e2e8f0' }}>Check your SMS inbox</div>
          <div style={{ fontSize:10, color:'#94a3b8', marginTop:2 }}>Message from VM-AGRISHIELD · OTP valid for 5 mins</div>
        </div>
      </div>

      {/* OTP boxes */}
      <div>
        <div style={{ display:'flex', gap:8, justifyContent:'center' }} onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input key={i} ref={el => inputRefs.current[i]=el} value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              maxLength={1} inputMode="numeric"
              style={{ width:42, height:52, textAlign:'center', fontSize:20, fontWeight:800, fontFamily:'monospace', borderRadius:10, outline:'none',
                border:`2px solid ${otpErr?'#ef4444':digit?'#16a34a':'#d1d5db'}`,
                background: otpErr?'#fef2f2':digit?'#f0fdf4':'#fff',
                color: otpErr?'#ef4444':'#111827', transition:'all 0.15s',
                boxShadow: digit?'0 0 0 3px rgba(22,163,74,0.15)':'none' }} />
          ))}
        </div>
        {otpErr && (
          <div style={{ marginTop:10, fontSize:11, color:'#ef4444', display:'flex', alignItems:'center', gap:5, justifyContent:'center', background:'#fef2f2', padding:'8px 12px', borderRadius:8 }}>
            <AlertCircle size={12} />{otpErr}
          </div>
        )}
        {verified && (
          <div style={{ marginTop:10, fontSize:12, color:'#16a34a', display:'flex', alignItems:'center', gap:5, justifyContent:'center', fontWeight:700 }}>
            <CheckCircle size={14} /> OTP Verified! Proceeding to payment...
          </div>
        )}
      </div>

      {/* Verify button */}
      <button onClick={handleVerify} disabled={verifying||verified||otp.join('').length<6}
        style={{ width:'100%', border:'none', borderRadius:11, padding:'12px 0', fontWeight:700, fontSize:14,
          cursor:(verifying||verified||otp.join('').length<6)?'not-allowed':'pointer',
          opacity:(verifying||verified||otp.join('').length<6)?0.6:1,
          background: verified?'linear-gradient(135deg,#22c55e,#16a34a)':'linear-gradient(135deg,#16a34a,#15803d)',
          color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'all 0.2s' }}>
        {verifying ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Verifying...</>
         : verified  ? <><CheckCircle size={14} /> Verified!</>
         : <><ShieldCheck size={14} /> Verify OTP &amp; Pay ₹{amount.toLocaleString('en-IN')}</>}
      </button>

      {/* Resend + Back */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', color:'#6b7280', fontSize:11, cursor:'pointer', padding:'3px 0' }}>
          <ArrowLeft size={12} /> Back to card details
        </button>
        <button onClick={handleResend} disabled={resendTimer>0||resending}
          style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', color:resendTimer>0?'#9ca3af':'#16a34a', fontSize:11, cursor:resendTimer>0?'not-allowed':'pointer', fontWeight:600 }}>
          {resending ? <><Loader2 size={11} style={{ animation:'spin 1s linear infinite' }} /> Sending...</>
           : resendTimer>0 ? `Resend in ${resendTimer}s`
           : <><RefreshCw size={11} /> Resend OTP</>}
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────
const CheckoutModal = ({ cart, onClose, onOrderSuccess, onNavigateOrders }) => {
  const [step,        setStep]        = useState('address');
  const [address,     setAddress]     = useState('');
  const [addrLoad,    setAddrLoad]    = useState(true);
  const [paymentType, setPaymentType] = useState('upi');
  const [upiId,       setUpiId]       = useState('');
  const [upiErr,      setUpiErr]      = useState('');
  const [payMode,     setPayMode]     = useState('qr');
  const [timer,       setTimer]       = useState(600);
  const [bill,        setBill]        = useState(null);
  const [qrRevealed,  setQrRevealed]  = useState(false);
  const [txnRef]                      = useState(`AGR${Date.now()}`);
  const [upiPaying,   setUpiPaying]   = useState(false);

  // Debit card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName,   setCardName]   = useState('');
  const [expiry,     setExpiry]     = useState('');
  const [cvv,        setCvv]        = useState('');
  const [cardErr,    setCardErr]    = useState('');

  // OTP + gateway state
  const [otpStep,       setOtpStep]       = useState(false);
  const [otpLoading,    setOtpLoading]    = useState(false);
  const [maskedPhone,   setMaskedPhone]   = useState('');
  const [gatewayActive, setGatewayActive] = useState(false);

  const timerRef = useRef(null);
  const userId = typeof localStorage!=='undefined' ? (localStorage.getItem('user_id')||'') : '';
  const token  = typeof localStorage!=='undefined' ? (localStorage.getItem('token')||'')   : '';

  const subtotal   = cart.reduce((s,i) => s + i.price*i.quantity, 0);
  const gst        = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gst;

  useEffect(() => {
    if (!userId) { setAddrLoad(false); return; }
    fetch(`${API_BASE}/api/users/${userId}`, { headers: token ? { Authorization:`Bearer ${token}` } : {} })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          const full = [d.address?.street,d.address?.city,d.district,d.state,d.address?.pincode].filter(Boolean);
          const mini = [d.district,d.state].filter(Boolean);
          setAddress((full.length ? full : mini).join(', '));
        }
      }).catch(()=>{}).finally(()=>setAddrLoad(false));
  }, []);

  useEffect(() => {
    if (step==='payment') { timerRef.current = setInterval(()=>setTimer(t=>t>0?t-1:0), 1000); }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const fmt    = s  => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const validU = id => /^[\w.\-]+@[\w]+$/.test(id.trim());

  const formatCardNumber = val => { const v=val.replace(/\D/g,'').slice(0,16); return v.replace(/(\d{4})(?=\d)/g,'$1 '); };
  const formatExpiry     = val => { const v=val.replace(/\D/g,'').slice(0,4); return v.length>=2 ? v.slice(0,2)+'/'+v.slice(2) : v; };

  const validateCard = () => {
    const cardNum = cardNumber.replace(/\s/g,'');
    if (cardNum.length!==16)  { setCardErr('Card number must be 16 digits');  return false; }
    if (!cardName.trim())      { setCardErr('Cardholder name is required');    return false; }
    if (expiry.length!==5||!expiry.includes('/')) { setCardErr('Invalid expiry (MM/YY)'); return false; }
    const [mm,yy] = expiry.split('/').map(Number);
    if (mm<1||mm>12)           { setCardErr('Invalid expiry month');           return false; }
    const now=new Date(), cardYear=2000+yy;
    if (cardYear<now.getFullYear()||(cardYear===now.getFullYear()&&mm<now.getMonth()+1)) { setCardErr('Card has expired'); return false; }
    if (cvv.length!==3)        { setCardErr('CVV must be 3 digits');           return false; }
    return true;
  };

  const processPayment = async (method, gatewayResult=null) => {
    setStep('processing');
    const finalTxn = gatewayResult ? `${txnRef}_CARD_${gatewayResult.rrn}` : `${txnRef}_${method.replace(/\s/g,'').toLowerCase()}`;
    const created = [];
    for (const item of cart) {
      try {
        const r = await fetch(`${API_BASE}/api/marketplace/orders`, {
          method:'POST', headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},
          body: JSON.stringify({ product_id:String(item.id), buyer_id:userId, seller_id:'agrimart_seller', quantity:item.quantity, total_amount:item.price*item.quantity, address, payment_method:method.startsWith('Debit')?'DEBIT_CARD':'UPI', upi_ref:finalTxn, ...(gatewayResult?{ card_auth_code:gatewayResult.authCode, bank_ref:gatewayResult.bankRef, merchant_upi:MERCHANT_UPI_ID }:{}) })
        });
        if (r.ok) {
          const od = await r.json(); created.push(od);
          if (od.id) await fetch(`${API_BASE}/api/marketplace/payments/verify`, { method:'POST', headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})}, body:JSON.stringify({ payment_id:finalTxn, order_id:od.id, status:'SUCCESS' }) });
        }
      } catch {}
    }
    await new Promise(r=>setTimeout(r,3500));
    const now=new Date(), eta=new Date(); eta.setDate(eta.getDate()+5);
    setBill({ orderId:created[0]?.id||`AGM-${Date.now().toString().slice(-8)}`, txnRef:finalTxn, method, address, items:cart.map(i=>({name:i.name,qty:i.quantity,price:i.price,unit:i.unit})), subtotal, gst, grandTotal, ...(gatewayResult?{authCode:gatewayResult.authCode,rrn:gatewayResult.rrn}:{}), date:now.toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}), eta:eta.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) });
    setStep('success');
    if (onOrderSuccess) onOrderSuccess();
  };

  const handleQRPay    = () => { setQrRevealed(true); setTimeout(()=>processPayment('QR Code'),15000); };
  const handleManualPay = () => {
    if (!validU(upiId)) { setUpiErr('Enter a valid UPI ID (e.g. name@upi)'); return; }
    setUpiErr(''); setUpiPaying(true);
    setTimeout(()=>processPayment(`UPI ID (${upiId})`),10000);
  };

  // ── Step 1: validate card → call backend to send OTP ─────────────────────────
  const handleCardPay = async () => {
    if (!validateCard()) return;
    setCardErr(''); setOtpLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/otp/send`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ txn_ref:txnRef, amount:grandTotal }) });
      const data = await res.json();
      if (data.success) { setMaskedPhone(data.masked_phone); setOtpStep(true); }
      else setCardErr(data.error || 'Failed to send OTP. Please try again.');
    } catch { setCardErr('Network error. Could not send OTP.'); }
    finally { setOtpLoading(false); }
  };

  // ── Step 2: OTP verified → launch gateway ────────────────────────────────────
  const handleOTPVerified = () => { setOtpStep(false); setGatewayActive(true); };

  // ── Step 3: gateway done → create order ─────────────────────────────────────
  const handleGatewayComplete = (gatewayResult) => {
    setGatewayActive(false);
    processPayment(`Debit Card (••••${cardNumber.replace(/\s/g,'').slice(-4)})`, gatewayResult);
  };

  const HL  = { fontWeight:700, fontSize:12, color:'#374151', display:'flex', alignItems:'center', gap:5, marginBottom:7 };
  const ROW = { display:'flex', justifyContent:'space-between', fontSize:11, color:'#6b7280', marginBottom:3 };

  const cardNetworkIcon = () => {
    const first = cardNumber.replace(/\s/g,'')[0];
    if (first==='4') return <span style={{ fontSize:11, fontWeight:900, color:'#1a56db', fontStyle:'italic', letterSpacing:'-1px' }}>VISA</span>;
    if (first==='5') return <span style={{ fontSize:11, fontWeight:900, color:'#eb001b', letterSpacing:'-0.5px' }}>MC</span>;
    if (first==='6') return <span style={{ fontSize:10, fontWeight:800, color:'#f59e0b' }}>RuPay</span>;
    return null;
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)', zIndex:9999, overflowY:'auto', display:'flex', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:24, width:'100%', maxWidth:step==='payment'?900:520, height:'fit-content', margin:'auto', overflow:'hidden', boxShadow:'0 25px 60px rgba(0,0,0,0.3)', display:'flex', flexDirection:step==='payment'?'row':'column', position:'relative' }}>

        {/* ── Gateway overlay ── */}
        {gatewayActive && (
          <div style={{ position:'absolute', inset:0, background:'#fff', zIndex:50, borderRadius:24, display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <CardGatewayScreen cardLast4={cardNumber.replace(/\s/g,'').slice(-4)} amount={grandTotal} merchantUPI={MERCHANT_UPI_ID} txnRef={txnRef} onComplete={handleGatewayComplete} />
          </div>
        )}

        {/* ── OTP overlay ── */}
        {otpStep && (
          <div style={{ position:'absolute', inset:0, background:'#fff', zIndex:49, borderRadius:24, display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <OTPScreen maskedPhone={maskedPhone} amount={grandTotal} cardLast4={cardNumber.replace(/\s/g,'').slice(-4)} txnRef={txnRef} onVerified={handleOTPVerified} onBack={()=>setOtpStep(false)} />
          </div>
        )}

        {/* ── Header ── */}
        {step !== 'payment' && (
          <div style={{ background:'linear-gradient(135deg,#166534,#15803d)', padding:'18px 22px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {!['processing','success'].includes(step) && (
                <div style={{ display:'flex', gap:4 }}>
                  {['address','payment'].map(s => <div key={s} style={{ height:5, borderRadius:3, background:step===s?'#fff':'rgba(255,255,255,0.3)', width:step===s?22:5, transition:'all 0.3s' }} />)}
                </div>
              )}
              <span style={{ color:'#fff', fontWeight:700, fontSize:15 }}>
                {step==='address'?'📦 Delivery Details':step==='payment'?'🔐 Secure Payment':step==='processing'?'⏳ Confirming Payment...':'✅ Payment Successful!'}
              </span>
            </div>
            {step!=='processing' && (
              <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:7, padding:5, cursor:'pointer', color:'#fff', display:'flex' }}><XCircle size={17} /></button>
            )}
          </div>
        )}

        {/* ── Payment step ── */}
        {step === 'payment' && (
          <>
            {/* Sidebar */}
            <div style={{ width:280, background:'#f9fafb', borderRight:'1px solid #e5e7eb', padding:18, overflowY:'auto', maxHeight:'100vh' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <span style={{ fontWeight:700, fontSize:13, color:'#111827' }}>Payment Method</span>
                <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}><XCircle size={16} /></button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[{ key:'upi',icon:<Smartphone size={16}/>,label:'UPI',sub:'Scan QR or enter ID'},{ key:'debit',icon:<CreditCard size={16}/>,label:'Debit Card',sub:'Visa, Mastercard, RuPay'}].map(({key,icon,label,sub})=>(
                  <button key={key} onClick={()=>setPaymentType(key)} style={{ padding:12, borderRadius:11, cursor:'pointer', transition:'all 0.2s', border:paymentType===key?'2px solid #16a34a':'2px solid #e5e7eb', background:paymentType===key?'#f0fdf4':'#fff', display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ color:paymentType===key?'#16a34a':'#6b7280' }}>{icon}</span>
                    <div style={{ textAlign:'left', flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:12, color:paymentType===key?'#16a34a':'#111827' }}>{label}</div>
                      <div style={{ fontSize:10, color:'#6b7280', marginTop:2 }}>{sub}</div>
                    </div>
                    {paymentType===key && <CheckCircle size={14} color="#16a34a" />}
                  </button>
                ))}
              </div>
              <div style={{ marginTop:18, padding:10, background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, display:'flex', gap:6, alignItems:'flex-start' }}>
                <Info size={12} color="#1d4ed8" style={{ flexShrink:0, marginTop:2 }} />
                <div style={{ fontSize:10, color:'#1d4ed8' }}><strong>Secure &amp; Encrypted</strong><div style={{ marginTop:3, opacity:0.8 }}>Your payment info is protected with 256-bit SSL</div></div>
              </div>
            </div>

            {/* Right panel */}
            <div style={{ flex:1, padding:18, overflowY:'auto', maxHeight:'100vh' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:13 }}>

                {/* Amount + timer */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#f9fafb', borderRadius:11, padding:'11px 14px', border:'1.5px solid #e5e7eb' }}>
                  <div><div style={{ fontSize:10, color:'#6b7280', marginBottom:1 }}>Amount Payable</div><div style={{ fontSize:24, fontWeight:900, color:'#111827', lineHeight:1 }}>₹{grandTotal.toLocaleString('en-IN')}</div></div>
                  <div style={{ textAlign:'right' }}><div style={{ fontSize:10, color:'#6b7280', marginBottom:1 }}>Expires in</div><div style={{ fontSize:17, fontWeight:800, color:timer<60?'#ef4444':'#f59e0b', fontFamily:'monospace' }}>{fmt(timer)}</div></div>
                </div>

                {/* Merchant */}
                <div style={{ background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:11, padding:'9px 13px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div><div style={{ fontSize:10, color:'#6b7280' }}>Paying to</div><div style={{ fontWeight:700, fontSize:13, color:'#166534', fontFamily:'monospace' }}>{MERCHANT_NAME}</div></div>
                  <div style={{ fontSize:10, color:'#6b7280', fontFamily:'monospace' }}>{MERCHANT_UPI_ID}</div>
                </div>

                {/* UPI */}
                {paymentType==='upi' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                    <div style={{ display:'flex', background:'#f3f4f6', borderRadius:9, padding:3, gap:2 }}>
                      {[['qr','📷 Scan QR'],['id','⌨️ Enter UPI ID']].map(([mode,label])=>(
                        <button key={mode} onClick={()=>setPayMode(mode)} style={{ flex:1, padding:'8px 3px', borderRadius:7, border:'none', fontWeight:600, fontSize:12, cursor:'pointer', transition:'all 0.2s', background:payMode===mode?'#fff':'transparent', color:payMode===mode?'#16a34a':'#6b7280', boxShadow:payMode===mode?'0 1px 4px rgba(0,0,0,0.1)':'none' }}>{label}</button>
                      ))}
                    </div>
                    {payMode==='qr' && (
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                        <div style={{ position:'relative', display:'inline-block' }}>
                          <UPIQRCode amount={grandTotal} txnRef={txnRef} />
                          {!qrRevealed && (
                            <div style={{ position:'absolute', inset:0, borderRadius:16, background:'rgba(255,255,255,0.10)', backdropFilter:'blur(2px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10 }}>
                              <button onClick={handleQRPay} style={{ background:'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', border:'none', borderRadius:12, padding:'10px 22px', fontWeight:700, fontSize:13, cursor:'pointer' }}>Pay via QR</button>
                              <div style={{ fontSize:10, color:'#374151', fontWeight:500 }}>Click to reveal QR code</div>
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize:12, color:'#6b7280', textAlign:'center', lineHeight:1.6 }}>{!qrRevealed?'Click "Pay via QR" then scan with any UPI app':'Scan the QR code with your UPI app now to complete payment'}</div>
                        {qrRevealed && <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'center' }}>{['GPay','PhonePe','Paytm','BHIM','Any UPI app'].map(a=><span key={a} style={{ fontSize:10, color:'#6b7280', background:'#f3f4f6', padding:'2px 7px', borderRadius:16 }}>{a}</span>)}</div>}
                      </div>
                    )}
                    {payMode==='id' && (
                      <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                        <input value={upiId} onChange={e=>{setUpiId(e.target.value);setUpiErr('');}} placeholder="yourname@paytm / 9876543210@upi" style={{ border:`2px solid ${upiErr?'#ef4444':'#d1d5db'}`, borderRadius:9, padding:'9px 11px', fontSize:12, outline:'none', background:upiErr?'#fef2f2':'#fff', boxSizing:'border-box', width:'100%' }} />
                        {upiErr && <div style={{ fontSize:11, color:'#ef4444', display:'flex', alignItems:'center', gap:3 }}><AlertCircle size={10}/>{upiErr}</div>}
                        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                          {['@paytm','@gpay','@ybl','@okaxis','@ibl','@upi'].map(s=><button key={s} onClick={()=>{setUpiId(upiId.split('@')[0]+s);setUpiErr('');}} style={{ fontSize:10, background:'#f3f4f6', border:'1px solid #e5e7eb', borderRadius:14, padding:'3px 8px', cursor:'pointer', color:'#374151' }}>{s}</button>)}
                        </div>
                        <button onClick={handleManualPay} disabled={upiPaying} style={{ width:'100%', background:upiPaying?'linear-gradient(135deg,#d97706,#b45309)':'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', border:'none', borderRadius:11, padding:'11px 0', fontWeight:700, fontSize:13, cursor:upiPaying?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                          {upiPaying?<><Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/> Awaiting confirmation...</>:<><IndianRupee size={13}/> Pay ₹{grandTotal.toLocaleString('en-IN')} via UPI</>}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Debit card */}
                {paymentType==='debit' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                    {/* Card preview */}
                    <div style={{ background:'linear-gradient(135deg,#1e3a5f,#2563eb)', borderRadius:14, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)', marginBottom:6 }}>DEBIT CARD</div>
                        <div style={{ fontFamily:'monospace', fontSize:13, color:'#fff', letterSpacing:'2px', fontWeight:700 }}>{cardNumber||'•••• •••• •••• ••••'}</div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.7)', marginTop:6, textTransform:'uppercase' }}>{cardName||'CARDHOLDER NAME'}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)', marginBottom:4 }}>VALID THRU</div>
                        <div style={{ fontFamily:'monospace', fontSize:12, color:'#fff' }}>{expiry||'MM/YY'}</div>
                        <div style={{ marginTop:8 }}>{cardNetworkIcon()}</div>
                      </div>
                    </div>

                    <div>
                      <label style={HL}><CreditCard size={12} color="#16a34a"/> Cardholder Name</label>
                      <input value={cardName} onChange={e=>{setCardName(e.target.value.toUpperCase());setCardErr('');}} placeholder="NAME AS ON CARD" style={{ width:'100%', border:`2px solid ${cardErr&&!cardName.trim()?'#ef4444':'#d1d5db'}`, borderRadius:9, padding:'9px 11px', fontSize:12, outline:'none', boxSizing:'border-box', textTransform:'uppercase', fontFamily:'monospace', letterSpacing:'1px' }} />
                    </div>
                    <div>
                      <label style={HL}><CreditCard size={12} color="#16a34a"/> Card Number</label>
                      <input value={cardNumber} onChange={e=>{setCardNumber(formatCardNumber(e.target.value));setCardErr('');}} placeholder="1234 5678 9012 3456" style={{ width:'100%', border:'2px solid #d1d5db', borderRadius:9, padding:'9px 11px', fontSize:12, outline:'none', boxSizing:'border-box', fontFamily:'monospace', letterSpacing:'2px' }} />
                    </div>
                    <div style={{ display:'flex', gap:10 }}>
                      <div style={{ flex:1 }}>
                        <label style={HL}>Expiry Date</label>
                        <input value={expiry} onChange={e=>{setExpiry(formatExpiry(e.target.value));setCardErr('');}} placeholder="MM/YY" style={{ width:'100%', border:'2px solid #d1d5db', borderRadius:9, padding:'9px 11px', fontSize:12, outline:'none', boxSizing:'border-box', fontFamily:'monospace' }} />
                      </div>
                      <div style={{ flex:1 }}>
                        <label style={HL}><Lock size={10} color="#16a34a"/> CVV</label>
                        <input value={cvv} onChange={e=>{setCvv(e.target.value.replace(/\D/g,'').slice(0,3));setCardErr('');}} placeholder="•••" type="password" style={{ width:'100%', border:'2px solid #d1d5db', borderRadius:9, padding:'9px 11px', fontSize:12, outline:'none', boxSizing:'border-box', fontFamily:'monospace', letterSpacing:'3px' }} />
                      </div>
                    </div>

                    {cardErr && <div style={{ fontSize:11, color:'#ef4444', display:'flex', alignItems:'center', gap:3, background:'#fef2f2', padding:9, borderRadius:8 }}><AlertCircle size={12}/>{cardErr}</div>}

                    <div style={{ background:'#fefce8', border:'1px solid #fde68a', borderRadius:9, padding:10, display:'flex', gap:7, alignItems:'flex-start' }}>
                      <Smartphone size={12} color="#d97706" style={{ flexShrink:0, marginTop:2 }} />
                      <div style={{ fontSize:10, color:'#92400e', lineHeight:1.6 }}>
                        <strong>2-Factor Authentication:</strong> An OTP will be sent to the mobile number registered to this card. You must enter it to authorise the payment.
                      </div>
                    </div>

                    <button onClick={handleCardPay} disabled={otpLoading} style={{ width:'100%', background:otpLoading?'linear-gradient(135deg,#6b7280,#4b5563)':'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', border:'none', borderRadius:11, padding:'12px 0', fontWeight:700, fontSize:13, cursor:otpLoading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                      {otpLoading?<><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> Sending OTP...</>:<><Lock size={13}/> Pay ₹{grandTotal.toLocaleString('en-IN')} · Get OTP</>}
                    </button>

                    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:12, opacity:0.5 }}>
                      {['VISA','MC','RuPay'].map(n=><span key={n} style={{ fontSize:9, fontWeight:800, fontFamily:'monospace', color:'#374151' }}>{n}</span>)}
                      <ShieldCheck size={11} color="#374151"/><span style={{ fontSize:9, color:'#374151' }}>PCI-DSS</span>
                    </div>
                  </div>
                )}

                <button onClick={()=>setStep('address')} style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', color:'#6b7280', fontSize:11, cursor:'pointer', padding:'3px 0' }}>
                  <ArrowLeft size={12}/> Back to delivery
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Non-payment steps ── */}
        {step !== 'payment' && (
          <div style={{ padding:18 }}>
            {step==='address' && (
              <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                <div style={{ background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:13, padding:13 }}>
                  <div style={{ fontWeight:700, color:'#166534', marginBottom:7, display:'flex', alignItems:'center', gap:5, fontSize:12 }}><Receipt size={13}/> Order Summary</div>
                  {cart.map(item=>(
                    <div key={item.id} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#374151', marginBottom:2 }}>
                      <span>{item.name} <span style={{ color:'#9ca3af' }}>×{item.quantity}</span></span>
                      <span style={{ fontWeight:600 }}>₹{(item.price*item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div style={{ borderTop:'1px solid #bbf7d0', marginTop:8, paddingTop:8 }}>
                    <div style={ROW}><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                    <div style={ROW}><span>GST (5%)</span><span>₹{gst.toLocaleString('en-IN')}</span></div>
                    <div style={ROW}><span>Delivery</span><span style={{ color:'#16a34a', fontWeight:700 }}>FREE</span></div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:14, color:'#111827', marginTop:5, paddingTop:5, borderTop:'1px solid #bbf7d0' }}>
                      <span>Total Payable</span><span style={{ color:'#166534' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label style={HL}><MapPin size={12} color="#16a34a"/> Delivery Address</label>
                  {addrLoad ? (
                    <div style={{ display:'flex', alignItems:'center', gap:7, color:'#9ca3af', fontSize:12, padding:7 }}><Loader2 size={12} style={{ animation:'spin 1s linear infinite' }}/> Loading your saved address...</div>
                  ) : (
                    <>
                      <textarea value={address} onChange={e=>setAddress(e.target.value)} rows={2} placeholder="House no, street, village, district, state, PIN..." style={{ width:'100%', border:'2px solid #d1d5db', borderRadius:10, padding:'8px 11px', fontSize:12, resize:'none', outline:'none', fontFamily:'inherit', boxSizing:'border-box', lineHeight:1.5 }} />
                      {address && <div style={{ fontSize:10, color:'#16a34a', display:'flex', alignItems:'center', gap:3, marginTop:3 }}><CheckCircle size={9}/> Loaded from your profile</div>}
                    </>
                  )}
                </div>
                <div style={{ background:'#eff6ff', border:'1.5px solid #bfdbfe', borderRadius:9, padding:9, fontSize:11, color:'#1d4ed8', display:'flex', gap:6 }}>
                  <Info size={12} style={{ flexShrink:0, marginTop:1 }}/>
                  🔒 Pay via UPI or Debit Card. Free delivery on all orders.
                </div>
                <button onClick={()=>address.trim()&&setStep('payment')} disabled={!address.trim()} style={{ width:'100%', background:'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', border:'none', borderRadius:11, padding:'12px 0', fontWeight:700, fontSize:14, cursor:address.trim()?'pointer':'not-allowed', opacity:address.trim()?1:0.5, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  Proceed to Pay ₹{grandTotal.toLocaleString('en-IN')} <ArrowRight size={16}/>
                </button>
              </div>
            )}

            {step==='processing' && (
              <div style={{ textAlign:'center', padding:'28px 0' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', border:'4px solid #dcfce7', borderTop:'4px solid #16a34a', margin:'0 auto 18px', animation:'spin 1s linear infinite' }} />
                <div style={{ fontSize:17, fontWeight:800, color:'#111827', marginBottom:7 }}>Confirming Payment</div>
                <div style={{ fontSize:12, color:'#6b7280', marginBottom:18 }}>Placing your order with the seller...</div>
                <div style={{ display:'flex', flexDirection:'column', gap:7, maxWidth:240, margin:'0 auto' }}>
                  {['Payment verified','Creating order','Notifying seller','Sending confirmation'].map(s=>(
                    <div key={s} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
                      <div style={{ width:18, height:18, borderRadius:'50%', background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><CheckCircle size={11} color="#fff"/></div>
                      <span style={{ color:'#374151' }}>{s}</span>
                    </div>
                  ))}
                </div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}

            {step==='success' && bill && (
              <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                <div style={{ textAlign:'center', padding:'4px 0 6px' }}>
                  <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#16a34a)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', boxShadow:'0 4px 20px rgba(22,163,74,0.3)' }}><CheckCircle size={32} color="#fff"/></div>
                  <div style={{ fontSize:19, fontWeight:900, color:'#111827', marginBottom:3 }}>Payment Successful!</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>Order confirmed and being processed</div>
                </div>
                <div style={{ background:'#f9fafb', border:'1.5px solid #e5e7eb', borderRadius:13, padding:13 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:9 }}>
                    <div style={{ fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:5, fontSize:12 }}><Receipt size={12} color="#16a34a"/> Receipt</div>
                    <div style={{ fontSize:10, color:'#9ca3af' }}>{bill.date}</div>
                  </div>
                  {[['Order ID',bill.orderId],['Transaction',bill.txnRef],['Paid via',bill.method],...(bill.authCode?[['Auth Code',bill.authCode],['RRN',bill.rrn]]:[]),['Deliver to',bill.address]].map(([k,v])=>(
                    <div key={k} style={ROW}><span style={{ flexShrink:0 }}>{k}</span><span style={{ color:'#374151', fontWeight:500, textAlign:'right', maxWidth:'65%', wordBreak:'break-all' }}>{String(v).length>42?String(v).slice(0,42)+'…':v}</span></div>
                  ))}
                  <div style={{ borderTop:'1px dashed #d1d5db', marginTop:9, paddingTop:9 }}>
                    {bill.items.map((it,i)=>(
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:2 }}>
                        <span style={{ color:'#374151' }}>{it.name} <span style={{ fontSize:10, color:'#9ca3af' }}>×{it.qty}</span></span>
                        <span style={{ fontWeight:600 }}>₹{(it.price*it.qty).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div style={{ borderTop:'1px dashed #d1d5db', marginTop:7, paddingTop:7 }}>
                      <div style={ROW}><span>Subtotal</span><span>₹{bill.subtotal.toLocaleString('en-IN')}</span></div>
                      <div style={ROW}><span>GST (5%)</span><span>₹{bill.gst.toLocaleString('en-IN')}</span></div>
                      <div style={ROW}><span>Delivery</span><span style={{ color:'#16a34a', fontWeight:700 }}>FREE</span></div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:14, color:'#111827', marginTop:5, paddingTop:5, borderTop:'1.5px solid #d1d5db' }}>
                        <span>Amount Paid</span><span style={{ color:'#166534' }}>₹{bill.grandTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:9, padding:9, marginTop:9, display:'flex', gap:7, alignItems:'flex-start' }}>
                    <Truck size={12} color="#16a34a" style={{ flexShrink:0, marginTop:1 }}/>
                    <div style={{ fontSize:11, color:'#166534' }}><strong>Est. Delivery: {bill.eta}</strong><div style={{ opacity:0.75, marginTop:1 }}>Track in My Orders section</div></div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:9 }}>
                  <button onClick={onClose} style={{ flex:1, background:'#f9fafb', border:'1.5px solid #e5e7eb', borderRadius:11, padding:'10px 0', fontWeight:600, fontSize:12, cursor:'pointer', color:'#374151' }}>Continue Shopping</button>
                  <button onClick={()=>{onClose();if(onNavigateOrders)onNavigateOrders();}} style={{ flex:1.5, background:'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', border:'none', borderRadius:11, padding:'10px 0', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                    <Package size={13}/> View My Orders
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;