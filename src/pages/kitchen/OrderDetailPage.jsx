import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Users, Clock, Timer, Flame, CheckCircle2, AlertCircle,
  ChevronRight, Utensils, Star, MessageSquare, Play, CheckCheck,
  Package, ChefHat, Zap, Info, StickyNote
} from 'lucide-react';

// ─── Animation Tokens ────────────────────────────────────────────────────────
const EASE_OUT = [0.16, 1, 0.3, 1];
const SPRING   = { type: 'spring', stiffness: 400, damping: 28, mass: 0.85 };

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { delay, duration: 0.52, ease: EASE_OUT },
  };
}

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
function findOrderInStorage(orderId) {
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('rms_orders_')) {
      try {
        const items = JSON.parse(localStorage.getItem(k) || '[]');
        const found = items.find(o => o && o.id === orderId);
        if (found) return { order: found, storageKey: k };
      } catch {}
    }
  }
  return null;
}

async function updateOrderInStorage(storageKey, orderId, updates) {
  // Update on shared server so all devices (admin, kitchen) see the change
  try {
    await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(updates),
    });
  } catch { /* server unreachable */ }

  // Also keep localStorage in sync for same-device fallback
  try {
    const items   = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = items.map(o => o.id === orderId ? { ...o, ...updates } : o);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch {}
  return true;
}

function removeOrderFromStorage(storageKey, orderId) {
  try {
    const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const filtered = items.filter(o => o.id !== orderId);
    localStorage.setItem(storageKey, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

// ─── Normalizer (same as KitchenOrdersPage) ───────────────────────────────────
function getElapsed(createdAt) {
  if (!createdAt) return '—';
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
}

function normalizeOrder(raw) {
  const rawStatus = raw.kitchenStatus || raw.status;
  let status = 'new';
  if (rawStatus === 'prep' || rawStatus === 'preparing') status = 'prep';
  else if (rawStatus === 'ready') status = 'ready';
  else if (rawStatus === 'completed' || rawStatus === 'complete') status = 'completed';
  else if (rawStatus === 'pending') status = 'new';

  const itemCount = (raw.items || []).reduce((s, i) => s + (i.quantity || i.qty || 1), 0);
  const priority = itemCount >= 5 ? 'high' : itemCount >= 3 ? 'mid' : 'low';

  return {
    id:       raw.id,
    table:    raw.tableNumber || raw.table || 'Takeaway',
    seats:    itemCount,
    time:     raw.time || (raw.createdAt ? new Date(raw.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
    elapsed:  getElapsed(raw.createdAt),
    status,
    priority,
    items: (raw.items || []).map(i => ({
      name:     i.name,
      qty:      i.quantity || i.qty || 1,
      note:     i.note || '',
      category: i.category || 'Main',
      status:   i.kitchenItemStatus || 'pending',
      price:    i.price || 0,
    })),
    chef:    raw.chef || '—',
    station: raw.station || '—',
    specialInstructions: raw.note || raw.specialInstructions || '',
    customer: raw.customer || (raw.tableNumber ? `Table ${raw.tableNumber}` : 'Walk-in'),
    waiter:   raw.waiter || '—',
    createdAt: raw.createdAt,
  };
}

const STATUS_META = {
  new:       { color: '#e05555', bg: 'rgba(224,85,85,0.1)',   border: 'rgba(224,85,85,0.28)',   label: 'Incoming',   icon: <AlertCircle size={13} /> },
  prep:      { color: '#e6a028', bg: 'rgba(230,160,40,0.1)',  border: 'rgba(230,160,40,0.28)',  label: 'In Prep',    icon: <Flame size={13} /> },
  ready:     { color: '#3a9b65', bg: 'rgba(58,155,101,0.12)', border: 'rgba(58,155,101,0.28)', label: 'Ready',      icon: <CheckCircle2 size={13} /> },
  completed: { color: '#2478c8', bg: 'rgba(36,120,200,0.1)',  border: 'rgba(36,120,200,0.28)', label: 'Completed',  icon: <CheckCheck size={13} /> },
};

const ITEM_STATUS = {
  pending: { color: '#527864', label: 'Pending', bg: 'rgba(138,176,154,0.1)' },
  cooking: { color: '#e6a028', label: 'Cooking', bg: 'rgba(230,160,40,0.1)' },
  done:    { color: '#3a9b65', label: 'Done',    bg: 'rgba(58,155,101,0.1)' },
};

const PRIORITY_META = {
  high: { color: '#e05555', label: 'High Priority' },
  mid:  { color: '#e6a028', label: 'Medium Priority' },
  low:  { color: '#3a9b65', label: 'Low Priority' },
};

// ─── Item Row ─────────────────────────────────────────────────────────────────
function ItemRow({ item, index, onToggle, locked }) {
  const is = ITEM_STATUS[item.status] || ITEM_STATUS.pending;
  return (
    <motion.div
      initial={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ delay: 0.3 + index * 0.07, duration: 0.45, ease: EASE_OUT }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 13,
        background: item.status === 'done' ? 'rgba(58,155,101,0.04)' : 'rgba(58,155,101,0.02)',
        border: `1px solid ${item.status === 'done' ? 'rgba(58,155,101,0.15)' : 'var(--border, rgba(90,160,110,0.12))'}`,
        marginBottom: 8, opacity: item.status === 'done' ? 0.8 : 1, transition: 'all 0.3s',
      }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 11, background: is.bg, border: '1px solid rgba(90,160,110,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Utensils size={18} color="rgba(58,155,101,0.6)" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary, #1a3a28)', textDecoration: item.status === 'done' ? 'line-through' : 'none' }}>{item.name}</span>
          <span style={{ padding: '2px 7px', borderRadius: 6, background: 'rgba(58,155,101,0.08)', fontSize: 10, fontWeight: 600, color: 'var(--text-muted, #527864)', letterSpacing: '0.04em' }}>{item.category}</span>
        </div>
        {item.note && (
          <div style={{ fontSize: 11.5, color: '#e6a028', display: 'flex', alignItems: 'center', gap: 5 }}>
            <StickyNote size={10} /> {item.note}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(58,155,101,0.1)', border: '1px solid rgba(58,155,101,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#3a9b65' }}>
          {item.qty}
        </div>
        <div style={{ fontSize: 9.5, color: 'var(--text-muted, #527864)', marginTop: 3 }}>qty</div>
      </div>

      {item.price > 0 && (
        <div style={{ textAlign: 'right', minWidth: 60, flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #1a3a28)', fontFamily: 'Cormorant Garamond, serif' }}>₹{(item.price * item.qty).toLocaleString()}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted, #527864)' }}>₹{item.price} ea.</div>
        </div>
      )}

      <motion.button
        whileHover={!locked ? { scale: 1.06 } : {}} whileTap={!locked ? { scale: 0.94 } : {}}
        onClick={() => !locked && onToggle(index)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 9,
          background: is.bg, border: `1px solid ${is.color}30`, color: is.color,
          cursor: locked ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, flexShrink: 0, transition: 'all 0.2s',
          opacity: locked ? 0.6 : 1,
        }}
      >
        {is.label}
      </motion.button>
    </motion.div>
  );
}

// ─── Action Button ─────────────────────────────────────────────────────────────
function ActionBtn({ icon, label, onClick, variant = 'ghost', disabled = false }) {
  const styles = {
    primary: { bg: '#3a9b65', border: 'rgba(58,155,101,0.5)', color: '#fff', shadow: '0 6px 24px rgba(58,155,101,0.35)' },
    warning: { bg: 'rgba(230,160,40,0.12)', border: 'rgba(230,160,40,0.35)', color: '#e6a028', shadow: '0 6px 24px rgba(230,160,40,0.15)' },
    success: { bg: 'rgba(36,120,200,0.1)', border: 'rgba(36,120,200,0.3)', color: '#2478c8', shadow: '0 6px 20px rgba(36,120,200,0.12)' },
    ghost:   { bg: 'rgba(90,160,110,0.06)', border: 'var(--border, rgba(90,160,110,0.18))', color: 'var(--text-secondary, #4a7060)', shadow: 'none' },
  };
  const s = styles[variant];

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03, boxShadow: s.shadow } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={!disabled ? onClick : undefined}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '13px 20px', borderRadius: 13, border: `1px solid ${s.border}`,
        background: s.bg, color: s.color, cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 13, fontWeight: 700, opacity: disabled ? 0.45 : 1,
        transition: 'all 0.22s', fontFamily: 'DM Sans, sans-serif',
        letterSpacing: '0.02em',
      }}
    >
      {icon} {label}
    </motion.button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder]         = useState(null);
  const [storageKey, setStorageKey] = useState(null);
  const [items, setItems]         = useState([]);
  const [toast, setToast]         = useState(null);
  const [notFound, setNotFound]   = useState(false);

  // Load order from localStorage on mount
  useEffect(() => {
    const result = findOrderInStorage(id);
    if (result) {
      const normalized = normalizeOrder(result.order);
      setOrder(normalized);
      setItems(normalized.items);
      setStorageKey(result.storageKey);
    } else {
      setNotFound(true);
    }
  }, [id]);

  const showToast = (msg, color = '#3a9b65') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2800);
  };

  const updateStatus = useCallback((newStatus) => {
    if (!storageKey || !order) return;
    updateOrderInStorage(storageKey, id, { kitchenStatus: newStatus, status: newStatus });
    setOrder(prev => ({ ...prev, status: newStatus }));
  }, [storageKey, id, order]);

  const toggleItemStatus = (idx) => {
    setItems(prev => {
      const next = prev.map((item, i) => {
        if (i !== idx) return item;
        const nextStatus = { pending: 'cooking', cooking: 'done', done: 'pending' }[item.status];
        return { ...item, status: nextStatus };
      });
      // Persist item statuses back to localStorage
      if (storageKey) {
        try {
          const raw = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const updated = raw.map(o => {
            if (o.id !== id) return o;
            const updatedItems = (o.items || []).map((item, i) => ({
              ...item,
              kitchenItemStatus: next[i]?.status || item.kitchenItemStatus,
            }));
            return { ...o, items: updatedItems };
          });
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {}
      }
      return next;
    });
  };

  const handleStartPrep = () => {
    updateStatus('prep');
    showToast('Preparation started!', '#e6a028');
  };

  const handleMarkReady = () => {
    updateStatus('ready');
    showToast('Order marked as ready!', '#3a9b65');
  };

  const handleComplete = () => {
    if (!storageKey) return;
    // Mark as completed in localStorage (keep the record for billing history)
    updateOrderInStorage(storageKey, id, { kitchenStatus: 'completed', status: 'completed', completedAt: new Date().toISOString() });
    showToast('Order completed! Redirecting...', '#2478c8');
    setTimeout(() => navigate('/kitchen/orders'), 1800);
  };

  // ── Not found state ──
  if (notFound) {
    return (
      <div style={{ fontFamily: 'DM Sans, sans-serif', textAlign: 'center', padding: '80px 20px' }}>
        <Package size={48} color="#527864" style={{ opacity: 0.4, marginBottom: 16 }} />
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary, #1a3a28)', marginBottom: 8 }}>Order not found</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted, #527864)', marginBottom: 24 }}>This order may have been removed or the ID is invalid.</div>
        <button onClick={() => navigate('/kitchen/orders')}
          style={{ padding: '10px 22px', borderRadius: 11, background: '#3a9b65', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          ← Back to Orders
        </button>
      </div>
    );
  }

  // ── Loading state ──
  if (!order) {
    return (
      <div style={{ fontFamily: 'DM Sans, sans-serif', textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted, #527864)' }}>Loading order…</div>
      </div>
    );
  }

  const currentStatus = order.status;
  const s = STATUS_META[currentStatus] || STATUS_META.new;
  const p = PRIORITY_META[order.priority];
  const totalAmt = items.reduce((acc, i) => acc + (i.price || 0) * i.qty, 0);
  const doneCount = items.filter(i => i.status === 'done').length;
  const isCompleted = currentStatus === 'completed';

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: 1100, margin: '0 auto' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.94 }}
            style={{
              position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--bg-elevated, #f4faf5)', border: `1px solid ${toast.color}40`,
              borderRadius: 14, padding: '11px 20px', zIndex: 1000,
              boxShadow: `0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px ${toast.color}20 inset`,
              fontSize: 13, fontWeight: 600, color: toast.color, whiteSpace: 'nowrap',
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back + Header */}
      <motion.div {...fadeUp(0)} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <motion.button whileHover={{ scale: 1.06, x: -2 }} whileTap={{ scale: 0.94 }}
          onClick={() => navigate('/kitchen/orders')}
          style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--bg-card, #fff)', border: '1px solid var(--border, rgba(90,160,110,0.18))', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary, #4a7060)', flexShrink: 0 }}>
          <ArrowLeft size={16} />
        </motion.button>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary, #1a3a28)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '-0.01em', margin: 0 }}>
              {order.id}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 20, background: s.bg, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 700, color: s.color }}>
              {s.icon} {s.label}
            </div>
            <div style={{ padding: '4px 10px', borderRadius: 20, background: `${p.color}10`, border: `1px solid ${p.color}28`, fontSize: 10.5, fontWeight: 700, color: p.color }}>
              {p.label}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted, #527864)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} /> {order.table} · {order.seats} items</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {order.time}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Timer size={11} /> {order.elapsed} elapsed</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ChefHat size={11} /> {order.chef} · {order.station}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

        {/* LEFT */}
        <div>
          {/* Items Section */}
          <motion.div {...fadeUp(0.1)} style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, rgba(90,160,110,0.18))', borderRadius: 18, padding: 22, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Utensils size={15} color="#3a9b65" />
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary, #1a3a28)' }}>Ordered Items</span>
                <span style={{ padding: '2px 8px', borderRadius: 20, background: 'rgba(58,155,101,0.1)', fontSize: 10, fontWeight: 700, color: '#3a9b65' }}>{items.length} items</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted, #527864)' }}>
                {doneCount}/{items.length} prepared
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 4, background: 'rgba(90,160,110,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 18 }}>
              <motion.div animate={{ width: items.length > 0 ? `${(doneCount / items.length) * 100}%` : '0%' }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #3a9b65, #4dbf7f)', borderRadius: 4 }} />
            </div>

            {items.map((item, i) => (
              <ItemRow key={i} item={item} index={i} onToggle={toggleItemStatus} locked={isCompleted} />
            ))}
          </motion.div>

          {/* Notes / Instructions */}
          {order.specialInstructions && (
            <motion.div {...fadeUp(0.22)} style={{ background: 'rgba(230,160,40,0.06)', border: '1px solid rgba(230,160,40,0.22)', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', gap: 12 }}>
              <Info size={16} color="#e6a028" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#e6a028', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Special Instructions</div>
                <div style={{ fontSize: 13, color: 'var(--text-primary, #1a3a28)', lineHeight: 1.55 }}>{order.specialInstructions}</div>
              </div>
            </motion.div>
          )}

          {/* Completed banner */}
          {isCompleted && (
            <motion.div {...fadeUp(0.25)} style={{ background: 'rgba(36,120,200,0.07)', border: '1px solid rgba(36,120,200,0.25)', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCheck size={18} color="#2478c8" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#2478c8' }}>This order has been completed.</span>
            </motion.div>
          )}

          {/* Action Buttons */}
          {!isCompleted && (
            <motion.div {...fadeUp(0.3)} style={{ display: 'flex', gap: 12 }}>
              <ActionBtn
                icon={<Play size={15} />} label="Start Preparation" variant="warning"
                onClick={handleStartPrep}
                disabled={currentStatus !== 'new'}
              />
              <ActionBtn
                icon={<CheckCircle2 size={15} />} label="Mark Ready" variant="success"
                onClick={handleMarkReady}
                disabled={currentStatus !== 'prep'}
              />
              <ActionBtn
                icon={<CheckCheck size={15} />} label="Complete Order" variant="primary"
                onClick={handleComplete}
                disabled={currentStatus !== 'ready'}
              />
            </motion.div>
          )}
        </div>

        {/* RIGHT — sidebar info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Order Info */}
          <motion.div {...fadeUp(0.15)} style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, rgba(90,160,110,0.18))', borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #527864)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Order Info</div>
            {[
              { label: 'Customer',   value: order.customer },
              { label: 'Waiter',     value: order.waiter },
              { label: 'Station',    value: `${order.station} Station` },
              { label: 'Chef',       value: order.chef },
              { label: 'Ordered At', value: order.time },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid rgba(90,160,110,0.07)' }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted, #527864)' }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary, #1a3a28)', textAlign: 'right', maxWidth: 140 }}>{row.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Bill Summary */}
          {totalAmt > 0 && (
            <motion.div {...fadeUp(0.22)} style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, rgba(90,160,110,0.18))', borderRadius: 18, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #527864)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Bill Summary</div>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 9 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary, #4a7060)' }}>{item.name} × {item.qty}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary, #1a3a28)' }}>₹{((item.price || 0) * item.qty).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--border, rgba(90,160,110,0.18))', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #1a3a28)' }}>Total</span>
                <span style={{ fontSize: 17, fontWeight: 800, fontFamily: 'Cormorant Garamond, serif', color: '#3a9b65' }}>₹{totalAmt.toLocaleString()}</span>
              </div>
            </motion.div>
          )}

          {/* Prep Status Timeline */}
          <motion.div {...fadeUp(0.28)} style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, rgba(90,160,110,0.18))', borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #527864)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Preparation Status</div>
            {[
              { label: 'Order Received',  done: true,                                                                             time: order.time },
              { label: 'In Preparation',  done: currentStatus === 'prep' || currentStatus === 'ready' || isCompleted,            time: currentStatus !== 'new' ? 'Started' : '—' },
              { label: 'Ready to Serve',  done: currentStatus === 'ready' || isCompleted,                                        time: currentStatus === 'ready' || isCompleted ? 'Ready' : '—' },
              { label: 'Completed',       done: isCompleted,                                                                      time: isCompleted ? 'Done ✓' : '—' },
            ].map((step, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: i < arr.length - 1 ? 14 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: step.done ? '#3a9b65' : 'rgba(90,160,110,0.1)', border: `2px solid ${step.done ? '#3a9b65' : 'rgba(90,160,110,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {step.done && <CheckCircle2 size={11} color="#fff" />}
                  </div>
                  {i < arr.length - 1 && <div style={{ width: 2, height: 22, background: step.done ? 'rgba(58,155,101,0.35)' : 'rgba(90,160,110,0.1)', margin: '3px 0' }} />}
                </div>
                <div style={{ flex: 1, paddingTop: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: step.done ? 700 : 500, color: step.done ? 'var(--text-primary, #1a3a28)' : 'var(--text-muted, #527864)' }}>{step.label}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted, #527864)' }}>{step.time}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}