import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight, ArrowDownRight, Package, Calendar,
  BarChart2, XCircle, ShoppingBag, CheckCircle,
  Clock, Flame, X, Minus, UtensilsCrossed, AlertCircle,
} from 'lucide-react';
import { PageHeader } from './RevenueStatsPage';
import { useHotel } from '../../context/HotelContext';

// ─── Primitives ───────────────────────────────────────────────────────────────

function fadeUp(delay = 0, duration = 0.58) {
  return {
    initial: { opacity: 0, y: 28, scale: 0.97, filter: 'blur(7px)' },
    animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
      transition: { delay, duration, ease: [0.16, 1, 0.3, 1] } },
  };
}

function Card({ children, style = {}, delay = 0 }) {
  return (
    <motion.div {...fadeUp(delay)} style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px',
      position: 'relative', overflow: 'hidden', ...style,
    }}>
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

function EmptyState({ icon: Icon, msg }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 12 }}>
      <Icon size={28} style={{ opacity: 0.25, display: 'block', margin: '0 auto 10px' }} />
      {msg}
    </div>
  );
}

// ─── Data hook ────────────────────────────────────────────────────────────────

function useOrderData(hotelId) {
  return useMemo(() => {
    try {
      const allOrders = JSON.parse(localStorage.getItem(`rms_orders_${hotelId || 'default'}`) || '[]');

      const now = new Date();
      const todayKey = now.toISOString().slice(0, 10);

      const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().slice(0, 10);

      // week boundaries (Mon–Sun)
      const dayOfWeek = now.getDay();
      const diffToMon = (dayOfWeek + 6) % 7;
      const weekStart = new Date(now); weekStart.setDate(now.getDate() - diffToMon); weekStart.setHours(0,0,0,0);
      const thisWeekKeys = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
        return d.toISOString().slice(0, 10);
      });
      const lastWeekKeys = thisWeekKeys.map(k => {
        const d = new Date(k); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10);
      });

      const monthKey     = todayKey.slice(0, 7);
      const lastMonthDate = new Date(now); lastMonthDate.setMonth(now.getMonth() - 1);
      const lastMonthKey  = lastMonthDate.toISOString().slice(0, 7);

      const dk = o => (o.date || o.createdAt || '').slice(0, 10);

      // counts
      const todayOrders    = allOrders.filter(o => dk(o) === todayKey);
      const yesterdayOrders= allOrders.filter(o => dk(o) === yesterdayKey);
      const thisWeekOrders = allOrders.filter(o => thisWeekKeys.includes(dk(o)));
      const lastWeekOrders = allOrders.filter(o => lastWeekKeys.includes(dk(o)));
      const thisMonthOrders= allOrders.filter(o => dk(o).startsWith(monthKey));
      const lastMonthOrders= allOrders.filter(o => dk(o).startsWith(lastMonthKey));

      const pct = (a, b) => b > 0 ? +((a - b) / b * 100).toFixed(1) : 0;

      // Today KPIs
      const todayCount  = todayOrders.length;
      const yestCount   = yesterdayOrders.length;
      const weekCount   = thisWeekOrders.length;
      const lastWkCount = lastWeekOrders.length;
      const monCount    = thisMonthOrders.length;
      const lastMonCount= lastMonthOrders.length;
      const cancelledToday = todayOrders.filter(o => o.status === 'cancelled').length;
      const cancelledLast  = yesterdayOrders.filter(o => o.status === 'cancelled').length;

      // Hourly distribution — today's orders bucketed by hour
      const hourlyMap = {};
      for (let h = 8; h <= 22; h++) hourlyMap[h] = 0;
      todayOrders.forEach(o => {
        const t = o.time || (o.createdAt ? new Date(o.createdAt).toTimeString().slice(0,5) : null);
        if (t) {
          const h = parseInt(t.split(':')[0]);
          if (h >= 8 && h <= 22) hourlyMap[h]++;
        }
      });
      const hourly = Object.entries(hourlyMap).map(([hour, val]) => ({ hour, val }));
      const maxH = Math.max(...hourly.map(d => d.val), 1);
      const peakEntry = hourly.reduce((a, b) => b.val > a.val ? b : a, hourly[0]);

      // Order status breakdown — today
      const statusGroups = {
        served:    todayOrders.filter(o => o.status === 'paid' || o.status === 'completed' || o.status === 'served' || o.status === 'ready').length,
        preparing: todayOrders.filter(o => o.status === 'prep' || o.status === 'preparing').length,
        pending:   todayOrders.filter(o => o.status === 'pending' || o.status === 'new').length,
        cancelled: cancelledToday,
      };
      const totalToday = todayCount || 1;

      // Weekly bar (Mon–Sun) order counts — this week vs last
      const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const weeklyBars = thisWeekKeys.map((k, i) => ({
        day: DAYS[i],
        curr: allOrders.filter(o => dk(o) === k).length,
        prev: allOrders.filter(o => dk(o) === lastWeekKeys[i]).length,
      }));
      const maxCmp = Math.max(...weeklyBars.flatMap(d => [d.curr, d.prev]), 1);

      // Recent activity feed (last 8 orders, any date)
      const recent = [...allOrders]
        .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
        .slice(0, 8);

      return {
        todayCount, yestCount, weekCount, lastWkCount, monCount, lastMonCount,
        cancelledToday, cancelledLast,
        pctToday:   pct(todayCount, yestCount),
        pctWeek:    pct(weekCount, lastWkCount),
        pctMonth:   pct(monCount, lastMonCount),
        pctCancel:  pct(cancelledToday, cancelledLast),
        hourly, maxH, peakEntry,
        statusGroups, totalToday: todayCount,
        weeklyBars, maxCmp,
        recent,
        currentMonthLabel: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
        lastMonthLabel:    lastMonthDate.toLocaleString('default', { month: 'long' }),
      };
    } catch {
      return {
        todayCount:0, yestCount:0, weekCount:0, lastWkCount:0, monCount:0, lastMonCount:0,
        cancelledToday:0, cancelledLast:0, pctToday:0, pctWeek:0, pctMonth:0, pctCancel:0,
        hourly:[], maxH:1, peakEntry:{ hour:'—', val:0 },
        statusGroups:{ served:0, preparing:0, pending:0, cancelled:0 }, totalToday:0,
        weeklyBars:[], maxCmp:1, recent:[],
        currentMonthLabel:'This Month', lastMonthLabel:'Last Month',
      };
    }
  }, [hotelId]);
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

function OrderKpiCards({ d }) {
  const kpis = [
    { label: "Today's Orders",   value: d.todayCount,     pct: d.pctToday,  Icon: Package,   color: '#3a9b65', sub: `vs ${d.yestCount} yesterday` },
    { label: 'Weekly Orders',    value: d.weekCount,      pct: d.pctWeek,   Icon: Calendar,  color: '#3b9eff', sub: `vs ${d.lastWkCount} last week` },
    { label: 'Monthly Orders',   value: d.monCount,       pct: d.pctMonth,  Icon: BarChart2, color: '#a78bfa', sub: `vs ${d.lastMonCount} last month` },
    { label: 'Cancelled Today',  value: d.cancelledToday, pct: d.pctCancel, Icon: XCircle,   color: '#f87171', sub: `vs ${d.cancelledLast} yesterday`, invertGood: true },
  ];

  return (
    <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
      {kpis.map((k, i) => {
        const up = k.pct > 0;
        const neutral = k.pct === 0;
        // For cancelled: fewer cancellations = good (green)
        const isGood = k.invertGood ? !up : up;
        const color  = neutral ? 'var(--text-muted)' : isGood ? '#4ade80' : '#f87171';
        const DeltaIcon = neutral ? Minus : up ? ArrowUpRight : ArrowDownRight;
        return (
          <Card key={k.label} delay={0.05 * i}>
            <Accent color={k.color} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${k.color}15`, border: `1px solid ${k.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.Icon size={18} color={k.color} />
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontSize: 11.5, fontWeight: 600, color,
                background: `${color}18`, border: `1px solid ${color}30`,
                borderRadius: 6, padding: '2px 7px',
              }}>
                <DeltaIcon size={11} />
                {Math.abs(k.pct)}%
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, fontFamily: 'DM Sans, sans-serif' }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 500 }}>{k.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{k.sub}</div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Hourly chart ─────────────────────────────────────────────────────────────

function HourlyChart({ hourly, maxH, peakEntry, totalToday }) {
  const [hovered, setHovered] = useState(null);

  return (
    <Card delay={0.2} style={{ flex: 2, minWidth: 0 }}>
      <Accent color="#3b9eff" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>Hourly Order Volume</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Today — 8am to 10pm</div>
        </div>
        {peakEntry?.val > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 8, background: 'rgba(59,158,255,0.1)', border: '1px solid rgba(59,158,255,0.2)', fontSize: 11.5, color: '#3b9eff', fontWeight: 600 }}>
            <Flame size={12} color="#3b9eff" />
            Peak: {peakEntry.hour}:00 — {peakEntry.val} orders
          </div>
        )}
      </div>

      {totalToday === 0 ? (
        <EmptyState icon={ShoppingBag} msg="No orders placed today yet" />
      ) : (
        <>
          <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 140, padding: '0 2px', position: 'relative' }}>
            {hourly.map((d, i) => {
              const isPeak = d.val === maxH && d.val > 0;
              return (
                <div key={d.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}
                  onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                >
                  {hovered === i && d.val > 0 && (
                    <div style={{ position: 'absolute', bottom: '105%', background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)', borderRadius: 7, padding: '5px 8px', fontSize: 10.5, color: 'var(--text-primary)', whiteSpace: 'nowrap', zIndex: 10, boxShadow: 'var(--shadow-md)', pointerEvents: 'none' }}>
                      {d.val} orders
                    </div>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(d.val / maxH * 100, d.val > 0 ? 4 : 0)}%` }}
                    transition={{ delay: 0.22 + i * 0.03, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      background: isPeak
                        ? 'linear-gradient(180deg, #3b9eff, rgba(59,158,255,0.4))'
                        : hovered === i
                        ? 'linear-gradient(180deg, rgba(59,158,255,0.6), rgba(59,158,255,0.2))'
                        : 'linear-gradient(180deg, rgba(59,158,255,0.35), rgba(59,158,255,0.1))',
                      transition: 'background 0.2s',
                      border: isPeak ? '1px solid rgba(59,158,255,0.4)' : 'none',
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', marginTop: 6 }}>
            {hourly.map((d, i) => (
              <div key={d.hour} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--text-muted)' }}>
                {i % 2 === 0 ? d.hour : ''}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

// ─── Status breakdown ─────────────────────────────────────────────────────────

function StatusBreakdown({ statusGroups, totalToday }) {
  const STATUS_LIST = [
    { label: 'Served / Paid', key: 'served',    color: '#4ade80' },
    { label: 'Preparing',     key: 'preparing',  color: '#3b9eff' },
    { label: 'Pending',       key: 'pending',    color: '#f59e0b' },
    { label: 'Cancelled',     key: 'cancelled',  color: '#f87171' },
  ];
  const total = totalToday || 1;

  return (
    <Card delay={0.25} style={{ flex: 1, minWidth: 200 }}>
      <Accent color="#4ade80" />
      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)', marginBottom: 4 }}>Order Status</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Today's breakdown</div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>{totalToday}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>total today</div>
      </div>

      {STATUS_LIST.map((s, i) => {
        const count = statusGroups[s.key] || 0;
        const pct = Math.round(count / total * 100);
        return (
          <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 + i * 0.06 }} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color }} />
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{s.label}</span>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                {count} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct}%)</span>
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'rgba(72,160,100,0.09)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ delay: 0.32 + i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%', borderRadius: 3, background: s.color }}
              />
            </div>
          </motion.div>
        );
      })}
    </Card>
  );
}

// ─── Weekly comparison (this week vs last) ────────────────────────────────────

function WeeklyComparison({ weeklyBars, maxCmp, currentMonthLabel, lastMonthLabel }) {
  const hasData = weeklyBars.some(d => d.curr > 0 || d.prev > 0);

  return (
    <Card delay={0.3} style={{ flex: 1, minWidth: 0 }}>
      <Accent color="#a78bfa" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>Weekly Comparison</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>This week vs last week · daily orders</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[{ c: '#a78bfa', l: 'This week' }, { c: 'rgba(255,255,255,0.15)', l: 'Last week' }].map(({ c, l }) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {!hasData ? (
        <EmptyState icon={BarChart2} msg="No order data to compare yet" />
      ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          {weeklyBars.map((d, i) => (
            <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 110 }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.prev / maxCmp) * 100}%` }}
                  transition={{ delay: 0.32 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ width: 14, borderRadius: '4px 4px 0 0', background: 'rgba(255,255,255,0.12)', minHeight: d.prev > 0 ? 3 : 0 }}
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(d.curr / maxCmp * 100, d.curr > 0 ? 3 : 0)}%` }}
                  transition={{ delay: 0.35 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ width: 14, borderRadius: '4px 4px 0 0', background: 'linear-gradient(180deg, #a78bfa, rgba(167,139,250,0.3))', minHeight: d.curr > 0 ? 3 : 0 }}
                />
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{d.day}</div>
              <div style={{ fontSize: 10, color: 'var(--text-primary)', fontWeight: 600 }}>{d.curr}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── Activity feed ────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  paid: '#4ade80', completed: '#4ade80', served: '#4ade80', ready: '#4ade80',
  prep: '#3b9eff', preparing: '#3b9eff',
  pending: '#f59e0b', new: '#f59e0b',
  cancelled: '#f87171',
};
const STATUS_ICON = {
  paid: CheckCircle, completed: CheckCircle, served: CheckCircle, ready: CheckCircle,
  prep: Flame, preparing: Flame,
  pending: Clock, new: Clock,
  cancelled: X,
};
const STATUS_LABEL = {
  paid: 'Paid', completed: 'Completed', served: 'Served', ready: 'Ready',
  prep: 'Preparing', preparing: 'Preparing',
  pending: 'Pending', new: 'Pending',
  cancelled: 'Cancelled',
};

function timeAgo(order) {
  try {
    const d = new Date(order.createdAt || `${order.date}T${order.time || '00:00'}:00`);
    const diff = Math.floor((Date.now() - d) / 60000);
    if (diff < 1)  return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  } catch { return '—'; }
}

function ActivityFeed({ recent }) {
  return (
    <Card delay={0.35} style={{ flex: 1, minWidth: 0 }}>
      <Accent color="#3a9b65" />
      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)', marginBottom: 4 }}>Order Activity</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Most recent orders</div>

      {recent.length === 0 ? (
        <EmptyState icon={ShoppingBag} msg="No orders placed yet" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {recent.map((o, i) => {
            const s = o.status || 'pending';
            const color = STATUS_COLOR[s] || '#f59e0b';
            const StatusIcon = STATUS_ICON[s] || Clock;
            const label = STATUS_LABEL[s] || s;
            const itemSummary = (o.items || []).slice(0, 2).map(it => it.name).join(', ') + (o.items?.length > 2 ? ` +${o.items.length - 2}` : '');
            return (
              <motion.div key={o.id || i}
                initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.38 + i * 0.06 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(72,160,100,0.09)', transition: 'background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(72,160,100,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <StatusIcon size={14} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color, background: `${color}15`, border: `1px solid ${color}25`, borderRadius: 5, padding: '1px 6px', fontFamily: 'DM Sans, sans-serif' }}>
                      {o.tableNumber || 'Takeaway'}
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {itemSummary || 'No items'}
                  </div>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: '#3a9b65' }}>₹{parseFloat(o.totalAmount || 0).toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{timeAgo(o)}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderStatsPage() {
  const { activeHotelId } = useHotel();
  const d = useOrderData(activeHotelId);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <PageHeader title="Orders Statistics" sub="Order flow, volume & activity overview" icon={ShoppingBag} color="#3b9eff" />
      <OrderKpiCards d={d} />
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <HourlyChart hourly={d.hourly} maxH={d.maxH} peakEntry={d.peakEntry} totalToday={d.totalToday} />
        <StatusBreakdown statusGroups={d.statusGroups} totalToday={d.totalToday} />
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <WeeklyComparison weeklyBars={d.weeklyBars} maxCmp={d.maxCmp} currentMonthLabel={d.currentMonthLabel} lastMonthLabel={d.lastMonthLabel} />
        <ActivityFeed recent={d.recent} />
      </div>
      <div style={{ height: 32 }} />
    </div>
  );
}