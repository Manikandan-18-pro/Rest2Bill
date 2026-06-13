import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

function useIsMobile(bp = 768) {
  const [is, setIs] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const h = () => setIs(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return is;
}
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useHotel } from '../context/HotelContext';
import SummaryCard from '../components/SummaryCard';
import { loadTables } from './TableManagementPage';
import { TrendingUp, ArrowUpRight, Clock, Zap, Receipt, LayoutGrid, DollarSign, Timer } from 'lucide-react';

const ROLE_COLORS = { admin: '#3a9b65', kitchen: '#2478c8', super_admin: '#d63b3b' };
const ROLE_GREETINGS = {
  admin: "Your restaurant is performing beautifully today.",
  kitchen: "The kitchen is running at full capacity.",
  super_admin: 'Full system overview at your command.',
};

const SUMMARY_CARDS = [
  { title: 'Total Orders',     icon: <Receipt size={22} />, color: '#3a9b65' },
  { title: 'Active Tables',    icon: <LayoutGrid size={22} />, color: '#2478c8' },
  { title: "Today's Revenue",  icon: <DollarSign size={22} />, color: '#27a06b' },
  { title: 'Pending Items',    icon: <Timer size={22} />, color: '#d63b3b' },
];

// Builds last-7-days bar data from real orders stored in localStorage
function buildWeeklyBarData(hotelId) {
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Collect all orders
  const targetKey = `rms_orders_${hotelId || 'default'}`;
  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('rms_orders_')) keys.push(k);
    }
  } catch { /* no-op */ }
  if (!keys.includes(targetKey)) keys.push(targetKey);

  const seen = new Set();
  const allOrders = [];
  keys.forEach(k => {
    try {
      const items = JSON.parse(localStorage.getItem(k) || '[]');
      items.forEach(o => {
        if (o && o.id && !seen.has(o.id)) { seen.add(o.id); allOrders.push(o); }
      });
    } catch { /* no-op */ }
  });

  // Build revenue map: date string → total revenue
  // Try every date field an order might carry, in priority order:
  //   1. o.date      – plain YYYY-MM-DD set at order creation (most reliable)
  //   2. o.createdAt – full ISO timestamp, split to date portion
  //   3. o.paidAt    – set when billed; absent for pending/preparing orders
  // This matches the same population the "Today's Revenue" KPI sums over.
  const revenueByDate = {};
  allOrders.forEach(o => {
    const amt = parseFloat(o.totalAmount) || 0;
    if (amt <= 0) return;
    const dateStr =
      o.date ||
      (o.createdAt ? o.createdAt.split('T')[0] : null) ||
      (o.paidAt    ? o.paidAt.split('T')[0]    : null);
    if (!dateStr) return;
    revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + amt;
  });

  // Last 7 days ending today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    const rev = revenueByDate[iso] || 0;
    days.push({ day: DAY_LABELS[d.getDay()], date: iso, rev });
  }

  const maxRev = Math.max(...days.map(d => d.rev), 1);
  return days.map(d => ({
    day:    d.day,
    date:   d.date,
    rev:    d.rev,
    h:      Math.max(4, Math.round((d.rev / maxRev) * 100)), // min 4% so bar is always visible
    val:    d.rev >= 1000 ? `₹${(d.rev / 1000).toFixed(1)}k` : `₹${d.rev}`,
    hasData: d.rev > 0,
  }));
}

// Week-over-week change
function calcWeeklyChange(barData) {
  const thisWeek = barData.slice(0, 7).reduce((s, d) => s + d.rev, 0);
  // Can't compare to previous week without more data; show total change vs average
  if (thisWeek === 0) return null;
  // Show as total for the week
  return thisWeek;
}

function SparklinePath({ data, color }) {
  const w = 120, h = 40;
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <polyline
        points={pts}
        fill="none"
        stroke={`url(#sg-${color.replace('#', '')})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * w}
        cy={h - (data[data.length - 1] / max) * h}
        r="3" fill={color}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

function RevenueChart({ delay = 0, barData = [] }) {
  const [hovered, setHovered] = useState(null);

  const hasAnyData = barData.some(d => d.rev > 0);
  const totalWeek = barData.reduce((s, d) => s + d.rev, 0);
  const weekLabel = totalWeek >= 1000
    ? `₹${(totalWeek / 1000).toFixed(1)}k this week`
    : totalWeek > 0 ? `₹${totalWeek} this week` : 'No revenue yet';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '22px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Accent line */}
      <div style={{
        position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(72,160,100,0.6), transparent)',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.01em' }}>
            Weekly Revenue
          </h3>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>
            {hovered !== null
              ? `${barData[hovered]?.day} — ${barData[hovered]?.val}`
              : hasAnyData ? weekLabel : 'No orders yet this week'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 11px', borderRadius: 20,
          background: hasAnyData ? 'rgba(76,175,147,0.1)' : 'rgba(180,180,180,0.1)',
          border: `1px solid ${hasAnyData ? 'rgba(76,175,147,0.25)' : 'rgba(180,180,180,0.2)'}`,
          fontSize: 11, fontWeight: 600,
          color: hasAnyData ? '#27a06b' : 'var(--text-muted)',
        }}>
          <TrendingUp size={11} />
          {hasAnyData ? weekLabel : 'Live'}
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 4px' }}>
        {barData.map((d, i) => (
          <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}
            onMouseEnter={() => d.rev > 0 && setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: delay + 0.04 * i, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%', transformOrigin: 'bottom',
                height: `${d.h}%`,
                borderRadius: '5px 5px 2px 2px',
                background: hovered === i
                  ? 'linear-gradient(180deg, #3a9b65 0%, rgba(72,160,100,0.3) 100%)'
                  : d.rev > 0
                    ? (i % 2 === 0
                      ? 'linear-gradient(180deg, rgba(72,160,100,0.5) 0%, rgba(72,160,100,0.15) 100%)'
                      : 'linear-gradient(180deg, rgba(72,160,100,0.35) 0%, rgba(72,160,100,0.08) 100%)')
                    : 'linear-gradient(180deg, rgba(200,210,200,0.18) 0%, rgba(200,210,200,0.06) 100%)',
                boxShadow: hovered === i ? '0 0 16px rgba(72,160,100,0.4)' : 'none',
                transition: 'background 0.25s ease, box-shadow 0.25s ease',
                cursor: d.rev > 0 ? 'pointer' : 'default',
              }}
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.08 + 0.04 * i, duration: 0.4 }}
              style={{ fontSize: 9.5, color: hovered === i ? 'var(--gold)' : 'var(--text-muted)', transition: 'color 0.2s', letterSpacing: '0.03em' }}
            >
              {d.day}
            </motion.span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function QuickMetrics({ delay = 0, barData = [] }) {
  // Derive sparkline from real weekly revenue data
  const sparklineRevenue = barData.length > 0
    ? barData.map(d => d.rev)
    : Array(7).fill(0);
  // Normalise to 0-100 for display
  const maxV = Math.max(...sparklineRevenue, 1);
  const normalised = sparklineRevenue.map(v => Math.round((v / maxV) * 100));

  const metrics = [
    { label: 'Avg Order Time', value: '14 min', trend: normalised, color: '#2478c8', icon: Clock },
    { label: 'Kitchen Efficiency', value: '94%', trend: normalised.map(v => Math.min(100, v * 0.9 + 5)), color: '#27a06b', icon: Zap },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '22px',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(91,163,245,0.5), transparent)' }} />

      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
        Live Metrics
      </h3>

      {metrics.map((m, i) => (
        <div key={m.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${m.color}15`, border: `1px solid ${m.color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <m.icon size={15} color={m.color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{m.label}</div>
              <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)', lineHeight: 1.2 }}>{m.value}</div>
            </div>
          </div>
          <SparklinePath data={m.trend} color={m.color} />
        </div>
      ))}
    </motion.div>
  );
}

// ── Shared order loader ──────────────────────────────────────────────────────
// Fetches from the server first (shared across devices); merges with any
// localStorage orders created while the server was unreachable.
async function loadOrders(hotelId) {
  const localOrders = (() => {
    try {
      const seen = new Set();
      const all  = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('rms_orders_')) {
          const items = JSON.parse(localStorage.getItem(k) || '[]');
          items.forEach(o => { if (o?.id && !seen.has(o.id)) { seen.add(o.id); all.push(o); } });
        }
      }
      return all;
    } catch { return []; }
  })();

  try {
    const res = await fetch(`/api/orders?hotel_id=${encodeURIComponent(hotelId || 'default')}`);
    if (!res.ok) throw new Error('server error');
    const serverOrders = await res.json();
    // Merge: server is source of truth; append local-only orders not yet on server
    const serverIds = new Set(serverOrders.map(o => o.id));
    const localOnly = localOrders.filter(o => !serverIds.has(o.id));
    return [...serverOrders, ...localOnly];
  } catch {
    // Server unreachable – use localStorage only (same-device fallback)
    return localOrders;
  }
}

const STATUS_PULSE = { Served: '#27a06b', Preparing: '#2478c8', Pending: '#3a9b65' };

function mapOrder(o) {
  return {
    id:      o.id,
    table:   o.tableNumber || 'Takeaway',
    items:   o.items?.length || 0,
    time:    o.time || '—',
    date:    o.date || '',
    status:  o.status === 'pending' ? 'Pending' : o.status === 'preparing' ? 'Preparing' : 'Served',
    color:   o.status === 'pending' ? '#3a9b65' : o.status === 'preparing' ? '#2478c8' : '#27a06b',
    amount:  parseFloat(o.totalAmount) || 0,
    payment: o.payment || 'Cash',
    paidAt:  o.paidAt || '',
    isPaid:  o.status === 'paid',
  };
}

function RecentOrders({ delay = 0 }) {
  const { activeHotelId } = useHotel();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders(activeHotelId).then(raw => {
      const mapped = raw
        .filter(o => o.status !== 'paid')
        .slice(0, 20)
        .map(mapOrder);
      setOrders(mapped);
    });
  }, [activeHotelId]);

  // SSE: refresh when any device places an order
  useEffect(() => {
    if (!activeHotelId) return;
    let es;
    try {
      es = new EventSource(`/api/orders/sse?hotel_id=${encodeURIComponent(activeHotelId)}`);
      es.onmessage = () => {
        loadOrders(activeHotelId).then(raw => {
          setOrders(raw.filter(o => o.status !== 'paid').slice(0, 20).map(mapOrder));
        });
      };
      es.onerror = () => es.close();
    } catch {}
    return () => es?.close();
  }, [activeHotelId]);

  const filters = ['All', 'Pending', 'Preparing', 'Served'];
  const displayed = activeFilter === 'All' ? orders : orders.filter(o => o.status === activeFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#27a06b', boxShadow: '0 0 8px #27a06b',
              animation: 'livePulse 2s ease-in-out infinite',
            }} />
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
              Active Orders
            </h3>
            <span style={{
              padding: '2px 8px', borderRadius: 10,
              background: 'rgba(72,160,100,0.1)', border: '1px solid rgba(72,160,100,0.2)',
              fontSize: 10.5, fontWeight: 700, color: 'var(--gold)',
            }}>{orders.length} live</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{
              padding: '5px 12px', borderRadius: 20,
              background: 'rgba(72,160,100,0.08)', border: '1px solid rgba(72,160,100,0.2)',
              fontSize: 11, fontWeight: 500, color: 'var(--gold)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            View All <ArrowUpRight size={10} />
          </motion.button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                cursor: 'pointer', border: '1px solid',
                background: activeFilter === f ? (f === 'All' ? 'var(--gold-dim)' : `${STATUS_PULSE[f] || 'var(--gold)'}15`) : 'transparent',
                borderColor: activeFilter === f ? (f === 'All' ? 'rgba(72,160,100,0.3)' : `${STATUS_PULSE[f] || 'var(--gold)'}40`) : 'var(--border)',
                color: activeFilter === f ? (f === 'All' ? 'var(--gold)' : STATUS_PULSE[f] || 'var(--gold)') : 'var(--text-muted)',
                transition: 'all 0.18s ease',
              }}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: delay + 0.1 } } }}
        initial="hidden"
        animate="show"
        style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}
      >
        {displayed.map((order) => (
          <motion.div
            key={order.id}
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.93, filter: 'blur(5px)' },
              show:   { opacity: 1, y: 0,  scale: 1,    filter: 'blur(0px)',
                transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] } },
            }}
            whileHover={{ y: -4, scale: 1.015, boxShadow: `0 16px 40px rgba(40,110,70,0.15), 0 0 24px ${order.color}15`, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } }}
            whileTap={{ scale: 0.982 }}
            onClick={() => navigate(`/billing/generate?orderId=${encodeURIComponent(order.id)}`)}
            style={{
              background: 'var(--bg-elevated)', border: `1px solid rgba(72,160,100,0.09)`,
              borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
              transition: 'border-color 0.2s',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = `${order.color}30`}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(72,160,100,0.09)'}
          >
            {/* Top status bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${order.color}80, ${order.color}30)`,
                transformOrigin: 'left',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {order.table}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>{order.id}</div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 9px', borderRadius: 20,
                background: `${order.color}12`, border: `1px solid ${order.color}25`,
                fontSize: 10.5, fontWeight: 600, color: order.color,
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', background: order.color,
                  boxShadow: `0 0 5px ${order.color}`,
                  ...(order.status === 'Preparing' ? { animation: 'livePulse 1.5s ease-in-out infinite' } : {}),
                }} />
                {order.status}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 2 }}>{order.items} items · {order.waiter}</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                  ₹{order.amount.toLocaleString()}
                </div>
              </div>
              <div style={{
                fontSize: 11, color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <Clock size={9} /> {order.time} ago
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {displayed.length === 0 && (
        <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No {activeFilter.toLowerCase()} orders right now.
        </div>
      )}

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </motion.div>
  );
}

function BilledOrders({ delay = 0 }) {
  const { activeHotelId } = useHotel();
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    loadOrders(activeHotelId).then(raw => {
      const paid = raw
        .filter(o => o.status === 'paid')
        .map(mapOrder)
        .sort((a, b) => new Date(b.paidAt || b.date) - new Date(a.paidAt || a.date));
      setOrders(paid);
    });
  }, [activeHotelId]);

  if (orders.length === 0) return null;

  const PAYMENT_COLOR = { Cash: '#3a9b65', Card: '#2478c8', UPI: '#7c3aed' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginTop: 20,
      }}
    >
      {/* Header */}
      <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#27a06b',
          }} />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, serif' }}>
            Billed Orders
          </h3>
          <span style={{
            padding: '2px 8px', borderRadius: 10,
            background: 'rgba(72,160,100,0.1)', border: '1px solid rgba(72,160,100,0.2)',
            fontSize: 10.5, fontWeight: 700, color: 'var(--gold)',
          }}>{orders.length} closed</span>
        </div>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr 0.7fr 0.8fr 0.8fr 0.6fr',
        padding: '9px 22px', gap: 8,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(72,160,100,0.03)',
      }}>
        {['Order ID', 'Table', 'Items', 'Amount', 'Payment', 'Time'].map(h => (
          <span key={h} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: delay + 0.1 } } }}
        initial="hidden"
        animate="show"
      >
        {orders.map((order, i) => {
          const pc = PAYMENT_COLOR[order.payment] || '#3a9b65';
          return (
            <motion.div
              key={order.id}
              variants={{
                hidden: { opacity: 0, x: -12, filter: 'blur(4px)' },
                show: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 0.8fr 0.7fr 0.8fr 0.8fr 0.6fr',
                  padding: '12px 22px', gap: 8, alignItems: 'center',
                  borderTop: i > 0 ? '1px solid rgba(72,160,100,0.05)' : 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.018)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {order.id}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.table}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{order.items} dishes</span>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  ₹{order.amount.toLocaleString()}
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 9px', borderRadius: 20, width: 'fit-content',
                  background: `${pc}12`, border: `1px solid ${pc}30`,
                  fontSize: 11, fontWeight: 600, color: pc,
                }}>
                  {order.payment}
                </span>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{order.time}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Footer total */}
      <div style={{
        padding: '12px 22px', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(72,160,100,0.03)',
      }}>
        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
          {orders.length} bill{orders.length !== 1 ? 's' : ''} closed today
        </span>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, fontWeight: 700, color: 'var(--gold)' }}>
          Total: ₹{orders.reduce((s, o) => s + o.amount, 0).toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeHotelId } = useHotel();
  const isMobile = useIsMobile();
  const roleColor = ROLE_COLORS[user?.role] || '#3a9b65';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Compute live stats from real orders
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, pending: 0, activeTables: 0, totalTables: 0 });
  const [weeklyBarData, setWeeklyBarData] = useState(() => buildWeeklyBarData(null));

  // ── Refresh stats from server + localStorage ────────────────────────────
  const refreshStats = useCallback(async () => {
    const orders = await loadOrders(activeHotelId);
    const tables = loadTables(activeHotelId);
    const today  = new Date().toISOString().split('T')[0];
    const getOrderDate = o =>
      o.date ||
      (o.createdAt ? o.createdAt.split('T')[0] : null) ||
      (o.paidAt    ? o.paidAt.split('T')[0]    : null);
    const todayOrders = orders.filter(o => getOrderDate(o) === today);

    const activeTableNumbers = new Set(
      orders
        .filter(o => !['paid', 'completed', 'void'].includes(o.status))
        .map(o => o.tableNumber)
        .filter(Boolean)
    );
    const occupiedCount = tables.filter(t => t.status === 'occupied' || activeTableNumbers.has(t.label)).length;

    setStats({
      totalOrders:  orders.length,
      revenue:      todayOrders.reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0),
      pending:      orders.filter(o => o.status === 'pending').reduce((s, o) => s + (o.items?.length || 0), 0),
      activeTables: occupiedCount,
      totalTables:  tables.length,
    });
    setWeeklyBarData(buildWeeklyBarData(activeHotelId));
  }, [activeHotelId]);

  // Initial load + re-run when hotel changes
  useEffect(() => { refreshStats(); }, [refreshStats]);

  // ── SSE: listen for new orders pushed from any device ──────────────────
  useEffect(() => {
    if (!activeHotelId) return;
    let es;
    try {
      es = new EventSource(`/api/orders/sse?hotel_id=${encodeURIComponent(activeHotelId)}`);
      es.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'orders_updated') refreshStats();
        } catch {}
      };
      es.onerror = () => es.close(); // will auto-reconnect via re-render
    } catch {}
    return () => es?.close();
  }, [activeHotelId, refreshStats]);

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto' }}>

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 30, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}
      >
        <div>
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 11.5, fontWeight: 500, color: roleColor, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}
          >
            {greeting}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 600,
              color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.01em',
            }}
          >
            Welcome back,{' '}
            <span style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {user?.name}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 7, letterSpacing: '0.01em' }}
          >
            {ROLE_GREETINGS[user?.role]}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 16 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.22, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            padding: '10px 18px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, fontSize: 12.5, color: 'var(--text-secondary)',
            letterSpacing: '0.02em',
          }}
        >
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </motion.div>
      </motion.div>

      {/* KPI Cards — staggered */}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}
        initial="hidden"
        animate="show"
        className="kpi-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 20 }}
      >
        {SUMMARY_CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.94, filter: 'blur(6px)' },
              show:   { opacity: 1, y: 0,  scale: 1,    filter: 'blur(0px)',
                transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }
            }}
          >
            <SummaryCard
              title={card.title}
              icon={card.icon}
              color={card.color}
              delay={0}
              liveValue={
                card.title === 'Total Orders'    ? stats.totalOrders :
                card.title === 'Active Tables'   ? stats.activeTables :
                card.title === "Today's Revenue" ? Math.round(stats.revenue) :
                card.title === 'Pending Items'   ? stats.pending :
                undefined
              }
              liveSuffix={
                card.title === 'Active Tables' ? `/${stats.totalTables}` : undefined
              }
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row — slide in from sides */}
      <div className="charts-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>
        <motion.div
          initial={{ opacity: 0, x: -28, filter: 'blur(6px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.38, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <RevenueChart delay={0} barData={weeklyBarData} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 28, filter: 'blur(6px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.44, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <QuickMetrics delay={0} barData={weeklyBarData} />
        </motion.div>
      </div>

      {/* Orders Table */}
      <RecentOrders delay={0.52} />

      {/* Billed Orders */}
      <BilledOrders delay={0.6} />

      <div style={{ height: 36 }} />
    </div>
  );
}