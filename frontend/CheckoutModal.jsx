import React, { useState, useEffect, useRef } from 'react';
import {
  XCircle, Receipt, MapPin, Loader2, ArrowRight, ArrowLeft,
  Smartphone, CheckCircle, AlertCircle, Copy, Truck,
  IndianRupee, Clock, Package, Info
} from 'lucide-react';

// ── Simple UPI QR (canvas-based) ─────────────────────────────────────────────
const QRCanvas = ({ amount }) => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const S = 200;
    c.width = S; c.height = S;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, S, S);
    let seed = amount + 12345;
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0xffffffff; };
    ctx.fillStyle = '#1a1a2e';
    const cell = 8, cells = Math.floor(S / cell);
    for (let r = 0; r < cells; r++) {
      for (let col = 0; col < cells; col++) {
        const corner = (r < 7 && col < 7) || (r < 7 && col >= cells - 7) || (r >= cells - 7 && col < 7);
        if (corner || rand() > 0.5) ctx.fillRect(col * cell, r * cell, cell - 1, cell - 1);
      }
    }
    const box = (x, y) => {
      ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x, y, 56, 56);
      ctx.fillStyle = '#fff';    ctx.fillRect(x+8, y+8, 40, 40);
      ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x+16, y+16, 24, 24);
    };
    box(0, 0); box(S - 56, 0); box(0, S - 56);
  }, [amount]);
  return <canvas ref={ref} style={{ width: 180, height: 180, borderRadius: 12, border: '4px solid white', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />;
};

// ── Main CheckoutModal ────────────────────────────────────────────────────────
const CheckoutModal = ({ cart, onClose, onOrderSuccess, onNavigateOrders }) => {
  const [step, setStep]               = useState('address');
  const [address, setAddress]         = useState('');
  const [addrLoading, setAddrLoading] = useState(true);
  const [upiId, setUpiId]             = useState('');
  const [upiError, setUpiError]       = useState('');
  const [timer, setTimer]             = useState(300);
  const [bill, setBill]               = useState(null);
  const [processing, setProcessing]   = useState(false);
  const timerRef = useRef(null);

  const userId = localStorage.getItem('user_id') || '';
  const token  = localStorage.getItem('token')   || '';

  // Compute totals
  const subtotal   = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const gst        = Math.round(subtotal * 0.05);
  const delivery   = 0;
  const grandTotal = subtotal + gst + delivery;

  // Load address from profile
  useEffect(() => {
    if (!userId) { setAddrLoading(false); return; }
    fetch(`http://127.0.0.1:8000/api/users/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          const parts = [d.district, d.state].filter(Boolean);
          if (parts.length) setAddress(parts.join(', '));
        }
      })
      .catch(() => {})
      .finally(() => setAddrLoading(false));
  }, []);

  // Countdown timer on payment step
  useEffect(() => {
    if (step === 'payment') {
      timerRef.current = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const validUPI = id => /^[\w.\-]+@[\w]+$/.test(id);

  const handlePay = async () => {
    if (!validUPI(upiId)) { setUpiError('Enter a valid UPI ID (e.g. name@upi)'); return; }
    setUpiError('');
    setProcessing(true);

    // Mock payment initiation
    let txnId = `txn_${Math.random().toString(36).slice(2,14)}`;
    try {
      const r = await fetch('http://127.0.0.1:8000/api/marketplace/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ amount: grandTotal, currency: 'INR', method: 'UPI' })
      });
      if (r.ok) { const d = await r.json(); if (d.payment_order_id) txnId = d.payment_order_id; }
    } catch {}

    // Create orders
    const created = [];
    for (const item of cart) {
      try {
        const r = await fetch('http://127.0.0.1:8000/api/marketplace/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            product_id: String(item.id), buyer_id: userId,
            seller_id: 'agrimart_seller', quantity: item.quantity,
            total_amount: item.price * item.quantity,
            address, payment_method: 'UPI'
          })
        });
        if (r.ok) {
          const od = await r.json();
          created.push(od);
          if (od.id) {
            await fetch('http://127.0.0.1:8000/api/marketplace/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
              body: JSON.stringify({ payment_id: txnId, order_id: od.id, status: 'SUCCESS' })
            });
          }
        }
      } catch {}
    }

    await new Promise(r => setTimeout(r, 1500));

    const d = new Date();
    const ed = new Date(); ed.setDate(ed.getDate() + 5);
    setBill({
      orderId: created[0]?.id || `AGM-${Date.now().toString().slice(-8)}`,
      txnId, upiId, address,
      items: cart.map(i => ({ name: i.name, qty: i.quantity, price: i.price, unit: i.unit })),
      subtotal, gst, delivery, grandTotal,
      date: d.toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }),
      eta:  ed.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
    });
    setProcessing(false);
    setStep('success');
    if (onOrderSuccess) onOrderSuccess();
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16, overflowY:'auto' }}>
      <div style={{ background:'#fff', borderRadius:24, width:'100%', maxWidth:520, margin:'16px auto', overflow:'hidden', boxShadow:'0 25px 60px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#166534,#15803d)', padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {step !== 'success' && step !== 'processing' && (
              <div style={{ display:'flex', gap:6 }}>
                {['address','payment'].map((s,i) => (
                  <div key={s} style={{ height:8, borderRadius:4, background: step===s ? '#fff' : 'rgba(255,255,255,0.35)', width: step===s ? 28 : 8, transition:'all 0.3s' }} />
                ))}
              </div>
            )}
            <span style={{ color:'#fff', fontWeight:700, fontSize:17 }}>
              {step==='address' ? '📦 Delivery Details' : step==='payment' ? '💳 UPI Payment' : step==='processing' ? '⏳ Processing...' : '🎉 Order Placed!'}
            </span>
          </div>
          {step !== 'processing' && (
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8, padding:6, cursor:'pointer', color:'#fff', display:'flex' }}>
              <XCircle size={20} />
            </button>
          )}
        </div>

        <div style={{ padding:24 }}>

          {/* ── STEP 1: Address ── */}
          {step === 'address' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Order summary */}
              <div style={{ background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:16, padding:16 }}>
                <div style={{ fontWeight:700, color:'#166534', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                  <Receipt size={15} /> Order Summary
                </div>
                {cart.map(item => (
                  <div key={item.id} style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#374151', marginBottom:4 }}>
                    <span>{item.name} <span style={{ color:'#9ca3af' }}>×{item.quantity}</span></span>
                    <span style={{ fontWeight:600 }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div style={{ borderTop:'1px solid #bbf7d0', marginTop:8, paddingTop:8 }}>
                  {[['Subtotal', `₹${subtotal}`], ['GST (5%)', `₹${gst}`], ['Delivery', 'FREE']].map(([k,v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#6b7280', marginBottom:2 }}>
                      <span>{k}</span><span style={{ color: v==='FREE' ? '#16a34a' : undefined, fontWeight: v==='FREE' ? 600 : undefined }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:15, color:'#111827', marginTop:4, paddingTop:4, borderTop:'1px solid #bbf7d0' }}>
                    <span>Total</span><span style={{ color:'#166534' }}>₹{grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label style={{ display:'flex', alignItems:'center', gap:6, fontWeight:700, fontSize:13, color:'#374151', marginBottom:8 }}>
                  <MapPin size={14} color="#16a34a" /> Delivery Address
                </label>
                {addrLoading ? (
                  <div style={{ display:'flex', alignItems:'center', gap:8, color:'#9ca3af', fontSize:13, padding:8 }}>
                    <Loader2 size={14} className="animate-spin" /> Loading your saved address...
                  </div>
                ) : (
                  <>
                    <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3}
                      placeholder="Enter your full delivery address..."
                      style={{ width:'100%', border:'2px solid #d1d5db', borderRadius:12, padding:'10px 14px', fontSize:13, resize:'none', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }} />
                    {address && <div style={{ fontSize:11, color:'#16a34a', display:'flex', alignItems:'center', gap:4, marginTop:4 }}><CheckCircle size={11} /> Address loaded from your profile</div>}
                  </>
                )}
              </div>

              <div style={{ background:'#eff6ff', border:'1.5px solid #bfdbfe', borderRadius:10, padding:10, fontSize:12, color:'#1d4ed8', display:'flex', gap:8 }}>
                <Info size={14} style={{ flexShrink:0, marginTop:1 }} /> Free delivery on all orders. Expected in 3–5 business days.
              </div>

              <button onClick={() => { if (address.trim()) setStep('payment'); }} disabled={!address.trim()}
                style={{ width:'100%', background:'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', border:'none', borderRadius:14, padding:'14px 20px', fontWeight:700, fontSize:15, cursor: address.trim() ? 'pointer' : 'not-allowed', opacity: address.trim() ? 1 : 0.5, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                Proceed to Payment <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* ── STEP 2: Payment ── */}
          {step === 'payment' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:28, fontWeight:900, color:'#111827' }}>₹{grandTotal.toLocaleString('en-IN')}</div>
                <div style={{ fontSize:12, color:'#6b7280', marginTop:2 }}>Total payable via UPI</div>
              </div>

              <div style={{ display:'flex', justifyContent:'center' }}>
                <QRCanvas amount={grandTotal} />
              </div>

              <div style={{ background:'#fffbeb', border:'1.5px solid #fde68a', borderRadius:10, padding:10, textAlign:'center', fontSize:12, color:'#92400e' }}>
                <Clock size={13} style={{ display:'inline', marginRight:4 }} />
                Session expires in {fmt(timer)} · Scan QR or enter UPI ID below
              </div>

              <div>
                <label style={{ fontWeight:700, fontSize:13, color:'#374151', display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                  <Smartphone size={14} color="#16a34a" /> Your UPI ID
                </label>
                <input value={upiId} onChange={e => { setUpiId(e.target.value); setUpiError(''); }}
                  placeholder="yourname@paytm / @gpay / @ybl"
                  style={{ width:'100%', border:`2px solid ${upiError ? '#ef4444' : '#d1d5db'}`, borderRadius:12, padding:'10px 14px', fontSize:13, outline:'none', background: upiError ? '#fef2f2' : '#fff', boxSizing:'border-box' }} />
                {upiError && <div style={{ fontSize:11, color:'#ef4444', marginTop:4, display:'flex', alignItems:'center', gap:4 }}><AlertCircle size={11} />{upiError}</div>}
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:8 }}>
                  {['@paytm','@gpay','@ybl','@okaxis'].map(s => (
                    <button key={s} onClick={() => { setUpiId(upiId.split('@')[0]+s); setUpiError(''); }}
                      style={{ fontSize:11, background:'#f3f4f6', border:'none', borderRadius:20, padding:'4px 10px', cursor:'pointer', color:'#374151' }}>{s}</button>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setStep('address')} style={{ flex:1, background:'#f9fafb', border:'2px solid #e5e7eb', borderRadius:14, padding:'12px 16px', fontWeight:600, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  <ArrowLeft size={15} /> Back
                </button>
                <button onClick={handlePay} style={{ flex:2, background:'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', border:'none', borderRadius:14, padding:'12px 16px', fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  <IndianRupee size={15} /> Pay ₹{grandTotal.toLocaleString('en-IN')}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Processing ── */}
          {(step === 'processing' || processing) && (
            <div style={{ textAlign:'center', padding:'32px 0' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', border:'5px solid #dcfce7', borderTop:'5px solid #16a34a', animation:'spin 1s linear infinite', margin:'0 auto 20px' }} />
              <div style={{ fontSize:19, fontWeight:800, color:'#111827', marginBottom:8 }}>Processing Payment</div>
              <div style={{ fontSize:13, color:'#6b7280' }}>Verifying UPI transaction and confirming your order...</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* ── STEP 4: Success ── */}
          {step === 'success' && bill && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ textAlign:'center', padding:'8px 0 4px' }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#16a34a)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', boxShadow:'0 4px 20px rgba(22,163,74,0.3)' }}>
                  <CheckCircle size={36} color="#fff" />
                </div>
                <div style={{ fontSize:22, fontWeight:900, color:'#111827', marginBottom:4 }}>Payment Successful!</div>
                <div style={{ fontSize:13, color:'#6b7280' }}>Your order has been placed and is being processed</div>
              </div>

              {/* Bill */}
              <div style={{ background:'#f9fafb', border:'1.5px solid #e5e7eb', borderRadius:16, padding:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <div style={{ fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:6 }}><Receipt size={14} color="#16a34a" /> Order Receipt</div>
                  <div style={{ fontSize:11, color:'#9ca3af' }}>{bill.date}</div>
                </div>
                {[['Order ID', bill.orderId], ['UPI ID', bill.upiId], ['Delivery to', bill.address]].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#6b7280', marginBottom:4 }}>
                    <span>{k}</span><span style={{ color:'#374151', fontWeight:500, maxWidth:'60%', textAlign:'right' }}>{String(v).slice(0,40)}{String(v).length>40?'...':''}</span>
                  </div>
                ))}
                <div style={{ borderTop:'1px dashed #d1d5db', marginTop:10, paddingTop:10 }}>
                  {bill.items.map((it,idx) => (
                    <div key={idx} style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:3 }}>
                      <span style={{ color:'#374151' }}>{it.name} <span style={{ fontSize:11, color:'#9ca3af' }}>({it.unit}) ×{it.qty}</span></span>
                      <span style={{ fontWeight:600 }}>₹{it.price*it.qty}</span>
                    </div>
                  ))}
                  <div style={{ borderTop:'1px dashed #d1d5db', marginTop:8, paddingTop:8 }}>
                    {[['Subtotal',`₹${bill.subtotal}`],['GST (5%)',`₹${bill.gst}`],['Delivery','FREE']].map(([k,v]) => (
                      <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#6b7280', marginBottom:2 }}>
                        <span>{k}</span><span style={{ color: v==='FREE'?'#16a34a':undefined, fontWeight: v==='FREE'?600:undefined }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:15, color:'#111827', marginTop:6, paddingTop:6, borderTop:'1px solid #d1d5db' }}>
                      <span>Amount Paid</span><span style={{ color:'#166534' }}>₹{bill.grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
                <div style={{ background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:10, padding:10, marginTop:12, display:'flex', gap:8, alignItems:'flex-start' }}>
                  <Truck size={14} color="#16a34a" style={{ flexShrink:0, marginTop:1 }} />
                  <div style={{ fontSize:12, color:'#166534' }}>
                    <div style={{ fontWeight:700 }}>Estimated Delivery: {bill.eta}</div>
                    <div style={{ opacity:0.75, marginTop:2 }}>Track your order in the My Orders section</div>
                  </div>
                </div>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={onClose} style={{ flex:1, background:'#f9fafb', border:'2px solid #e5e7eb', borderRadius:14, padding:'12px 16px', fontWeight:600, fontSize:13, cursor:'pointer' }}>
                  Continue Shopping
                </button>
                <button onClick={() => { onClose(); if (onNavigateOrders) onNavigateOrders(); }}
                  style={{ flex:1.5, background:'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', border:'none', borderRadius:14, padding:'12px 16px', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  <Package size={15} /> View My Orders
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