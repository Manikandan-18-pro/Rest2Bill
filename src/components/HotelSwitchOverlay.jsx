import { motion, AnimatePresence } from 'framer-motion';
import { useHotel, HOTELS } from '../context/HotelContext';
import { MapPin, Building2 } from 'lucide-react';

export default function HotelSwitchOverlay() {
  const { switching, switchTarget } = useHotel();
  const targetHotel = HOTELS.find(h => h.id === switchTarget);

  return (
    <AnimatePresence>
      {switching && targetHotel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'all',
          }}
        >
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(10, 20, 14, 0.65)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
            }}
          />

          {/* Radial burst from center */}
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 8, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              width: 200, height: 200,
              borderRadius: '50%',
              background: targetHotel.branding.gradient,
              opacity: 0.3,
            }}
          />

          {/* Hotel card */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative', zIndex: 1,
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(40px)',
              border: `1px solid ${targetHotel.branding.primary}40`,
              borderRadius: 24, padding: '36px 48px',
              textAlign: 'center',
              boxShadow: `0 0 80px ${targetHotel.branding.primary}30, 0 24px 64px rgba(0,0,0,0.3)`,
              minWidth: 300,
            }}
          >
            {/* Animated top border glow */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: targetHotel.branding.gradient,
                borderRadius: '24px 24px 0 0',
                transformOrigin: 'left',
              }}
            />

            {/* Hotel logo */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 300 }}
              style={{
                width: 72, height: 72, borderRadius: 20,
                background: targetHotel.branding.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 22, fontWeight: 900,
                color: targetHotel.branding.logoColor,
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: `0 8px 32px ${targetHotel.branding.primary}50`,
              }}
            >
              {targetHotel.shortName}
            </motion.div>

            {/* Labels */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}
            >
              Switching to
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em', marginBottom: 6 }}
            >
              {targetHotel.name}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}
            >
              <MapPin size={11} />
              {targetHotel.city}, {targetHotel.state}
            </motion.div>

            {/* Loading dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: targetHotel.branding.accent,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
