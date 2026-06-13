import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Utensils, ClipboardList, TrendingDown, ChefHat,
  AlertTriangle, ShoppingBag,
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

// ─── Data hook ────────────────────────────────────────────────────────────────

function useFoodData(hotelId) {
  return useMemo(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(`rms_orders_${hotelId || 'default'}`) || '[]');
      const orders = raw.filter(o => o.status === 'paid' || o.status === 'completed');

      // today / this month date strings
      const now = new Date();
      const todayKey  = now.toISOString().slice(0, 10);
      const monthKey  = now.toISOString().slice(0, 7);

      const lastMonthDate = new Date(now); lastMonthDate.setMonth(now.getMonth() - 1);
      const lastMonthKey  = lastMonthDate.toISOString().slice(0, 7);

      // item counter
      const itemTotals = {}; // name → { qty, rev, cat }
      let totalDishes = 0;

      orders.forEach(order => {
        const dk = (order.date || order.createdAt || '').slice(0, 10);
        (order.items || []).forEach(item => {
          const qty = item.quantity ?? item.qty ?? 1;
          const price = item.price ?? 0;
          const name = item.name || 'Unknown';
          const cat  = item.category || 'Other';
          if (!itemTotals[name]) itemTotals[name] = { qty: 0, rev: 0, cat };
          itemTotals[name].qty += qty;
          itemTotals[name].rev += qty * price;
          totalDishes += qty;
        });
      });

      // sorted arrays
      const sorted = Object.entries(itemTotals)
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.qty - a.qty);

      const topFoods = sorted.slice(0, 5);
      const lowFoods = sorted.slice(-4).reverse().filter(f => f.qty > 0);
      const maxQty   = topFoods[0]?.qty || 1;

      // category split from all items
      const catTotals = {};
      sorted.forEach(f => {
        catTotals[f.cat] = (catTotals[f.cat] || 0) + f.qty;
      });
      const totalCatQty = Object.values(catTotals).reduce((s, v) => s + v, 0) || 1;
      const CAT_COLORS = ['#3a9b65','#3b9eff','#34d399','#a78bfa','#f59e0b','#f87171','#ffd700'];
      const categories = Object.entries(catTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([label, qty], i) => ({
          label, qty,
          pct: Math.round(qty / totalCatQty * 100),
          color: CAT_COLORS[i % CAT_COLORS.length],
        }));

      // KPI: menu item count from menuData
      let menuItemCount = 0;
      try {
        const menuRaw = localStorage.getItem('rms_menu_items');
        if (menuRaw) menuItemCount = JSON.parse(menuRaw).length;
      } catch {}

      return { totalDishes, topFoods, lowFoods, maxQty, categories, menuItemCount, totalItems: sorted.length };
    } catch {
      return { totalDishes: 0, topFoods: [], lowFoods: [], maxQty: 1, categories: [], menuItemCount: 0, totalItems: 0 };
    }
  }, [hotelId]);
}

// ─── KPI cards ────────────────────────────────────────────────────────────────

const RANK_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32', '#3a9b65', '#3b9eff'];

function FoodKpiCards({ data }) {
  const kpis = [
    { label: 'Total Dishes Sold',  value: data.totalDishes.toLocaleString(), Icon: Utensils,      color: '#3a9b65', sub: 'from paid orders' },
    { label: 'Unique Items Sold',  value: data.totalItems.toString(),        Icon: ClipboardList, color: '#34d399', sub: 'across all categories' },
    { label: 'Top Item',           value: data.topFoods[0]?.name || '—',    Icon: ChefHat,       color: '#f59e0b', sub: data.topFoods[0] ? `${data.topFoods[0].qty} sold` : 'no data yet' },
    { label: 'Lowest Seller',      value: data.lowFoods[0]?.name || '—',    Icon: TrendingDown,  color: '#f87171', sub: data.lowFoods[0] ? `only ${data.lowFoods[0].qty} sold` : 'no data yet' },
  ];

  return (
    <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
      {kpis.map((k, i) => (
        <Card key={k.label} delay={0.05 * i}>
          <Accent color={k.color} />
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${k.color}15`, border: `1px solid ${k.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <k.Icon size={18} color={k.color} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {k.value}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 500 }}>{k.label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{k.sub}</div>
        </Card>
      ))}
    </div>
  );
}

// ─── Top selling foods ────────────────────────────────────────────────────────

function TopFoodsCard({ topFoods, maxQty }) {
  if (topFoods.length === 0) return (
    <Card delay={0.2} style={{ flex: 1, minWidth: 0 }}>
      <Accent color="#3a9b65" />
      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)', marginBottom: 4 }}>Top Selling Items</div>
      <EmptyState icon={ShoppingBag} msg="No paid orders yet" />
    </Card>
  );

  return (
    <Card delay={0.2} style={{ flex: 1, minWidth: 0 }}>
      <Accent color="#3a9b65" />
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>Top Selling Items</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Best performers · all time</div>
      </div>

      {topFoods.map((f, i) => (
        <motion.div key={f.name}
          initial={{ opacity: 0, x: -12, filter: 'blur(4px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.22 + i * 0.07, duration: 0.4 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 10px', borderRadius: 10, marginBottom: 4,
            background: i === 0 ? 'rgba(255,215,0,0.05)' : 'transparent',
            border: i === 0 ? '1px solid rgba(255,215,0,0.12)' : '1px solid transparent',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (i > 0) e.currentTarget.style.background = 'rgba(72,160,100,0.05)'; }}
          onMouseLeave={e => { if (i > 0) e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{
            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
            background: `${RANK_COLORS[i]}15`, border: `1px solid ${RANK_COLORS[i]}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: RANK_COLORS[i], fontFamily: 'DM Sans, sans-serif',
          }}>{i + 1}</div>

          <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: `${RANK_COLORS[i]}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChefHat size={14} color={RANK_COLORS[i]} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', flexShrink: 0, marginLeft: 8 }}>{f.qty} sold</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'rgba(72,160,100,0.14)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${(f.qty / maxQty) * 100}%` }}
                transition={{ delay: 0.3 + i * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${RANK_COLORS[i]}cc, ${RANK_COLORS[i]}55)` }}
              />
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: '#3a9b65', flexShrink: 0, textAlign: 'right' }}>
            ₹{Math.round(f.rev).toLocaleString('en-IN')}
          </div>
        </motion.div>
      ))}
    </Card>
  );
}

// ─── Low selling foods ────────────────────────────────────────────────────────

function LowFoodsCard({ lowFoods }) {
  if (lowFoods.length === 0) return (
    <Card delay={0.25} style={{ flex: 1, minWidth: 0 }}>
      <Accent color="#f87171" />
      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)', marginBottom: 4 }}>Low Performing Items</div>
      <EmptyState icon={ShoppingBag} msg="No data yet" />
    </Card>
  );

  const maxLow = lowFoods[0]?.qty || 1;

  return (
    <Card delay={0.25} style={{ flex: 1, minWidth: 0 }}>
      <Accent color="#f87171" />
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>Low Performing Items</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Least ordered · all time</div>
      </div>

      {lowFoods.map((f, i) => {
        const isWarning = f.qty <= 2;
        return (
          <motion.div key={f.name}
            initial={{ opacity: 0, x: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.27 + i * 0.07 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 10px', borderRadius: 10, marginBottom: 4,
              background: isWarning ? 'rgba(248,113,113,0.05)' : 'transparent',
              border: isWarning ? '1px solid rgba(248,113,113,0.12)' : '1px solid transparent',
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: isWarning ? 'rgba(248,113,113,0.1)' : 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={14} color={isWarning ? '#f87171' : '#f59e0b'} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                <span style={{ fontSize: 11.5, color: isWarning ? '#f87171' : 'var(--text-secondary)', flexShrink: 0, marginLeft: 8, fontWeight: isWarning ? 600 : 400 }}>{f.qty} sold</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'rgba(72,160,100,0.14)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${(f.qty / maxLow) * 100}%` }}
                  transition={{ delay: 0.32 + i * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: '100%', borderRadius: 3, background: isWarning ? 'linear-gradient(90deg,#f87171cc,#f8717155)' : 'linear-gradient(90deg,#f59e0bcc,#f59e0b55)' }}
                />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{f.cat}</div>
            </div>
            {isWarning && (
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(248,113,113,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={12} color="#f87171" />
              </div>
            )}
          </motion.div>
        );
      })}
    </Card>
  );
}

// ─── Category breakdown ───────────────────────────────────────────────────────

function CategoryBreakdown({ categories }) {
  if (categories.length === 0) return (
    <Card delay={0.32}>
      <Accent color="#34d399" />
      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)', marginBottom: 4 }}>Category Split</div>
      <EmptyState icon={Utensils} msg="No category data yet" />
    </Card>
  );

  return (
    <Card delay={0.32}>
      <Accent color="#34d399" />
      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)', marginBottom: 4 }}>Category Split</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Sales by food category · all time</div>

      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ height: 16, borderRadius: 8, overflow: 'hidden', display: 'flex' }}>
          {categories.map((c, i) => (
            <motion.div key={c.label}
              initial={{ width: 0 }} animate={{ width: `${c.pct}%` }}
              transition={{ delay: 0.35 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: c.color, height: '100%' }}
              title={`${c.label}: ${c.pct}%`}
            />
          ))}
        </div>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categories.map((c, i) => (
            <motion.div key={c.label}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{c.label}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{c.qty} sold</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', minWidth: 36, textAlign: 'right' }}>{c.pct}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, msg }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 12 }}>
      <Icon size={28} style={{ opacity: 0.25, display: 'block', margin: '0 auto 10px' }} />
      {msg}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FoodStatsPage() {
  const { activeHotelId } = useHotel();
  const data = useFoodData(activeHotelId);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <PageHeader title="Food Statistics" sub="Menu performance & sales analytics" icon={Utensils} color="#34d399" />
      <FoodKpiCards data={data} />
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <TopFoodsCard topFoods={data.topFoods} maxQty={data.maxQty} />
        <LowFoodsCard lowFoods={data.lowFoods} />
      </div>
      <CategoryBreakdown categories={data.categories} />
      <div style={{ height: 32 }} />
    </div>
  );
}