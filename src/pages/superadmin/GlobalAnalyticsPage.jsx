import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import {
  Globe, TrendingUp, DollarSign, ShoppingBag, Users, Star,
  Building2, ArrowUpRight, ArrowDownRight, Activity, Zap,
  BarChart3, ChevronRight, Clock, Filter, Download,
  MapPin, CheckCircle2, AlertCircle, Crown, Flame,
  Package, Coffee, ChefHat, Wifi, Server, Eye,
  Calendar, RefreshCw, TrendingDown, Award,
} from 'lucide-react';

// ── Mock Data ──────────────────────────────────────────────────────────────────

const PLATFORM_KPIS = [
  { id: 'revenue',  label: 'Platform Revenue',  value: '₹2.84Cr', raw: 28400000, sub: '+22.6% vs last month', icon: DollarSign, color: '#3a9b65', bg: 'rgba(58,155,101,0.13)', trend: 'up',   spark: [62,71,68,84,79,98,91,112,105,128,119,142] },
  { id: 'orders',   label: 'Global Orders',     value: '1,84,290', raw: 184290, sub: '+14.3% this month',     icon: ShoppingBag,color: '#6c63ff', bg: 'rgba(108,99,255,0.13)', trend: 'up',   spark: [310,380,360,480,450,560,540,640,610,720,690,810] },
  { id: 'hotels',   label: 'Active Hotels',     value: '48',        raw: 48,      sub: '3 onboarded this week',icon: Building2,  color: '#f59e0b', bg: 'rgba(245,158,11,0.13)', trend: 'up',   spark: [38,39,40,40,41,42,43,43,44,46,47,48] },
  { id: 'users',    label: 'Total Users',       value: '2,341',    raw: 2341,    sub: '312 online right now',  icon: Users,      color: '#ef4444', bg: 'rgba(239,68,68,0.13)',  trend: 'up',   spark: [1800,1900,1950,2000,2050,2100,2150,2180,2200,2280,2310,2341] },
  { id: 'rating',   label: 'Avg Platform Score',value: '4.72',    raw: 4.72,    sub: 'Based on 31,482 reviews',icon: Star,       color: '#8b5cf6', bg: 'rgba(139,92,246,0.13)', trend: 'up',   spark: [4.5,4.55,4.52,4.6,4.58,4.62,4.65,4.68,4.66,4.7,4.71,4.72] },
  { id: 'uptime',   label: 'System Uptime',    value: '99.97%',   raw: 99.97,   sub: '0 incidents this month', icon: Server,    color: '#00c9a7', bg: 'rgba(0,201,167,0.13)',  trend: 'up',   spark: [99.9,99.92,99.95,99.93,99.97,99.95,99.97,99.97,99.97,99.97,99.97,99.97] },
];

const REVENUE_MONTHLY = [
  { month: 'Jun', value: 142, orders: 6200 },
  { month: 'Jul', value: 168, orders: 7400 },
  { month: 'Aug', value: 155, orders: 6900 },
  { month: 'Sep', value: 192, orders: 8600 },
  { month: 'Oct', value: 184, orders: 8100 },
  { month: 'Nov', value: 218, orders: 9800 },
  { month: 'Dec', value: 246, orders: 11200 },
  { month: 'Jan', value: 231, orders: 10500 },
  { month: 'Feb', value: 268, orders: 12100 },
  { month: 'Mar', value: 284, orders: 13000 },
  { month: 'Apr', value: 271, orders: 12400 },
  { month: 'May', value: 312, orders: 14200 },
];

const TOP_HOTELS = [
  { rank: 1, name: 'Grand Spice Palace',   city: 'Mumbai',     revenue: '₹24.8L', orders: 9842,  rating: 4.9, growth: 22, status: 'active', category: 'Fine Dining' },
  { rank: 2, name: 'The Curry Leaf',       city: 'Delhi',      revenue: '₹21.3L', orders: 8610,  rating: 4.8, growth: 18, status: 'active', category: 'Multi-Cuisine' },
  { rank: 3, name: 'Saffron Heights',      city: 'Bangalore',  revenue: '₹18.6L', orders: 7430,  rating: 4.7, growth: 32, status: 'active', category: 'North Indian' },
  { rank: 4, name: 'Royal Darbar',         city: 'Jaipur',     revenue: '₹14.2L', orders: 5900,  rating: 4.6, growth: 12, status: 'active', category: 'Rajasthani' },
  { rank: 5, name: 'Marina Bay Kitchen',   city: 'Chennai',    revenue: '₹12.8L', orders: 5210,  rating: 4.5, growth: 9,  status: 'active', category: 'South Indian' },
  { rank: 6, name: 'Deccan Delight',       city: 'Hyderabad',  revenue: '₹11.4L', orders: 4680,  rating: 4.5, growth: 15, status: 'active', category: 'Hyderabadi' },
  { rank: 7, name: 'Spice Route Kolkata',  city: 'Kolkata',    revenue: '₹9.8L',  orders: 4020,  rating: 4.3, growth: 7,  status: 'active', category: 'Bengali' },
  { rank: 8, name: 'Punjab Grill',         city: 'Chandigarh', revenue: '₹8.2L',  orders: 3340,  rating: 4.4, growth: -3, status: 'warning',category: 'Punjabi' },
];

const CITY_PERFORMANCE = [
  { city: 'Mumbai',    hotels: 12, revenue: '₹68L', pct: 100, orders: 41200, color: '#6c63ff' },
  { city: 'Delhi',     hotels: 10, revenue: '₹57L', pct: 84,  orders: 34600, color: '#3a9b65' },
  { city: 'Bangalore', hotels: 8,  revenue: '₹44L', pct: 65,  orders: 26800, color: '#f59e0b' },
  { city: 'Hyderabad', hotels: 7,  revenue: '₹38L', pct: 56,  orders: 23100, color: '#ef4444' },
  { city: 'Chennai',   hotels: 6,  revenue: '₹29L', pct: 43,  orders: 17600, color: '#8b5cf6' },
  { city: 'Others',    hotels: 5,  revenue: '₹21L', pct: 31,  orders: 12800, color: '#00c9a7' },
];

const ACTIVITY_FEED = [
  { id: 1, hotel: 'Grand Spice Palace',  city: 'Mumbai',    event: 'Revenue milestone: ₹25L crossed', time: '1m ago',  type: 'milestone', icon: Crown },
  { id: 2, hotel: 'Saffron Heights',     city: 'Bangalore', event: '320 orders completed today',       time: '4m ago',  type: 'success',   icon: CheckCircle2 },
  { id: 3, hotel: 'The Curry Leaf',      city: 'Delhi',     event: 'Plan upgraded to Enterprise',      time: '12m ago', type: 'upgrade',   icon: ArrowUpRight },
  { id: 4, hotel: 'Spice Route Kolkata', city: 'Kolkata',   event: 'Menu items updated (+18 new)',     time: '28m ago', type: 'info',      icon: Package },
  { id: 5, hotel: 'Royal Darbar',        city: 'Jaipur',    event: 'Server latency spike detected',    time: '45m ago', type: 'warning',   icon: AlertCircle },
  { id: 6, hotel: 'Marina Bay Kitchen',  city: 'Chennai',   event: 'QR ordering system activated',    time: '1h ago',  type: 'success',   icon: CheckCircle2 },
  { id: 7, hotel: 'Deccan Delight',      city: 'Hyderabad', event: 'Rating improved to 4.5/5',        time: '2h ago',  type: 'success',   icon: Star },
  { id: 8, hotel: 'Punjab Grill',        city: 'Chandigarh',event: 'Revenue dip — 3% below target',   time: '3h ago',  type: 'warning',   icon: TrendingDown },
  { id: 9, hotel: 'Coastal Bliss',       city: 'Goa',       event: 'New hotel successfully onboarded',time: '5h ago',  type: 'new',       icon: Building2 },
];

const ORDER_BREAKDOWN = [
  { label: 'Dine-In',   value: 44, color: '#3a9b65' },
  { label: 'QR Table',  value: 31, color: '#6c63ff' },
  { label: 'Takeaway',  value: 17, color: '#f59e0b' },
  { label: 'Delivery',  value: 8,  color: '#ef4444' },
];

const PEAK_HOURS = [7,12,10,8,14,22,35,48,42,30,25,38,72,95,80,62,44,58,82,110,98,76,52,28];

// ── Subcomponents ──────────────────────────────────────────────────────────────

function Sparkline({ data, color, h = 46 }) {
  const w = 140;
  const max = Math.max(...data), min = Math.min(...data);
  const norm = v => h - ((v - min) / (max - min || 1)) * (h - 8) - 4;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${norm(v)}`).join(' ');
  const area = `M${data.map((v, i) => `${(i / (data.length - 1)) * w},${norm(v)}`).join('L')}L${w},${h}L0,${h}Z`;
  const uid = `sp-${color.replace(/[#(),.]/g, '')}`;
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${uid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BarChart({ data, selectedIdx, onSelect }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160, padding: '0 4px' }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        const isSelected = i === selectedIdx;
        return (
          <div key={d.month} onClick={() => onSelect(i)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{ duration: 0.7, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%', borderRadius: '5px 5px 2px 2px',
                background: isSelected
                  ? 'linear-gradient(180deg, #3a9b65, #2e7d50)'
                  : 'linear-gradient(180deg, rgba(58,155,101,0.4), rgba(58,155,101,0.15))',
                boxShadow: isSelected ? '0 0 16px rgba(58,155,101,0.45)' : 'none',
                border: isSelected ? '1px solid rgba(58,155,101,0.6)' : '1px solid rgba(58,155,101,0.15)',
                transition: 'all 0.25s ease',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {isSelected && (
                <motion.div layoutId="bar-shine" style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.25), transparent)',
                }} />
              )}
            </motion.div>
            <span style={{ fontSize: 9.5, color: isSelected ? '#3a9b65' : 'var(--text-muted)', fontWeight: isSelected ? 600 : 400, letterSpacing: '0.02em' }}>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ data, size = 120 }) {
  const r = 42, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(90,160,110,0.1)" strokeWidth="14" />
      {data.map((d, i) => {
        const dash = (d.value / total) * circ;
        const gap = circ - dash;
        const el = (
          <motion.circle key={i}
            cx={cx} cy={cy} r={r}
            fill="none" stroke={d.color} strokeWidth="14"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${gap}` }}
            transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

function PeakHoursChart({ data }) {
  const max = Math.max(...data);
  const hours = data.map((v, i) => ({ v, h: i, pct: (v / max) * 100 }));
  const peaks = [6, 12, 13, 19, 20, 21];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 72 }}>
      {hours.map(({ v, h, pct }) => {
        const isPeak = peaks.includes(h);
        return (
          <motion.div key={h}
            title={`${h}:00 — ${v}% activity`}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(pct, 6)}%` }}
            transition={{ duration: 0.6, delay: h * 0.02, ease: [0.16, 1, 0.3, 1] }}
            style={{
              flex: 1, borderRadius: '3px 3px 1px 1px',
              background: isPeak
                ? 'linear-gradient(180deg, #ef4444, rgba(239,68,68,0.5))'
                : 'linear-gradient(180deg, rgba(58,155,101,0.55), rgba(58,155,101,0.2))',
              cursor: 'default',
            }}
          />
        );
      })}
    </div>
  );
}

// ── Activity Type Configs ──────────────────────────────────────────────────────
const FEED_STYLES = {
  milestone: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  success:   { bg: 'rgba(58,155,101,0.11)', color: '#3a9b65', border: 'rgba(58,155,101,0.25)' },
  upgrade:   { bg: 'rgba(108,99,255,0.11)', color: '#6c63ff', border: 'rgba(108,99,255,0.25)' },
  info:      { bg: 'rgba(36,120,200,0.11)', color: '#2478c8', border: 'rgba(36,120,200,0.25)' },
  warning:   { bg: 'rgba(239,68,68,0.11)',  color: '#ef4444', border: 'rgba(239,68,68,0.25)'  },
  new:       { bg: 'rgba(0,201,167,0.11)',  color: '#00c9a7', border: 'rgba(0,201,167,0.25)'  },
};

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedNumber({ to, duration = 1.8, prefix = '', suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to, duration]);
  return <span>{prefix}{val.toLocaleString('en-IN')}{suffix}</span>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GlobalAnalyticsPage() {
  const [selectedBar, setSelectedBar] = useState(11);
  const [activeFilter, setActiveFilter] = useState('30d');
  const [liveTime, setLiveTime] = useState(new Date());
  const [feedPaused, setFeedPaused] = useState(false);
  const [viewMode, setViewMode] = useState('revenue');

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const selectedMonth = REVENUE_MONTHLY[selectedBar];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } } };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '28px 32px', minHeight: '100vh' }}
    >
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 13,
              background: 'linear-gradient(135deg, rgba(58,155,101,0.2), rgba(108,99,255,0.15))',
              border: '1px solid rgba(58,155,101,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(58,155,101,0.2)',
            }}>
              <Globe size={20} color="#3a9b65" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                Global Analytics
              </h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, letterSpacing: '0.04em' }}>
                Platform-wide intelligence · All 48 hotels · Live
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Live clock */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 13px', borderRadius: 10,
            background: 'rgba(58,155,101,0.09)', border: '1px solid rgba(58,155,101,0.2)',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3a9b65', boxShadow: '0 0 8px rgba(58,155,101,0.8)', animation: 'pulse-ring 2s infinite' }} />
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#3a9b65', fontWeight: 600 }}>
              {liveTime.toLocaleTimeString('en-IN', { hour12: false })}
            </span>
          </div>

          {/* Filter pills */}
          {['7d','30d','90d','1y'].map(f => (
            <motion.button key={f} whileTap={{ scale: 0.93 }} onClick={() => setActiveFilter(f)}
              style={{
                padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                background: activeFilter === f ? '#3a9b65' : 'rgba(255,255,255,0.7)',
                color: activeFilter === f ? '#fff' : 'var(--text-secondary)',
                border: activeFilter === f ? '1px solid #3a9b65' : '1px solid var(--border)',
                transition: 'all 0.22s ease',
                boxShadow: activeFilter === f ? '0 4px 16px rgba(58,155,101,0.35)' : 'none',
              }}>
              {f}
            </motion.button>
          ))}

          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: 'rgba(255,255,255,0.75)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}>
            <Download size={13} /> Export
          </motion.button>
        </div>
      </motion.div>

      {/* ── KPI Grid ── */}
      <motion.div variants={container} initial="hidden" animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 28 }}
        className="kpi-grid">
        {PLATFORM_KPIS.map((kpi, i) => (
          <motion.div key={kpi.id} variants={item}
            whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(40,110,70,0.18)' }}
            style={{
              background: 'var(--bg-card)', borderRadius: 18,
              border: '1px solid var(--border)',
              padding: '20px 22px',
              boxShadow: 'var(--shadow-card)',
              cursor: 'default', position: 'relative', overflow: 'hidden',
              transition: 'box-shadow 0.25s ease',
            }}>
            {/* BG accent */}
            <div style={{
              position: 'absolute', top: -24, right: -24, width: 90, height: 90,
              borderRadius: '50%', background: kpi.bg, filter: 'blur(18px)',
              pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, position: 'relative' }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {kpi.label}
                </span>
                <div style={{ fontSize: 26, fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, color: 'var(--text-primary)', marginTop: 5, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {kpi.value}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                  <ArrowUpRight size={11} color="#3a9b65" />
                  <span style={{ fontSize: 11, color: '#3a9b65', fontWeight: 500 }}>{kpi.sub}</span>
                </div>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: kpi.bg, border: `1px solid ${kpi.color}28`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <kpi.icon size={18} color={kpi.color} />
              </div>
            </div>

            <Sparkline data={kpi.spark} color={kpi.color} />
          </motion.div>
        ))}
      </motion.div>

      {/* ── Revenue Chart + Donut ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 24 }}>
        {/* Revenue bar chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{
            background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)',
            padding: '24px 26px', boxShadow: 'var(--shadow-card)',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                Revenue Overview
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Monthly platform-wide revenue in lakhs</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['revenue', 'orders'].map(m => (
                <button key={m} onClick={() => setViewMode(m)}
                  style={{
                    padding: '5px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
                    background: viewMode === m ? 'rgba(58,155,101,0.12)' : 'transparent',
                    color: viewMode === m ? '#3a9b65' : 'var(--text-muted)',
                    border: viewMode === m ? '1px solid rgba(58,155,101,0.3)' : '1px solid transparent',
                    textTransform: 'capitalize', transition: 'all 0.2s',
                  }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Selected month callout */}
          <motion.div key={selectedBar}
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'flex', gap: 24, marginBottom: 20,
              padding: '14px 18px', borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(58,155,101,0.09), rgba(108,99,255,0.06))',
              border: '1px solid rgba(58,155,101,0.18)',
            }}>
            <div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{selectedMonth.month} Revenue</div>
              <div style={{ fontSize: 22, fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, color: '#3a9b65' }}>₹{selectedMonth.value}L</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total Orders</div>
              <div style={{ fontSize: 22, fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, color: '#6c63ff' }}>{selectedMonth.orders.toLocaleString('en-IN')}</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Avg / Order</div>
              <div style={{ fontSize: 22, fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, color: '#f59e0b' }}>
                ₹{Math.round((selectedMonth.value * 100000) / selectedMonth.orders)}
              </div>
            </div>
          </motion.div>

          <BarChart
            data={viewMode === 'revenue' ? REVENUE_MONTHLY : REVENUE_MONTHLY.map(d => ({ ...d, value: Math.round(d.orders / 100) }))}
            selectedIdx={selectedBar}
            onSelect={setSelectedBar}
          />
        </motion.div>

        {/* Order breakdown donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
          style={{
            background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)',
            padding: '24px 26px', boxShadow: 'var(--shadow-card)',
          }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Order Types
          </h2>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 24 }}>Global breakdown by channel</p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <DonutChart data={ORDER_BREAKDOWN} size={130} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2, fontWeight: 500 }}>Total</div>
                <div style={{ fontSize: 17, fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, color: 'var(--text-primary)' }}>1.84L</div>
              </div>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ORDER_BREAKDOWN.map((d, i) => (
                <motion.div key={d.label} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0, boxShadow: `0 0 6px ${d.color}60` }} />
                  <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', flex: 1 }}>{d.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 70, height: 4, borderRadius: 3, background: 'rgba(90,160,110,0.12)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${d.value}%` }}
                        transition={{ duration: 0.8, delay: 0.6 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: '100%', borderRadius: 3, background: d.color }}
                      />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: d.color, minWidth: 28 }}>{d.value}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Top Hotels + City Performance ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 24 }}>
        {/* Top Hotels table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
          style={{
            background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)',
            padding: '24px 0', boxShadow: 'var(--shadow-card)', overflow: 'hidden',
          }}>
          <div style={{ padding: '0 26px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                Top Performing Hotels
              </h2>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>Ranked by monthly revenue</p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 9,
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
            }}>
              <Crown size={12} color="#f59e0b" />
              <span style={{ fontSize: 11.5, color: '#f59e0b', fontWeight: 600 }}>Enterprise</span>
            </div>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '40px 1fr 90px 80px 60px 70px 70px',
            padding: '10px 26px', gap: 8,
            background: 'rgba(90,160,110,0.06)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
          }}>
            {['#', 'Hotel', 'Revenue', 'Orders', 'Rating', 'Growth', 'Status'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>

          {TOP_HOTELS.map((hotel, i) => {
            const rankColors = ['#f59e0b', '#94a3b8', '#cd7c32', ...Array(10).fill('var(--text-muted)')];
            return (
              <motion.div key={hotel.name}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.52 + i * 0.06 }}
                whileHover={{ background: 'rgba(58,155,101,0.04)' }}
                style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 90px 80px 60px 70px 70px',
                  padding: '13px 26px', gap: 8,
                  borderBottom: i < TOP_HOTELS.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'default', transition: 'background 0.2s',
                }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: rankColors[i], fontFamily: 'Cormorant Garamond, serif' }}>
                    {hotel.rank <= 3 ? ['1','2','3'][i] : hotel.rank}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hotel.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hotel.city}</span>
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#3a9b65', fontFamily: 'Cormorant Garamond, serif', alignSelf: 'center' }}>{hotel.revenue}</span>
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', alignSelf: 'center' }}>{hotel.orders.toLocaleString()}</span>
                <div style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Star size={11} color="#f59e0b" fill="#f59e0b" />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{hotel.rating}</span>
                </div>
                <div style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {hotel.growth > 0 ? <ArrowUpRight size={11} color="#3a9b65" /> : <ArrowDownRight size={11} color="#ef4444" />}
                  <span style={{ fontSize: 12, fontWeight: 600, color: hotel.growth > 0 ? '#3a9b65' : '#ef4444' }}>{Math.abs(hotel.growth)}%</span>
                </div>
                <div style={{ alignSelf: 'center' }}>
                  <span style={{
                    fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
                    background: hotel.status === 'active' ? 'rgba(58,155,101,0.12)' : 'rgba(245,158,11,0.12)',
                    color: hotel.status === 'active' ? '#3a9b65' : '#f59e0b',
                    border: hotel.status === 'active' ? '1px solid rgba(58,155,101,0.25)' : '1px solid rgba(245,158,11,0.25)',
                    letterSpacing: '0.04em', textTransform: 'capitalize',
                  }}>
                    {hotel.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* City performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54 }}
          style={{
            background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)',
            padding: '24px 22px', boxShadow: 'var(--shadow-card)',
          }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            City Breakdown
          </h2>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 22 }}>Revenue share by city</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {CITY_PERFORMANCE.map((city, i) => (
              <motion.div key={city.city} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.58 + i * 0.07 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: city.color, boxShadow: `0 0 6px ${city.color}60` }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{city.city}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: city.color, fontFamily: 'Cormorant Garamond, serif' }}>{city.revenue}</span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', marginLeft: 5 }}>({city.hotels} hotels)</span>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 4, background: 'rgba(90,160,110,0.1)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${city.pct}%` }}
                    transition={{ duration: 0.9, delay: 0.62 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${city.color}, ${city.color}80)` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Peak hours */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Peak Activity Hours</h3>
              <span style={{ fontSize: 10.5, color: '#ef4444', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Flame size={10} color="#ef4444" /> Rush hours
              </span>
            </div>
            <PeakHoursChart data={PEAK_HOURS} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {['12A','6A','12P','6P','12A'].map(t => (
                <span key={t} style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{t}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Global Activity Feed ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62 }}
        style={{
          background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)',
          padding: '24px 26px', boxShadow: 'var(--shadow-card)',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              Global Activity Feed
            </h2>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>Real-time platform events across all hotels</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <motion.button whileTap={{ scale: 0.93 }} onClick={() => setFeedPaused(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                background: feedPaused ? 'rgba(245,158,11,0.1)' : 'rgba(58,155,101,0.1)',
                color: feedPaused ? '#f59e0b' : '#3a9b65',
                border: feedPaused ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(58,155,101,0.25)',
              }}>
              {feedPaused ? <RefreshCw size={12} /> : <Activity size={12} />}
              {feedPaused ? 'Resume' : 'Live'}
            </motion.button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {ACTIVITY_FEED.map((ev, i) => {
            const style = FEED_STYLES[ev.type];
            return (
              <motion.div key={ev.id}
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.66 + i * 0.05 }}
                whileHover={{ y: -3, boxShadow: `0 8px 28px ${style.color}18` }}
                style={{
                  padding: '14px 16px', borderRadius: 14,
                  background: style.bg, border: `1px solid ${style.border}`,
                  cursor: 'default', transition: 'box-shadow 0.2s ease',
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: `${style.color}18`, border: `1px solid ${style.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ev.icon size={15} color={style.color} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 3 }}>
                      {ev.hotel}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 8 }}>
                      {ev.event}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10.5, color: style.color, fontWeight: 500 }}>{ev.city}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={9} color="var(--text-muted)" />
                        <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{ev.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 1100px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 700px) {
          .kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  );
}
