import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, Printer, Receipt, X, ChevronRight,
  CheckCircle, AlertCircle, Loader, Zap, Clock, UtensilsCrossed, Lock,
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';

/* ── Helper: load all orders from localStorage ─────────────── */
function loadAllOrders(hotelId) {
  try {
    const targetKey = `rms_orders_${hotelId || 'default'}`;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('rms_orders_')) keys.push(k);
    }
    if (!keys.includes(targetKey)) keys.push(targetKey);
    const seen = new Set();
    const all = [];
    keys.forEach(k => {
      try {
        const items = JSON.parse(localStorage.getItem(k) || '[]');
        items.forEach(o => {
          if (o && o.id && !seen.has(o.id)) { seen.add(o.id); all.push({ order: o, storageKey: k }); }
        });
      } catch {}
    });
    return all;
  } catch { return []; }
}

function findOrderById(hotelId, orderId) {
  const all = loadAllOrders(hotelId);
  return all.find(({ order }) => order.id === orderId) || null;
}

async function markOrderPaid(storageKey, orderId, paymentMethod) {
  const paidAt  = new Date().toISOString();
  const updates = { status: 'paid', payment: paymentMethod, paidAt };

  // Update on shared server first
  try {
    await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(updates),
    });
  } catch { /* server unreachable */ }

  // Also update localStorage (for same-device fallback / offline resilience)
  try {
    const items   = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = items.map(o => o.id === orderId ? { ...o, ...updates } : o);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch {}
  return true;
}

const TAX_RATE     = 0.05;
const SERVICE_RATE = 0.1;

function LineItem({ item, index }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ delay: 0.05 + index * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <td style={{ padding: '11px 0', borderBottom: '1px solid rgba(72,160,100,0.07)', fontSize: 13, color: 'var(--text-primary)' }}>
        {item.name}
      </td>
      <td style={{ padding: '11px 8px', borderBottom: '1px solid rgba(72,160,100,0.07)', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
        {item.qty}
      </td>
      <td style={{ padding: '11px 8px', borderBottom: '1px solid rgba(72,160,100,0.07)', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right' }}>
        ₹{item.price}
      </td>
      <td style={{ padding: '11px 0 11px 8px', borderBottom: '1px solid rgba(72,160,100,0.07)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', fontFamily: 'Cormorant Garamond, serif' }}>
        ₹{(item.qty * item.price).toLocaleString()}
      </td>
    </motion.tr>
  );
}

function BillModal({ orderId, data, onClose, onCloseBill }) {
  const [printed, setPrinted] = useState(false);
  const [payMethod, setPayMethod] = useState('Cash');
  const subtotal  = data.items.reduce((s, i) => s + i.qty * i.price, 0);
  const tax       = Math.round(subtotal * TAX_RATE);
  const service   = Math.round(subtotal * SERVICE_RATE);
  const total     = subtotal + tax + service;

  const handleGenerate = () => {
    setPrinted(true);
    setTimeout(() => setPrinted(false), 2400);
  };

  const handleCloseBill = () => {
    if (onCloseBill) onCloseBill(payMethod);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(3px)" }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 560,
          maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 16px 48px rgba(40,110,70,0.2), 0 0 60px rgba(72,160,100,0.08)',
          position: 'relative',
        }}
      >
        {/* Decorative top line */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(72,160,100,0.8), transparent)',
        }} />

        {/* Modal Header */}
        <div style={{
          padding: '22px 26px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'var(--gold-dim)', border: '1px solid var(--border-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Receipt size={15} color="var(--gold)" />
              </div>
              <div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Bill Preview
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  Order {orderId} · {data.table}
                </div>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'rgba(72,160,100,0.09)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={14} color="var(--text-muted)" />
          </motion.button>
        </div>

        {/* Order meta */}
        <div style={{ padding: '14px 26px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Waiter', value: data.waiter },
            { label: 'Seated', value: data.seated },
            { label: 'Covers', value: `${Math.floor(Math.random() * 3) + 2} pax` },
          ].map(m => (
            <div key={m.label}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Items Table */}
        <div style={{ overflowY: 'auto', padding: '10px 26px 0', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Item', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
                  <th key={h} style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.09em',
                    textTransform: 'uppercase', color: 'var(--text-muted)',
                    paddingBottom: 10, textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right',
                    borderBottom: '1px solid var(--border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => <LineItem key={item.name} item={item} index={i} />)}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ padding: '16px 26px', borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Subtotal',        value: `₹${subtotal.toLocaleString()}`,   muted: true },
            { label: `CGST + SGST (${TAX_RATE * 100}%)`,    value: `₹${tax.toLocaleString()}`,      muted: true },
            { label: `Service Charge (${SERVICE_RATE * 100}%)`, value: `₹${service.toLocaleString()}`, muted: true },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{r.label}</span>
              <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{r.value}</span>
            </div>
          ))}

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-accent)',
          }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
              Grand Total
            </span>
            <span style={{
              fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 700,
              background: 'linear-gradient(135deg, var(--gold), var(--gold-bright))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              ₹{total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ padding: '14px 26px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Payment method selector */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center', marginRight: 4 }}>Payment:</span>
            {['Cash', 'Card', 'UPI'].map(pm => (
              <button
                key={pm}
                onClick={() => setPayMethod(pm)}
                style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 500,
                  cursor: 'pointer', border: '1px solid',
                  background: payMethod === pm ? 'rgba(72,160,100,0.1)' : 'transparent',
                  borderColor: payMethod === pm ? 'rgba(72,160,100,0.4)' : 'var(--border)',
                  color: payMethod === pm ? 'var(--gold)' : 'var(--text-muted)',
                  transition: 'all 0.18s',
                }}
              >{pm}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={onClose}
              style={{
                flex: 1, padding: '11px', borderRadius: 11,
                background: 'transparent', border: '1px solid var(--border)',
                fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(72,160,100,0.3)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              style={{
                flex: 2, padding: '11px', borderRadius: 11,
                background: 'linear-gradient(135deg, var(--gold), #2e7d50)',
                border: 'none', fontSize: 13.5, fontWeight: 600, color: '#1a3a28',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 20px rgba(72,160,100,0.2)',
              }}
            >
              {printed
                ? <><CheckCircle size={14} /> Bill Generated!</>
                : <><Printer size={14} /> Print Bill</>
              }
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(39,160,107,0.25)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCloseBill}
              style={{
                flex: 2, padding: '11px', borderRadius: 11,
                background: 'rgba(39,160,107,0.12)', border: '1px solid rgba(39,160,107,0.35)',
                fontSize: 13.5, fontWeight: 600, color: '#27a06b',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <CheckCircle size={14} /> Close Bill ({payMethod})
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GenerateBillPage() {
  const { activeHotelId } = useHotel();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query,   setQuery]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [found,   setFound]   = useState(null);
  const [foundId, setFoundId] = useState('');
  const [storageKey, setStorageKey] = useState('');
  const [modal,   setModal]   = useState(false);
  const [billClosed, setBillClosed] = useState(false);
  const inputRef = useRef();

  // Auto-load order if orderId is in URL params
  useEffect(() => {
    const paramId = searchParams.get('orderId');
    if (paramId) {
      setQuery(paramId);
      loadOrder(paramId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadOrder = (id) => {
    const q = (id || query).trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setFound(null);
    setBillClosed(false);
    setTimeout(() => {
      setLoading(false);
      // Search localStorage first
      const result = findOrderById(activeHotelId, q);
      if (result) {
        const { order, storageKey: sk } = result;
        setFound({
          table:   order.tableNumber || 'Takeaway',
          waiter:  order.waiter || '—',
          seated:  order.time || '—',
          items:   (order.items || []).map(i => ({
            name:  i.name,
            qty:   i.quantity ?? i.qty ?? 1,
            price: i.price ?? i.unitPrice ?? 0,
          })),
          status:  order.status,
          payment: order.payment || '',
        });
        setFoundId(q);
        setStorageKey(sk);
        if (order.status === 'paid') setBillClosed(true);
      } else {
        setError(`No order found for "${q}". Please check the Order ID and try again.`);
      }
    }, 600);
  };

  const handleSearch = () => loadOrder(query);

  const handleCloseBill = (paymentMethod) => {
    if (!storageKey || !foundId) return;
    const ok = markOrderPaid(storageKey, foundId, paymentMethod);
    if (ok) {
      setBillClosed(true);
      setFound(prev => ({ ...prev, status: 'paid', payment: paymentMethod }));
      setModal(false);
    }
  };

  const subtotal = found ? found.items.reduce((s, i) => s + (i.qty * i.price), 0) : 0;
  const tax      = Math.round(subtotal * TAX_RATE);
  const service  = Math.round(subtotal * SERVICE_RATE);
  const total    = subtotal + tax + service;

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto' }}>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -14, filter: "blur(5px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 28 }}
      >
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
          Finance / Checkout
        </p>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 600,
          color: 'var(--text-primary)', lineHeight: 1.1,
        }}>
          Generate Bill
        </h1>
      </motion.div>

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 18, filter: "blur(5px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '28px 32px',
          marginBottom: 20, position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(72,160,100,0.5), transparent)',
        }} />

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 5 }}>
            Lookup Order
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            Enter an Order ID to fetch the order details and generate a bill.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Receipt size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. ORD-1042"
              style={{
                width: '100%', paddingLeft: 40, paddingRight: 14, paddingTop: 11, paddingBottom: 11,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 11, fontSize: 13.5, color: 'var(--text-primary)',
                outline: 'none', fontFamily: 'Cormorant Garamond, serif',
                letterSpacing: '0.03em', fontWeight: 600,
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(72,160,100,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(72,160,100,0.14)'}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 6px 24px rgba(72,160,100,0.25)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: '11px 24px', borderRadius: 11,
              background: 'linear-gradient(135deg, var(--gold), #2e7d50)',
              border: 'none', fontSize: 13, fontWeight: 600, color: '#1a3a28',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <><Loader size={13} style={{ animation: 'spin 0.9s linear infinite' }} /> Searching…</> : <><Search size={13} /> Search Order</>}
          </motion.button>
        </div>

        {/* Quick access chips removed – orders load from live data */}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6, filter: "blur(5px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(3px)" }}
              style={{
                marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '10px 14px', borderRadius: 9,
                background: 'rgba(224,85,85,0.07)', border: '1px solid rgba(224,85,85,0.2)',
                fontSize: 12.5, color: '#d63b3b',
              }}
            >
              <AlertCircle size={13} style={{ marginTop: 1, flexShrink: 0 }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bill Preview */}
      <AnimatePresence>
        {found && (
          <motion.div
            initial={{ opacity: 0, y: 22, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-xl)', overflow: 'hidden',
              boxShadow: '0 8px 48px rgba(40,110,70,0.12), 0 0 40px rgba(72,160,100,0.06)',
            }}
          >
            {/* Preview header */}
            <div style={{
              padding: '20px 28px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(72,160,100,0.05), transparent)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--gold-dim)', border: '1px solid var(--border-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Zap size={15} color="var(--gold)" />
                </div>
                <div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Bill Preview — {foundId}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                    {found.table} · Waiter: {found.waiter}
                  </div>
                </div>
              </div>
              {(() => {
                const s = found.status;
                const isPaid = billClosed || s === 'paid';
                const isReady = s === 'ready' || s === 'served' || s === 'completed';
                const isPrep = s === 'prep' || s === 'preparing';
                const label = isPaid ? 'Paid' : isReady ? 'Served — Ready to Bill' : isPrep ? 'Preparing' : 'Pending';
                const bg = isPaid ? 'rgba(76,175,147,0.1)' : isReady ? 'rgba(72,160,100,0.1)' : isPrep ? 'rgba(36,120,200,0.1)' : 'rgba(230,160,40,0.1)';
                const border = isPaid ? 'rgba(76,175,147,0.25)' : isReady ? 'rgba(72,160,100,0.3)' : isPrep ? 'rgba(36,120,200,0.3)' : 'rgba(230,160,40,0.3)';
                const color = isPaid ? '#27a06b' : isReady ? '#3a9b65' : isPrep ? '#2478c8' : '#e6a028';
                return (
                  <span style={{
                    padding: '4px 12px', borderRadius: 20,
                    background: bg, border: `1px solid ${border}`,
                    fontSize: 11, fontWeight: 600, color,
                  }}>
                    {label}
                  </span>
                );
              })()}
            </div>

            {/* Items summary table */}
            <div className="table-scroll-wrapper" style={{ padding: '18px 28px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 4, minWidth: 380 }}>
                <thead>
                  <tr>
                    {['Item', 'Qty', 'Unit', 'Amount'].map((h, i) => (
                      <th key={h} style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: 'var(--text-muted)',
                        paddingBottom: 10, borderBottom: '1px solid var(--border)',
                        textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {found.items.map((item, i) => <LineItem key={item.name} item={item} index={i} />)}
                </tbody>
              </table>
            </div>

            {/* Totals breakdown */}
            <div style={{
              margin: '0 28px 20px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '16px 20px',
            }}>
              {[
                { label: 'Subtotal',            value: `₹${subtotal.toLocaleString()}` },
                { label: `CGST + SGST (${TAX_RATE * 100}%)`,        value: `₹${tax.toLocaleString()}` },
                { label: `Service Charge (${SERVICE_RATE * 100}%)`,  value: `₹${service.toLocaleString()}` },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 9 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{r.label}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{r.value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Grand Total
                </span>
                <span style={{
                  fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--gold), var(--gold-bright))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* CTA */}
            {(() => {
              const orderStatus = found.status;
              const isServed = orderStatus === 'ready' || orderStatus === 'served' || orderStatus === 'completed';
              const isPending = orderStatus === 'pending' || orderStatus === 'new';
              const isPrep = orderStatus === 'prep' || orderStatus === 'preparing';
              const isBlocked = !billClosed && (isPending || isPrep);

              const statusLabel = isPending ? 'Pending' : isPrep ? 'Preparing' : 'Ready to Bill';
              const StatusIcon = isPending ? Clock : isPrep ? UtensilsCrossed : CheckCircle;
              const statusColor = isPending
                ? { bg: 'rgba(230,160,40,0.1)', border: 'rgba(230,160,40,0.3)', color: '#e6a028' }
                : isPrep
                ? { bg: 'rgba(36,120,200,0.1)', border: 'rgba(36,120,200,0.3)', color: '#2478c8' }
                : { bg: 'rgba(76,175,147,0.1)', border: 'rgba(76,175,147,0.3)', color: '#27a06b' };

              return (
                <div style={{ padding: '0 28px 26px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Order status indicator bar */}
                  {!billClosed && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', borderRadius: 10,
                      background: statusColor.bg, border: `1px solid ${statusColor.border}`,
                    }}>
                      <StatusIcon size={14} color={statusColor.color} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: statusColor.color }}>
                          Order Status: {statusLabel}
                        </span>
                        {isBlocked && (
                          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginLeft: 10 }}>
                            · Bill can only be generated once the order is <strong>Served</strong>
                          </span>
                        )}
                      </div>
                      {isBlocked && <Lock size={13} color="var(--text-muted)" />}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {billClosed ? (
                      <div style={{
                        flex: 1, padding: '13px', borderRadius: 12, textAlign: 'center',
                        background: 'rgba(76,175,147,0.1)', border: '1px solid rgba(76,175,147,0.3)',
                        fontSize: 14, fontWeight: 700, color: '#27a06b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontFamily: 'Cormorant Garamond, serif',
                      }}>
                        <CheckCircle size={16} /> Bill Closed · Paid ({found.payment || 'Cash'})
                      </div>
                    ) : isBlocked ? (
                      <div style={{
                        flex: 1, padding: '13px', borderRadius: 12, textAlign: 'center',
                        background: 'rgba(100,100,100,0.05)', border: '1px solid rgba(100,100,100,0.15)',
                        fontSize: 13.5, fontWeight: 600,
                        color: 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontFamily: 'Cormorant Garamond, serif',
                        cursor: 'not-allowed', userSelect: 'none',
                      }}>
                        <Lock size={14} />
                        Billing locked — waiting for order to be served
                      </div>
                    ) : (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(72,160,100,0.3)' }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setModal(true)}
                          style={{
                            flex: 1, padding: '13px', borderRadius: 12,
                            background: 'linear-gradient(135deg, var(--gold), #2e7d50)',
                            border: 'none', fontSize: 14, fontWeight: 700, color: '#1a3a28',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: '0 4px 20px rgba(72,160,100,0.22)',
                            fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.02em',
                          }}
                        >
                          <Printer size={15} /> Generate &amp; Print Full Bill
                          <ChevronRight size={14} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(39,160,107,0.25)' }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleCloseBill('Cash')}
                          style={{
                            padding: '13px 20px', borderRadius: 12,
                            background: 'rgba(39,160,107,0.12)', border: '1px solid rgba(39,160,107,0.35)',
                            fontSize: 13, fontWeight: 600, color: '#27a06b',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                            fontFamily: 'Cormorant Garamond, serif',
                          }}
                        >
                          <CheckCircle size={14} /> Close Bill (Cash)
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bill Modal */}
      <AnimatePresence>
        {modal && found && (
          <BillModal orderId={foundId} data={found} onClose={() => setModal(false)} onCloseBill={handleCloseBill} />
        )}
      </AnimatePresence>

      {/* Spin keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ height: 36 }} />
    </div>
  );
}