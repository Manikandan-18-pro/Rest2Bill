import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Search, Filter, MoreVertical,
  MapPin, Phone, Users, Star, DollarSign, Edit2,
  Trash2, Eye, ToggleLeft, ToggleRight, X, Check,
  ChevronDown, Grid3x3, List, AlertTriangle,
  Globe, Mail, Calendar, TrendingUp, Utensils,
  CheckCircle2, XCircle, Clock, Crown, ChevronRight,
} from 'lucide-react';

// ─── Mock Hotels ──────────────────────────────────────────────────────────────
const INITIAL_HOTELS = [
  { id: 1,  name: 'Grand Spice Palace',   city: 'Mumbai',    state: 'Maharashtra',  phone: '+91 98200 11234', email: 'gsp@example.com',    plan: 'Enterprise', status: 'active',   revenue: '₹2.1L', orders: 1842, rating: 4.9, tables: 40, staff: 18, joinedDate: '12 Jan 2024', cuisine: 'North Indian, Mughlai' },
  { id: 2,  name: 'The Curry Leaf',       city: 'Delhi',     state: 'Delhi',        phone: '+91 98100 22345', email: 'tcl@example.com',    plan: 'Pro',        status: 'active',   revenue: '₹1.8L', orders: 1620, rating: 4.8, tables: 32, staff: 14, joinedDate: '5 Mar 2024',  cuisine: 'South Indian, Pan-Asian' },
  { id: 3,  name: 'Saffron Heights',      city: 'Bangalore', state: 'Karnataka',    phone: '+91 98400 33456', email: 'sh@example.com',     plan: 'Pro',        status: 'active',   revenue: '₹1.6L', orders: 1430, rating: 4.7, tables: 28, staff: 12, joinedDate: '20 Apr 2024', cuisine: 'Continental, Indian' },
  { id: 4,  name: 'Royal Darbar',         city: 'Jaipur',    state: 'Rajasthan',    phone: '+91 94100 44567', email: 'rd@example.com',     plan: 'Basic',      status: 'active',   revenue: '₹1.2L', orders: 1100, rating: 4.6, tables: 24, staff: 10, joinedDate: '8 Jun 2024',  cuisine: 'Rajasthani, Indian' },
  { id: 5,  name: 'Marina Bay Kitchen',   city: 'Chennai',   state: 'Tamil Nadu',   phone: '+91 98300 55678', email: 'mbk@example.com',    plan: 'Basic',      status: 'active',   revenue: '₹98K',  orders: 890,  rating: 4.5, tables: 20, staff: 9,  joinedDate: '15 Jul 2024', cuisine: 'Seafood, South Indian' },
  { id: 6,  name: 'Deccan Delight',       city: 'Hyderabad', state: 'Telangana',    phone: '+91 98500 66789', email: 'dd@example.com',     plan: 'Pro',        status: 'active',   revenue: '₹1.2L', orders: 1080, rating: 4.7, tables: 30, staff: 13, joinedDate: '22 Aug 2024', cuisine: 'Hyderabadi, Biryani' },
  { id: 7,  name: 'Himalayan Hearth',     city: 'Dehradun',  state: 'Uttarakhand',  phone: '+91 94500 77890', email: 'hh@example.com',     plan: 'Basic',      status: 'inactive', revenue: '₹34K',  orders: 320,  rating: 4.2, tables: 16, staff: 7,  joinedDate: '1 Sep 2024',  cuisine: 'North Indian, Chinese' },
  { id: 8,  name: 'Coastal Craze',        city: 'Goa',       state: 'Goa',          phone: '+91 98220 88901', email: 'cc@example.com',     plan: 'Pro',        status: 'active',   revenue: '₹88K',  orders: 790,  rating: 4.6, tables: 22, staff: 10, joinedDate: '14 Oct 2024', cuisine: 'Goan, Seafood, Continental' },
  { id: 9,  name: 'The Pepper Trail',     city: 'Kochi',     state: 'Kerala',       phone: '+91 94400 99012', email: 'tpt@example.com',    plan: 'Basic',      status: 'inactive', revenue: '₹22K',  orders: 210,  rating: 4.0, tables: 14, staff: 6,  joinedDate: '30 Oct 2024', cuisine: 'Kerala, Seafood' },
  { id: 10, name: 'Urban Masala Co.',     city: 'Pune',      state: 'Maharashtra',  phone: '+91 98200 10123', email: 'umc@example.com',    plan: 'Enterprise', status: 'active',   revenue: '₹1.5L', orders: 1350, rating: 4.8, tables: 35, staff: 16, joinedDate: '12 Nov 2024', cuisine: 'Fusion, Modern Indian' },
];

const PLAN_STYLES = {
  Enterprise: { color: '#d63b3b', bg: 'rgba(214,59,59,0.1)',    label: 'Enterprise' },
  Pro:        { color: '#6c63ff', bg: 'rgba(108,99,255,0.1)',   label: 'Pro'        },
  Basic:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   label: 'Basic'      },
};

const EMPTY_FORM = { name: '', city: '', state: '', phone: '', email: '', cuisine: '', plan: 'Basic', tables: '', staff: '' };

// ─── Hotel Card ───────────────────────────────────────────────────────────────
function HotelCard({ hotel, onEdit, onDelete, onToggle, onView, delay }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const plan = PLAN_STYLES[hotel.plan];
  const isActive = hotel.status === 'active';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      style={{
        background: 'var(--bg-card)', border: `1px solid ${isActive ? 'var(--border)' : 'rgba(239,68,68,0.15)'}`,
        borderRadius: 18, padding: '20px', position: 'relative', overflow: 'hidden',
        opacity: isActive ? 1 : 0.75,
      }}
    >
      {/* Status bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: isActive ? 'linear-gradient(90deg, #3a9b65, #00c9a7)' : 'linear-gradient(90deg, #ef4444, #f59e0b)', borderRadius: '18px 18px 0 0' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: isActive ? 'rgba(58,155,101,0.12)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} color={isActive ? '#3a9b65' : '#ef4444'} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{hotel.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <MapPin size={10} /> {hotel.city}, {hotel.state}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: plan.color, background: plan.bg, padding: '3px 8px', borderRadius: 20 }}>{plan.label}</span>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(v => !v)} style={{ width: 28, height: 28, borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MoreVertical size={14} color="var(--text-muted)" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
                  style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', padding: 6, zIndex: 100, minWidth: 148 }}
                >
                  {[
                    { icon: Eye,      label: 'View Details', action: () => { onView(hotel); setMenuOpen(false); }, color: '#2478c8' },
                    { icon: Edit2,    label: 'Edit Hotel',   action: () => { onEdit(hotel);  setMenuOpen(false); }, color: '#6c63ff' },
                    { icon: isActive ? ToggleLeft : ToggleRight, label: isActive ? 'Deactivate' : 'Activate', action: () => { onToggle(hotel.id); setMenuOpen(false); }, color: isActive ? '#f59e0b' : '#3a9b65' },
                    { icon: Trash2,   label: 'Delete Hotel', action: () => { onDelete(hotel); setMenuOpen(false); }, color: '#ef4444' },
                  ].map(item => (
                    <button key={item.label} onClick={item.action}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 8, color: item.color, fontSize: 12.5, fontWeight: 500 }}
                      onMouseEnter={e => e.currentTarget.style.background = `${item.color}10`}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <item.icon size={13} /> {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { icon: DollarSign, val: hotel.revenue, label: 'Revenue', color: '#3a9b65' },
          { icon: Utensils,   val: hotel.orders,  label: 'Orders',  color: '#6c63ff' },
          { icon: Star,       val: hotel.rating,  label: 'Rating',  color: '#f59e0b' },
        ].map(stat => (
          <div key={stat.label} style={{ background: `${stat.color}08`, borderRadius: 10, padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{stat.val}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={10} /> Joined {hotel.joinedDate}
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600,
          color: isActive ? '#3a9b65' : '#ef4444',
          background: isActive ? 'rgba(58,155,101,0.1)' : 'rgba(239,68,68,0.1)',
          padding: '3px 9px', borderRadius: 20,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Hotel Row (List View) ────────────────────────────────────────────────────
function HotelRow({ hotel, onEdit, onDelete, onToggle, onView, delay }) {
  const plan = PLAN_STYLES[hotel.plan];
  const isActive = hotel.status === 'active';

  return (
    <motion.tr
      layout initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
      transition={{ delay, duration: 0.35 }}
      style={{ borderBottom: '1px solid var(--border)', opacity: isActive ? 1 : 0.65 }}
    >
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: isActive ? 'rgba(58,155,101,0.1)' : 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={16} color={isActive ? '#3a9b65' : '#ef4444'} />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{hotel.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hotel.cuisine}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} />{hotel.city}</div>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: plan.color, background: plan.bg, padding: '3px 8px', borderRadius: 20 }}>{plan.label}</span>
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{hotel.revenue}</td>
      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{hotel.orders.toLocaleString()}</td>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Star size={12} color="#f59e0b" fill="#f59e0b" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{hotel.rating}</span>
        </div>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? '#3a9b65' : '#ef4444', background: isActive ? 'rgba(58,155,101,0.1)' : 'rgba(239,68,68,0.1)', padding: '3px 9px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          {isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />} {isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { icon: Eye,   action: () => onView(hotel),        color: '#2478c8', title: 'View' },
            { icon: Edit2, action: () => onEdit(hotel),        color: '#6c63ff', title: 'Edit' },
            { icon: isActive ? ToggleLeft : ToggleRight, action: () => onToggle(hotel.id), color: isActive ? '#f59e0b' : '#3a9b65', title: isActive ? 'Deactivate' : 'Activate' },
            { icon: Trash2, action: () => onDelete(hotel),     color: '#ef4444', title: 'Delete' },
          ].map(btn => (
            <button key={btn.title} onClick={btn.action} title={btn.title}
              style={{ width: 28, height: 28, borderRadius: 7, background: `${btn.color}10`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = `${btn.color}22`}
              onMouseLeave={e => e.currentTarget.style.background = `${btn.color}10`}
            >
              <btn.icon size={13} color={btn.color} />
            </button>
          ))}
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} color="var(--text-muted)" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Field({ label, value, onChange, type = 'text', options }) {
  const style = { width: '100%', padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13.5, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' };
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{label}</label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={style}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={style} />
      )}
    </div>
  );
}

// ─── Hotel Detail View ────────────────────────────────────────────────────────
function HotelDetailModal({ hotel, onClose }) {
  const isActive = hotel.status === 'active';
  const plan = PLAN_STYLES[hotel.plan];
  return (
    <Modal title="Hotel Details" onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: '14px', background: 'var(--bg-elevated)', borderRadius: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Building2 size={24} color="#6c63ff" />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{hotel.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{hotel.city}, {hotel.state}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: plan.color, background: plan.bg, padding: '3px 10px', borderRadius: 20 }}>{plan.label}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? '#3a9b65' : '#ef4444', background: isActive ? 'rgba(58,155,101,0.1)' : 'rgba(239,68,68,0.1)', padding: '3px 10px', borderRadius: 20 }}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'Revenue', val: hotel.revenue, color: '#3a9b65' },
          { label: 'Orders',  val: hotel.orders,  color: '#6c63ff' },
          { label: 'Rating',  val: `${hotel.rating}/5`, color: '#f59e0b' },
          { label: 'Tables',  val: hotel.tables,  color: '#2478c8' },
          { label: 'Staff',   val: hotel.staff,   color: '#8b5cf6' },
          { label: 'Joined',  val: hotel.joinedDate, color: '#00c9a7' },
        ].map(s => (
          <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}15`, borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { icon: Phone, label: 'Phone', val: hotel.phone },
          { icon: Mail,  label: 'Email', val: hotel.email },
          { icon: Utensils, label: 'Cuisine', val: hotel.cuisine },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 10 }}>
            <row.icon size={14} color="var(--text-muted)" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 56 }}>{row.label}</span>
            <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{row.val}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────
function HotelFormModal({ hotel, onClose, onSave }) {
  const [form, setForm] = useState(hotel ? { name: hotel.name, city: hotel.city, state: hotel.state, phone: hotel.phone, email: hotel.email, cuisine: hotel.cuisine, plan: hotel.plan, tables: hotel.tables, staff: hotel.staff } : EMPTY_FORM);
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title={hotel ? 'Edit Hotel' : 'Add New Hotel'} onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
        <div style={{ gridColumn: 'span 2' }}><Field label="Hotel Name *" value={form.name} onChange={set('name')} /></div>
        <Field label="City *" value={form.city} onChange={set('city')} />
        <Field label="State *" value={form.state} onChange={set('state')} />
        <Field label="Phone" value={form.phone} onChange={set('phone')} />
        <Field label="Email" value={form.email} onChange={set('email')} type="email" />
        <div style={{ gridColumn: 'span 2' }}><Field label="Cuisine Type" value={form.cuisine} onChange={set('cuisine')} /></div>
        <Field label="Plan" value={form.plan} onChange={set('plan')} options={['Basic', 'Pro', 'Enterprise']} />
        <Field label="Tables" value={form.tables} onChange={set('tables')} type="number" />
        <div style={{ gridColumn: 'span 2' }}><Field label="Staff Count" value={form.staff} onChange={set('staff')} type="number" /></div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
        <button onClick={() => onSave(form)} style={{ padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Check size={14} /> {hotel ? 'Save Changes' : 'Add Hotel'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteModal({ hotel, onClose, onConfirm }) {
  return (
    <Modal title="Delete Hotel" onClose={onClose}>
      <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertTriangle size={28} color="#ef4444" />
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Delete "{hotel.name}"?</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>This action cannot be undone. All data for this hotel will be permanently removed.</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { onConfirm(hotel.id); onClose(); }} style={{ padding: '10px 22px', borderRadius: 10, background: '#ef4444', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Delete Hotel</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HotelManagementPage() {
  const [hotels, setHotels] = useState(INITIAL_HOTELS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [modal, setModal] = useState(null); // { type: 'add'|'edit'|'delete'|'view', hotel? }

  const filtered = useMemo(() => hotels.filter(h => {
    const q = search.toLowerCase();
    const matchSearch = !q || h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || h.cuisine.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || h.status === filterStatus;
    const matchPlan = filterPlan === 'all' || h.plan === filterPlan;
    return matchSearch && matchStatus && matchPlan;
  }), [hotels, search, filterStatus, filterPlan]);

  const stats = useMemo(() => ({
    total: hotels.length,
    active: hotels.filter(h => h.status === 'active').length,
    inactive: hotels.filter(h => h.status === 'inactive').length,
    enterprise: hotels.filter(h => h.plan === 'Enterprise').length,
  }), [hotels]);

  const handleToggle = (id) => setHotels(h => h.map(x => x.id === id ? { ...x, status: x.status === 'active' ? 'inactive' : 'active' } : x));
  const handleDelete = (id) => setHotels(h => h.filter(x => x.id !== id));
  const handleSave = (form) => {
    if (modal?.type === 'edit' && modal.hotel) {
      setHotels(h => h.map(x => x.id === modal.hotel.id ? { ...x, ...form } : x));
    } else {
      setHotels(h => [...h, { ...form, id: Date.now(), status: 'active', revenue: '₹0', orders: 0, rating: 0, joinedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }]);
    }
    setModal(null);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
              <Building2 size={18} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: 'Georgia, serif' }}>Hotel Management</h1>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Manage all onboarded hotels across the platform</p>
            </div>
          </div>
        </div>
        <button onClick={() => setModal({ type: 'add' })}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', boxShadow: '0 4px 14px rgba(108,99,255,0.3)' }}>
          <Plus size={16} /> Add Hotel
        </button>
      </motion.div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Hotels',      val: stats.total,      color: '#6c63ff', bg: 'rgba(108,99,255,0.1)',  icon: Building2 },
          { label: 'Active',            val: stats.active,     color: '#3a9b65', bg: 'rgba(58,155,101,0.1)', icon: CheckCircle2 },
          { label: 'Inactive',          val: stats.inactive,   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  icon: XCircle },
          { label: 'Enterprise Plan',   val: stats.enterprise, color: '#d63b3b', bg: 'rgba(214,59,59,0.1)', icon: Crown },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 11, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
      >
        {/* Search */}
        <div style={{ flex: '1 1 220px', position: 'relative' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hotels, cities, cuisine..."
            style={{ width: '100%', padding: '9px 12px 9px 34px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['all','active','inactive'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              style={{ padding: '7px 14px', borderRadius: 20, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                borderColor: filterStatus === s ? '#6c63ff' : 'var(--border)',
                background: filterStatus === s ? 'rgba(108,99,255,0.1)' : 'transparent',
                color: filterStatus === s ? '#6c63ff' : 'var(--text-muted)',
              }}>{s}</button>
          ))}
        </div>

        {/* Plan filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['all','Basic','Pro','Enterprise'].map(p => (
            <button key={p} onClick={() => setFilterPlan(p)}
              style={{ padding: '7px 14px', borderRadius: 20, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                borderColor: filterPlan === p ? '#00c9a7' : 'var(--border)',
                background: filterPlan === p ? 'rgba(0,201,167,0.1)' : 'transparent',
                color: filterPlan === p ? '#00c9a7' : 'var(--text-muted)',
              }}>{p}</button>
          ))}
        </div>

        {/* View toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, background: 'var(--bg-elevated)', borderRadius: 10, padding: 3 }}>
          {[{ mode: 'grid', Icon: Grid3x3 }, { mode: 'list', Icon: List }].map(({ mode, Icon }) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: viewMode === mode ? '#6c63ff' : 'transparent',
                color: viewMode === mode ? '#fff' : 'var(--text-muted)',
              }}>
              <Icon size={15} />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Hotel list */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{filtered.length} hotel{filtered.length !== 1 ? 's' : ''} found</div>

      {viewMode === 'grid' ? (
        <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          <AnimatePresence>
            {filtered.map((h, i) => (
              <HotelCard key={h.id} hotel={h} delay={i * 0.04}
                onEdit={hotel => setModal({ type: 'edit', hotel })}
                onDelete={hotel => setModal({ type: 'delete', hotel })}
                onToggle={handleToggle}
                onView={hotel => setModal({ type: 'view', hotel })}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden' }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)' }}>
                {['Hotel', 'City', 'Plan', 'Revenue', 'Orders', 'Rating', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <AnimatePresence>
              <tbody>
                {filtered.map((h, i) => (
                  <HotelRow key={h.id} hotel={h} delay={i * 0.03}
                    onEdit={hotel => setModal({ type: 'edit', hotel })}
                    onDelete={hotel => setModal({ type: 'delete', hotel })}
                    onToggle={handleToggle}
                    onView={hotel => setModal({ type: 'view', hotel })}
                  />
                ))}
              </tbody>
            </AnimatePresence>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              <Building2 size={36} style={{ opacity: 0.3, marginBottom: 10 }} />
              <div style={{ fontSize: 14 }}>No hotels found</div>
            </div>
          )}
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {modal?.type === 'view'   && <HotelDetailModal hotel={modal.hotel} onClose={() => setModal(null)} />}
        {(modal?.type === 'add' || modal?.type === 'edit') && <HotelFormModal hotel={modal.hotel} onClose={() => setModal(null)} onSave={handleSave} />}
        {modal?.type === 'delete' && <DeleteModal hotel={modal.hotel} onClose={() => setModal(null)} onConfirm={handleDelete} />}
      </AnimatePresence>
    </div>
  );
}
