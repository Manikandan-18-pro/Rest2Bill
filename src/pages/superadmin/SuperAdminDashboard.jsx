import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, TrendingUp, Users, Globe, Activity,
  ArrowUpRight, ArrowDownRight, Star, Zap, BarChart3,
  ShieldCheck, Server, Clock, CheckCircle2, AlertCircle,
  Crown, DollarSign, Layers, Eye, ChevronRight,
  MapPin, Phone, Wifi, WifiOff,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const PLATFORM_STATS = [
  { label: 'Total Hotels',     value: '48',      sub: '+3 this month',  icon: Building2,   color: '#6c63ff', bg: 'rgba(108,99,255,0.12)', trend: 'up'   },
  { label: 'Total Revenue',    value: '₹84.2L',  sub: '+18.4% vs last', icon: DollarSign,  color: '#00c9a7', bg: 'rgba(0,201,167,0.12)',  trend: 'up'   },
  { label: 'Active Users',     value: '2,341',   sub: '312 online now', icon: Users,       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', trend: 'up'   },
  { label: 'Platform Uptime',  value: '99.97%',  sub: '0 incidents',    icon: Server,      color: '#3a9b65', bg: 'rgba(58,155,101,0.12)', trend: 'up'   },
  { label: 'Global Orders',    value: '1.28L',   sub: '+9.2% this week',icon: BarChart3,   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  trend: 'up'   },
  { label: 'Avg Rating',       value: '4.7/5',    sub: 'Across all props',icon: Star,        color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', trend: 'up'   },
];

const RECENT_ACTIVITY = [
  { hotel: 'Grand Spice Palace',  city: 'Mumbai',   event: 'New hotel onboarded',     time: '2m ago',  type: 'success', revenue: '₹2.1L/mo' },
  { hotel: 'The Curry Leaf',      city: 'Delhi',    event: 'Plan upgraded to Pro',    time: '18m ago', type: 'upgrade', revenue: '₹98K/mo'  },
  { hotel: 'Saffron Heights',     city: 'Bangalore', event: 'Surge in orders (+32%)', time: '1h ago',  type: 'info',    revenue: '₹1.4L/mo' },
  { hotel: 'Royal Darbar',        city: 'Jaipur',   event: 'Billing issue flagged',   time: '2h ago',  type: 'warning', revenue: '₹76K/mo'  },
  { hotel: 'Marina Bay Kitchen',  city: 'Chennai',  event: 'QR system activated',     time: '3h ago',  type: 'success', revenue: '₹55K/mo'  },
  { hotel: 'Deccan Delight',      city: 'Hyderabad',event: 'New menu added (42 items)',time: '5h ago', type: 'info',    revenue: '₹1.2L/mo' },
];

const TOP_HOTELS = [
  { name: 'Grand Spice Palace', city: 'Mumbai',    revenue: '₹2.1L', orders: 1842, rating: 4.9, status: 'active', growth: 22 },
  { name: 'The Curry Leaf',     city: 'Delhi',     revenue: '₹1.8L', orders: 1620, rating: 4.8, status: 'active', growth: 18 },
  { name: 'Saffron Heights',    city: 'Bangalore', revenue: '₹1.6L', orders: 1430, rating: 4.7, status: 'active', growth: 32 },
  { name: 'Royal Darbar',       city: 'Jaipur',    revenue: '₹1.2L', orders: 1100, rating: 4.6, status: 'active', growth: 12 },
  { name: 'Marina Bay Kitchen', city: 'Chennai',   revenue: '₹98K',  orders: 890,  rating: 4.5, status: 'active', growth: 9  },
];

const CITY_DISTRIBUTION = [
  { city: 'Mumbai',    hotels: 12, pct: 25 },
  { city: 'Delhi',     hotels: 10, pct: 21 },
  { city: 'Bangalore', hotels: 8,  pct: 17 },
  { city: 'Hyderabad', hotels: 7,  pct: 15 },
  { city: 'Chennai',   hotels: 6,  pct: 12 },
  { city: 'Others',    hotels: 5,  pct: 10 },
];

const REVENUE_TREND = [42, 58, 51, 73, 68, 82, 79, 95, 88, 105, 98, 120];
const ORDER_TREND   = [310, 420, 380, 510, 490, 580, 560, 670, 640, 730, 710, 820];

const EVENT_COLORS = {
  success: { bg: 'rgba(58,155,101,0.12)', color: '#3a9b65', icon: CheckCircle2 },
  upgrade: { bg: 'rgba(108,99,255,0.12)', color: '#6c63ff', icon: ArrowUpRight },
  info:    { bg: 'rgba(36,120,200,0.12)', color: '#2478c8', icon: Activity      },
  warning: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', icon: AlertCircle   },
};

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Spark({ data, color, h = 44 }) {
  const w = 130;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3;
    return `${x},${y}`;
  }).join(' ');
  const area = `M${pts.split(' ').map((p, i) => (i === 0 ? p : p)).join('L')}L${w},${h}L0,${h}Z`;
  const uid = color.replace('#', 'g');
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${uid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3;
        return i === data.length - 1 ? (
          <circle key={i} cx={x} cy={y} r="3.5" fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
        ) : null;
      })}
    </svg>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ target, prefix = '', suffix = '', duration = 1600 }) {
  const [val, setVal] = useState(0);
  const num = parseFloat(target.replace(/[^0-9.]/g, '')) || 0;
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * num));
      if (p < 1) requestAnimationFrame(step);
      else setVal(num);
    };
    requestAnimationFrame(step);
  }, [num, duration]);
  const display = target.includes('L') ? `${val}L` : target.includes('K') ? `${val}K` : target.includes('%') ? `${(val / 100).toFixed(2)}%` : target.includes('/5') ? `${(val / 10).toFixed(1)}/5` : val.toLocaleString('en-IN');
  return <span>{prefix}{display}{suffix}</span>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ item, delay }) {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 18,
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Top accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${item.color}, ${item.color}55)`, borderRadius: '18px 18px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={21} color={item.color} />
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, color: '#3a9b65',
          background: 'rgba(58,155,101,0.1)', padding: '3px 8px', borderRadius: 20,
          display: 'flex', alignItems: 'center', gap: 3,
        }}>
          <ArrowUpRight size={11} /> UP
        </span>
      </div>

      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
        <Counter target={item.value} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>{item.label}</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>{item.sub}</div>

      {/* Background glow */}
      <div style={{ position: 'absolute', bottom: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: item.bg, filter: 'blur(24px)', pointerEvents: 'none' }} />
    </motion.div>
  );
}

// ─── Revenue Chart ────────────────────────────────────────────────────────────
function RevenueChart() {
  const [hovered, setHovered] = useState(null);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const max = Math.max(...REVENUE_TREND);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px', gridColumn: 'span 2' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Platform Revenue</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>All hotels combined · 2025</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Revenue', 'Orders'].map((l, i) => (
            <span key={l} style={{ fontSize: 11, color: i === 0 ? '#6c63ff' : '#00c9a7', fontWeight: 600,
              background: i === 0 ? 'rgba(108,99,255,0.1)' : 'rgba(0,201,167,0.1)',
              padding: '4px 10px', borderRadius: 20 }}>{l}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
        {REVENUE_TREND.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <AnimatePresence>
              {hovered === i && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 10, fontWeight: 700, color: '#6c63ff', whiteSpace: 'nowrap' }}>
                  ₹{v}L
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ delay: 0.5 + i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%', height: `${(v / max) * 100}%`,
                background: hovered === i ? 'linear-gradient(180deg, #6c63ff, #8b5cf6)' : 'linear-gradient(180deg, rgba(108,99,255,0.8), rgba(108,99,255,0.3))',
                borderRadius: '5px 5px 2px 2px', transformOrigin: 'bottom',
                transition: 'background 0.2s', cursor: 'pointer',
                boxShadow: hovered === i ? '0 0 12px rgba(108,99,255,0.5)' : 'none',
              }}
            />
            <span style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 500 }}>{months[i]}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── City Distribution ────────────────────────────────────────────────────────
function CityPieChart() {
  const COLORS = ['#6c63ff','#00c9a7','#f59e0b','#ef4444','#3a9b65','#8b5cf6'];
  let cumAngle = -90;

  function polarToXY(angle, r, cx = 80, cy = 80) {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const slices = CITY_DISTRIBUTION.map((d, i) => {
    const angle = (d.pct / 100) * 360;
    const start = cumAngle;
    cumAngle += angle;
    const end = cumAngle;
    const large = angle > 180 ? 1 : 0;
    const r = 68, ir = 42;
    const s = polarToXY(start, r);
    const e = polarToXY(end, r);
    const si = polarToXY(start, ir);
    const ei = polarToXY(end, ir);
    return { d: `M${s.x},${s.y} A${r},${r} 0 ${large},1 ${e.x},${e.y} L${ei.x},${ei.y} A${ir},${ir} 0 ${large},0 ${si.x},${si.y}Z`, color: COLORS[i], label: d.city, pct: d.pct, hotels: d.hotels };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px' }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>City Distribution</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Hotels by location</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width={160} height={160} viewBox="0 0 160 160">
          {slices.map((s, i) => (
            <motion.path key={i} d={s.d} fill={s.color}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))' }} />
          ))}
          <circle cx={80} cy={80} r={38} fill="var(--bg-card)" />
          <text x={80} y={76} textAnchor="middle" fontSize={14} fontWeight={800} fill="var(--text-primary)">48</text>
          <text x={80} y={90} textAnchor="middle" fontSize={9} fill="var(--text-muted)">Hotels</text>
        </svg>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', flex: 1 }}>{s.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{s.hotels}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Top Hotels Table ─────────────────────────────────────────────────────────
function TopHotelsTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px', gridColumn: 'span 2' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Top Performing Hotels</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>By revenue this month</div>
        </div>
        <button style={{ fontSize: 12, color: '#6c63ff', fontWeight: 600, background: 'rgba(108,99,255,0.1)', border: 'none', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          View All <ChevronRight size={13} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 12, padding: '0 10px 10px', borderBottom: '1px solid var(--border)' }}>
          {['Hotel', 'Revenue', 'Orders', 'Rating', 'Growth'].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
          ))}
        </div>

        {TOP_HOTELS.map((h, i) => (
          <motion.div key={h.name}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.06 }}
            whileHover={{ background: 'rgba(108,99,255,0.04)' }}
            style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 12, padding: '12px 10px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.2s' }}
          >
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{h.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <MapPin size={10} /> {h.city}
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>{h.revenue}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>{h.orders.toLocaleString()}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={12} color="#f59e0b" fill="#f59e0b" />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{h.rating}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#3a9b65', background: 'rgba(58,155,101,0.1)', padding: '3px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                <ArrowUpRight size={11} /> {h.growth}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Activity Feed ────────────────────────────────────────────────────────────
function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px' }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Recent Activity</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Platform-wide events</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {RECENT_ACTIVITY.map((a, i) => {
          const cfg = EVENT_COLORS[a.type];
          const Icon = cfg.icon;
          return (
            <motion.div key={i}
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.05 }}
              style={{ display: 'flex', gap: 10, padding: '10px 8px', borderRadius: 10, cursor: 'pointer' }}
              whileHover={{ background: 'rgba(0,0,0,0.03)' }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={15} color={cfg.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.hotel}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={9} />{a.city}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 1 }}>{a.event}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{a.time}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: cfg.color, marginTop: 2 }}>{a.revenue}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Platform Health ──────────────────────────────────────────────────────────
function PlatformHealth() {
  const metrics = [
    { label: 'API Response',  value: 98, color: '#3a9b65', unit: 'ms avg' },
    { label: 'Order Success', value: 99, color: '#6c63ff', unit: '% rate'  },
    { label: 'Uptime',        value: 100, color: '#00c9a7', unit: '% today' },
    { label: 'QR Scans',      value: 87, color: '#f59e0b', unit: '% active' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px' }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Platform Health</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Real-time system metrics</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {metrics.map((m, i) => (
          <div key={m.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 500 }}>{m.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{m.value}{m.unit.startsWith('%') ? '%' : ''} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 10.5 }}>{m.unit.startsWith('%') ? m.unit.slice(1) : m.unit}</span></span>
            </div>
            <div style={{ height: 6, background: 'rgba(0,0,0,0.07)', borderRadius: 6 }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${m.value}%` }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%', background: `linear-gradient(90deg, ${m.color}99, ${m.color})`, borderRadius: 6, boxShadow: `0 0 8px ${m.color}55` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, padding: '10px 14px', background: 'rgba(58,155,101,0.08)', borderRadius: 12, border: '1px solid rgba(58,155,101,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3a9b65', boxShadow: '0 0 8px #3a9b65' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#3a9b65' }}>All systems operational</span>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg, #d63b3b, #8b0000)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(214,59,59,0.35)' }}>
              <Crown size={18} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: 'Georgia, serif' }}>
                Super Admin Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-muted)' }}>Platform-wide overview · {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(58,155,101,0.1)', border: '1px solid rgba(58,155,101,0.25)', borderRadius: 20, padding: '7px 14px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3a9b65', boxShadow: '0 0 6px #3a9b65' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#3a9b65' }}>Live · {timeStr}</span>
          </div>
          <div style={{ background: 'rgba(214,59,59,0.1)', border: '1px solid rgba(214,59,59,0.25)', borderRadius: 20, padding: '7px 14px' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#d63b3b', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Globe size={13} /> 48 Hotels Active
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        {PLATFORM_STATS.map((item, i) => <StatCard key={item.label} item={item} delay={0.08 * i} />)}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        <RevenueChart />
        <CityPieChart />
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <TopHotelsTable />
        <PlatformHealth />
        <ActivityFeed />
      </div>
    </div>
  );
}
