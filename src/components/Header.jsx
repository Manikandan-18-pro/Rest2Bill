import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Sparkles } from 'lucide-react';
import { MobileMenuButton } from './Sidebar';
import { useAuth } from './AuthContext';
import HotelSwitcher from './HotelSwitcher';
import { useHotel } from '../context/HotelContext';

const ROLE_COLORS = { admin: '#2d9e5f', kitchen: '#2478c8', super_admin: '#d63b3b' };

const NOTIFICATIONS = [
  { id: 1, text: 'Table T-07 awaiting service', time: '2m ago', dot: '#2ea866' },
  { id: 2, text: 'New order: 4 items from T-03', time: '5m ago', dot: '#2d9e5f' },
  { id: 3, text: 'Kitchen: Low stock on Salmon', time: '12m ago', dot: '#d63b3b' },
];

export default function Header({ onMobileMenuOpen }) {
  const { user } = useAuth();
  const { activeHotel } = useHotel();
  const roleColor = ROLE_COLORS[user?.role] || '#2d9e5f';
  const [time, setTime] = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Dynamic accent line: use hotel branding if active, else role color
  const accentColor = activeHotel ? activeHotel.branding.primary : roleColor;

  return (
    <header className="header-inner" style={{
      height: 'var(--header-height)',
      background: 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(32px) saturate(160%)',
      WebkitBackdropFilter: 'blur(32px) saturate(160%)',
      borderBottom: '1px solid rgba(80,168,115,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 40,
      boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 24px rgba(20,60,35,0.08)',
    }}>

      {/* Accent gradient line — adapts to active hotel */}
      <motion.div
        animate={{ background: `linear-gradient(90deg, transparent 0%, ${accentColor}50 30%, ${accentColor}80 50%, ${accentColor}50 70%, transparent 100%)` }}
        transition={{ duration: 0.6 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2 }}
      />

      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="mobile-only">
          <MobileMenuButton onClick={onMobileMenuOpen} />
        </div>

        {/* Hotel Switcher: super_admin can switch hotels; admin sees their own hotel as read-only */}
        {user?.role === 'super_admin' && (
          <div className="desktop-only">
            <HotelSwitcher />
          </div>
        )}

      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Live Clock */}
        <div className="desktop-only" style={{
          textAlign: 'right',
          borderRight: '1px solid rgba(80,168,115,0.2)',
          paddingRight: 18, marginRight: 4,
        }}>
          <motion.div
            key={timeStr}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em', fontFamily: 'DM Sans, sans-serif' }}
          >
            {timeStr}
          </motion.div>
          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1, letterSpacing: '0.03em', fontFamily: 'DM Sans, sans-serif' }}>{dateStr}</div>
        </div>

        {/* Notification Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setNotifOpen(v => !v)}
            style={{
              position: 'relative',
              background: notifOpen ? 'rgba(74,163,107,0.12)' : 'rgba(74,163,107,0.07)',
              border: `1px solid ${notifOpen ? 'rgba(74,163,107,0.35)' : 'rgba(74,163,107,0.2)'}`,
              borderRadius: 12, width: 38, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: notifOpen ? 'var(--gold)' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            <Bell size={16} />
            <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 8px rgba(74,163,107,0.7)' }} />
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  width: 300, background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(80,168,115,0.2)',
                  borderRadius: 16, overflow: 'hidden',
                  boxShadow: '0 16px 48px rgba(20,60,35,0.15)',
                  zIndex: 100,
                }}
                className="notif-dropdown"
              >
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(80,168,115,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={13} color="var(--gold)" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>Live Activity</span>
                  <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 20, background: 'rgba(74,163,107,0.12)', fontSize: 10, fontWeight: 600, color: 'var(--gold)', fontFamily: 'DM Sans, sans-serif' }}>{NOTIFICATIONS.length} new</span>
                </div>
                {NOTIFICATIONS.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{ padding: '12px 16px', borderBottom: i < NOTIFICATIONS.length - 1 ? '1px solid rgba(74,163,107,0.08)' : 'none', display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,163,107,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.dot, flexShrink: 0, marginTop: 5, boxShadow: `0 0 6px ${n.dot}` }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.4, fontFamily: 'DM Sans, sans-serif' }}>{n.text}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontFamily: 'DM Sans, sans-serif' }}>{n.time}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 12px 6px 6px',
            background: `${roleColor}0a`,
            border: `1px solid ${roleColor}22`,
            borderRadius: 12, cursor: 'pointer',
            transition: 'all 0.25s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${roleColor}14`; e.currentTarget.style.borderColor = `${roleColor}38`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${roleColor}0a`; e.currentTarget.style.borderColor = `${roleColor}22`; }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: `linear-gradient(135deg, ${roleColor}30 0%, ${roleColor}15 100%)`,
            border: `1px solid ${roleColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12.5, fontWeight: 700, color: roleColor,
            fontFamily: 'Cormorant Garamond, serif',
          }}>
            {(user?.name || 'U')[0].toUpperCase()}
          </div>
          <span className="desktop-only" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
            {user?.name}
          </span>
        </motion.div>
      </div>
    </header>
  );
}