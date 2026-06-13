import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

function useCountUp(target, duration = 1200, delay = 0) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setCurrent(Math.floor(ease * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return current;
}

const CARD_DATA = {
  'Total Orders':     { value: 284,   prefix: '',  suffix: '',    change: '+12%', up: true },
  'Active Tables':    { value: 18,    prefix: '',  suffix: '/24', change: '+3',   up: true },
  "Today's Revenue":  { value: 12480, prefix: '₹', suffix: '',    change: '+8.4%',up: true },
  'Pending Items':    { value: 7,     prefix: '',  suffix: '',    change: '-23%', up: false },
};

export default function SummaryCard({ title, icon, color = '#3a9b65', delay = 0, liveValue, liveSuffix }) {
  const meta = CARD_DATA[title] || { value: 0, prefix: '', suffix: '', change: '+0%', up: true };
  const targetVal = liveValue !== undefined ? liveValue : meta.value;
  const count = useCountUp(targetVal, 1400, delay + 0.3);
  const suffix = liveSuffix !== undefined ? liveSuffix : meta.suffix;
  const displayVal = meta.prefix + (targetVal >= 1000 ? count.toLocaleString() : count) + suffix;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.94, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.015, transition: { type: "spring", stiffness: 320, damping: 24 } }}
      className="summary-card-inner"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '22px',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.35s ease, border-color 0.35s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}30`;
        e.currentTarget.style.boxShadow = `0 16px 48px rgba(40,110,70,0.15), 0 0 40px ${color}12, 0 1px 0 rgba(72,160,100,0.09) inset`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top gradient line */}
      <div style={{
        position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
        background: `linear-gradient(90deg, transparent, ${color}80, transparent)`,
      }} />

      {/* Corner ambient glow */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 120, height: 120,
        background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
        animation: 'breathe-glow 4s ease-in-out infinite',
        animationDelay: `${delay}s`,
        pointerEvents: 'none',
      }} />

      {/* Bottom-left subtle glow */}
      <div style={{
        position: 'absolute', bottom: -20, left: -20,
        width: 80, height: 80,
        background: `radial-gradient(circle, ${color}06 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }}
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: `linear-gradient(135deg, ${color}1c 0%, ${color}08 100%)`,
            border: `1px solid ${color}28`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
            boxShadow: `0 4px 16px ${color}14`,
          }}>
          {icon}
        </motion.div>

        {/* Change badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 9px', borderRadius: 20,
          background: meta.up ? 'rgba(76,175,147,0.1)' : 'rgba(224,85,85,0.1)',
          border: `1px solid ${meta.up ? 'rgba(76,175,147,0.25)' : 'rgba(224,85,85,0.25)'}`,
          fontSize: 11, fontWeight: 600,
          color: meta.up ? '#27a06b' : '#d63b3b',
        }}>
          {meta.up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
          {meta.change}
        </div>
      </div>

      {/* Label */}
      <div style={{
        fontSize: 11, fontWeight: 500,
        color: 'var(--text-muted)',
        letterSpacing: '0.09em', textTransform: 'uppercase',
        marginBottom: 8,
      }}>
        {title}
      </div>

      {/* Value */}
      <div
        className="summary-card-value"
        style={{
          fontSize: 28, fontWeight: 600, fontFamily: 'Cormorant Garamond, serif',
          color: 'var(--text-primary)', lineHeight: 1,
          letterSpacing: '-0.02em',
          animation: 'count-up 0.5s ease forwards',
          animationDelay: `${delay + 0.3}s`,
        }}>
        {displayVal}
      </div>

      {/* Subtle bottom progress line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute', bottom: 0, left: 0,
          height: 2, transformOrigin: 'left',
          width: `${(meta.value / 300) * 100}%`,
          maxWidth: '85%',
          background: `linear-gradient(90deg, ${color}60, ${color}20)`,
          borderRadius: '0 2px 2px 0',
        }}
      />
    </motion.div>
  );
}