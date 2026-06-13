import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChefHat, Flame, Clock, CheckCircle2, AlertCircle,
  TrendingUp, Utensils, Timer, Star, ArrowRight,
  Zap, BarChart3, Circle, RefreshCw, Bell
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

// ─── Animation Tokens ────────────────────────────────────────────────────────
const EASE_OUT = [0.16, 1, 0.3, 1];
const SPRING = { type: 'spring', stiffness: 360, damping: 28, mass: 0.9 };

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 28, filter: 'blur(8px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { delay, duration: 0.58, ease: EASE_OUT },
  };
}

// ─── Count-Up Hook ────────────────────────────────────────────────────────────
function useCountUp(target, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / 1300, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setVal(Math.floor(e * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [target, delay]);
  return val;
}

// ─── Real Order Loading ───────────────────────────────────────────────────────
function loadOrdersFromStorage(hotelId) {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('rms_orders_')) keys.push(k);
  }
  if (hotelId) {
    const specific = `rms_orders_${hotelId}`;
    if (!keys.includes(specific)) keys.push(specific);
  }
  const seen = new Set();
  const all = [];
  keys.forEach(k => {
    try {
      const items = JSON.parse(localStorage.getItem(k) || '[]');
      items.forEach(o => { if (o && o.id && !seen.has(o.id)) { seen.add(o.id); all.push(o); } });
    } catch {}
  });
  return all;
}

function getElapsed(createdAt) {
  if (!createdAt) return '—';
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
}

function toKitchenOrder(raw) {
  const itemNames = (raw.items || []).map(i => i.name);
  const itemCount = (raw.items || []).reduce((s, i) => s + (i.quantity || i.qty || 1), 0);
  // Normalize status — only allow values that exist in STATUS_COLORS
  const rawStatus = raw.kitchenStatus || raw.status;
  let status = 'new';
  if (rawStatus === 'prep' || rawStatus === 'preparing') status = 'prep';
  else if (rawStatus === 'ready') status = 'ready';
  // 'completed' and everything else stays 'new' — completed orders are filtered out before this runs
  return {
    id: raw.id,
    table: raw.tableNumber || raw.table || 'Takeaway',
    items: itemNames,
    priority: itemCount >= 5 ? 'high' : itemCount >= 3 ? 'mid' : 'low',
    time: getElapsed(raw.createdAt),
    status,
  };
}

// COOKING_QUEUE is now derived from real "prep" orders in the component

const WEEKLY = [
  { day: 'Mon', orders: 62, height: 55 },
  { day: 'Tue', orders: 78, height: 70 },
  { day: 'Wed', orders: 91, height: 82 },
  { day: 'Thu', orders: 84, height: 75 },
  { day: 'Fri', orders: 110, height: 98 },
  { day: 'Sat', orders: 134, height: 120 },
  { day: 'Sun', orders: 97, height: 87 },
];

const STATUS_COLORS = {
  new:   { bg: 'rgba(224,85,85,0.12)',  border: 'rgba(224,85,85,0.3)',  text: '#e05555', label: 'Incoming' },
  prep:  { bg: 'rgba(230,160,40,0.12)', border: 'rgba(230,160,40,0.3)', text: '#e6a028', label: 'In Prep'  },
  ready: { bg: 'rgba(58,155,101,0.15)', border: 'rgba(58,155,101,0.3)', text: '#3a9b65', label: 'Ready'    },
};

const PRIORITY_DOT = { high: '#e05555', mid: '#e6a028', low: '#3a9b65' };

// ─── Sub-Components ───────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, delay }) {
  const count = useCountUp(parseInt(value) || 0, delay + 0.2);
  return (
    <motion.div {...fadeUp(delay)}
      whileHover={{ y: -5, scale: 1.012, transition: SPRING }}
      style={{
        background: 'var(--bg-card, #fff)', border: '1px solid var(--border, rgba(90,160,110,0.18))',
        borderRadius: 18, padding: '20px 22px', position: 'relative', overflow: 'hidden', cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.boxShadow = `0 12px 40px ${color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border, rgba(90,160,110,0.18))'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} />
      <div style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, background: `radial-gradient(circle, ${color}0e 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted, #527864)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{sub}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary, #1a3a28)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {isNaN(parseInt(value)) ? value : count}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted, #527864)', marginTop: 5, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>{label}</div>

      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: delay + 0.5, duration: 1.1, ease: EASE_OUT }}
        style={{ position: 'absolute', bottom: 0, left: 0, height: 2, width: '70%', background: `linear-gradient(90deg, ${color}60, ${color}10)`, transformOrigin: 'left', borderRadius: '0 2px 2px 0' }} />
    </motion.div>
  );
}

function OrderCard({ order, onClick }) {
  const s = STATUS_COLORS[order.status] || STATUS_COLORS['new'];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -18, filter: 'blur(4px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      whileHover={{ x: 4, transition: SPRING }}
      onClick={onClick}
      style={{
        background: 'var(--bg-card, #fff)', border: '1px solid var(--border, rgba(90,160,110,0.18))',
        borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(58,155,101,0.35)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(40,110,70,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border, rgba(90,160,110,0.18))'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Priority dot */}
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_DOT[order.priority], flexShrink: 0, boxShadow: `0 0 8px ${PRIORITY_DOT[order.priority]}` }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary, #1a3a28)' }}>{order.id}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted, #527864)' }}>·</span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#3a9b65' }}>{order.table}</span>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-secondary, #4a7060)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {order.items.join(' · ')}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
        <div style={{ padding: '3px 9px', borderRadius: 20, background: s.bg, border: `1px solid ${s.border}`, fontSize: 10, fontWeight: 700, color: s.text, letterSpacing: '0.04em' }}>
          {s.label}
        </div>
        <div style={{ fontSize: 10.5, color: 'var(--text-muted, #527864)', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Clock size={10} />
          {order.time}
        </div>
      </div>
    </motion.div>
  );
}

function CookingItem({ item, index }) {
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProg(item.progress), 400 + index * 120);
    return () => clearTimeout(t);
  }, [item.progress, index]);

  const color = item.progress > 75 ? '#3a9b65' : item.progress > 45 ? '#e6a028' : '#2478c8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.45, ease: EASE_OUT }}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--border, rgba(90,160,110,0.1))' }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
        
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary, #1a3a28)' }}>{item.dish}</span>
          <span style={{ fontSize: 10.5, color, fontWeight: 700 }}>{item.progress}%</span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(90,160,110,0.1)', borderRadius: 4, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${prog}%` }}
            transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.3 + index * 0.1 }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${color}, ${color}aa)`, borderRadius: 4 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted, #527864)' }}>{item.chef} · {item.station}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted, #527864)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Timer size={9} /> {item.eta}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function KitchenDashboardPage() {
  const navigate = useNavigate();
  const { activeHotelId } = useHotel();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  const [activeFilter, setActiveFilter] = useState('all');
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [allTodayCount, setAllTodayCount] = useState(0);
  const [cookingQueue, setCookingQueue] = useState([]);
  const [weeklyData, setWeeklyData] = useState(WEEKLY);
  const [tick, setTick] = useState(0);

  const loadOrders = useCallback(() => {
    const raw = loadOrdersFromStorage(activeHotelId);
    const today = new Date().toISOString().split('T')[0];

    // ALL orders (including completed/paid) — for the total count stat card
    const todayAll = raw.filter(r => {
      const d = r.date || (r.createdAt ? r.createdAt.split('T')[0] : null);
      return !d || d === today; // include undated orders too
    });
    setAllTodayCount(todayAll.length > 0 ? todayAll.length : raw.length);

    // Only active (non-completed, non-paid) orders for the incoming list
    const active = raw
      .filter(r => {
        const s = (r.kitchenStatus || r.status || '').toLowerCase();
        return s !== 'completed' && s !== 'complete' && s !== 'paid';
      })
      .map(toKitchenOrder)
      .sort((a, b) => {
        const ra = raw.find(r => r.id === a.id);
        const rb = raw.find(r => r.id === b.id);
        return new Date(rb?.createdAt || 0) - new Date(ra?.createdAt || 0);
      });
    setIncomingOrders(active);

    // ── Cooking Queue: derive from "prep" orders' items ──
    const prepOrders = raw.filter(r => {
      const s = (r.kitchenStatus || r.status || '').toLowerCase();
      return s === 'prep' || s === 'preparing';
    });
    const queueItems = [];
    prepOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const elapsed = order.createdAt
          ? Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
          : 5;
        // Progress based on elapsed time vs expected 20min cook cycle
        const progress = Math.min(Math.floor((elapsed / 20) * 100), 95);
        const eta = Math.max(20 - elapsed, 1);
        queueItems.push({
          dish: item.name || 'Unknown Item',
          chef: order.staffName || order.chef || 'Kitchen',
          progress,
          eta: `${eta} min`,
          station: item.station || order.station || 'Kitchen',
        });
      });
    });
    // If no real prep orders, keep the previous state (don't flash empty)
    if (queueItems.length > 0) setCookingQueue(queueItems.slice(0, 6));
    else if (prepOrders.length === 0 && cookingQueue.length === 0) {
      setCookingQueue([]); // genuinely empty
    }

    // ── Weekly Summary: count orders per day of current week ──
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
    weekStart.setHours(0, 0, 0, 0);
    const weekCounts = Array(7).fill(0);
    raw.forEach(r => {
      const d = r.createdAt ? new Date(r.createdAt) : (r.date ? new Date(r.date) : null);
      if (d && d >= weekStart) {
        const dayIdx = d.getDay();
        weekCounts[dayIdx]++;
      }
    });
    const maxCount = Math.max(...weekCounts, 1);
    const generatedWeekly = dayNames.map((day, i) => ({
      day,
      orders: weekCounts[i],
      height: Math.floor((weekCounts[i] / maxCount) * 120),
    }));
    if (weekCounts.some(c => c > 0)) setWeeklyData(generatedWeekly);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHotelId]);

  useEffect(() => {
    loadOrders();
    const t = setInterval(() => { loadOrders(); setTick(v => v + 1); }, 15000);
    return () => clearInterval(t);
  }, [loadOrders]);

  const filtered = activeFilter === 'all' ? incomingOrders : incomingOrders.filter(o => o.status === activeFilter);

  const totalOrders  = useCountUp(allTodayCount, 0.2);
  const inPrep       = useCountUp(incomingOrders.filter(o => o.status === 'prep').length, 0.35);
  const readyCount   = useCountUp(incomingOrders.filter(o => o.status === 'ready').length, 0.5);
  const avgTime      = useCountUp(14, 0.65);

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Page Header */}
      <motion.div {...fadeUp(0)} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(58,155,101,0.12)', border: '1px solid rgba(58,155,101,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a9b65' }}>
              <ChefHat size={18} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary, #1a3a28)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '-0.01em', margin: 0 }}>
              Kitchen Dashboard
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted, #527864)', margin: 0, letterSpacing: '0.02em' }}>
            Live operations · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/kitchen/orders')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, background: 'rgba(58,155,101,0.1)', border: '1px solid rgba(58,155,101,0.25)', color: '#3a9b65', cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}
          >
            <Utensils size={14} /> All Orders
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => { loadOrders(); setTick(v => v + 1); }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, background: 'rgba(58,155,101,0.9)', border: '1px solid rgba(58,155,101,0.4)', color: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}
          >
            <RefreshCw size={13} /> Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon={<Utensils size={16} />} label="Today's Orders"  value={totalOrders} sub="Total"    color="#3a9b65" delay={0.05} />
        <StatCard icon={<Flame size={16} />}    label="In Preparation"  value={inPrep}      sub="Active"   color="#e6a028" delay={0.12} />
        <StatCard icon={<CheckCircle2 size={16} />} label="Ready to Serve" value={readyCount} sub="Done"  color="#2478c8" delay={0.19} />
        <StatCard icon={<Timer size={16} />}    label="Avg Prep Time"   value={`${avgTime}m`} sub="Minutes" color="#9b6b3a" delay={0.26} />
      </div>

      {/* Main Grid */}
      <div className="kitchen-grid charts-row" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: 20, marginBottom: 20 }}>

        {/* LEFT — Incoming Orders */}
        <motion.div {...fadeUp(0.2)} style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, rgba(90,160,110,0.18))', borderRadius: 18, padding: 22, minHeight: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Bell size={15} color="#3a9b65" />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary, #1a3a28)', letterSpacing: '-0.01em' }}>Incoming Orders</span>
              <span style={{ padding: '2px 8px', borderRadius: 20, background: 'rgba(224,85,85,0.1)', border: '1px solid rgba(224,85,85,0.25)', fontSize: 10, fontWeight: 700, color: '#e05555' }}>
                {incomingOrders.filter(o => o.status === 'new').length} NEW
              </span>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 6, background: 'rgba(90,160,110,0.06)', borderRadius: 10, padding: 4 }}>
              {['all', 'new', 'prep', 'ready'].map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  style={{ padding: '5px 11px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, letterSpacing: '0.03em', transition: 'all 0.2s',
                    background: activeFilter === f ? '#3a9b65' : 'transparent',
                    color: activeFilter === f ? '#fff' : 'var(--text-muted, #527864)',
                  }}
                >
                  {f === 'all' ? 'All' : f === 'new' ? 'New' : f === 'prep' ? 'Prep' : 'Ready'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((order, i) => (
                <OrderCard key={order.id} order={order} onClick={() => navigate(`/kitchen/orders/${order.id}`)} />
              ))}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/kitchen/orders')}
            style={{ width: '100%', marginTop: 14, padding: '10px', borderRadius: 11, background: 'rgba(58,155,101,0.06)', border: '1px dashed rgba(58,155,101,0.25)', color: '#3a9b65', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            View All Orders <ArrowRight size={13} />
          </motion.button>
        </motion.div>

        {/* RIGHT — Active Cooking Queue */}
        <motion.div {...fadeUp(0.28)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Queue card */}
          <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, rgba(90,160,110,0.18))', borderRadius: 18, padding: 20, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Flame size={15} color="#e6a028" />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary, #1a3a28)' }}>Active Cooking Queue</span>
            </div>
            {cookingQueue.length > 0 ? cookingQueue.map((item, i) => (
              <CookingItem key={item.dish + i} item={item} index={i} />
            )) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted, #527864)', fontSize: 12.5 }}>
                No items currently in preparation
              </div>
            )}
          </div>

          {/* Status overview mini-card */}
          <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, rgba(90,160,110,0.18))', borderRadius: 18, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <BarChart3 size={14} color="#3a9b65" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary, #1a3a28)' }}>Status Overview</span>
            </div>
            {[
              { label: 'Incoming', count: incomingOrders.filter(o => o.status === 'new').length,   color: '#e05555' },
              { label: 'In Prep',  count: incomingOrders.filter(o => o.status === 'prep').length,  color: '#e6a028' },
              { label: 'Ready',    count: incomingOrders.filter(o => o.status === 'ready').length, color: '#3a9b65' },
            ].map(s => {
              const total = incomingOrders.length || 1;
              return (
              <div key={s.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11.5, color: 'var(--text-secondary, #4a7060)', fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: s.color }}>{s.count}</span>
                </div>
                <div style={{ height: 5, background: 'rgba(90,160,110,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(s.count / total) * 100}%` }}
                    transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.4 }}
                    style={{ height: '100%', background: s.color, borderRadius: 4 }} />
                </div>
              </div>
            );
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom — Weekly Summary */}
      <motion.div {...fadeUp(0.35)} style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, rgba(90,160,110,0.18))', borderRadius: 18, padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={15} color="#3a9b65" />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary, #1a3a28)' }}>Weekly Order Summary</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted, #527864)', letterSpacing: '0.04em' }}>
            This week · {weeklyData.reduce((s, d) => s + d.orders, 0)} total orders
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 130, paddingBottom: 10 }}>
          {weeklyData.map((d, i) => {
            const today = new Date().getDay();
            const isToday = i === today;
            return (
            <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#3a9b65' }}>{d.orders}</span>
              <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 120 }}>
                <motion.div
                  initial={{ height: 0 }} animate={{ height: d.height }}
                  transition={{ delay: 0.5 + i * 0.07, duration: 0.7, ease: EASE_OUT }}
                  style={{
                    width: '70%', borderRadius: '5px 5px 3px 3px',
                    background: isToday ? 'linear-gradient(180deg, #3a9b65, #2e7d50)' : 'linear-gradient(180deg, rgba(58,155,101,0.35), rgba(58,155,101,0.15))',
                    border: isToday ? '1px solid rgba(58,155,101,0.5)' : '1px solid rgba(58,155,101,0.2)',
                    boxShadow: isToday ? '0 4px 20px rgba(58,155,101,0.3)' : 'none',
                  }}
                />
              </div>
              <span style={{ fontSize: 10.5, color: isToday ? '#3a9b65' : 'var(--text-muted, #527864)', fontWeight: isToday ? 700 : 500 }}>{d.day}</span>
            </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}