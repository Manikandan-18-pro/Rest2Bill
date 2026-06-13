import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, Plus, Trash2, CheckCircle, Clock, XCircle,
  Users, Edit3, Save, X,
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';

/* ── localStorage helpers ─────────────────────────────────── */
export function loadTables(hotelId) {
  try {
    const raw = localStorage.getItem(`rms_tables_${hotelId || 'default'}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Default 10 tables on first load
  const defaults = Array.from({ length: 10 }, (_, i) => ({
    id: `T${i + 1}`,
    label: `Table-${i + 1}`,
    capacity: 4,
    status: 'available', // available | occupied | reserved
  }));
  saveTables(hotelId, defaults);
  return defaults;
}

export function saveTables(hotelId, tables) {
  try {
    localStorage.setItem(`rms_tables_${hotelId || 'default'}`, JSON.stringify(tables));
  } catch {}
}

/* ── Status meta ──────────────────────────────────────────── */
const STATUS = {
  available: { label: 'Available', color: '#27a06b', bg: 'rgba(76,175,147,0.1)', border: 'rgba(76,175,147,0.25)', icon: CheckCircle },
  occupied:  { label: 'Occupied',  color: '#2478c8', bg: 'rgba(36,120,200,0.1)', border: 'rgba(36,120,200,0.25)', icon: Clock       },
  reserved:  { label: 'Reserved',  color: '#e6a028', bg: 'rgba(230,160,40,0.1)', border: 'rgba(230,160,40,0.25)', icon: Users       },
};

function StatusBadge({ status }) {
  const m = STATUS[status] || STATUS.available;
  const Icon = m.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: m.bg, border: `1px solid ${m.border}`,
      fontSize: 11, fontWeight: 600, color: m.color, whiteSpace: 'nowrap',
    }}>
      <Icon size={10} />
      {m.label}
    </span>
  );
}

export default function TableManagementPage() {
  const { activeHotelId } = useHotel();
  const [tables, setTables] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editCap, setEditCap] = useState(4);
  const [addCount, setAddCount] = useState(1);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTables(loadTables(activeHotelId));
  }, [activeHotelId]);

  // Re-sync when an order marks a table occupied
  useEffect(() => {
    const handler = (e) => {
      if (!e.detail?.hotelId || e.detail.hotelId === (activeHotelId || 'default')) {
        setTables(loadTables(activeHotelId));
      }
    };
    window.addEventListener('rms_tables_updated', handler);
    return () => window.removeEventListener('rms_tables_updated', handler);
  }, [activeHotelId]);

  const persist = (updated) => {
    setTables(updated);
    saveTables(activeHotelId, updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleAddTables = () => {
    const count = Math.max(1, Math.min(20, parseInt(addCount) || 1));
    const maxNum = tables.reduce((m, t) => {
      const n = parseInt(t.id.replace(/\D/g, '')) || 0;
      return Math.max(m, n);
    }, 0);
    const newTables = Array.from({ length: count }, (_, i) => ({
      id: `T${maxNum + i + 1}`,
      label: `Table-${maxNum + i + 1}`,
      capacity: 4,
      status: 'available',
    }));
    persist([...tables, ...newTables]);
  };

  const handleRemove = (id) => {
    persist(tables.filter(t => t.id !== id));
  };

  const handleStatusCycle = (id) => {
    const order = ['available', 'occupied', 'reserved'];
    persist(tables.map(t =>
      t.id === id
        ? { ...t, status: order[(order.indexOf(t.status) + 1) % order.length] }
        : t
    ));
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditLabel(t.label);
    setEditCap(t.capacity);
  };

  const saveEdit = (id) => {
    persist(tables.map(t =>
      t.id === id ? { ...t, label: editLabel.trim() || t.label, capacity: Math.max(1, parseInt(editCap) || 1) } : t
    ));
    setEditingId(null);
  };

  const available = tables.filter(t => t.status === 'available').length;
  const occupied  = tables.filter(t => t.status === 'occupied').length;
  const reserved  = tables.filter(t => t.status === 'reserved').length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}
      >
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
            Admin Panel / Tables
          </p>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 600,
            color: 'var(--text-primary)', lineHeight: 1.1,
          }}>
            Table Management
          </h1>
        </div>
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 10,
                background: 'rgba(39,160,107,0.1)', border: '1px solid rgba(39,160,107,0.3)',
                fontSize: 12.5, fontWeight: 600, color: '#27a06b',
              }}
            >
              <CheckCircle size={13} /> Saved
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}
      >
        {[
          { label: 'Total Tables', value: tables.length, color: '#3a9b65', icon: LayoutGrid },
          { label: 'Available',    value: available,      color: '#27a06b', icon: CheckCircle },
          { label: 'Occupied',     value: occupied,       color: '#2478c8', icon: Clock },
          { label: 'Reserved',     value: reserved,       color: '#e6a028', icon: Users },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '16px 20px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
                background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)`,
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: `${s.color}12`, border: `1px solid ${s.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={12} color={s.color} />
                </div>
              </div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Add Tables Panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '18px 22px',
          marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
            Add Tables
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Add new tables — they are numbered automatically from the last existing table.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Count:</span>
            <input
              type="number"
              min={1}
              max={20}
              value={addCount}
              onChange={e => setAddCount(e.target.value)}
              style={{
                width: 60, padding: '7px 10px', borderRadius: 8,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                fontSize: 13.5, color: 'var(--text-primary)', outline: 'none',
                textAlign: 'center', fontFamily: 'Cormorant Garamond, serif', fontWeight: 700,
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleAddTables}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 18px', borderRadius: 10,
              background: 'linear-gradient(135deg, var(--gold), #2e7d50)',
              border: 'none', fontSize: 13, fontWeight: 600, color: '#1a3a28',
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(72,160,100,0.2)',
            }}
          >
            <Plus size={14} /> Add Tables
          </motion.button>
        </div>
      </motion.div>

      {/* Tables Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="table-scroll-wrapper"
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '0.6fr 1.4fr 0.7fr 0.9fr 1fr',
          padding: '10px 20px', gap: 8,
          borderBottom: '1px solid var(--border)',
          background: 'rgba(72,160,100,0.03)',
          minWidth: 560,
        }}>
          {['ID', 'Name', 'Capacity', 'Status', 'Actions'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        <AnimatePresence>
          {tables.map((t, i) => {
            const isEditing = editingId === t.id;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0, padding: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '0.6fr 1.4fr 0.7fr 0.9fr 1fr',
                    padding: '12px 20px', gap: 8, alignItems: 'center',
                    borderTop: i > 0 ? '1px solid rgba(72,160,100,0.06)' : 'none',
                    transition: 'background 0.2s',
                    minWidth: 560,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.018)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* ID */}
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>
                    {t.id}
                  </span>

                  {/* Name */}
                  {isEditing ? (
                    <input
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      style={{
                        padding: '5px 10px', borderRadius: 7,
                        background: 'var(--bg-elevated)', border: '1px solid rgba(72,160,100,0.35)',
                        fontSize: 13, color: 'var(--text-primary)', outline: 'none',
                      }}
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(t.id); if (e.key === 'Escape') setEditingId(null); }}
                    />
                  ) : (
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{t.label}</span>
                  )}

                  {/* Capacity */}
                  {isEditing ? (
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={editCap}
                      onChange={e => setEditCap(e.target.value)}
                      style={{
                        width: 60, padding: '5px 8px', borderRadius: 7,
                        background: 'var(--bg-elevated)', border: '1px solid rgba(72,160,100,0.35)',
                        fontSize: 13, color: 'var(--text-primary)', outline: 'none', textAlign: 'center',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      <Users size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      {t.capacity}
                    </span>
                  )}

                  {/* Status */}
                  <button
                    onClick={() => handleStatusCycle(t.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                    title="Click to cycle status"
                  >
                    <StatusBadge status={t.status} />
                  </button>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {isEditing ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                          onClick={() => saveEdit(t.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '5px 11px', borderRadius: 7,
                            background: 'rgba(39,160,107,0.12)', border: '1px solid rgba(39,160,107,0.3)',
                            fontSize: 11.5, fontWeight: 600, color: '#27a06b', cursor: 'pointer',
                          }}
                        >
                          <Save size={11} /> Save
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                          onClick={() => setEditingId(null)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', borderRadius: 7,
                            background: 'transparent', border: '1px solid var(--border)',
                            fontSize: 11.5, color: 'var(--text-muted)', cursor: 'pointer',
                          }}
                        >
                          <X size={11} /> Cancel
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                          onClick={() => startEdit(t)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '5px 11px', borderRadius: 7,
                            background: 'rgba(72,160,100,0.07)', border: '1px solid var(--border)',
                            fontSize: 11.5, color: 'var(--text-secondary)', cursor: 'pointer',
                          }}
                        >
                          <Edit3 size={11} /> Edit
                        </motion.button>
                        {(() => {
                          const isActive = t.status === 'occupied' || t.status === 'reserved';
                          return (
                            <div title={isActive ? `Cannot remove — table is ${t.status}` : 'Remove table'}>
                              <motion.button
                                whileHover={!isActive ? { scale: 1.08, background: 'rgba(224,85,85,0.12)' } : {}}
                                whileTap={!isActive ? { scale: 0.94 } : {}}
                                onClick={() => !isActive && handleRemove(t.id)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 5,
                                  padding: '5px 11px', borderRadius: 7,
                                  background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                                  border: `1px solid ${isActive ? 'rgba(100,100,100,0.2)' : 'var(--border)'}`,
                                  fontSize: 11.5,
                                  color: isActive ? 'rgba(150,150,150,0.5)' : '#d63b3b',
                                  cursor: isActive ? 'not-allowed' : 'pointer',
                                  transition: 'background 0.2s',
                                  opacity: isActive ? 0.55 : 1,
                                }}
                              >
                                <Trash2 size={11} /> Remove
                              </motion.button>
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {tables.length === 0 && (
          <div style={{ padding: '40px 22px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            No tables configured. Add some tables above.
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(72,160,100,0.03)',
        }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            {tables.length} table{tables.length !== 1 ? 's' : ''} configured
          </span>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            Click a status badge to cycle status · Remove is disabled while Occupied or Reserved
          </span>
        </div>
      </motion.div>

      <div style={{ height: 36 }} />
    </div>
  );
}