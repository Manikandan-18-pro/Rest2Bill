import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, Plus, MoreHorizontal, Edit3,
  Trash2, ShieldCheck, ChefHat, Crown, UserCheck, UserX,
  Building2, Mail, Phone, Calendar, Clock, Activity,
  ChevronDown, ChevronUp, Eye, Lock, Unlock, RefreshCw,
  Star, TrendingUp, Download, Check, X, AlertCircle,
  BarChart3, Shield, UserPlus, Settings, Zap,
} from 'lucide-react';

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_USERS = [
  { id: 'u001', name: 'Arjun Mehta',      email: 'arjun@grandspice.in',     phone: '+91 98765 43210', role: 'admin',       hotel: 'Grand Spice Palace',  city: 'Mumbai',    status: 'active',   lastLogin: '2 min ago',  joined: 'Jan 2023', orders: 4821, revenue: '₹21.4L', loginStreak: 48, avatar: 'AM' },
  { id: 'u002', name: 'Priya Sharma',     email: 'priya@curryleaf.in',      phone: '+91 97654 32109', role: 'admin',       hotel: 'The Curry Leaf',      city: 'Delhi',     status: 'active',   lastLogin: '15 min ago', joined: 'Mar 2023', orders: 3920, revenue: '₹18.6L', loginStreak: 31, avatar: 'PS' },
  { id: 'u003', name: 'Ravi Kumar',       email: 'ravi.k@saffron.in',       phone: '+91 87654 32190', role: 'kitchen',     hotel: 'Saffron Heights',     city: 'Bangalore', status: 'active',   lastLogin: '1 hr ago',   joined: 'Apr 2023', orders: 2840, revenue: '—',       loginStreak: 22, avatar: 'RK' },
  { id: 'u004', name: 'Sneha Patel',      email: 'sneha@royaldarbar.in',    phone: '+91 76543 21098', role: 'admin',       hotel: 'Royal Darbar',        city: 'Jaipur',    status: 'active',   lastLogin: '3 hr ago',   joined: 'Jun 2023', orders: 2100, revenue: '₹14.2L', loginStreak: 17, avatar: 'SP' },
  { id: 'u005', name: 'Deepak Nair',      email: 'deepak@marina.in',        phone: '+91 65432 10987', role: 'kitchen',     hotel: 'Marina Bay Kitchen',  city: 'Chennai',   status: 'active',   lastLogin: '5 hr ago',   joined: 'Aug 2023', orders: 1870, revenue: '—',       loginStreak: 14, avatar: 'DN' },
  { id: 'u006', name: 'Kavitha Rao',      email: 'kavitha@deccan.in',       phone: '+91 54321 09876', role: 'admin',       hotel: 'Deccan Delight',      city: 'Hyderabad', status: 'inactive', lastLogin: '2 days ago', joined: 'Sep 2023', orders: 1540, revenue: '₹11.4L', loginStreak: 0,  avatar: 'KR' },
  { id: 'u007', name: 'Mohan Das',        email: 'mohan@spiceroute.in',     phone: '+91 43210 98765', role: 'kitchen',     hotel: 'Spice Route Kolkata', city: 'Kolkata',   status: 'active',   lastLogin: '1 day ago',  joined: 'Oct 2023', orders: 1290, revenue: '—',       loginStreak: 5,  avatar: 'MD' },
  { id: 'u008', name: 'Anita Singh',      email: 'anita@punjabgrill.in',    phone: '+91 32109 87654', role: 'admin',       hotel: 'Punjab Grill',        city: 'Chandigarh',status: 'inactive', lastLogin: '5 days ago', joined: 'Nov 2023', orders: 980,  revenue: '₹8.2L',  loginStreak: 0,  avatar: 'AS' },
  { id: 'u009', name: 'Vikram Joshi',     email: 'vikram@samarjit.in',      phone: '+91 21098 76543', role: 'kitchen',     hotel: 'Grand Spice Palace',  city: 'Mumbai',    status: 'active',   lastLogin: '30 min ago', joined: 'Dec 2023', orders: 1820, revenue: '—',       loginStreak: 12, avatar: 'VJ' },
  { id: 'u010', name: 'Suresh Admin',     email: 'superadmin@saveur.in',    phone: '+91 10987 65432', role: 'super_admin', hotel: 'Platform Admin',       city: 'Pan-India', status: 'active',   lastLogin: 'Now',        joined: 'Jan 2022', orders: '—',  revenue: '₹2.84Cr',loginStreak: 180,avatar: 'SA' },
  { id: 'u011', name: 'Leela Krishnan',   email: 'leela@coastalbliss.in',   phone: '+91 99887 76655', role: 'admin',       hotel: 'Coastal Bliss',       city: 'Goa',       status: 'active',   lastLogin: '6 hr ago',   joined: 'Feb 2024', orders: 720,  revenue: '₹5.8L',  loginStreak: 9,  avatar: 'LK' },
  { id: 'u012', name: 'Ramesh Gupta',     email: 'ramesh@kitchen.in',       phone: '+91 88776 65544', role: 'kitchen',     hotel: 'Deccan Delight',      city: 'Hyderabad', status: 'inactive', lastLogin: '1 week ago', joined: 'Mar 2024', orders: 610,  revenue: '—',       loginStreak: 0,  avatar: 'RG' },
];

const ROLE_META = {
  super_admin: { label: 'Super Admin', icon: Crown,      color: '#d63b3b', bg: 'rgba(214,59,59,0.11)',  border: 'rgba(214,59,59,0.25)'  },
  admin:       { label: 'Admin',       icon: ShieldCheck,color: '#1a6b42', bg: 'rgba(58,155,101,0.11)', border: 'rgba(58,155,101,0.35)' },
  kitchen:     { label: 'Kitchen',     icon: ChefHat,    color: '#2478c8', bg: 'rgba(36,120,200,0.11)', border: 'rgba(36,120,200,0.25)' },
};

const SUMMARY_STATS = [
  { label: 'Total Users',    value: 12,  icon: Users,       color: '#3a9b65', bg: 'rgba(58,155,101,0.11)'  },
  { label: 'Active Now',     value: 8,   icon: UserCheck,   color: '#6c63ff', bg: 'rgba(108,99,255,0.11)'  },
  { label: 'Admins',         value: 6,   icon: ShieldCheck, color: '#f59e0b', bg: 'rgba(245,158,11,0.11)'  },
  { label: 'Kitchen Staff',  value: 4,   icon: ChefHat,     color: '#2478c8', bg: 'rgba(36,120,200,0.11)'  },
  { label: 'Inactive',       value: 3,   icon: UserX,       color: '#ef4444', bg: 'rgba(239,68,68,0.11)'   },
  { label: 'Super Admins',   value: 1,   icon: Crown,       color: '#8b5cf6', bg: 'rgba(139,92,246,0.11)'  },
];

// ── User Modal ─────────────────────────────────────────────────────────────────

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ ...user });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(26,58,40,0.55)',
        backdropFilter: 'blur(8px)', zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', borderRadius: 24,
          border: '1px solid var(--border)',
          width: '90%', maxWidth: 520,
          boxShadow: '0 32px 80px rgba(26,58,40,0.28)',
          overflow: 'hidden',
        }}>
        {/* Modal header */}
        <div style={{
          padding: '22px 28px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(58,155,101,0.07), rgba(108,99,255,0.05))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14,
              background: 'linear-gradient(135deg, #3a9b65, #2e7d50)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: '#fff',
              boxShadow: '0 6px 20px rgba(58,155,101,0.4)',
            }}>{user.avatar}</div>
            <div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                Edit User
              </h3>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: 10, background: 'rgba(239,68,68,0.09)',
              border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: '#ef4444',
            }}>
            <X size={15} />
          </motion.button>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Name */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Full Name</span>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{
                padding: '10px 14px', borderRadius: 11,
                border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                fontSize: 14, color: 'var(--text-primary)', outline: 'none',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'border 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#3a9b65'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </label>

          {/* Role */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Role</span>
            <div style={{ display: 'flex', gap: 10 }}>
              {Object.entries(ROLE_META).map(([key, meta]) => (
                <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => setForm(f => ({ ...f, role: key }))}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 11, cursor: 'pointer',
                    border: form.role === key ? `1px solid ${meta.color}` : '1px solid var(--border)',
                    background: form.role === key ? meta.bg : 'var(--bg-elevated)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                    transition: 'all 0.2s ease',
                    boxShadow: form.role === key ? `0 4px 16px ${meta.color}25` : 'none',
                  }}>
                  <meta.icon size={16} color={form.role === key ? meta.color : 'var(--text-muted)'} />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: form.role === key ? meta.color : 'var(--text-muted)' }}>{meta.label}</span>
                </motion.button>
              ))}
            </div>
          </label>

          {/* Status */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Account Status</span>
            <div style={{ display: 'flex', gap: 10 }}>
              {['active', 'inactive'].map(s => (
                <motion.button key={s} whileTap={{ scale: 0.95 }} onClick={() => setForm(f => ({ ...f, status: s }))}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 11, cursor: 'pointer',
                    border: form.status === s ? (s === 'active' ? '1px solid #3a9b65' : '1px solid #ef4444') : '1px solid var(--border)',
                    background: form.status === s ? (s === 'active' ? 'rgba(58,155,101,0.1)' : 'rgba(239,68,68,0.1)') : 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    transition: 'all 0.2s',
                  }}>
                  {s === 'active' ? <UserCheck size={15} color={form.status === s ? '#3a9b65' : 'var(--text-muted)'} /> : <UserX size={15} color={form.status === s ? '#ef4444' : 'var(--text-muted)'} />}
                  <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize', color: form.status === s ? (s === 'active' ? '#3a9b65' : '#ef4444') : 'var(--text-muted)' }}>{s}</span>
                </motion.button>
              ))}
            </div>
          </label>
        </div>

        {/* Footer */}
        <div style={{
          padding: '18px 28px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: 12, justifyContent: 'flex-end',
          background: 'rgba(90,160,110,0.03)',
        }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={onClose}
            style={{
              padding: '10px 22px', borderRadius: 11, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)',
            }}>
            Cancel
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={() => { onSave(form); onClose(); }}
            style={{
              padding: '10px 24px', borderRadius: 11, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              background: 'linear-gradient(135deg, #3a9b65, #2e7d50)', color: '#fff',
              border: 'none', boxShadow: '0 6px 20px rgba(58,155,101,0.38)',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
            <Check size={14} /> Save Changes
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Role Assignment Badge ──────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const meta = ROLE_META[role];
  if (!meta) return null;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      background: meta.bg, border: `1px solid ${meta.border}`,
    }}>
      <meta.icon size={11} color={meta.color} />
      <span style={{ fontSize: 11, fontWeight: 600, color: meta.color, letterSpacing: '0.03em' }}>{meta.label}</span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UserManagementPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [editUser, setEditUser] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    return users
      .filter(u => {
        const q = search.toLowerCase();
        const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.hotel.toLowerCase().includes(q);
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        const matchStatus = statusFilter === 'all' || u.status === statusFilter;
        return matchSearch && matchRole && matchStatus;
      })
      .sort((a, b) => {
        let aVal = a[sortBy] ?? '';
        let bVal = b[sortBy] ?? '';
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [users, search, roleFilter, statusFilter, sortBy, sortDir]);

  const handleSort = col => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const toggleSelect = id => setSelectedIds(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const toggleStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    showToast('User status updated');
  };

  const saveUser = (updated) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    showToast('User profile saved');
  };

  const bulkDeactivate = () => {
    setUsers(prev => prev.map(u => selectedIds.has(u.id) ? { ...u, status: 'inactive' } : u));
    setSelectedIds(new Set());
    showToast(`${selectedIds.size} users deactivated`);
  };

  const SortIcon = ({ col }) => (
    <span style={{ marginLeft: 4, opacity: sortBy === col ? 1 : 0.3 }}>
      {sortBy === col && sortDir === 'desc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
    </span>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '28px 32px', minHeight: '100vh' }}>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
            style={{
              position: 'fixed', top: 24, left: '50%',
              padding: '11px 20px', borderRadius: 12,
              background: toast.type === 'success' ? '#3a9b65' : '#ef4444',
              color: '#fff', fontSize: 13.5, fontWeight: 600,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              zIndex: 999, display: 'flex', alignItems: 'center', gap: 8,
            }}>
            <Check size={14} /> {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editUser && <UserModal user={editUser} onClose={() => setEditUser(null)} onSave={saveUser} />}
      </AnimatePresence>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 30, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(58,155,101,0.15))',
            border: '1px solid rgba(139,92,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(139,92,246,0.2)',
          }}>
            <Shield size={20} color="#8b5cf6" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>
              User & Role Management
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, letterSpacing: '0.04em' }}>
              Manage access, roles, and permissions across the platform
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {selectedIds.size > 0 && (
            <motion.button initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileTap={{ scale: 0.95 }}
              onClick={bulkDeactivate}
              style={{
                padding: '9px 16px', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444',
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
              <UserX size={14} /> Deactivate ({selectedIds.size})
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
            style={{
              padding: '9px 16px', borderRadius: 11, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: 'rgba(255,255,255,0.75)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
            <Download size={14} /> Export
          </motion.button>
          <motion.button whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(58,155,101,0.4)' }} whileTap={{ scale: 0.96 }}
            style={{
              padding: '9px 18px', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: 'linear-gradient(135deg, #3a9b65, #2e7d50)', color: '#fff', border: 'none',
              boxShadow: '0 4px 18px rgba(58,155,101,0.35)',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
            <UserPlus size={14} /> Invite User
          </motion.button>
        </div>
      </motion.div>

      {/* ── Summary Cards ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 26 }}
        className="user-stat-grid">
        {SUMMARY_STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 + i * 0.05 }}
            whileHover={{ y: -3, boxShadow: '0 10px 30px rgba(40,110,70,0.15)' }}
            style={{
              background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)',
              padding: '16px 18px', boxShadow: 'var(--shadow-card)',
              transition: 'box-shadow 0.25s ease', cursor: 'default',
              position: 'relative', overflow: 'hidden',
            }}>
            <div style={{
              position: 'absolute', top: -16, right: -16, width: 56, height: 56,
              borderRadius: '50%', background: s.bg, filter: 'blur(12px)',
            }} />
            <div style={{ width: 34, height: 34, borderRadius: 10, background: s.bg, border: `1px solid ${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <s.icon size={16} color={s.color} />
            </div>
            <div style={{ fontSize: 22, fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Filters ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap',
          padding: '16px 20px', borderRadius: 16,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, hotel…"
            style={{
              width: '100%', padding: '9px 14px 9px 36px',
              borderRadius: 10, border: '1px solid var(--border)',
              background: 'var(--bg-elevated)', fontSize: 13,
              color: 'var(--text-primary)', outline: 'none',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'border 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#3a9b65'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Role filter */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {[['all', 'All Roles'], ['admin', 'Admin'], ['kitchen', 'Kitchen'], ['super_admin', 'Super Admin']].map(([val, lbl]) => (
            <motion.button key={val} whileTap={{ scale: 0.93 }} onClick={() => setRoleFilter(val)}
              style={{
                padding: '7px 13px', borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                background: roleFilter === val ? (val === 'all' ? '#3a9b65' : (ROLE_META[val]?.color || '#3a9b65')) : 'var(--bg-elevated)',
                color: roleFilter === val ? '#fff' : 'var(--text-secondary)',
                border: roleFilter === val ? `1px solid ${val === 'all' ? '#3a9b65' : (ROLE_META[val]?.color || '#3a9b65')}` : '1px solid var(--border)',
                transition: 'all 0.2s ease',
              }}>
              {lbl}
            </motion.button>
          ))}
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 7 }}>
          {[['all', 'All'], ['active', 'Active'], ['inactive', 'Inactive']].map(([val, lbl]) => (
            <motion.button key={val} whileTap={{ scale: 0.93 }} onClick={() => setStatusFilter(val)}
              style={{
                padding: '7px 13px', borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                background: statusFilter === val ? (val === 'active' ? 'rgba(58,155,101,0.12)' : val === 'inactive' ? 'rgba(239,68,68,0.1)' : 'rgba(58,155,101,0.12)') : 'transparent',
                color: statusFilter === val ? (val === 'inactive' ? '#ef4444' : '#3a9b65') : 'var(--text-secondary)',
                border: '1px solid transparent',
                transition: 'all 0.2s',
              }}>
              {lbl}
            </motion.button>
          ))}
        </div>

        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {filtered.length} of {users.length} users
        </span>
      </motion.div>

      {/* ── User Table ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{
          background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)', overflow: 'hidden',
        }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '44px 1fr 160px 140px 110px 110px 90px 80px',
          padding: '13px 20px', gap: 10,
          background: 'linear-gradient(135deg, rgba(58,155,101,0.06), rgba(108,99,255,0.04))',
          borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <input type="checkbox"
              checked={selectedIds.size === filtered.length && filtered.length > 0}
              onChange={() => setSelectedIds(s => s.size === filtered.length ? new Set() : new Set(filtered.map(u => u.id)))}
              style={{ cursor: 'pointer', accentColor: '#3a9b65' }}
            />
          </div>
          {[['name','User'], ['role','Role'], ['hotel','Hotel'], ['status','Status'], ['lastLogin','Last Login'], ['joined','Joined'], [null,'Actions']].map(([col, lbl]) => (
            <div key={lbl} onClick={col ? () => handleSort(col) : undefined}
              style={{
                fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', cursor: col ? 'pointer' : 'default',
                userSelect: 'none',
              }}>
              {lbl} {col && <SortIcon col={col} />}
            </div>
          ))}
        </div>

        {/* Rows */}
        <AnimatePresence>
          {filtered.map((user, i) => {
            const isExpanded = expandedId === user.id;
            const isSelected = selectedIds.has(user.id);
            return (
              <motion.div key={user.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                {/* Main row */}
                <div
                  style={{
                    display: 'grid', gridTemplateColumns: '44px 1fr 160px 140px 110px 110px 90px 80px',
                    padding: '14px 20px', gap: 10, alignItems: 'center',
                    background: isSelected ? 'rgba(58,155,101,0.04)' : isExpanded ? 'rgba(58,155,101,0.025)' : 'transparent',
                    transition: 'background 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => { if (!isSelected && !isExpanded) e.currentTarget.style.background = 'rgba(58,155,101,0.025)'; }}
                  onMouseLeave={e => { if (!isSelected && !isExpanded) e.currentTarget.style.background = 'transparent'; }}>

                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(user.id)}
                    style={{ cursor: 'pointer', accentColor: '#3a9b65' }} />

                  {/* User info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                      background: user.role === 'super_admin'
                        ? 'linear-gradient(135deg, #d63b3b, #b02b2b)'
                        : user.role === 'kitchen'
                        ? 'linear-gradient(135deg, #2478c8, #1a5e9e)'
                        : 'linear-gradient(135deg, #3a9b65, #2e7d50)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#fff',
                      boxShadow: `0 3px 12px ${user.role === 'super_admin' ? 'rgba(214,59,59,0.35)' : user.role === 'kitchen' ? 'rgba(36,120,200,0.35)' : 'rgba(58,155,101,0.35)'}`,
                    }}>{user.avatar}</div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={9} /> {user.email}
                      </div>
                    </div>
                  </div>

                  <div><RoleBadge role={user.role} /></div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
                    <Building2 size={11} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.hotel}</span>
                  </div>

                  {/* Status toggle */}
                  <motion.div whileTap={{ scale: 0.93 }}
                    onClick={() => toggleStatus(user.id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 11px', borderRadius: 20, cursor: 'pointer',
                      background: user.status === 'active' ? 'rgba(58,155,101,0.12)' : 'rgba(239,68,68,0.10)',
                      border: user.status === 'active' ? '1px solid rgba(58,155,101,0.28)' : '1px solid rgba(239,68,68,0.25)',
                      transition: 'all 0.2s',
                    }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: user.status === 'active' ? '#3a9b65' : '#ef4444',
                      boxShadow: user.status === 'active' ? '0 0 5px rgba(58,155,101,0.8)' : 'none',
                    }} />
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: user.status === 'active' ? '#3a9b65' : '#ef4444', letterSpacing: '0.03em' }}>
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </motion.div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={11} color="var(--text-muted)" />
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{user.lastLogin}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Calendar size={11} color="var(--text-muted)" />
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{user.joined}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setEditUser(user)}
                      title="Edit user"
                      style={{
                        width: 30, height: 30, borderRadius: 9, border: '1px solid var(--border)',
                        background: 'rgba(58,155,101,0.07)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#3a9b65', transition: 'all 0.2s',
                      }}>
                      <Edit3 size={13} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setExpandedId(isExpanded ? null : user.id)}
                      title="View details"
                      style={{
                        width: 30, height: 30, borderRadius: 9,
                        border: isExpanded ? '1px solid rgba(108,99,255,0.35)' : '1px solid var(--border)',
                        background: isExpanded ? 'rgba(108,99,255,0.1)' : 'var(--bg-elevated)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isExpanded ? '#6c63ff' : 'var(--text-secondary)', transition: 'all 0.2s',
                      }}>
                      <Eye size={13} />
                    </motion.button>
                  </div>
                </div>

                {/* Expanded detail row */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: 'hidden' }}>
                      <div style={{
                        padding: '18px 74px 20px',
                        background: 'linear-gradient(135deg, rgba(108,99,255,0.04), rgba(58,155,101,0.03))',
                        borderTop: '1px dashed var(--border)',
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18,
                      }}>
                        {[
                          { label: 'Phone', value: user.phone, icon: Phone },
                          { label: 'City', value: user.city, icon: MapPin },
                          { label: 'Total Orders', value: typeof user.orders === 'number' ? user.orders.toLocaleString() : user.orders, icon: BarChart3 },
                          { label: 'Revenue', value: user.revenue, icon: TrendingUp },
                          { label: 'Login Streak', value: `${user.loginStreak} days`, icon: Zap },
                          { label: 'Hotel', value: user.hotel, icon: Building2 },
                          { label: 'Role', value: ROLE_META[user.role]?.label, icon: Shield },
                          { label: 'Account Since', value: user.joined, icon: Calendar },
                        ].map(({ label, value, icon: Icon }) => (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: 9,
                              background: 'rgba(108,99,255,0.09)', border: '1px solid rgba(108,99,255,0.18)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <Icon size={13} color="#6c63ff" />
                            </div>
                            <div>
                              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{value}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}><Search size={40} color="var(--text-muted)" /></div>
            <div style={{ fontSize: 17, fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No users found</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Try adjusting your search or filters</div>
          </motion.div>
        )}
      </motion.div>

      {/* ── Role Summary Footer ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {Object.entries(ROLE_META).map(([role, meta]) => {
          const count = users.filter(u => u.role === role).length;
          const active = users.filter(u => u.role === role && u.status === 'active').length;
          return (
            <motion.div key={role} whileHover={{ y: -3, boxShadow: `0 12px 36px ${meta.color}18` }}
              style={{
                background: 'var(--bg-card)', borderRadius: 18, border: '1px solid var(--border)',
                padding: '20px 22px', boxShadow: 'var(--shadow-card)',
                transition: 'box-shadow 0.25s ease', cursor: 'default',
                display: 'flex', alignItems: 'center', gap: 18,
              }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: meta.bg, border: `1px solid ${meta.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: `0 4px 16px ${meta.color}18`,
              }}>
                <meta.icon size={22} color={meta.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>{meta.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 28, fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, color: meta.color, lineHeight: 1 }}>{count}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>total</span>
                </div>
                <div style={{ marginTop: 10, height: 4, borderRadius: 3, background: 'rgba(90,160,110,0.1)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: count > 0 ? `${(active / count) * 100}%` : '0%' }}
                    transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: '100%', borderRadius: 3, background: meta.color }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                  <span style={{ fontSize: 11, color: '#3a9b65', fontWeight: 500 }}>{active} active</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{count - active} inactive</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <style>{`
        @media (max-width: 1100px) {
          .user-stat-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 700px) {
          .user-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </motion.div>
  );
}
