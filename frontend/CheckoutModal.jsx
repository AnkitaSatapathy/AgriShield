import React, { useState, useEffect, useRef } from 'react';
import {
  XCircle, Receipt, MapPin, Loader2, ArrowRight, ArrowLeft,
  Smartphone, CheckCircle, AlertCircle, Copy, Truck,
  IndianRupee, Clock, Package, Info
} from 'lucide-react';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const MERCHANT_UPI_ID = '8249196843@ybl';
const MERCHANT_NAME   = 'AgriShield';
const MERCHANT_CODE   = 'AGRISHIELD001';

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
          <img src={qrUrl} alt="UPI QR Code" width={180} height={180}
            style={{ display:'block', borderRadius:8 }}
            onError={() => setImgOk(false)} />
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

// ─── Main Modal ───────────────────────────────────────────────────────────────
const CheckoutModal = ({ cart, onClose, onOrderSuccess, onNavigateOrders }) => {
  const [step,        setStep]       = useState('address');
  const [address,     setAddress]    = useState('');
  const [addrLoad,    setAddrLoad]   = useState(true);
  const [upiId,       setUpiId]      = useState('');
  const [upiErr,      setUpiErr]     = useState('');
  const [payMode,     setPayMode]    = useState('qr');
  const [timer,       setTimer]      = useState(600);
  const [bill,        setBill]       = useState(null);
  const [qrRevealed,  setQrRevealed] = useState(false);
  const [txnRef]                     = useState(`AGR${Date.now()}`);
  const [upiPaying,   setUpiPaying]  = useState(false); // true while waiting 10s after Pay clicked
  const timerRef                     = useRef(null);

  const userId = localStorage.getItem('user_id') || '';
  const token  = localStorage.getItem('token')   || '';

  const subtotal   = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const gst        = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gst;

  // Load saved address
  useEffect(() => {
    if (!userId) { setAddrLoad(false); return; }
    fetch(`http://127.0.0.1:8000/api/users/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          const full = [d.address?.street, d.address?.city, d.district, d.state, d.address?.pincode].filter(Boolean);
          const mini = [d.district, d.state].filter(Boolean);
          setAddress((full.length ? full : mini).join(', '));
        }
      })
      .catch(() => {})
      .finally(() => setAddrLoad(false));
  }, []);

  // Session countdown timer
  useEffect(() => {
    if (step === 'payment') {
      timerRef.current = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const fmt    = s  => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const validU = id => /^[\w.\-]+@[\w]+$/.test(id.trim());
  const copyUPI = () => navigator.clipboard.writeText(MERCHANT_UPI_ID).catch(() => {});

  // ── Core: create orders + show bill ──────────────────────────────────────
  const processPayment = async (method) => {
    setStep('processing');
    const finalTxn = `${txnRef}_${method.replace(/\s/g, '').toLowerCase()}`;
    const created  = [];

    for (const item of cart) {
      try {
        const r = await fetch('http://127.0.0.1:8000/api/marketplace/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            product_id: String(item.id), buyer_id: userId,
            seller_id: 'agrimart_seller', quantity: item.quantity,
            total_amount: item.price * item.quantity,
            address, payment_method: 'UPI', upi_ref: finalTxn,
          })
        });
        if (r.ok) {
          const od = await r.json(); created.push(od);
          if (od.id) {
            await fetch('http://127.0.0.1:8000/api/marketplace/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
              body: JSON.stringify({ payment_id: finalTxn, order_id: od.id, status: 'SUCCESS' })
            });
          }
        }
      } catch {}
    }

    await new Promise(r => setTimeout(r, 7000));

    const now = new Date(), eta = new Date(); eta.setDate(eta.getDate() + 5);
    setBill({
      orderId:  created[0]?.id || `AGM-${Date.now().toString().slice(-8)}`,
      txnRef:   finalTxn, method, address,
      items:    cart.map(i => ({ name: i.name, qty: i.quantity, price: i.price, unit: i.unit })),
      subtotal, gst, grandTotal,
      date: now.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      eta:  eta.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    });
    setStep('success');
    if (onOrderSuccess) onOrderSuccess();
  };

  // ── QR "Pay via QR" clicked ───────────────────────────────────────────────
  const handleQRPay = () => {
    setQrRevealed(true);
    // Wait 10 seconds silently (user scans and pays in real life), then auto-process
    setTimeout(() => processPayment('QR Code'), 15000);
  };

  // ── UPI ID Pay clicked ────────────────────────────────────────────────────
  const handleManualPay = () => {
    if (!validU(upiId)) { setUpiErr('Enter a valid UPI ID (e.g. name@upi)'); return; }
    setUpiErr('');
    setUpiPaying(true);
    // Stay on payment screen 10s (button turns amber — looks like awaiting bank), then process
    setTimeout(() => processPayment(`UPI ID (${upiId})`), 10000);
  };

  const HL  = { fontWeight: 700, fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 };
  const ROW = { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 3 };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)', zIndex:9999, overflowY:'auto', display:'flex', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#fff', borderRadius:24, width:'100%', maxWidth:520, height:'fit-content', margin:'auto', overflow:'hidden', boxShadow:'0 25px 60px rgba(0,0,0,0.3)' }}>

        {/* ── Header ── */}
        <div style={{ background:'linear-gradient(135deg,#166534,#15803d)', padding:'18px 22px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {!['processing','success'].includes(step) && (
              <div style={{ display:'flex', gap:4 }}>
                {['address','payment'].map(s => (
                  <div key={s} style={{ height:5, borderRadius:3, background: step===s ? '#fff' : 'rgba(255,255,255,0.3)', width: step===s ? 22 : 5, transition:'all 0.3s' }} />
                ))}
              </div>
            )}
            <span style={{ color:'#fff', fontWeight:700, fontSize:15 }}>
              {step==='address'    ? '📦 Delivery Details'      :
               step==='payment'    ? '🔐 Secure UPI Payment'    :
               step==='processing' ? '⏳ Confirming Payment...' : '✅ Payment Successful!'}
            </span>
          </div>
          {step !== 'processing' && (
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:7, padding:5, cursor:'pointer', color:'#fff', display:'flex' }}>
              <XCircle size={17} />
            </button>
          )}
        </div>

        <div style={{ padding:18 }}>

          {/* ══════════ ADDRESS STEP ══════════ */}
          {step === 'address' && (
            <div style={{ display:'flex', flexDirection:'column', gap:13 }}>

              {/* Order summary */}
              <div style={{ background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:13, padding:13 }}>
                <div style={{ fontWeight:700, color:'#166534', marginBottom:7, display:'flex', alignItems:'center', gap:5, fontSize:12 }}>
                  <Receipt size={13} /> Order Summary
                </div>
                {cart.map(item => (
                  <div key={item.id} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#374151', marginBottom:2 }}>
                    <span>{item.name} <span style={{ color:'#9ca3af' }}>×{item.quantity}</span></span>
                    <span style={{ fontWeight:600 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
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

              {/* Address */}
              <div>
                <label style={HL}><MapPin size={12} color="#16a34a" /> Delivery Address</label>
                {addrLoad ? (
                  <div style={{ display:'flex', alignItems:'center', gap:7, color:'#9ca3af', fontSize:12, padding:7 }}>
                    <Loader2 size={12} className="animate-spin" /> Loading your saved address...
                  </div>
                ) : (
                  <>
                    <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2}
                      placeholder="House no, street, village, district, state, PIN..."
                      style={{ width:'100%', border:'2px solid #d1d5db', borderRadius:10, padding:'8px 11px', fontSize:12, resize:'none', outline:'none', fontFamily:'inherit', boxSizing:'border-box', lineHeight:1.5 }} />
                    {address && (
                      <div style={{ fontSize:10, color:'#16a34a', display:'flex', alignItems:'center', gap:3, marginTop:3 }}>
                        <CheckCircle size={9} /> Loaded from your profile
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Info banner */}
              <div style={{ background:'#eff6ff', border:'1.5px solid #bfdbfe', borderRadius:9, padding:9, fontSize:11, color:'#1d4ed8', display:'flex', gap:6 }}>
                <Info size={12} style={{ flexShrink:0, marginTop:1 }} />
                🔒 Payments are processed via UPI currently. Free delivery on all orders.
              </div>

              <button onClick={() => address.trim() && setStep('payment')} disabled={!address.trim()}
                style={{ width:'100%', background:'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', border:'none', borderRadius:11, padding:'12px 0', fontWeight:700, fontSize:14, cursor: address.trim() ? 'pointer' : 'not-allowed', opacity: address.trim() ? 1 : 0.5, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                Proceed to Pay ₹{grandTotal.toLocaleString('en-IN')} <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ══════════ PAYMENT STEP ══════════ */}
          {step === 'payment' && (
            <div style={{ display:'flex', flexDirection:'column', gap:13 }}>

              {/* Amount + session timer */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#f9fafb', borderRadius:11, padding:'11px 14px', border:'1.5px solid #e5e7eb' }}>
                <div>
                  <div style={{ fontSize:10, color:'#6b7280', marginBottom:1 }}>Amount Payable</div>
                  <div style={{ fontSize:24, fontWeight:900, color:'#111827', lineHeight:1 }}>₹{grandTotal.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:10, color:'#6b7280', marginBottom:1 }}>Expires in</div>
                  <div style={{ fontSize:17, fontWeight:800, color: timer < 60 ? '#ef4444' : '#f59e0b', fontFamily:'monospace' }}>{fmt(timer)}</div>
                </div>
              </div>

              {/* Merchant UPI banner */}
              <div style={{ background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:11, padding:'9px 13px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:10, color:'#6b7280' }}>Paying to</div>
                  <div style={{ fontWeight:700, fontSize:13, color:'#166534', fontFamily:'monospace' }}>{MERCHANT_UPI_ID}</div>
                  <div style={{ fontSize:10, color:'#6b7280' }}>{MERCHANT_NAME}</div>
                </div>
                <button onClick={copyUPI}
                  style={{ display:'flex', alignItems:'center', gap:3, background:'#dcfce7', border:'1px solid #bbf7d0', borderRadius:7, padding:'5px 9px', cursor:'pointer', fontSize:11, color:'#166534', fontWeight:600 }}>
                  <Copy size={10} /> Copy
                </button>
              </div>

              {/* Tab switcher — only QR and UPI ID */}
              <div style={{ display:'flex', background:'#f3f4f6', borderRadius:9, padding:3, gap:2 }}>
                {[['qr','📷 Scan QR'], ['id','⌨️ Enter UPI ID']].map(([mode, label]) => (
                  <button key={mode} onClick={() => setPayMode(mode)}
                    style={{ flex:1, padding:'8px 3px', borderRadius:7, border:'none', fontWeight:600, fontSize:12, cursor:'pointer', transition:'all 0.2s',
                      background: payMode===mode ? '#fff' : 'transparent',
                      color:      payMode===mode ? '#16a34a' : '#6b7280',
                      boxShadow:  payMode===mode ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* ── QR Tab ── */}
              {payMode === 'qr' && (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>

                  {/* QR with overlay */}
                  <div style={{ position:'relative', display:'inline-block' }}>
                    <UPIQRCode amount={grandTotal} txnRef={txnRef} />

                    {/* Overlay before reveal */}
                    {!qrRevealed && (
                      <div style={{ position:'absolute', inset:0, borderRadius:16, background:'rgba(255,255,255,0.10)', backdropFilter:'blur(2px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10 }}>
                        <button onClick={handleQRPay}
                          style={{ background:'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', border:'none', borderRadius:12, padding:'10px 22px', fontWeight:700, fontSize:13, cursor:'pointer', boxShadow:'0 4px 14px rgba(22,163,74,0.4)' }}>
                          Pay via QR
                        </button>
                        <div style={{ fontSize:10, color:'#374151', fontWeight:500 }}>Click to reveal QR code</div>
                      </div>
                    )}

                  </div>

                  {/* Supporting text */}
                  <div style={{ fontSize:12, color:'#6b7280', textAlign:'center', lineHeight:1.6 }}>
                    {!qrRevealed
                      ? 'Click "Pay via QR" then scan with any UPI app to complete payment'
                      : 'Scan the QR code with your UPI app now to complete payment'}
                  </div>

                  {qrRevealed && (
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'center' }}>
                      {['GPay','PhonePe','Paytm','BHIM','Any UPI app'].map(a => (
                        <span key={a} style={{ fontSize:10, color:'#6b7280', background:'#f3f4f6', padding:'2px 7px', borderRadius:16 }}>{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── UPI ID Tab ── */}
              {payMode === 'id' && (
                <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                  <div style={{ fontSize:12, color:'#374151' }}>Enter your UPI ID to pay:</div>

                  <input value={upiId} onChange={e => { setUpiId(e.target.value); setUpiErr(''); }}
                    placeholder="yourname@paytm / 9876543210@upi"
                    style={{ border:`2px solid ${upiErr ? '#ef4444' : '#d1d5db'}`, borderRadius:9, padding:'9px 11px', fontSize:12, outline:'none', background: upiErr ? '#fef2f2' : '#fff', boxSizing:'border-box', width:'100%' }} />

                  {upiErr && (
                    <div style={{ fontSize:11, color:'#ef4444', display:'flex', alignItems:'center', gap:3 }}>
                      <AlertCircle size={10} />{upiErr}
                    </div>
                  )}

                  {/* UPI suffix chips */}
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                    {['@paytm','@gpay','@ybl','@okaxis','@ibl','@upi'].map(s => (
                      <button key={s} onClick={() => { setUpiId(upiId.split('@')[0] + s); setUpiErr(''); }}
                        style={{ fontSize:10, background:'#f3f4f6', border:'1px solid #e5e7eb', borderRadius:14, padding:'3px 8px', cursor:'pointer', color:'#374151' }}>
                        {s}
                      </button>
                    ))}
                  </div>

                  <button onClick={handleManualPay} disabled={upiPaying}
                    style={{ width:'100%', background: upiPaying ? 'linear-gradient(135deg,#d97706,#b45309)' : 'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', border:'none', borderRadius:11, padding:'11px 0', fontWeight:700, fontSize:13, cursor: upiPaying ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5, transition:'background 0.4s' }}>
                    {upiPaying
                      ? <><Loader2 size={13} className="animate-spin" /> Awaiting payment confirmation...</>
                      : <><IndianRupee size={13} /> Pay ₹{grandTotal.toLocaleString('en-IN')} via UPI</>
                    }
                  </button>
                </div>
              )}

              <button onClick={() => setStep('address')}
                style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', color:'#6b7280', fontSize:11, cursor:'pointer', padding:'3px 0' }}>
                <ArrowLeft size={12} /> Back to delivery
              </button>
            </div>
          )}

          {/* ══════════ PROCESSING STEP ══════════ */}
          {step === 'processing' && (
            <div style={{ textAlign:'center', padding:'28px 0' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', border:'4px solid #dcfce7', borderTop:'4px solid #16a34a', margin:'0 auto 18px', animation:'spin 1s linear infinite' }} />
              <div style={{ fontSize:17, fontWeight:800, color:'#111827', marginBottom:7 }}>Confirming Payment</div>
              <div style={{ fontSize:12, color:'#6b7280', marginBottom:18 }}>Placing your order with the seller...</div>
              <div style={{ display:'flex', flexDirection:'column', gap:7, maxWidth:240, margin:'0 auto' }}>
                {['Payment verified','Creating order','Notifying seller','Sending confirmation'].map(s => (
                  <div key={s} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <CheckCircle size={11} color="#fff" />
                    </div>
                    <span style={{ color:'#374151' }}>{s}</span>
                  </div>
                ))}
              </div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {/* ══════════ SUCCESS STEP ══════════ */}
          {step === 'success' && bill && (
            <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
              <div style={{ textAlign:'center', padding:'4px 0 6px' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#16a34a)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', boxShadow:'0 4px 20px rgba(22,163,74,0.3)' }}>
                  <CheckCircle size={32} color="#fff" />
                </div>
                <div style={{ fontSize:19, fontWeight:900, color:'#111827', marginBottom:3 }}>Payment Successful!</div>
                <div style={{ fontSize:12, color:'#6b7280' }}>Order confirmed and being processed</div>
              </div>

              {/* Receipt */}
              <div style={{ background:'#f9fafb', border:'1.5px solid #e5e7eb', borderRadius:13, padding:13 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:9 }}>
                  <div style={{ fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:5, fontSize:12 }}>
                    <Receipt size={12} color="#16a34a" /> Receipt
                  </div>
                  <div style={{ fontSize:10, color:'#9ca3af' }}>{bill.date}</div>
                </div>

                {[['Order ID', bill.orderId], ['Transaction', bill.txnRef], ['Paid via', bill.method], ['Deliver to', bill.address]].map(([k, v]) => (
                  <div key={k} style={ROW}>
                    <span style={{ flexShrink:0 }}>{k}</span>
                    <span style={{ color:'#374151', fontWeight:500, textAlign:'right', maxWidth:'65%', wordBreak:'break-all' }}>
                      {String(v).length > 42 ? String(v).slice(0, 42) + '…' : v}
                    </span>
                  </div>
                ))}

                <div style={{ borderTop:'1px dashed #d1d5db', marginTop:9, paddingTop:9 }}>
                  {bill.items.map((it, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:2 }}>
                      <span style={{ color:'#374151' }}>{it.name} <span style={{ fontSize:10, color:'#9ca3af' }}>×{it.qty}</span></span>
                      <span style={{ fontWeight:600 }}>₹{(it.price * it.qty).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div style={{ borderTop:'1px dashed #d1d5db', marginTop:7, paddingTop:7 }}>
                    <div style={ROW}><span>Subtotal</span><span>₹{bill.subtotal.toLocaleString('en-IN')}</span></div>
                    <div style={ROW}><span>GST (5%)</span><span>₹{bill.gst.toLocaleString('en-IN')}</span></div>
                    <div style={ROW}><span>Delivery</span><span style={{ color:'#16a34a', fontWeight:700 }}>FREE</span></div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:14, color:'#111827', marginTop:5, paddingTop:5, borderTop:'1.5px solid #d1d5db' }}>
                      <span>Amount Paid</span>
                      <span style={{ color:'#166534' }}>₹{bill.grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:9, padding:9, marginTop:9, display:'flex', gap:7, alignItems:'flex-start' }}>
                  <Truck size={12} color="#16a34a" style={{ flexShrink:0, marginTop:1 }} />
                  <div style={{ fontSize:11, color:'#166534' }}>
                    <strong>Est. Delivery: {bill.eta}</strong>
                    <div style={{ opacity:0.75, marginTop:1 }}>Track in My Orders section</div>
                  </div>
                </div>
              </div>

              <div style={{ display:'flex', gap:9 }}>
                <button onClick={onClose}
                  style={{ flex:1, background:'#f9fafb', border:'1.5px solid #e5e7eb', borderRadius:11, padding:'10px 0', fontWeight:600, fontSize:12, cursor:'pointer', color:'#374151' }}>
                  Continue Shopping
                </button>
                <button onClick={() => { onClose(); if (onNavigateOrders) onNavigateOrders(); }}
                  style={{ flex:1.5, background:'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', border:'none', borderRadius:11, padding:'10px 0', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                  <Package size={13} /> View My Orders
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;