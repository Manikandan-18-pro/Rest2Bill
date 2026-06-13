import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, TrendingUp, CreditCard,
  CheckCircle, Clock, XCircle, ChevronDown, ArrowUpRight,
  Receipt, Calendar, RefreshCw, Smartphone, Banknote, Wallet,
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';

function loadOrders(hotelId) {
  try {
    const targetKey = `rms_orders_${hotelId || 'default'}`;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('rms_orders_')) keys.push(k);
    }
    if (!keys.includes(targetKey)) keys.push(targetKey);
    const seen = new Set();
    const all = [];
    keys.forEach(k => {
      try {
        const items = JSON.parse(localStorage.getItem(k) || '[]');
        items.forEach(o => {
          if (o && o.id && !seen.has(o.id)) { seen.add(o.id); all.push(o); }
        });
      } catch {}
    });
    return all;
  } catch { return []; }
}

const STATUS_META = {
  paid:      { color: '#27a06b', bg: 'rgba(76,175,147,0.1)',  border: 'rgba(76,175,147,0.25)',  icon: CheckCircle, label: 'Paid'      },
  pending:   { color: '#3a9b65', bg: 'rgba(72,160,100,0.1)',  border: 'rgba(72,160,100,0.25)',  icon: Clock,       label: 'Pending'   },
  void:      { color: '#d63b3b', bg: 'rgba(224,85,85,0.1)',   border: 'rgba(224,85,85,0.25)',   icon: XCircle,     label: 'Void'      },
  completed: { color: '#27a06b', bg: 'rgba(76,175,147,0.1)',  border: 'rgba(76,175,147,0.25)',  icon: CheckCircle, label: 'Completed' },
  ready:     { color: '#2478c8', bg: 'rgba(36,120,200,0.1)',  border: 'rgba(36,120,200,0.25)',  icon: CheckCircle, label: 'Ready'     },
  prep:      { color: '#e6a028', bg: 'rgba(230,160,40,0.1)',  border: 'rgba(230,160,40,0.25)',  icon: Clock,       label: 'In Prep'   },
  new:       { color: '#3a9b65', bg: 'rgba(72,160,100,0.1)',  border: 'rgba(72,160,100,0.25)',  icon: Clock,       label: 'New'       },
};

function normalizeStatus(raw) {
  if (!raw) return 'pending';
  const s = raw.toLowerCase();
  if (s === 'paid') return 'paid';
  if (s === 'void' || s === 'cancelled' || s === 'canceled') return 'void';
  if (s === 'completed' || s === 'complete') return 'completed';
  if (s === 'ready') return 'ready';
  if (s === 'prep' || s === 'preparing') return 'prep';
  if (s === 'new') return 'new';
  return 'pending';
}

// Normalize payment method label to one of: UPI | Cash | Card | Other
function normalizePayment(raw) {
  if (!raw || raw === '—') return null;
  const p = raw.toLowerCase();
  if (p.includes('upi') || p.includes('gpay') || p.includes('phonepe') || p.includes('paytm') || p.includes('bhim')) return 'UPI';
  if (p.includes('cash')) return 'Cash';
  if (p.includes('card') || p.includes('credit') || p.includes('debit') || p.includes('visa') || p.includes('master')) return 'Card';
  return 'Other';
}

function StatusBadge({ status }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      background: m.bg, border: `1px solid ${m.border}`,
      fontSize: 11, fontWeight: 600, color: m.color, whiteSpace: 'nowrap',
    }}>
      <Icon size={10} />
      {m.label}
    </span>
  );
}

export default function BillingHistoryPage() {
  const { activeHotelId } = useHotel();
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [sortDir, setSortDir]   = useState('desc');
  const [expanded, setExpanded] = useState(null);
  const [bills, setBills]       = useState([]);

  useEffect(() => {
    const raw = loadOrders(activeHotelId);
    const mapped = raw.map(o => ({
      id:       o.id,
      customer: o.tableNumber || 'Takeaway',
      amount:   parseFloat(o.totalAmount) || 0,
      status:   normalizeStatus(o.status || o.kitchenStatus),
      // orderDate = when the order was placed (display only)
      orderDate: o.date || new Date().toISOString().split('T')[0],
      orderTime: o.time || '00:00',
      // revenueDate = when the bill was paid/generated (used for revenue attribution)
      revenueDate: o.paidAt
        ? o.paidAt.split('T')[0]
        : (o.date || new Date().toISOString().split('T')[0]),
      date:     o.paidAt
        ? o.paidAt.split('T')[0]
        : (o.date || new Date().toISOString().split('T')[0]),
      time:     o.paidAt
        ? o.paidAt.split('T')[1]?.slice(0, 5) || o.time || '00:00'
        : (o.time || '00:00'),
      items:    o.items?.length || 0,
      payment:  o.payment || '—',
      itemList: o.items || [],
    }));
    setBills(mapped);
  }, [activeHotelId]);

  const today = new Date().toISOString().split('T')[0];
  const todayBills    = bills.filter(b => b.revenueDate === today);
  const paidStatuses  = new Set(['paid', 'completed']);
  const totalRevenue  = bills.filter(b => paidStatuses.has(b.status)).reduce((s, b) => s + b.amount, 0);
  const pendingAmount = bills.filter(b => ['pending', 'new', 'prep', 'ready'].includes(b.status)).reduce((s, b) => s + b.amount, 0);
  const avgValue      = bills.length ? Math.round(bills.reduce((s, b) => s + b.amount, 0) / bills.length) : 0;

  // Payment method revenue breakdown (paid/completed only)
  const paidBills = bills.filter(b => paidStatuses.has(b.status));
  const revenueByMethod = paidBills.reduce((acc, b) => {
    const method = normalizePayment(b.payment) || 'Other';
    acc[method] = (acc[method] || 0) + b.amount;
    return acc;
  }, {});

  const PAYMENT_BREAKDOWN = [
    { key: 'UPI',  label: 'UPI Revenue',  icon: Smartphone, color: '#5b63d3', bg: 'rgba(91,99,211,0.1)',  border: 'rgba(91,99,211,0.25)'  },
    { key: 'Cash', label: 'Cash Revenue', icon: Banknote,   color: '#27a06b', bg: 'rgba(76,175,147,0.1)', border: 'rgba(76,175,147,0.25)' },
    { key: 'Card', label: 'Card Revenue', icon: CreditCard, color: '#2478c8', bg: 'rgba(36,120,200,0.1)', border: 'rgba(36,120,200,0.25)' },
  ];

  const SUMMARY = [
    { label: 'Total Revenue',   value: `₹${totalRevenue.toLocaleString()}`, sub: 'All paid orders',   color: '#3a9b65', icon: TrendingUp },
    { label: 'Bills Today',     value: `${todayBills.length}`,              sub: 'Billed today',        color: '#27a06b', icon: Receipt    },
    { label: 'Avg. Bill Value', value: `₹${avgValue.toLocaleString()}`,     sub: 'Per transaction',    color: '#2478c8', icon: CreditCard },
    { label: 'Pending Amount',  value: `₹${pendingAmount.toLocaleString()}`,sub: `${bills.filter(b=>['pending','new','prep','ready'].includes(b.status)).length} open bills`, color: '#d63b3b', icon: Clock },
  ];

  const filtered = useMemo(() => {
    let list = [...bills];
    if (filter !== 'all') list = list.filter(b => b.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b => b.id.toLowerCase().includes(q) || b.customer.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const da = new Date(`${a.date} ${a.time}`);
      const db = new Date(`${b.date} ${b.time}`);
      return sortDir === 'desc' ? db - da : da - db;
    });
    return list;
  }, [search, filter, sortDir, bills]);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto' }}>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="header-row"
        style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}
      >
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
            Finance / Records
          </p>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 600,
            color: 'var(--text-primary)', lineHeight: 1.1,
          }}>
            Billing History
          </h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.03, borderColor: 'rgba(72,160,100,0.5)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 11,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <Download size={13} /> Export CSV
        </motion.button>
      </motion.div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 22 }}>
        {SUMMARY.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.06 + i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '18px 20px',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
                background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)`,
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: `${s.color}12`, border: `1px solid ${s.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={13} color={s.color} />
                </div>
              </div>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: 24,
                fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1,
              }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{s.sub}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 12, filter: "blur(5px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '14px 18px',
          display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
          marginBottom: 14,
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bill ID or table…"
            style={{
              width: '100%', paddingLeft: 33, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 9, fontSize: 12.5, color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'paid', 'completed', 'pending', 'new', 'prep', 'ready', 'void'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 13px', borderRadius: 20, fontSize: 11.5, fontWeight: 500,
                cursor: 'pointer', border: '1px solid',
                background: filter === f ? (f === 'all' ? 'var(--gold-dim)' : `${(STATUS_META[f] || { bg: 'var(--gold-dim)' }).bg}`) : 'transparent',
                borderColor: filter === f ? (f === 'all' ? 'rgba(72,160,100,0.35)' : `${(STATUS_META[f] || { border: 'var(--border)' }).border}`) : 'var(--border)',
                color: filter === f ? (f === 'all' ? 'var(--gold)' : `${(STATUS_META[f] || { color: 'var(--gold)' }).color}`) : 'var(--text-muted)',
                transition: 'all 0.18s ease',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort */}
        <button
          onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 9,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            fontSize: 11.5, color: 'var(--text-secondary)', cursor: 'pointer',
          }}
        >
          <RefreshCw size={11} />
          {sortDir === 'desc' ? 'Newest' : 'Oldest'}
        </button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(5px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.38, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="table-scroll-wrapper"
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        }}
      >
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 0.9fr 0.85fr 0.9fr 0.9fr 1fr 0.5fr',
          padding: '10px 22px', gap: 8,
          borderBottom: '1px solid var(--border)',
          background: 'rgba(72,160,100,0.03)',
          minWidth: 700,
        }}>
          {['Bill ID', 'Table', 'Amount', 'Payment', 'Date', 'Status', ''].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filtered.map(b => b.id).join()}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } } }}
            initial="hidden"
            animate="show"
          >
          {filtered.map((bill, i) => (
            <motion.div
              key={bill.id}
              variants={{
                hidden: { opacity: 0, x: -14, filter: 'blur(4px)' },
                show:   { opacity: 1, x: 0,   filter: 'blur(0px)',
                  transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
              }}
              exit={{ opacity: 0, x: 8, filter: 'blur(3px)', transition: { duration: 0.22 } }}
            >
              <div
                onClick={() => setExpanded(expanded === bill.id ? null : bill.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 0.9fr 0.85fr 0.9fr 0.9fr 1fr 0.5fr',
                  padding: '13px 22px', gap: 8, alignItems: 'center',
                  borderTop: i > 0 ? '1px solid rgba(72,160,100,0.05)' : 'none',
                  cursor: 'pointer', transition: 'background 0.2s',
                  minWidth: 700,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.018)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{
                  fontFamily: 'Cormorant Garamond, serif', fontSize: 13.5,
                  fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.01em',
                }}>{bill.id}</span>

                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{bill.customer}</span>

                <span style={{
                  fontFamily: 'Cormorant Garamond, serif', fontSize: 15,
                  fontWeight: 700, color: 'var(--text-primary)',
                }}>₹{bill.amount.toLocaleString()}</span>

                <span style={{
                  padding: '3px 9px', borderRadius: 6,
                  background: bill.payment === '—' ? 'transparent' : 'rgba(72,160,100,0.07)',
                  border: bill.payment === '—' ? 'none' : '1px solid rgba(72,160,100,0.16)',
                  fontSize: 11.5, color: bill.payment === '—' ? 'var(--text-muted)' : 'var(--text-secondary)',
                  width: 'fit-content',
                }}>{bill.payment}</span>

                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    {(bill.revenueDate || '').slice(5).replace('-', '/')}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={9} />{bill.time || '—'}
                  </div>
                  {bill.orderDate && bill.orderDate !== bill.revenueDate && (
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, opacity: 0.7 }}>
                      Ordered {bill.orderDate.slice(5).replace('-', '/')}
                    </div>
                  )}
                </div>

                <StatusBadge status={bill.status} />

                <motion.div
                  animate={{ rotate: expanded === bill.id ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: 'flex', justifyContent: 'flex-end' }}
                >
                  <ChevronDown size={14} color="var(--text-muted)" />
                </motion.div>
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {expanded === bill.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      padding: '14px 22px 18px',
                      background: 'rgba(72,160,100,0.02)',
                      borderTop: '1px solid rgba(72,160,100,0.1)',
                      display: 'flex', gap: 20, flexWrap: 'wrap',
                    }}>
                      {[
                        { label: 'Items Ordered', value: `${bill.items} dishes` },
                        { label: 'Subtotal',       value: `₹${Math.round(bill.amount / 1.18).toLocaleString()}` },
                        { label: 'GST (18%)',      value: `₹${Math.round(bill.amount - bill.amount / 1.18).toLocaleString()}` },
                        { label: 'Total',          value: `₹${bill.amount.toLocaleString()}`, highlight: true },
                      ].map(d => (
                        <div key={d.label} style={{ minWidth: 120 }}>
                          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>{d.label}</div>
                          <div style={{
                            fontFamily: d.highlight ? 'Cormorant Garamond, serif' : undefined,
                            fontSize: d.highlight ? 17 : 13.5,
                            fontWeight: d.highlight ? 700 : 500,
                            color: d.highlight ? 'var(--gold)' : 'var(--text-primary)',
                          }}>{d.value}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div style={{ padding: '48px 22px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            No bills match your search.
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '12px 22px', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(72,160,100,0.03)',
        }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {bills.length} bills
          </span>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: 15,
            fontWeight: 700, color: 'var(--gold)',
          }}>
            Total: ₹{filtered.reduce((s, b) => s + b.amount, 0).toLocaleString()}
          </span>
        </div>
      </motion.div>

      {/* Revenue Breakdown by Payment Method */}
      <motion.div
        initial={{ opacity: 0, y: 18, filter: "blur(5px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.5, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginTop: 20 }}
      >
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Wallet size={14} color="var(--gold)" />
          <span style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: 17,
            fontWeight: 600, color: 'var(--text-primary)',
          }}>Revenue by Payment Method</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)', marginLeft: 6 }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Paid & Completed orders only</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {PAYMENT_BREAKDOWN.map((p, i) => {
            const Icon = p.icon;
            const amount = revenueByMethod[p.key] || 0;
            const count  = paidBills.filter(b => normalizePayment(b.payment) === p.key).length;
            const pct    = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;

            return (
              <motion.div
                key={p.key}
                initial={{ opacity: 0, y: 16, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.56 + i * 0.07, duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '20px 22px',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Top accent line */}
                <div style={{
                  position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
                  background: `linear-gradient(90deg, transparent, ${p.color}60, transparent)`,
                }} />

                {/* Icon + label */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: p.bg, border: `1px solid ${p.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 10,
                    }}>
                      <Icon size={16} color={p.color} />
                    </div>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>{p.label}</span>
                  </div>
                  {/* Percentage pill */}
                  <span style={{
                    padding: '3px 9px', borderRadius: 20,
                    background: p.bg, border: `1px solid ${p.border}`,
                    fontSize: 11, fontWeight: 700, color: p.color,
                  }}>{pct}%</span>
                </div>

                {/* Amount */}
                <div style={{
                  fontFamily: 'Cormorant Garamond, serif', fontSize: 26,
                  fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 6,
                }}>
                  ₹{amount.toLocaleString()}
                </div>

                {/* Transaction count */}
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {count} transaction{count !== 1 ? 's' : ''}
                </div>

                {/* Progress bar */}
                <div style={{
                  marginTop: 14, height: 3, borderRadius: 4,
                  background: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.7 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: '100%', borderRadius: 4, background: p.color }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div style={{ height: 36 }} />
    </div>
  );
}