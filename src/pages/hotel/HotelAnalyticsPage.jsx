import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, DollarSign, ShoppingBag, Star, Users,
  BarChart3, ArrowUpRight, Building2, MapPin,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { useNavigate } from 'react-router-dom';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateData(hotel) {
  const s = hotel.id.charCodeAt(hotel.id.length - 1) % 5;
  return {
    revenue:  MONTHS.map((_, i) => Math.round(40 + i * 6 + s * 8 + Math.sin(i) * 10)),
    orders:   MONTHS.map((_, i) => Math.round(300 + i * 42 + s * 35 + Math.cos(i * 0.8) * 60)),
    ratings:  MONTHS.map((_, i) => parseFloat((4.0 + Math.sin(i * 0.5) * 0.3 + s * 0.1).toFixed(1))),
    staff:    MONTHS.map(() => hotel.staff),
  };
}

function BarChartViz({ data, color, label, height = 120, formatVal = v => v }) {
  const max = Math.max(...data);
  const [hovered, setHovered] = useState(null);

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === i && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                  background: '#1a2a20', color: '#fff', fontSize: 11, fontWeight: 700,
                  padding: '4px 7px', borderRadius: 7, whiteSpace: 'nowrap', marginBottom: 4,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)', zIndex: 10,
                }}
              >
                {formatVal(v)}
              </motion.div>
            )}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(v / max) * (height - 20)}px` }}
              transition={{ duration: 0.6, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%', borderRadius: '4px 4px 0 0',
                background: hovered === i
                  ? color
                  : `${color}${80 + Math.round((v / max) * 100).toString(16).padStart(2, '0')}`,
                transition: 'background 0.2s ease',
                cursor: 'pointer',
                boxShadow: hovered === i ? `0 0 12px ${color}50` : 'none',
              }}
            />
            <span style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 500 }}>{MONTHS[i].slice(0, 1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChartViz({ data, color, label }) {
  const w = 100, h = 60;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 60 }}>
        <defs>
          <linearGradient id={`lg_${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M${pts.split(' ').join('L')}L${w},${h}L0,${h}Z`} fill={`url(#lg_${label})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function HotelAnalyticsPage() {
  const { activeHotel, isAdmin } = useHotel();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('year');

  if (!activeHotel) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(72,160,100,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart3 size={28} color="#3a9b65" />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Cormorant Garamond', serif" }}>No Hotel Selected</div>
        <div style={{ fontSize: 13.5, color: 'var(--text-muted)', maxWidth: 320 }}>
          {isAdmin ? 'Your hotel analytics could not be loaded. Please contact support.' : 'Select a hotel using the switcher in the header to view its analytics.'}
        </div>
      </div>
    );
  }

  const data = generateData(activeHotel);
  const totalRevenue = data.revenue.reduce((a, b) => a + b, 0);
  const totalOrders = data.orders.reduce((a, b) => a + b, 0);
  const avgRating = (data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length).toFixed(1);

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: activeHotel.branding.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: activeHotel.branding.logoColor }}>
              {activeHotel.shortName}
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Cormorant Garamond', serif" }}>
              {activeHotel.name} — Analytics
            </h2>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <MapPin size={11} /> {activeHotel.city} · Isolated property data
          </div>
        </div>

        {/* Period selector */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(72,160,100,0.06)', padding: 4, borderRadius: 10, border: '1px solid rgba(72,160,100,0.15)' }}>
          {['month', 'quarter', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                background: period === p ? activeHotel.branding.primary : 'transparent',
                color: period === p ? '#fff' : 'var(--text-muted)',
                textTransform: 'capitalize',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </motion.div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Revenue', value: `₹${(totalRevenue / 10).toFixed(1)}L`, icon: DollarSign, sub: '+18% YoY', color: activeHotel.branding.primary },
          { label: 'Total Orders',  value: totalOrders.toLocaleString(), icon: ShoppingBag, sub: '+12% YoY', color: activeHotel.branding.accent },
          { label: 'Avg Rating',    value: `${avgRating}/5`,  icon: Star,       sub: 'Excellent',  color: '#f59e0b' },
          { label: 'Peak Month',    value: MONTHS[data.revenue.indexOf(Math.max(...data.revenue))], icon: TrendingUp, sub: 'Highest revenue', color: '#6c63ff' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '18px', boxShadow: 'var(--shadow-card)',
              borderTop: `3px solid ${kpi.color}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>{kpi.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{kpi.value}</div>
                <div style={{ fontSize: 11, color: '#3a9b65', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <ArrowUpRight size={10} /> {kpi.sub}
                </div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={17} color={kpi.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px', boxShadow: 'var(--shadow-card)', gridColumn: '1 / -1' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Revenue Trend</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: activeHotel.branding.gradient }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{activeHotel.name}</span>
            </div>
          </div>
          <BarChartViz data={data.revenue} color={activeHotel.branding.primary} label="Monthly Revenue (₹ Thousands)" height={160} formatVal={v => `₹${v}K`} />
        </motion.div>

        {/* Orders chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px', boxShadow: 'var(--shadow-card)' }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Order Volume</div>
          <BarChartViz data={data.orders} color={activeHotel.branding.accent} label="Orders per Month" height={140} formatVal={v => `${v} orders`} />
        </motion.div>

        {/* Ratings trend */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px', boxShadow: 'var(--shadow-card)' }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Rating Trend</div>
          <LineChartViz data={data.ratings} color="#f59e0b" label="Guest Rating (1–5)" />
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {data.ratings.map((r, i) => (
              <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: r >= 4.5 ? '#3a9b65' : r >= 4 ? '#f59e0b' : '#ef4444' }}>{r}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{MONTHS[i].slice(0, 1)}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
