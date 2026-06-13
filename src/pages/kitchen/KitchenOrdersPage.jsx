import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, X, ChefHat, Clock, Users,
  Flame, CheckCircle2, AlertCircle, ArrowRight, Filter,
  Utensils, Timer, Circle, Package, Star, RefreshCw
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

// ─── Animation Tokens ────────────────────────────────────────────────────────
const EASE_OUT = [0.16, 1, 0.3, 1];
const SPRING   = { type: 'spring', stiffness: 380, damping: 28, mass: 0.85 };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function loadOrdersFromStorage(hotelId) {
  // Try all known hotel keys so orders from any hotel are visible
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

function normalizePriority(order) {
  const itemCount = (order.items || []).reduce((s, i) => s + (i.quantity || i.qty || 1), 0);
  if (itemCount >= 5) return 'high';
  if (itemCount >= 3) return 'mid';
  return 'low';
}

function normalizeOrder(raw) {
  return {
    id:       raw.id,
    table:    raw.tableNumber || raw.table || 'Takeaway',
    seats:    (raw.items || []).reduce((s, i) => s + (i.quantity || i.qty || 1), 0),
    time:     raw.time || new Date(raw.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    elapsed:  getElapsed(raw.createdAt),
    status:   (() => {
      const raw_s = raw.kitchenStatus || raw.status;
      if (raw_s === 'prep' || raw_s === 'preparing') return 'prep';
      if (raw_s === 'ready') return 'ready';
      if (raw_s === 'completed' || raw_s === 'complete') return 'completed';
      return 'new'; // pending, new, or anything else
    })(),
    priority: normalizePriority(raw),
    items: (raw.items || []).map(i => ({
      name:     i.name,
      qty:      i.quantity || i.qty || 1,
      note:     i.note || '',
      category: i.category || 'Main',
    })),
    chef:    raw.chef || '—',
    station: raw.station || '—',
    note:    raw.note || '',
    type:    raw.type || 'eat',
    createdAt: raw.createdAt,
  };
}

const STATUS_META = {
  new:   { color: '#e05555', bg: 'rgba(224,85,85,0.1)',   border: 'rgba(224,85,85,0.28)',   label: 'Incoming',   icon: <AlertCircle size={12} /> },
  prep:  { color: '#e6a028', bg: 'rgba(230,160,40,0.1)',  border: 'rgba(230,160,40,0.28)',  label: 'In Prep',    icon: <Flame size={12} /> },
  ready: { color: '#3a9b65', bg: 'rgba(58,155,101,0.12)', border: 'rgba(58,155,101,0.28)', label: 'Ready',      icon: <CheckCircle2 size={12} /> },
};

const PRIORITY_META = {
  high: { color: '#e05555', label: 'High' },
  mid:  { color: '#e6a028', label: 'Mid'  },
  low:  { color: '#3a9b65', label: 'Low'  },
};

const CATEGORY_EMOJI = {
  Main: 'M', Starter: 'S', Dessert: 'D', Bread: 'B', Side: 'Si', Drink: 'Dr',
};

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, index }) {
  const navigate = useNavigate();
  const s = STATUS_META[order.status];
  const p = PRIORITY_META[order.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.96, filter: 'blur(3px)' }}
      transition={{ delay: index * 0.06, duration: 0.48, ease: EASE_OUT }}
      whileHover={{ y: -4, scale: 1.008, transition: SPRING }}
      onClick={() => navigate(`/kitchen/orders/${order.id}`)}
      style={{
        background: 'var(--bg-card, #fff)', border: '1px solid var(--border, rgba(90,160,110,0.18))',
        borderRadius: 18, padding: '18px 20px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.25s, box-shadow 0.25s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}35`; e.currentTarget.style.boxShadow = `0 12px 40px rgba(40,110,70,0.12), 0 0 0 1px ${s.color}20 inset`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border, rgba(90,160,110,0.18))'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1.5, background: `linear-gradient(90deg, transparent, ${s.color}80, transparent)` }} />

      {/* Priority stripe left */}
      <div style={{ position: 'absolute', left: 0, top: '15%', bottom: '15%', width: 3, borderRadius: '0 3px 3px 0', background: p.color, boxShadow: `0 0 8px ${p.color}` }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary, #1a3a28)', letterSpacing: '-0.01em' }}>{order.id}</div>
          <div style={{ width: 1, height: 14, background: 'var(--border, rgba(90,160,110,0.18))' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 700, color: '#3a9b65' }}>
            <Users size={11} /> {order.table} · {order.seats} pax
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: '3px 9px', borderRadius: 20, background: s.bg, border: `1px solid ${s.border}`, fontSize: 10.5, fontWeight: 700, color: s.color, display: 'flex', alignItems: 'center', gap: 4 }}>
            {s.icon} {s.label}
          </div>
        </div>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
        {order.items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20,
            background: 'rgba(58,155,101,0.06)', border: '1px solid rgba(58,155,101,0.14)', fontSize: 11.5,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>{CATEGORY_EMOJI[item.category] || 'M'}</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary, #1a3a28)' }}>{item.name}</span>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(58,155,101,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#3a9b65' }}>
              {item.qty}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted, #527864)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={10} /> {order.time}
          </span>
          <span style={{ fontSize: 11, color: p.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Timer size={10} /> {order.elapsed} elapsed
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted, #527864)' }}>Chef: {order.chef} · {order.station}</span>
        </div>
        <motion.div whileHover={{ x: 3 }} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 600, color: '#3a9b65' }}>
          Details <ArrowRight size={12} />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function KitchenOrdersPage() {
  const { activeHotelId } = useHotel();
  const [allOrders, setAllOrders]     = useState([]);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [filterOpen, setFilterOpen]   = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const loadOrders = useCallback(() => {
    const raw = loadOrdersFromStorage(activeHotelId);
    const normalized = raw.map(normalizeOrder)
      .filter(o => o.status !== 'completed')  // completed orders leave the kitchen queue
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setAllOrders(normalized);
    setLastRefresh(Date.now());
  }, [activeHotelId]);

  // Initial load + poll every 10s
  useEffect(() => {
    loadOrders();
    const t = setInterval(loadOrders, 10000);
    return () => clearInterval(t);
  }, [loadOrders]);

  const filtered = useMemo(() => allOrders.filter(o => {
    const matchSearch   = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.table.toLowerCase().includes(search.toLowerCase()) || o.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()));
    const matchStatus   = statusFilter === 'all'   || o.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || o.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  }), [allOrders, search, statusFilter, priorityFilter]);

  const counts = {
    all:   allOrders.length,
    new:   allOrders.filter(o => o.status === 'new').length,
    prep:  allOrders.filter(o => o.status === 'prep').length,
    ready: allOrders.filter(o => o.status === 'ready').length,
  };

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.55, ease: EASE_OUT }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(58,155,101,0.12)', border: '1px solid rgba(58,155,101,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3a9b65' }}>
              <Utensils size={18} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary, #1a3a28)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '-0.01em', margin: 0 }}>
              Kitchen Orders
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted, #527864)', margin: 0 }}>
            {filtered.length} of {allOrders.length} orders shown · refreshed {Math.floor((Date.now() - lastRefresh) / 1000)}s ago
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Refresh button */}
          <motion.button whileTap={{ scale: 0.94 }} onClick={loadOrders}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 13px', borderRadius: 10, background: 'var(--bg-card, #fff)', border: '1px solid var(--border, rgba(90,160,110,0.18))', color: '#3a9b65', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            <RefreshCw size={13} /> Refresh
          </motion.button>

          {/* Quick status tabs */}
          {[
            { key: 'all',   label: 'All Orders', count: counts.all,   color: '#3a9b65' },
            { key: 'new',   label: 'Incoming',   count: counts.new,   color: '#e05555' },
            { key: 'prep',  label: 'In Prep',    count: counts.prep,  color: '#e6a028' },
            { key: 'ready', label: 'Ready',       count: counts.ready, color: '#3a9b65' },
          ].map(tab => (
            <motion.button key={tab.key} whileTap={{ scale: 0.97 }}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: '8px 14px', borderRadius: 11, border: `1px solid ${statusFilter === tab.key ? tab.color + '40' : 'var(--border, rgba(90,160,110,0.18))'}`,
                background: statusFilter === tab.key ? `${tab.color}12` : 'var(--bg-card, #fff)',
                color: statusFilter === tab.key ? tab.color : 'var(--text-secondary, #4a7060)',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: statusFilter === tab.key ? `${tab.color}20` : 'rgba(90,160,110,0.08)', fontSize: 10, fontWeight: 700, color: tab.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {tab.count}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Body: Sidebar + Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: filterOpen ? '240px 1fr' : '0px 1fr', gap: filterOpen ? 20 : 0, alignItems: 'start', transition: 'grid-template-columns 0.35s ease' }}>

        {/* Filter Sidebar */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, rgba(90,160,110,0.18))', borderRadius: 18, padding: 20, position: 'sticky', top: 80 }}
            >
              {/* Search inside filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(58,155,101,0.05)', border: '1px solid rgba(58,155,101,0.14)', borderRadius: 11, padding: '8px 12px', marginBottom: 20 }}>
                <Search size={13} color="#3a9b65" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…"
                  style={{ background: 'none', border: 'none', outline: 'none', flex: 1, fontSize: 12.5, color: 'var(--text-primary, #1a3a28)', fontFamily: 'DM Sans, sans-serif' }} />
                {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #527864)', padding: 0 }}><X size={12} /></button>}
              </div>

              {/* Priority filter */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted, #527864)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Priority</div>
                {['all', 'high', 'mid', 'low'].map(p => {
                  const meta = p === 'all' ? { color: '#3a9b65', label: 'All Priorities' } : PRIORITY_META[p];
                  return (
                    <button key={p} onClick={() => setPriorityFilter(p)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 9,
                        background: priorityFilter === p ? `${meta.color}12` : 'transparent',
                        border: `1px solid ${priorityFilter === p ? meta.color + '30' : 'transparent'}`,
                        cursor: 'pointer', marginBottom: 4, textAlign: 'left', transition: 'all 0.18s',
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, boxShadow: priorityFilter === p ? `0 0 8px ${meta.color}` : 'none' }} />
                      <span style={{ fontSize: 12.5, fontWeight: priorityFilter === p ? 700 : 500, color: priorityFilter === p ? meta.color : 'var(--text-secondary, #4a7060)' }}>{meta.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Reset */}
              {(statusFilter !== 'all' || priorityFilter !== 'all' || search) && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setSearch(''); }}
                  style={{ width: '100%', marginTop: 16, padding: '9px', borderRadius: 10, background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.2)', color: '#e05555', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <X size={12} /> Clear Filters
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders Column */}
        <div>
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setFilterOpen(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 13px', borderRadius: 10, background: filterOpen ? 'rgba(58,155,101,0.1)' : 'var(--bg-card, #fff)', border: `1px solid ${filterOpen ? 'rgba(58,155,101,0.3)' : 'var(--border, rgba(90,160,110,0.18))'}`, color: filterOpen ? '#3a9b65' : 'var(--text-secondary, #4a7060)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >
              <SlidersHorizontal size={13} /> {filterOpen ? 'Hide Filters' : 'Show Filters'}
            </motion.button>

            {!filterOpen && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, background: 'var(--bg-card, #fff)', border: '1px solid var(--border, rgba(90,160,110,0.18))', borderRadius: 11, padding: '8px 14px' }}>
                <Search size={13} color="#527864" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders, tables, dishes…"
                  style={{ background: 'none', border: 'none', outline: 'none', flex: 1, fontSize: 12.5, color: 'var(--text-primary, #1a3a28)', fontFamily: 'DM Sans, sans-serif' }} />
              </div>
            )}

            <span style={{ fontSize: 12, color: 'var(--text-muted, #527864)', marginLeft: 'auto' }}>
              Showing <strong style={{ color: 'var(--text-primary, #1a3a28)' }}>{filtered.length}</strong> orders
            </span>
          </div>

          {/* Empty state when no real orders yet */}
          {allOrders.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card, #fff)', borderRadius: 18, border: '1px solid var(--border, rgba(90,160,110,0.18))' }}>
              <Package size={36} color="#527864" style={{ marginBottom: 12, opacity: 0.5 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted, #527864)', marginBottom: 6 }}>No orders yet</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted, #527864)' }}>Orders placed from the menu will appear here automatically</div>
            </motion.div>
          )}

          {/* Cards grid */}
          <motion.div layout style={{ display: 'grid', gridTemplateColumns: filterOpen ? '1fr' : 'repeat(2, 1fr)', gap: 14, transition: 'grid-template-columns 0.3s ease' }}>
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? filtered.map((order, i) => (
                <OrderCard key={order.id} order={order} index={i} />
              )) : allOrders.length > 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
                  <Package size={32} color="#527864" style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted, #527864)' }}>No orders match your filters</div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}