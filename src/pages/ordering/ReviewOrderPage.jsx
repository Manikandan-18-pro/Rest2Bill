import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Plus, Minus, Trash2, ShoppingBag,
  UtensilsCrossed, Package, CheckCircle2, AlertCircle,
  ArrowLeft, RotateCcw, ChevronRight, Clock, Tag, Utensils,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { loadTables, saveTables } from '../TableManagementPage';

const EASE = [0.16, 1, 0.3, 1];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function ReviewOrderPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const table   = params.get('table') || sessionStorage.getItem('rms_table') || '7';
  const hotelId = (
    params.get('hotel') ||
    params.get('hotel_id') ||
    params.get('hotelId') ||
    sessionStorage.getItem('rms_hotel_id') ||
    ''
  );
  const { items, removeItem, updateQty, clearAll, diningType, setDiningType, subtotal, tax, total, totalItems } = useCart();
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId]     = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [note, setNote] = useState('');
  const isMobile = useIsMobile();

  const handleConfirm = async () => {
    setConfirming(true);
    setSubmitError(null);
    try {
      const newOrderId = 'ORD-' + Date.now();
      const now = new Date();

      const orderData = {
        id:          newOrderId,
        type:        diningType === 'eat_in' ? 'eat' : 'parcel',
        tableNumber: diningType === 'eat_in' ? `Table-${table}` : 'Takeaway',
        totalAmount: total.toFixed(2),
        hotel_id:    hotelId || 'default',
        status:      'pending',
        date:        now.toISOString().split('T')[0],
        time:        now.toTimeString().slice(0, 5),
        payment:     '—',
        items: items.map(i => ({
          name: i.name, quantity: i.qty, price: i.price, category: i.cat,
        })),
        note,
        createdAt: now.toISOString(),
      };

      // ── Save to shared server (so all devices see it) ──────────────
      // Falls back to localStorage if server is unreachable.
      let savedToServer = false;
      try {
        const r = await fetch('/api/orders', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(orderData),
        });
        if (r.ok || r.status === 409) savedToServer = true;
      } catch { /* server unreachable – use localStorage fallback */ }

      if (!savedToServer) {
        const key      = `rms_orders_${hotelId || 'default'}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        localStorage.setItem(key, JSON.stringify([orderData, ...existing]));
      }

      // Mark the table as occupied in table management
      if (diningType === 'eat_in' && table) {
        const tableKey = hotelId || 'default';
        const tablesRaw = localStorage.getItem(`rms_tables_${tableKey}`);
        if (tablesRaw) {
          const currentTables = JSON.parse(tablesRaw);
          const tableId = `T${table}`;
          const updatedTables = currentTables.map(t =>
            t.id === tableId ? { ...t, status: 'occupied' } : t
          );
          localStorage.setItem(`rms_tables_${tableKey}`, JSON.stringify(updatedTables));
          window.dispatchEvent(new CustomEvent('rms_tables_updated', { detail: { hotelId: tableKey } }));
        }
      }

      setOrderId(newOrderId);
      setConfirmed(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  if (confirmed) {
    return (
      <OrderConfirmedScreen
        table={table} total={total} diningType={diningType}
        items={items} orderId={orderId}
        onDone={() => { clearAll(); navigate(`/order/menu?table=${table}&hotel=${hotelId}`); }}
        isMobile={isMobile}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      background: '#dceedd',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 640,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div style={{
          padding: isMobile ? '16px 16px 0' : '20px 20px 0',
          position: 'sticky', top: 0, zIndex: 30,
          background: 'linear-gradient(180deg, rgba(220,238,221,0.97) 0%, rgba(220,238,221,0.94) 75%, transparent 100%)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: isMobile ? 16 : 24 }}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              style={{
                width: isMobile ? 36 : 40, height: isMobile ? 36 : 40, borderRadius: 13,
                background: 'rgba(26,58,40,0.08)', border: '1px solid rgba(26,58,40,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <ChevronLeft size={18} color="#4a7a5a" />
            </motion.button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: isMobile ? 22 : 26, fontWeight: 700, color: '#1a3a28', lineHeight: 1.1,
              }}>
                Review Order
              </h1>
              <p style={{ color: 'rgba(122,170,136,0.6)', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                Table {table} · {totalItems} item{totalItems !== 1 ? 's' : ''}
              </p>
            </div>
            {items.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
                onClick={clearAll}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 12px', borderRadius: 10, border: '1px solid rgba(214,59,59,0.3)',
                  background: 'rgba(214,59,59,0.08)', color: 'rgba(214,59,59,0.7)',
                  fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <RotateCcw size={11} />
                {isMobile ? 'Clear' : 'Clear All'}
              </motion.button>
            )}
          </div>
        </div>

        {/* ── Empty state ─────────────────────────────────────────────────────── */}
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', textAlign: 'center' }}
          >
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
              <ShoppingBag size={56} color="#7aaa88" />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: '#1a3a28', marginBottom: 10 }}>Your order is empty</h2>
            <p style={{ color: '#7aaa88', fontSize: 14, fontFamily: "'DM Sans', sans-serif", marginBottom: 28 }}>
              Head back to the menu and add some dishes!
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/order/menu?table=${table}`)}
              style={{
                padding: '14px 28px', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #4a9b63 0%, #2e6644 100%)',
                color: '#fff', fontSize: 15, fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <ArrowLeft size={16} />
              Back to Menu
            </motion.button>
          </motion.div>
        )}

        {items.length > 0 && (
          <div style={{
            padding: isMobile ? '0 14px 120px' : '0 20px 120px',
            flex: 1, overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}>

            {/* ── Dining Type Selector ─────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.45, ease: EASE }}
              style={{ marginBottom: 20 }}
            >
              <p style={{
                color: 'rgba(122,170,136,0.5)', fontSize: 11, letterSpacing: '0.1em',
                textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif",
                marginBottom: 10, fontWeight: 500,
              }}>
                Dining Option
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 10 : 12 }}>
                {[
                  { id: 'eat_in', label: 'Eat In', icon: <UtensilsCrossed size={isMobile ? 18 : 22} />, sub: 'Served at your table' },
                  { id: 'parcel', label: 'Parcel', icon: <Package size={isMobile ? 18 : 22} />, sub: 'Packed to take away' },
                ].map(opt => {
                  const active = diningType === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setDiningType(opt.id)}
                      style={{
                        padding: isMobile ? '14px 10px' : '18px 16px',
                        borderRadius: 16, cursor: 'pointer',
                        background: active
                          ? 'linear-gradient(135deg, rgba(74,155,99,0.15) 0%, rgba(74,155,99,0.08) 100%)'
                          : '#ffffff',
                        border: active ? '1px solid rgba(74,155,99,0.4)' : '1px solid rgba(26,58,40,0.08)',
                        boxShadow: active ? '0 4px 12px rgba(74,155,99,0.12)' : '0 2px 6px rgba(26,58,40,0.06)',
                        textAlign: 'center',
                        transition: 'all 0.28s ease',
                        position: 'relative', overflow: 'hidden',
                      }}
                    >
                      {active && (
                        <motion.div
                          layoutId="diningActive"
                          style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(135deg, rgba(58,155,101,0.15), transparent)',
                            borderRadius: 16, pointerEvents: 'none',
                          }}
                        />
                      )}
                      <div style={{ color: active ? '#4a9b63' : '#7aaa88', marginBottom: 6, display: 'flex', justifyContent: 'center' }}>
                        {opt.icon}
                      </div>
                      <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: isMobile ? 16 : 18, fontWeight: 600,
                        color: active ? '#1a3a28' : '#4a7a5a', marginBottom: 2,
                      }}>
                        {opt.label}
                      </p>
                      <p style={{
                        fontSize: isMobile ? 10 : 11,
                        color: active ? '#4a7a5a' : '#7aaa88',
                        fontFamily: "'DM Sans', sans-serif",
                      }}>
                        {opt.sub}
                      </p>
                      {active && (
                        <CheckCircle2 size={14} color="#4a9b63" style={{ position: 'absolute', top: 10, right: 10 }} />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── Items List ──────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.45, ease: EASE }}
              style={{ marginBottom: 18 }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10,
              }}>
                <p style={{
                  color: 'rgba(122,170,136,0.5)', fontSize: 11, letterSpacing: '0.1em',
                  textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                }}>
                  Selected Items
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/order/menu?table=${table}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 9, border: '1px solid rgba(58,155,101,0.3)',
                    background: 'rgba(58,155,101,0.08)', color: '#4dbf7f',
                    fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                  }}
                >
                  <Plus size={12} strokeWidth={2.5} />
                  Add more
                </motion.button>
              </div>

              <div style={{
                background: 'rgba(26,58,40,0.04)',
                border: '1px solid rgba(26,58,40,0.08)',
                borderRadius: 20, overflow: 'hidden',
              }}>
                <AnimatePresence initial={false}>
                  {items.map((item, idx) => (
                    <ReviewItem
                      key={item.id}
                      item={item}
                      isLast={idx === items.length - 1}
                      isMobile={isMobile}
                      onInc={() => updateQty(item.id, item.qty + 1)}
                      onDec={() => updateQty(item.id, item.qty - 1)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* ── Special note ────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.45, ease: EASE }}
              style={{ marginBottom: 18 }}
            >
              <p style={{
                color: 'rgba(122,170,136,0.5)', fontSize: 11, letterSpacing: '0.1em',
                textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                marginBottom: 10,
              }}>
                Special Instructions (Optional)
              </p>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Allergies, spice level, extra requests…"
                rows={3}
                style={{
                  width: '100%', padding: '14px 16px',
                  background: 'rgba(26,58,40,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14, color: '#1a3a28', fontSize: isMobile ? 16 : 14,
                  fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'none',
                  lineHeight: 1.6, boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(58,155,101,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </motion.div>

            {/* ── Bill Summary ─────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.45, ease: EASE }}
              style={{
                background: 'rgba(26,58,40,0.04)',
                border: '1px solid rgba(26,58,40,0.08)',
                borderRadius: 20, padding: isMobile ? '16px' : '20px',
                marginBottom: 16,
              }}
            >
              <p style={{
                color: 'rgba(122,170,136,0.5)', fontSize: 11, letterSpacing: '0.1em',
                textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                marginBottom: 14,
              }}>
                Order Summary
              </p>

              {/* Item-wise mini list */}
              <div style={{ marginBottom: 12 }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, gap: 8 }}>
                    <span style={{
                      color: 'rgba(122,170,136,0.55)', fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                    }}>
                      {item.name} <span style={{ color: 'rgba(122,170,136,0.35)' }}>×{item.qty}</span>
                    </span>
                    <span style={{ color: 'rgba(122,170,136,0.65)', fontSize: 13, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
                      ₹{(item.price * item.qty).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 12 }} />

              {/* Dining type badge */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
              }}>
                <span style={{ color: 'rgba(122,170,136,0.5)', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Dining Type</span>
                <div style={{
                  padding: '4px 10px', borderRadius: 7,
                  background: diningType === 'eat_in' ? 'rgba(58,155,101,0.15)' : 'rgba(36,120,200,0.15)',
                  border: `1px solid ${diningType === 'eat_in' ? 'rgba(58,155,101,0.3)' : 'rgba(36,120,200,0.3)'}`,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {diningType === 'eat_in' ? <UtensilsCrossed size={11} color="#4dbf7f" /> : <Package size={11} color="#4499e0" />}
                  <span style={{
                    fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                    color: diningType === 'eat_in' ? '#4dbf7f' : '#4499e0',
                  }}>
                    {diningType === 'eat_in' ? 'Eat In' : 'Parcel'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'rgba(122,170,136,0.5)', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Subtotal</span>
                <span style={{ color: 'rgba(122,170,136,0.7)', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>₹{subtotal.toFixed(0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ color: 'rgba(122,170,136,0.5)', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>GST (5%)</span>
                <span style={{ color: 'rgba(122,170,136,0.7)', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>₹{tax.toFixed(0)}</span>
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 14 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: '#1a3a28',
                }}>Total</span>
                <motion.span
                  key={total}
                  initial={{ scale: 1.15 }} animate={{ scale: 1 }}
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: '#4dbf7f' }}
                >
                  ₹{total.toFixed(0)}
                </motion.span>
              </div>
            </motion.div>

            {/* ── Confirm button ───────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.45, ease: EASE }}
            >
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 10px 28px rgba(74,155,99,0.2)' }}
                whileTap={{ scale: 0.98 }}
                disabled={confirming}
                onClick={handleConfirm}
                style={{
                  width: '100%',
                  padding: isMobile ? '16px 24px' : '18px 24px',
                  borderRadius: 18, border: 'none',
                  background: confirming
                    ? 'rgba(74,155,99,0.5)'
                    : 'linear-gradient(135deg, #4a9b63 0%, #2e6644 100%)',
                  color: '#fff', fontSize: isMobile ? 15 : 17, fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif", cursor: confirming ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 6px 20px rgba(74,155,99,0.18)',
                  transition: 'background 0.25s, box-shadow 0.25s',
                }}
              >
                {confirming ? (
                  <>
                    <LoadingSpinner />
                    Placing Order…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Confirm Order · ₹{total.toFixed(0)}
                  </>
                )}
              </motion.button>

              {/* Error message */}
              {submitError && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 12, padding: '12px 16px', borderRadius: 12,
                    background: 'rgba(224,62,62,0.12)', border: '1px solid rgba(224,62,62,0.25)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                  <AlertCircle size={15} color="#e03e3e" />
                  <span style={{ color: '#c85555', fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>{submitError}</span>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 639px) {
          textarea { font-size: 16px !important; }
        }
      `}</style>
    </div>
  );
}

// ── Review Item Row ────────────────────────────────────────────────────────────
function ReviewItem({ item, isLast, onInc, onDec, onRemove, isMobile }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      style={{ overflow: 'hidden' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14,
        padding: isMobile ? '12px 14px' : '16px 20px',
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
      }}>
        {/* Icon */}
        <div style={{
          width: isMobile ? 40 : 52, height: isMobile ? 40 : 52,
          borderRadius: isMobile ? 12 : 14, flexShrink: 0,
          background: 'rgba(58,155,101,0.1)',
          border: '1px solid rgba(58,155,101,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Utensils size={isMobile ? 18 : 22} color="rgba(58,155,101,0.7)" />
        </div>

        {/* Name + price */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: isMobile ? 15 : 17, fontWeight: 600,
            color: '#1a3a28', marginBottom: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {item.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'rgba(122,170,136,0.5)', fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>
              ₹{item.price} each
            </span>
          </div>
        </div>

        {/* Controls column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          {/* Total for this item */}
          <motion.span
            key={item.qty}
            initial={{ scale: 1.2, color: '#4dbf7f' }} animate={{ scale: 1, color: '#4dbf7f' }}
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 13 : 15, fontWeight: 700, color: '#4dbf7f' }}
          >
            ₹{(item.price * item.qty).toFixed(0)}
          </motion.span>

          {/* Qty row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 5 : 6 }}>
            <motion.button whileTap={{ scale: 0.85 }} onClick={onDec} style={{
              width: isMobile ? 30 : 28, height: isMobile ? 30 : 28,
              borderRadius: isMobile ? 9 : 8,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <Minus size={12} color="rgba(122,170,136,0.7)" strokeWidth={2.5} />
            </motion.button>

            <motion.span
              key={item.qty}
              initial={{ scale: 1.3 }} animate={{ scale: 1 }}
              style={{ minWidth: 20, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#4dbf7f', fontFamily: "'DM Sans', sans-serif" }}
            >
              {item.qty}
            </motion.span>

            <motion.button whileTap={{ scale: 0.85 }} onClick={onInc} style={{
              width: isMobile ? 30 : 28, height: isMobile ? 30 : 28,
              borderRadius: isMobile ? 9 : 8,
              background: 'rgba(58,155,101,0.2)', border: '1px solid rgba(58,155,101,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <Plus size={12} color="#4dbf7f" strokeWidth={2.5} />
            </motion.button>

            <motion.button whileTap={{ scale: 0.85 }} onClick={onRemove} style={{
              width: isMobile ? 30 : 28, height: isMobile ? 30 : 28,
              borderRadius: isMobile ? 9 : 8, marginLeft: 2,
              background: 'rgba(214,59,59,0.1)', border: '1px solid rgba(214,59,59,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <Trash2 size={12} color="rgba(214,59,59,0.7)" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Order Confirmed Screen ─────────────────────────────────────────────────────
function OrderConfirmedScreen({ table, total, diningType, items, orderId, onDone, isMobile }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '32px 20px' : '40px 32px',
        textAlign: 'center',
        background: '#dceedd',
      }}
    >
      {/* Success ring animation */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
        style={{
          width: isMobile ? 84 : 100, height: isMobile ? 84 : 100, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(74,155,99,0.15), rgba(74,155,99,0.08))',
          border: '2px solid rgba(74,155,99,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
          boxShadow: '0 0 0 16px rgba(74,155,99,0.06), 0 0 0 32px rgba(74,155,99,0.03)',
        }}
      >
        <CheckCircle2 size={isMobile ? 36 : 44} color="#4a9b63" strokeWidth={1.5} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxWidth: 480, width: '100%', padding: isMobile ? '0 4px' : '0 32px' }}
      >
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: isMobile ? 30 : 36, fontWeight: 700, color: '#1a3a28',
          marginBottom: 8, lineHeight: 1.1,
        }}>
          Order Placed!
        </h1>
        <p style={{
          color: '#4a7a5a', fontSize: isMobile ? 14 : 15,
          fontFamily: "'DM Sans', sans-serif", marginBottom: 28, lineHeight: 1.6,
        }}>
          Your order has been sent to the kitchen.<br />We'll bring it to Table {table} shortly.
        </p>
        {orderId && (
          <p style={{
            color: '#b8860b', fontSize: 12, fontFamily: "'DM Sans',sans-serif",
            fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
            marginTop: -16, marginBottom: 20,
          }}>
            REF: #{orderId}
          </p>
        )}

        {/* Order details card */}
        <div style={{
          background: '#ffffff', border: '1px solid rgba(26,58,40,0.1)',
          borderRadius: 20, padding: isMobile ? '16px 18px' : '20px 24px',
          marginBottom: 12, textAlign: 'left',
          boxShadow: '0 4px 12px rgba(26,58,40,0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{ color: '#7aaa88', fontSize: 11, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Order Total</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? 22 : 26, fontWeight: 700, color: '#4a9b63' }}>₹{total.toFixed(0)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#7aaa88', fontSize: 11, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Dining</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 13 : 15, fontWeight: 600, color: '#1a3a28' }}>
                {diningType === 'eat_in' ? 'Eat In' : 'Parcel'}
              </p>
            </div>
          </div>
          <div style={{ height: 1, background: 'rgba(26,58,40,0.08)', marginBottom: 12 }} />
          {items.slice(0, 3).map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Utensils size={13} color="#4a9b63" />
              <span style={{
                color: '#4a7a5a', fontSize: 13, fontFamily: "'DM Sans', sans-serif", flex: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{item.name}</span>
              <span style={{ color: '#7aaa88', fontSize: 12, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>×{item.qty}</span>
            </div>
          ))}
          {items.length > 3 && (
            <p style={{ color: '#7aaa88', fontSize: 12, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
              +{items.length - 3} more item{items.length - 3 !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Eta chip */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: 'rgba(74,155,99,0.1)', border: '1px solid rgba(74,155,99,0.2)',
          borderRadius: 12, padding: '10px 16px', marginBottom: 28,
        }}>
          <Clock size={14} color="#4a9b63" />
          <span style={{ color: '#4a7a5a', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
            Estimated delivery: <strong style={{ color: '#4a9b63' }}>20–35 mins</strong>
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={onDone}
          style={{
            width: '100%', padding: isMobile ? '14px 24px' : '16px 24px',
            borderRadius: 16, border: 'none',
            background: 'linear-gradient(135deg, #4a9b63 0%, #2e6644 100%)',
            color: '#fff', fontSize: isMobile ? 15 : 16, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(74,155,99,0.15)',
          }}
        >
          Back to Menu
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function LoadingSpinner() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="9" cy="9" r="7" fill="none" stroke="rgba(74,155,99,0.2)" strokeWidth="2" />
      <path d="M9 2 A7 7 0 0 1 16 9" fill="none" stroke="#4a9b63" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}