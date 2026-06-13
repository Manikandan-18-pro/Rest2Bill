import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Building2, Settings, LogOut,
  Camera, Edit3, Check, X, Mail, Phone,
  Clock, Activity, TrendingUp, ShoppingBag,
  Bell, Lock, Eye, EyeOff, ChevronRight,
  Star, Award, Zap, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { useHotel } from '../context/HotelContext';
import { useNavigate } from 'react-router-dom';

function loadOrders(hotelId) {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('rms_orders_')) keys.push(k);
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
  } catch { return []; }
}

function EditableField({ label, value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);

  const save = () => { onChange(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
      {editing ? (
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
            style={{
              flex: 1, padding: '7px 12px',
              background: 'var(--bg-elevated)', border: '1px solid rgba(72,160,100,0.4)',
              borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', outline: 'none',
            }}
          />
          <motion.button whileTap={{ scale: 0.93 }} onClick={save}
            style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(76,175,147,0.15)', border: '1px solid rgba(76,175,147,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={12} color="#27a06b" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.93 }} onClick={cancel}
            style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(224,85,85,0.1)', border: '1px solid rgba(224,85,85,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={12} color="#e05555" />
          </motion.button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>{value || '—'}</span>
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} onClick={() => setEditing(true)}
            style={{ padding: '3px 7px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, opacity: 0.5 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
          >
            <Edit3 size={10} color="var(--text-muted)" />
          </motion.button>
        </div>
      )}
    </div>
  );
}

function ToggleSetting({ label, desc, value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0', borderBottom: '1px solid rgba(72,160,100,0.07)',
    }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
      </div>
      <motion.button
        onClick={() => onChange(!value)}
        style={{
          width: 42, height: 22, borderRadius: 11, cursor: 'pointer', border: 'none',
          background: value ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
          position: 'relative', flexShrink: 0, transition: 'background 0.25s',
        }}
      >
        <motion.div
          animate={{ x: value ? 21 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ width: 18, height: 18, borderRadius: '50%', background: value ? '#1a3a28' : 'rgba(255,255,255,0.4)', position: 'absolute', top: 2 }}
        />
      </motion.button>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>{value || '—'}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, getToken } = useAuth();
  const { activeHotel } = useHotel();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // Editable profile fields — initialised from real auth user
  const [name,  setName]  = useState(user?.name  || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Sync if user object changes (e.g. after re-login)
  useEffect(() => {
    if (user?.name)  setName(user.name);
    if (user?.email) setEmail(user.email);
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  // Stats computed from localStorage orders
  const [stats, setStats] = useState({ bills: 0, orders: 0, daysActive: 0 });
  useEffect(() => {
    const orders = loadOrders(activeHotel?.id);
    const paidStatuses = new Set(['paid', 'completed']);
    const bills = orders.filter(o => paidStatuses.has((o.status || '').toLowerCase())).length;

    // Days since account created (use user.createdAt if available, else joined date from hotel)
    let daysActive = 0;
    const createdRaw = user?.createdAt || user?.joinedDate || activeHotel?.joinedDate;
    if (createdRaw) {
      const created = new Date(createdRaw);
      if (!isNaN(created)) {
        daysActive = Math.floor((Date.now() - created.getTime()) / 86_400_000);
      }
    }

    setStats({ bills, orders: orders.length, daysActive });
  }, [activeHotel, user]);

  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts:   false,
    darkMode:      true,
    autoLogout:    true,
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toggleSetting = key => setSettings(s => ({ ...s, [key]: !s[key] }));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const ROLE_META = {
    admin:       { label: 'Administrator', color: '#1a6b42', icon: Shield,  bg: 'rgba(72,160,100,0.1)'  },
    kitchen:     { label: 'Kitchen Staff', color: '#2478c8', icon: Zap,     bg: 'rgba(91,163,245,0.1)'  },
    super_admin: { label: 'Super Admin',   color: '#d63b3b', icon: Award,   bg: 'rgba(224,85,85,0.1)'   },
  };
  const role = ROLE_META[user?.role] || ROLE_META.admin;
  const RoleIcon = role.icon;

  const isKitchen = user?.role === 'kitchen';
  const STATS = isKitchen ? [
    { label: 'Orders Handled',  value: stats.orders.toLocaleString(), icon: ShoppingBag, color: '#2478c8' },
    { label: 'Dishes Prepared', value: (() => {
        try {
          const orders = loadOrders(activeHotel?.id);
          return orders.reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + (i.quantity || i.qty || 1), 0) || 0), 0).toLocaleString();
        } catch { return '0'; }
      })(),                                                             icon: Zap,        color: '#3a9b65' },
    { label: 'Days on Duty',    value: stats.daysActive > 0 ? String(stats.daysActive) : '—', icon: Clock, color: '#e6a028' },
    { label: 'Station',         value: user?.station || 'Kitchen',     icon: Activity,   color: '#a78bfa' },
  ] : [
    { label: 'Bills Generated', value: stats.bills.toLocaleString(),  icon: TrendingUp, color: '#3a9b65' },
    { label: 'Orders Managed',  value: stats.orders.toLocaleString(), icon: ShoppingBag, color: '#27a06b' },
    { label: 'Days Active',     value: stats.daysActive > 0 ? String(stats.daysActive) : '—', icon: Clock, color: '#2478c8' },
    { label: 'System Uptime',   value: '99.8%',                       icon: Activity,   color: '#a78bfa' },
  ];

  // Recent activity from orders (last 5) — kitchen shows prep/ready transitions
  const recentActivity = (() => {
    try {
      const orders = loadOrders(activeHotel?.id);
      return orders
        .sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`))
        .slice(0, 5)
        .map(o => {
          const status = (o.kitchenStatus || o.status || 'new').toLowerCase();
          const kitchenLabel = status === 'ready' ? '✓ Marked Ready' : status === 'prep' ? '🔥 In Preparation' : '📋 Received';
          const action = isKitchen
            ? `${kitchenLabel} — Order #${o.id} · ${o.tableNumber || 'Takeaway'}`
            : `Order #${o.id} — ${o.tableNumber || 'Takeaway'} (${o.status || 'new'})`;
          const color = status === 'ready' ? '#3a9b65' : status === 'prep' ? '#e6a028' : '#2478c8';
          return { action, time: o.time || o.date || '—', color };
        });
    } catch { return []; }
  })();

  // Hotel details from context
  const hotelFields = activeHotel ? [
    { label: 'Restaurant Name', value: activeHotel.name },
    { label: 'Location',        value: `${activeHotel.city}, ${activeHotel.state}` },
    { label: 'Total Tables',    value: activeHotel.tables ? `${activeHotel.tables} covers` : '—' },
    { label: 'Phone',           value: activeHotel.phone },
    { label: 'Email',           value: activeHotel.email },
    { label: 'Plan',            value: activeHotel.plan },
  ] : [];

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -14, filter: "blur(5px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 28 }}
      >
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
          Account / Profile
        </p>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 600,
          color: 'var(--text-primary)', lineHeight: 1.1,
        }}>
          {user?.name ? `${isKitchen ? 'Chef ' : ''}${user.name}'s Profile` : isKitchen ? 'Kitchen Profile' : 'Admin Profile'}
        </h1>
      </motion.div>

      <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(280px,320px) 1fr', gap: 18, alignItems: 'start' }}>

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -18, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', padding: '28px 22px',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
              width: 200, height: 200,
              background: `radial-gradient(ellipse, ${role.color}12, transparent 65%)`,
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
              background: `linear-gradient(90deg, transparent, ${role.color}60, transparent)`,
            }} />

            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: `linear-gradient(135deg, ${role.color}30, ${role.color}08)`,
                border: `2px solid ${role.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontFamily: 'Cormorant Garamond, serif', fontWeight: 700,
                color: role.color,
                boxShadow: `0 0 32px ${role.color}20`,
              }}>
                {(name || user?.name || '?').charAt(0).toUpperCase()}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'var(--bg-elevated)', border: `1px solid ${role.color}50`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Camera size={11} color={role.color} />
              </motion.button>
            </div>

            <div style={{
              fontFamily: 'Cormorant Garamond, serif', fontSize: 21,
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5,
            }}>{name || '—'}</div>

            {/* Role badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 20, marginBottom: 14,
              background: role.bg, border: `1px solid ${role.color}30`,
              fontSize: 12, fontWeight: 600, color: role.color,
            }}>
              <RoleIcon size={11} />
              {role.label}
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{email || '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{phone || '—'}</div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: -18, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.18, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={13} color="var(--gold)" />
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Activity</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {recentActivity.length > 0 ? recentActivity.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.25 + i * 0.07 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 18px',
                    borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(72,160,100,0.05)' : 'none',
                  }}
                >
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                    background: a.color,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{a.action}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={9} /> {a.time}
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div style={{ padding: '18px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                  No recent orders found.
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Stats Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.12 + i * 0.07 }}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: '16px 18px',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: `linear-gradient(90deg, transparent, ${s.color}50, transparent)` }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <Icon size={13} color={s.color} />
                  </div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>{s.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Admin Information */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.22, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={13} color="var(--gold)" />
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{isKitchen ? 'Kitchen Staff Information' : 'Admin Information'}</span>
            </div>
            <div style={{ padding: '20px 22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                <EditableField label="Full Name"  value={name}  onChange={setName}  />
                <EditableField label="Email"      value={email} onChange={setEmail} />
                <EditableField label="Phone"      value={phone} onChange={setPhone} />
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>Role</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 12px', borderRadius: 20,
                    background: role.bg, border: `1px solid ${role.color}30`,
                    fontSize: 12, fontWeight: 600, color: role.color,
                  }}>
                    <RoleIcon size={10} />
                    {role.label}
                  </div>
                </div>
                {user?.id && (
                  <InfoRow label="User ID" value={user.id} />
                )}
                {(user?.hotelId || activeHotel) && (
                  <InfoRow label="Assigned Restaurant" value={activeHotel?.name || user.hotelId} />
                )}
                {isKitchen && user?.station && (
                  <InfoRow label="Kitchen Station" value={user.station} />
                )}
                {isKitchen && user?.shift && (
                  <InfoRow label="Shift" value={user.shift} />
                )}
              </div>
            </div>
          </motion.div>

          {/* Hotel Details */}
          {activeHotel && (
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              }}
            >
              <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={13} color="var(--gold)" />
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Hotel Details</span>
                {/* Active hotel chip */}
                <span style={{
                  marginLeft: 'auto', padding: '2px 9px', borderRadius: 20,
                  background: 'rgba(72,160,100,0.1)', border: '1px solid rgba(72,160,100,0.25)',
                  fontSize: 10.5, fontWeight: 600, color: '#3a9b65',
                }}>Active</span>
              </div>
              <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                  {hotelFields.map(f => (
                    <InfoRow key={f.label} label={f.label} value={f.value} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Account Settings */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.38, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Settings size={13} color="var(--gold)" />
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Account Settings</span>
            </div>
            <div style={{ padding: '8px 22px 14px' }}>
              <ToggleSetting label="Push Notifications"  desc="Receive order & alert notifications"  value={settings.notifications} onChange={() => toggleSetting('notifications')} />
              <ToggleSetting label="Email Alerts"        desc="Daily revenue report via email"        value={settings.emailAlerts}   onChange={() => toggleSetting('emailAlerts')}   />
              <ToggleSetting label="Dark Mode"           desc="Use dark theme throughout"             value={settings.darkMode}      onChange={() => toggleSetting('darkMode')}      />
              <ToggleSetting label="Auto Logout"         desc="Logout after 30 min of inactivity"    value={settings.autoLogout}    onChange={() => toggleSetting('autoLogout')}    />
            </div>
          </motion.div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.44, duration: 0.5 }}
          >
            <AnimatePresence mode="wait">
              {!showLogoutConfirm ? (
                <motion.button
                  key="logout-btn"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: "blur(3px)" }}
                  whileHover={{ scale: 1.01, borderColor: 'rgba(224,85,85,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogoutConfirm(true)}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 'var(--radius-lg)',
                    background: 'rgba(224,85,85,0.05)', border: '1px solid rgba(224,85,85,0.2)',
                    fontSize: 13.5, fontWeight: 600, color: '#d63b3b',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.2s',
                  }}
                >
                  <LogOut size={14} /> Sign Out
                </motion.button>
              ) : (
                <motion.div
                  key="logout-confirm"
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, filter: "blur(3px)" }}
                  style={{
                    padding: '16px 20px', borderRadius: 'var(--radius-lg)',
                    background: 'rgba(224,85,85,0.06)', border: '1px solid rgba(224,85,85,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Are you sure you want to sign out?</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <motion.button
                      whileTap={{ scale: 0.95 }} onClick={() => setShowLogoutConfirm(false)}
                      style={{ padding: '7px 14px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text-muted)', cursor: 'pointer' }}
                    >Cancel</motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }} onClick={handleLogout}
                      style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(224,85,85,0.2)', border: '1px solid rgba(224,85,85,0.4)', fontSize: 12.5, color: '#d63b3b', cursor: 'pointer', fontWeight: 600 }}
                    >Sign Out</motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <div style={{ height: 36 }} />
    </div>
  );
}