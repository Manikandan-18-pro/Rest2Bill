import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, Wifi, MapPin, ChevronRight, Star, Clock, Circle } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1];

export default function QRLandingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const table   = params.get('table') || sessionStorage.getItem('rms_table') || '7';
  const hotelId = (
    params.get('hotel') ||
    params.get('hotel_id') ||
    params.get('hotelId') ||
    sessionStorage.getItem('rms_hotel_id') ||
    ''
  );
  if (hotelId) sessionStorage.setItem('rms_hotel_id', hotelId);
  if (table)   sessionStorage.setItem('rms_table', table);
  const [scanning, setScanning] = useState(true);

  // Light sage theme design tokens
  const D = {
    bg:          '#dceedd',          // light sage green background
    card:        '#ffffff',          // pure white cards
    cardShadow:  '0 4px 24px rgba(26,58,40,0.10), 0 1px 4px rgba(26,58,40,0.06)',
    accent:      '#1a3a28',          // dark forest green
    accentLight: '#4a9b63',          // lighter green for accents
    text:        '#1a3a28',          // primary text
    textSub:     '#4a7a5a',          // secondary text
    textMuted:   '#7aaa88',          // muted text
  };

  useEffect(() => {
    const t = setTimeout(() => setScanning(false), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0',
      margin: '0',
      background: D.bg,
      position: 'fixed',
      top: '0',
      left: '0',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '100vh',
      }}>
      {/* ── Top section ─────────────────────────────────────────────────────── */}
      <div style={{ width: '100%', padding: '48px 32px 0' }}>
        {/* Logo area */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: 22,
            background: 'linear-gradient(135deg, #4a9b63 0%, #2e6644 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: D.cardShadow,
          }}>
            <Utensils size={32} color="#fff" strokeWidth={1.8} />
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 36, fontWeight: 700, color: D.text,
            letterSpacing: '-0.01em', lineHeight: 1.1,
          }}>
            RestoBill
          </h1>
          <p style={{ color: D.textMuted, fontSize: 13, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
            Fine Dining Experience
          </p>
        </motion.div>

        {/* Scanning animation */}
        {scanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center', marginBottom: 40 }}
          >
            <ScanAnimation accentColor={D.accentLight} />
            <p style={{ color: D.textMuted, fontSize: 13, marginTop: 16, fontFamily: "'DM Sans', sans-serif" }}>
              Reading your table QR code…
            </p>
          </motion.div>
        )}

        {!scanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* Table card */}
            <div style={{
              background: D.card,
              border: `1px solid rgba(26,58,40,0.12)`,
              borderRadius: 20,
              padding: '28px 24px',
              marginBottom: 24,
              boxShadow: D.cardShadow,
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Glow line top */}
              <div style={{
                position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
                background: `linear-gradient(90deg, transparent, rgba(74,155,99,0.3), transparent)`,
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'rgba(74,155,99,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(74,155,99,0.2)',
                }}>
                  <MapPin size={18} color={D.accentLight} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: D.textMuted, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Your Table
                  </p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: D.text, lineHeight: 1.1 }}>
                    Table No. {table}
                  </p>
                </div>
                <div style={{
                  marginLeft: 'auto',
                  background: 'rgba(74,155,99,0.12)',
                  border: '1px solid rgba(74,155,99,0.2)',
                  borderRadius: 8, padding: '4px 10px',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: D.accentLight, fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                    <Circle size={7} fill={D.accentLight} stroke="none" /> ACTIVE
                  </span>
                </div>
              </div>

              {/* Info chips */}
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { icon: <Wifi size={13} />, label: 'Connected' },
                  { icon: <Clock size={13} />, label: '~30 min delivery' },
                  { icon: <Star size={13} />, label: '4.8 Rated' },
                ].map(chip => (
                  <div key={chip.label} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'rgba(26,58,40,0.04)',
                    border: '1px solid rgba(26,58,40,0.08)',
                    borderRadius: 8, padding: '6px 10px',
                    flex: 1, justifyContent: 'center',
                  }}>
                    <span style={{ color: D.textMuted }}>{chip.icon}</span>
                    <span style={{ color: D.textMuted, fontSize: 11, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>{chip.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Welcome message */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
              style={{ textAlign: 'center', padding: '0 8px 32px' }}
            >
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 28, fontWeight: 600, color: D.text,
                marginBottom: 8, lineHeight: 1.2,
              }}>
                Welcome! Ready to order?
              </h2>
              <p style={{
                color: D.textSub, fontSize: 14,
                fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6,
              }}>
                Browse our full menu, add items to your cart and we'll bring it right to your table.
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* ── Bottom CTA ─────────────────────────────────────────────────────── */}
      {!scanning && (
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.55, ease: EASE }}
          style={{ width: '100%', padding: '0 32px 56px' }}
        >
          <motion.button
            onClick={() => navigate(`/order/menu?table=${table}&hotel=${hotelId}`)}
            whileHover={{ scale: 1.025, boxShadow: '0 8px 24px rgba(74,155,99,0.25)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%',
              padding: '18px 24px',
              borderRadius: 18,
              border: 'none',
              background: `linear-gradient(135deg, ${D.accentLight} 0%, #2e6644 100%)`,
              color: '#fff',
              fontSize: 17,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 4px 16px rgba(74,155,99,0.2)',
              letterSpacing: '0.01em',
            }}
          >
            Browse Menu
            <ChevronRight size={20} strokeWidth={2.5} />
          </motion.button>

          <p style={{
            textAlign: 'center', marginTop: 16,
            color: D.textMuted, fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Tap to explore today's menu
          </p>
        </motion.div>
      )}
      </div>
    </div>
  );
}

function ScanAnimation({ accentColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        <style>{`
          @keyframes scanLine {
            0%  { y: 18px; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100%{ y: 74px; opacity: 0; }
          }
          @keyframes cornerPulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
          .scan-line { animation: scanLine 1.2s ease-in-out infinite; }
          .corner { animation: cornerPulse 1.2s ease-in-out infinite; }
        `}</style>
        {/* Corner brackets */}
        {[
          { x:14, y:14, rx:14, ry:14, d:'M14,26 L14,14 L26,14' },
          { x:86, y:14, rx:86, ry:14, d:'M74,14 L86,14 L86,26' },
          { x:14, y:86, rx:14, ry:86, d:'M14,74 L14,86 L26,86' },
          { x:86, y:86, rx:86, ry:86, d:'M86,74 L86,86 L74,86' },
        ].map((c, i) => (
          <path key={i} d={c.d} fill="none" stroke={accentColor} strokeWidth="3"
            strokeLinecap="round" className="corner"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
        {/* Scan line */}
        <rect className="scan-line" x="18" width="64" height="2" rx="1"
          fill={`url(#scanGrad_${accentColor.replace('#', '')})`} />
        <defs>
          <linearGradient id={`scanGrad_${accentColor.replace('#', '')}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor={accentColor} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {/* Grid dots (QR-like) */}
        {Array.from({ length: 16 }).map((_, i) => (
          <rect key={i} x={30 + (i % 4) * 11} y={35 + Math.floor(i / 4) * 11}
            width={6} height={6} rx={1.5}
            fill={`rgba(74,155,99,${0.15 + Math.random() * 0.3})`}
          />
        ))}
      </svg>
    </div>
  );
}