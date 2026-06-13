import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Calendar,
  ArrowUpRight, ArrowDownRight, Minus, BarChart2, Target,
  ChevronLeft, ChevronRight, ShoppingBag,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

// ─── Shared primitives ───────────────────────────────────────────────────────

function fadeUp(delay = 0, duration = 0.58) {
  return {
    initial: { opacity: 0, y: 28, scale: 0.97, filter: "blur(7px)" },
    animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
      transition: { delay, duration, ease: [0.16, 1, 0.3, 1] } },
  };
}

function Card({ children, style = {}, delay = 0 }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

function Accent({ color }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 2,
      background: `linear-gradient(90deg, transparent, ${color}70, transparent)`,
    }} />
  );
}

function Delta({ value, suffix = '%' }) {
  const up = value > 0;
  const neutral = value === 0;
  const color = neutral ? 'var(--text-muted)' : up ? '#4ade80' : '#f87171';
  const Icon = neutral ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 11.5, fontWeight: 600, color,
      background: `${color}18`, border: `1px solid ${color}30`,
      borderRadius: 6, padding: '2px 7px',
    }}>
      <Icon size={11} />
      {Math.abs(value)}{suffix}
    </span>
  );
}

// ─── Real data loader ─────────────────────────────────────────────────────────

function loadOrdersForHotel(hotelId) {
  try {
    const key = `rms_orders_${hotelId || 'default'}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch { return []; }
}

function parseOrderAmount(order) {
  const v = parseFloat(order.totalAmount ?? order.amount ?? 0);
  return isNaN(v) ? 0 : v;
}

function toDateKey(dateStr) {
  // normalise "2026-06-06" or ISO strings
  return dateStr ? dateStr.slice(0, 10) : null;
}

function useRevenueData(hotelId) {
  return useMemo(() => {
    const orders = loadOrdersForHotel(hotelId).filter(
      o => o.status === 'paid' || o.status === 'completed'
    );

    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);

    // yesterday
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    // group by date
    const byDate = {};
    orders.forEach(o => {
      const dk = toDateKey(o.date || o.createdAt);
      if (!dk) return;
      byDate[dk] = (byDate[dk] || 0) + parseOrderAmount(o);
    });

    // today & yesterday revenue
    const todayRev = byDate[todayKey] || 0;
    const yestRev  = byDate[yesterdayKey] || 0;
    const todayDelta = yestRev > 0 ? +((todayRev - yestRev) / yestRev * 100).toFixed(1) : 0;

    // this week (Mon–Sun containing today)
    const dayOfWeek = today.getDay(); // 0=Sun
    const diffToMon = (dayOfWeek + 6) % 7;
    const weekStart = new Date(today); weekStart.setDate(today.getDate() - diffToMon);
    weekStart.setHours(0,0,0,0);
    const weekKeys = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
    const thisWeekRev = weekKeys.reduce((s, k) => s + (byDate[k] || 0), 0);

    // last week
    const lastWeekKeys = weekKeys.map(k => {
      const d = new Date(k); d.setDate(d.getDate() - 7);
      return d.toISOString().slice(0, 10);
    });
    const lastWeekRev = lastWeekKeys.reduce((s, k) => s + (byDate[k] || 0), 0);
    const weekDelta = lastWeekRev > 0 ? +((thisWeekRev - lastWeekRev) / lastWeekRev * 100).toFixed(1) : 0;

    // this month
    const monthKey = todayKey.slice(0, 7); // "2026-06"
    const lastMonthDate = new Date(today); lastMonthDate.setMonth(today.getMonth() - 1);
    const lastMonthKey = lastMonthDate.toISOString().slice(0, 7);
    const thisMonthRev = Object.entries(byDate).filter(([k]) => k.startsWith(monthKey)).reduce((s, [, v]) => s + v, 0);
    const lastMonthRev = Object.entries(byDate).filter(([k]) => k.startsWith(lastMonthKey)).reduce((s, [, v]) => s + v, 0);
    const monthDelta = lastMonthRev > 0 ? +((thisMonthRev - lastMonthRev) / lastMonthRev * 100).toFixed(1) : 0;

    // avg order value
    const paidOrders = orders.length;
    const avgOrder = paidOrders > 0 ? Math.round(orders.reduce((s, o) => s + parseOrderAmount(o), 0) / paidOrders) : 0;

    // weekly bar chart data (Mon–Sun)
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekly = weekKeys.map((k, i) => ({
      day: DAYS[i],
      val: byDate[k] || 0,
      prev: byDate[lastWeekKeys[i]] || 0,
      dateKey: k,
    }));

    // dine-in vs takeaway breakdown (this week)
    const dineOrders  = orders.filter(o => weekKeys.includes(toDateKey(o.date || o.createdAt)) && (o.type === 'eat' || o.tableNumber !== 'Takeaway'));
    const takeOrders  = orders.filter(o => weekKeys.includes(toDateKey(o.date || o.createdAt)) && (o.type === 'parcel' || o.tableNumber === 'Takeaway'));
    const dineRev  = dineOrders.reduce((s, o) => s + parseOrderAmount(o), 0);
    const takeRev  = takeOrders.reduce((s, o) => s + parseOrderAmount(o), 0);
    const totalBreakdown = dineRev + takeRev || 1;

    // calendar: byDate for current viewed month
    return {
      todayRev, yestRev, todayDelta,
      thisWeekRev, lastWeekRev, weekDelta,
      thisMonthRev, lastMonthRev, monthDelta,
      avgOrder, paidOrders,
      weekly,
      breakdown: [
        { label: 'Dine-in',  pct: Math.round(dineRev / totalBreakdown * 100), value: dineRev, color: '#3a9b65' },
        { label: 'Takeaway', pct: Math.round(takeRev / totalBreakdown * 100), value: takeRev, color: '#3b9eff' },
      ],
      byDate,
    };
  }, [hotelId]);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)  return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n.toLocaleString()}`;
}

function fmtFull(n) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

const ICON_MAP = { DollarSign, Calendar, BarChart2, Target, TrendingUp };

// ─── KPI cards ────────────────────────────────────────────────────────────────

function KpiCards({ data }) {
  const kpis = [
    { label: "Today's Revenue",  value: fmtFull(data.todayRev),      delta: data.todayDelta,  icon: 'DollarSign', color: '#3a9b65', sub: `vs yesterday ${fmtFull(data.yestRev)}` },
    { label: 'Weekly Revenue',   value: fmtFull(data.thisWeekRev),   delta: data.weekDelta,   icon: 'Calendar',   color: '#3b9eff', sub: `vs last week ${fmtFull(data.lastWeekRev)}` },
    { label: 'Monthly Revenue',  value: fmtFull(data.thisMonthRev),  delta: data.monthDelta,  icon: 'BarChart2',  color: '#a78bfa', sub: `vs last month ${fmtFull(data.lastMonthRev)}` },
    { label: 'Avg Order Value',  value: fmtFull(data.avgOrder),      delta: 0,                icon: 'Target',     color: '#34d399', sub: `across ${data.paidOrders} orders` },
  ];

  return (
    <motion.div
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } } }}
      initial="hidden" animate="show"
      className="kpi-grid"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 24 }}
    >
      {kpis.map(k => {
        const IconComp = ICON_MAP[k.icon] || DollarSign;
        return (
          <motion.div key={k.label}
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.93, filter: 'blur(8px)' },
              show:   { opacity: 1, y: 0,  scale: 1,    filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
            }}
            whileHover={{ y: -5, scale: 1.015, transition: { type: 'spring', stiffness: 340, damping: 24 } }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', position: 'relative', overflow: 'hidden', cursor: 'default' }}
          >
            <Accent color={k.color} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${k.color}15`, border: `1px solid ${k.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconComp size={18} color={k.color} />
              </div>
              <Delta value={k.delta} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, fontFamily: 'DM Sans, sans-serif' }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 500 }}>{k.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{k.sub}</div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─── Weekly bar chart ─────────────────────────────────────────────────────────

function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

function WeeklyChart({ weekly }) {
  const [hovered, setHovered] = useState(null);
  const maxVal = Math.max(...weekly.map(d => Math.max(d.val, d.prev)), 1);
  const today = new Date();
  const todayDayIdx = (today.getDay() + 6) % 7; // Mon=0

  return (
    <Card delay={0.2} style={{ flex: 2, minWidth: 0 }}>
      <Accent color="#3a9b65" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>Weekly Revenue</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Current vs previous week</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <LegendDot color="#3a9b65" label="This week" />
          <LegendDot color="rgba(255,255,255,0.18)" label="Last week" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 160, padding: '0 4px', position: 'relative' }}>
        {weekly.map((d, i) => (
          <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end', position: 'relative' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === i && d.val > 0 && (
              <div style={{
                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)',
                borderRadius: 8, padding: '6px 10px', fontSize: 11, color: 'var(--text-primary)',
                whiteSpace: 'nowrap', zIndex: 10, marginBottom: 6,
                boxShadow: '0 8px 32px rgba(40,110,70,0.15)',
              }}>
                {fmtFull(d.val)}
              </div>
            )}
            {/* prev bar */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.prev / maxVal) * 100}%` }}
              transition={{ delay: 0.05 * i + 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '38%', borderRadius: '3px 3px 0 0', background: 'rgba(255,255,255,0.09)', minHeight: d.prev > 0 ? 2 : 0 }}
            />
            {/* current bar */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(d.val / maxVal * 100, d.val > 0 ? 2 : 0)}%` }}
              transition={{ delay: 0.05 * i + 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '38%', borderRadius: '3px 3px 0 0',
                background: i === todayDayIdx
                  ? 'linear-gradient(180deg, #4dbf7f, #3a9b65)'
                  : hovered === i
                  ? 'linear-gradient(180deg, #4dbf7f, #3a9b65)'
                  : 'linear-gradient(180deg, rgba(232,183,90,0.85), rgba(232,183,90,0.3))',
                transition: 'background 0.2s',
                outline: i === todayDayIdx ? '1.5px solid rgba(58,155,101,0.5)' : 'none',
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', marginTop: 8 }}>
        {weekly.map((d, i) => (
          <div key={d.day} style={{ flex: 1, textAlign: 'center', fontSize: 10.5, color: i === todayDayIdx ? 'var(--gold)' : 'var(--text-muted)', fontWeight: i === todayDayIdx ? 700 : 400 }}>
            {d.day}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Revenue Breakdown (Dine-in + Takeaway only) ──────────────────────────────

function RevenueBreakdown({ breakdown }) {
  const total = breakdown.reduce((s, b) => s + b.value, 0);
  return (
    <Card delay={0.25} style={{ flex: 1, minWidth: 220 }}>
      <Accent color="#3b9eff" />
      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)', marginBottom: 4 }}>
        Revenue Breakdown
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>By order type · this week</div>

      {breakdown.map((c, i) => (
        <div key={c.label} style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{c.label}</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{fmtFull(c.value)}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(72,160,100,0.14)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${c.pct}%` }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%', borderRadius: 3, background: c.color }}
            />
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 3 }}>{c.pct}% of total</div>
        </div>
      ))}

      {total === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 12 }}>
          <ShoppingBag size={28} style={{ opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
          No paid orders this week
        </div>
      )}
    </Card>
  );
}

// ─── Revenue Calendar (real data, live month, no future) ─────────────────────

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_HEADER = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function RevCalendar({ byDate }) {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  // Calendar starts at current month
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const canGoNext = !isCurrentMonth;
  const canGoBack = !(viewYear === 2026 && viewMonth === 0); // stop at Jan 2026

  const goBack = () => {
    if (!canGoBack) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goNext = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Build calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;

  const cells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateKey = `${monthPrefix}-${String(day).padStart(2, '0')}`;
    const isFuture = dateKey > todayKey;
    const isToday  = dateKey === todayKey;
    const rev = isFuture ? null : (byDate[dateKey] ?? null);
    return { day, dateKey, rev, isFuture, isToday };
  });

  const maxRev = Math.max(...cells.filter(c => c.rev != null).map(c => c.rev), 1);

  const [hovered, setHovered] = useState(null);

  return (
    <Card delay={0.3}>
      <Accent color="#3a9b65" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            Revenue Calendar
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Daily revenue · {MONTH_NAMES[viewMonth]} {viewYear}
          </div>
        </div>

        {/* Month navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <motion.button
            whileHover={canGoBack ? { scale: 1.1 } : {}} whileTap={canGoBack ? { scale: 0.9 } : {}}
            onClick={goBack}
            style={{
              width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)',
              background: canGoBack ? 'rgba(72,160,100,0.06)' : 'rgba(72,160,100,0.02)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: canGoBack ? 'pointer' : 'not-allowed',
              opacity: canGoBack ? 1 : 0.35,
            }}
          >
            <ChevronLeft size={14} color="var(--text-secondary)" />
          </motion.button>

          <div style={{
            padding: '4px 14px', borderRadius: 8,
            background: 'rgba(58,155,101,0.1)', border: '1px solid rgba(58,155,101,0.25)',
            fontSize: 11.5, color: 'var(--gold)', fontWeight: 600, minWidth: 90, textAlign: 'center',
          }}>
            {MONTH_NAMES[viewMonth].slice(0, 3)} {viewYear}
          </div>

          <motion.button
            whileHover={canGoNext ? { scale: 1.1 } : {}} whileTap={canGoNext ? { scale: 0.9 } : {}}
            onClick={goNext}
            style={{
              width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)',
              background: canGoNext ? 'rgba(72,160,100,0.06)' : 'rgba(72,160,100,0.02)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: canGoNext ? 'pointer' : 'not-allowed', opacity: canGoNext ? 1 : 0.35,
            }}
          >
            <ChevronRight size={14} color="var(--text-secondary)" />
          </motion.button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {DAYS_HEADER.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {/* empty offset cells */}
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {cells.map((cell, i) => {
          const intensity = cell.rev != null ? cell.rev / maxRev : 0;
          const isHovered = hovered === i && !cell.isFuture;

          let bg, border;
          if (cell.isFuture) {
            bg = 'rgba(72,160,100,0.02)';
            border = '1px solid rgba(72,160,100,0.05)';
          } else if (cell.rev != null && cell.rev > 0) {
            bg = `rgba(58,155,101,${0.07 + intensity * 0.52})`;
            border = cell.isToday
              ? '1.5px solid rgba(58,155,101,0.7)'
              : `1px solid rgba(58,155,101,${0.12 + intensity * 0.25})`;
          } else {
            // past day, no revenue
            bg = 'rgba(72,160,100,0.04)';
            border = '1px solid rgba(72,160,100,0.07)';
          }

          return (
            <motion.div
              key={cell.day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.32 + i * 0.006, duration: 0.3 }}
              onMouseEnter={() => !cell.isFuture && setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                aspectRatio: '1',
                borderRadius: 7,
                background: bg,
                border,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: cell.rev != null && cell.rev > 0 ? 'pointer' : 'default',
                position: 'relative',
                transition: 'transform 0.15s, background 0.15s',
                transform: isHovered && cell.rev > 0 ? 'scale(1.1)' : 'scale(1)',
                boxShadow: cell.isToday ? '0 0 0 2px rgba(58,155,101,0.25)' : 'none',
              }}
            >
              <span style={{
                fontSize: 10.5,
                color: cell.isFuture ? 'rgba(255,255,255,0.12)' : cell.isToday ? 'var(--gold)' : cell.rev > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: cell.isToday ? 700 : 400,
              }}>
                {cell.day}
              </span>

              {/* Revenue micro-label for days with data */}
              {cell.rev != null && cell.rev > 0 && !cell.isFuture && (
                <span style={{ fontSize: 8.5, color: 'var(--text-muted)', marginTop: 1, lineHeight: 1 }}>
                  {fmt(cell.rev)}
                </span>
              )}

              {/* Hover tooltip */}
              {isHovered && cell.rev != null && (
                <div style={{
                  position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)',
                  borderRadius: 8, padding: '6px 10px', fontSize: 11,
                  color: 'var(--text-primary)', whiteSpace: 'nowrap', zIndex: 20,
                  boxShadow: '0 8px 32px rgba(40,110,70,0.2)',
                  pointerEvents: 'none',
                }}>
                  <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{MONTH_NAMES[viewMonth].slice(0,3)} {cell.day}</span>
                  <br />
                  {fmtFull(cell.rev)}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Low</span>
        {[0.07, 0.18, 0.32, 0.46, 0.59].map(v => (
          <div key={v} style={{ width: 14, height: 14, borderRadius: 3, background: `rgba(58,155,101,${v})` }} />
        ))}
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>High</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>
          Future dates are hidden
        </span>
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RevenueStatsPage() {
  const { activeHotelId } = useHotel();
  const data = useRevenueData(activeHotelId);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <PageHeader title="Revenue Statistics" sub="Financial performance overview" icon={DollarSign} color="#3a9b65" />
      <KpiCards data={data} />
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <WeeklyChart weekly={data.weekly} />
        <RevenueBreakdown breakdown={data.breakdown} />
      </div>
      <RevCalendar byDate={data.byDate} />
      <div style={{ height: 32 }} />
    </div>
  );
}

export function PageHeader({ title, sub, icon: IconComp, color }) {
  return (
    <motion.div
      {...fadeUp(0)}
      style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 13,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {IconComp && <IconComp size={22} color={color} />}
      </div>
      <div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {title}
        </h1>
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3 }}>{sub}</p>
      </div>
    </motion.div>
  );
}