import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Users, Utensils, X, Building2, ChevronRight, Wifi } from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { useNavigate } from 'react-router-dom';

const PLAN_STYLES = {
  Enterprise: { color: '#fff', bg: 'rgba(255,255,255,0.2)', border: 'rgba(255,255,255,0.3)' },
  Pro:        { color: '#fff', bg: 'rgba(255,255,255,0.15)', border: 'rgba(255,255,255,0.25)' },
  Basic:      { color: '#fff', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)' },
};

export default function HotelContextBanner() {
  const { activeHotel, clearHotel, isAdmin } = useHotel();
  const navigate = useNavigate();

  if (!activeHotel) return null;

  const plan = PLAN_STYLES[activeHotel.plan];

  return (
    <AnimatePresence>
      <motion.div
        key={activeHotel.id}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ overflow: 'hidden', position: 'relative', zIndex: 35 }}
      >
        <div style={{
          background: activeHotel.branding.gradient,
          padding: '8px 24px',
          display: 'flex', alignItems: 'center',
          gap: 16,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle noise texture overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
            pointerEvents: 'none',
          }} />

          {/* Animated shimmer */}
          <motion.div
            animate={{ x: ['−100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
            style={{
              position: 'absolute', top: 0, bottom: 0, width: '30%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
              pointerEvents: 'none',
            }}
          />

          {/* Hotel avatar */}
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 900, color: '#fff',
            fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
            backdropFilter: 'blur(8px)',
          }}>
            {activeHotel.shortName}
          </div>

          {/* Hotel name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.01em' }}>
              {activeHotel.name}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: plan.color,
              background: plan.bg, border: `1px solid ${plan.border}`,
              padding: '2px 7px', borderRadius: 20,
            }}>
              {activeHotel.plan}
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />

          {/* Stats row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, flexWrap: 'wrap' }}>
            {[
              { icon: MapPin, label: `${activeHotel.city}, ${activeHotel.state}` },
              { icon: Star, label: `${activeHotel.rating} rating` },
              { icon: Users, label: `${activeHotel.staff} staff` },
              { icon: Utensils, label: `${activeHotel.tables} tables` },
              { icon: Wifi, label: activeHotel.status === 'active' ? 'Live' : 'Offline' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>
                <Icon size={10} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Tagline */}
          <div style={{
            fontSize: 11, fontStyle: 'italic', color: 'rgba(255,255,255,0.6)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            maxWidth: 200,
            fontFamily: "'Cormorant Garamond', serif",
          }}>
            "{activeHotel.branding.tagline}"
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {!isAdmin && (
              <button
                onClick={clearHotel}
                style={{
                  width: 24, height: 24, borderRadius: 7,
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  color: '#fff',
                }}
                title="Clear hotel context"
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <X size={11} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
