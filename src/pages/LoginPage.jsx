import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ChefHat, ShieldCheck, Crown, AlertCircle, Loader2, Utensils } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

const ROLES = [
  { id: 'admin',       label: 'Admin',       icon: ShieldCheck, desc: 'Full restaurant access',  color: '#d7ac5c', glow: 'rgba(215,172,92,0.3)' },
  { id: 'kitchen',     label: 'Kitchen',      icon: ChefHat,     desc: 'Order & prep view',        color: '#5ba3f5', glow: 'rgba(91,163,245,0.3)' },
  { id: 'super_admin', label: 'Super Admin',  icon: Crown,       desc: 'Global management',        color: '#e05555', glow: 'rgba(224,85,85,0.3)'  },
];

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1 + Math.random() * 2,
  duration: 6 + Math.random() * 8,
  delay: Math.random() * 5,
  opacity: 0.1 + Math.random() * 0.25,
}));

function AuroraBackground({ roleColor }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Aurora blobs — very subtle tint, never overwhelming */}
      <div style={{
        position: 'absolute', top: '20%', left: '25%',
        width: 600, height: 600,
        background: `radial-gradient(ellipse, ${roleColor}06 0%, transparent 65%)`,
        animation: 'aurora 18s linear infinite',
        transformOrigin: 'center',
        transition: 'background 1s ease',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '20%',
        width: 400, height: 400,
        background: `radial-gradient(ellipse, ${roleColor}04 0%, transparent 65%)`,
        animation: 'aurora 24s linear infinite reverse',
        filter: 'blur(80px)',
      }} />
      <div style={{
        position: 'absolute', top: '5%', right: '10%',
        width: 300, height: 300,
        background: 'radial-gradient(ellipse, rgba(72,160,100,0.05) 0%, transparent 70%)',
        animation: 'float-slow 14s ease-in-out infinite',
        filter: 'blur(50px)',
      }} />

      {/* Grid — always uses the neutral green tone, not role color */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(72,160,100,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(72,160,100,0.08) 1px, transparent 1px)',
        backgroundSize: '72px 72px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
      }} />

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: roleColor,
            opacity: p.opacity * 0.5, // halved so kitchen blue stays subtle
          }}
          animate={{ y: [0, -30, 0], opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Diagonal accent — very faint */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, transparent 0%, ${roleColor}03 40%, transparent 60%, transparent 100%)`,
        transition: 'background 1s ease',
      }} />

      {/* Top glow line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent 0%, ${roleColor}40 50%, transparent 100%)`,
        transition: 'background 0.8s ease',
      }} />
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, refreshUser } = useAuth();
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusField, setFocusField] = useState(null);

  const activeRole = ROLES.find(r => r.id === role);
  const rc = activeRole.color;

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    const ROLE_HOME = { admin: '/dashboard', super_admin: '/superadmin/dashboard', kitchen: '/kitchen/dashboard' };
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid credentials. Please try again.'); setLoading(false); return; }
      login(data.user, data.token);
      // Fetch fresh full profile from API (picks up station, shift, phone, etc.)
      if (refreshUser) await refreshUser();
      navigate(ROLE_HOME[data.user.role] || '/dashboard');
    } catch {
      setError('Cannot reach server. Make sure the backend is running.');
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '13px 16px',
    background: focusField === field ? 'rgba(72,160,100,0.1)' : 'rgba(72,160,100,0.06)',
    border: `1px solid ${focusField === field ? `${rc}50` : 'rgba(72,160,100,0.2)'}`,
    borderRadius: 12,
    color: 'var(--text-primary)', fontSize: 14,
    fontFamily: 'DM Sans, sans-serif', outline: 'none',
    transition: 'all 0.25s var(--ease-smooth)',
    boxShadow: focusField === field ? `0 0 0 3px ${rc}14, 0 4px 20px ${rc}18` : 'none',
  });

  return (
    <>
      <AuroraBackground roleColor={rc} />

      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(12px, 4vw, 24px)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.93, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: 440 }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.12, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'center', marginBottom: 36 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 64, height: 64, borderRadius: 18,
              background: `linear-gradient(135deg, ${rc}22 0%, ${rc}0a 100%)`,
              border: `1px solid ${rc}30`,
              marginBottom: 16,
              boxShadow: `0 8px 32px ${rc}18`,
              transition: 'all 0.5s ease',
            }}><Utensils size={28} color={rc} /></div>
            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 28, fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em', lineHeight: 1,
              transition: 'color 0.4s ease',
            }}>Rest2Bill</h1>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Restaurant Management System
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            style={{
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(32px) saturate(160%)',
              border: '1px solid rgba(72,160,100,0.18)',
              borderRadius: 24,
              padding: '32px',
              boxShadow: `0 32px 80px rgba(40,110,70,0.14), 0 1px 0 rgba(72,160,100,0.08) inset, 0 0 0 1px ${rc}10`,
              transition: 'box-shadow 0.5s ease',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Card top glow */}
            <div style={{
              position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
              background: `linear-gradient(90deg, transparent, ${rc}60, transparent)`,
              transition: 'background 0.5s ease',
            }} />

            {/* Role Selector */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
                Sign in as
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {ROLES.map((r) => {
                  const RIcon = r.icon;
                  const active = role === r.id;
                  return (
                    <motion.button
                      key={r.id}
                      whileHover={{ scale: 1.05, y: -2, transition: { type: "spring", stiffness: 380, damping: 22 } }}
                      whileTap={{ scale: 0.94, transition: { duration: 0.1 } }}
                      onClick={() => { setRole(r.id); setError(''); }}
                      style={{
                        flex: 1, padding: '12px 8px', borderRadius: 12,
                        background: active ? `${r.color}14` : 'rgba(72,160,100,0.06)',
                        border: `1px solid ${active ? `${r.color}40` : 'rgba(72,160,100,0.18)'}`,
                        cursor: 'pointer', transition: 'all 0.25s var(--ease-smooth)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        boxShadow: active ? `0 4px 20px ${r.color}18` : 'none',
                      }}
                    >
                      <RIcon size={16} color={active ? r.color : '#3e4257'} style={{ transition: 'color 0.2s' }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: active ? r.color : 'var(--text-muted)', transition: 'color 0.2s', letterSpacing: '0.02em' }}>
                        {r.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.04em', display: 'block', marginBottom: 7 }}>
                  Email Address
                </label>
                <input
                  type="email" value={email} placeholder="you@restaurant.com"
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusField('email')}
                  onBlur={() => setFocusField(null)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={inputStyle('email')}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.04em', display: 'block', marginBottom: 7 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'} value={password} placeholder="••••••••"
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusField('password')}
                    onBlur={() => setFocusField(null)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    style={{ ...inputStyle('password'), paddingRight: 46 }}
                  />
                  <button
                    onClick={() => setShowPass(v => !v)} type="button"
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: 0, display: 'flex',
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', borderRadius: 10, marginBottom: 14,
                    background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.22)',
                    fontSize: 12.5, color: '#e05555',
                  }}
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02, y: -1, transition: { type: "spring", stiffness: 360, damping: 22 } }}
              whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                borderRadius: 14, border: `1px solid ${rc}40`,
                background: `linear-gradient(135deg, ${rc}22 0%, ${rc}12 100%)`,
                color: rc, fontSize: 14, fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 4px 24px ${rc}18`,
                transition: 'all 0.25s var(--ease-smooth)',
                letterSpacing: '0.02em',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = `linear-gradient(135deg, ${rc}30 0%, ${rc}18 100%)`; e.currentTarget.style.boxShadow = `0 8px 32px ${rc}30`; } }}
              onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${rc}22 0%, ${rc}12 100%)`; e.currentTarget.style.boxShadow = `0 4px 24px ${rc}18`; }}
            >
              {loading ? <Loader2 size={16} style={{ animation: 'rotate-slow 0.8s linear infinite' }} /> : null}
              {loading ? 'Authenticating…' : 'Sign In'}
            </motion.button>

            {/* Role hint */}
            <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 18, lineHeight: 1.5 }}>
              Signing in as <span style={{ color: rc, fontWeight: 600 }}>{activeRole.label}</span> — {activeRole.desc}
            </p>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 22, letterSpacing: '0.03em' }}
          >
            Rest2Bill v2.0 · Premium Edition
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}