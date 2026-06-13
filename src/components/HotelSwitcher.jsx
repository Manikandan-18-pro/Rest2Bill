import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ChevronDown, Check, Search, MapPin, Star, Zap, X } from 'lucide-react';
import { useHotel } from '../context/HotelContext';

const PLAN_STYLES = {
  Enterprise: { color: '#d63b3b', bg: 'rgba(214,59,59,0.12)' },
  Pro:        { color: '#6c63ff', bg: 'rgba(108,99,255,0.12)' },
  Basic:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

function HotelAvatar({ hotel, size = 32, showGlow = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: hotel.branding.gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: size * 0.32, fontWeight: 800, letterSpacing: '-0.02em',
      color: hotel.branding.logoColor,
      boxShadow: showGlow ? `0 0 16px ${hotel.branding.primary}50` : `0 2px 8px ${hotel.branding.primary}30`,
      transition: 'box-shadow 0.3s ease',
    }}>
      {hotel.shortName}
    </div>
  );
}

export default function HotelSwitcher({ compact = false }) {
  const { hotels, activeHotel, switchHotel, switching } = useHotel();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropRef = useRef(null);

  const filtered = hotels.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (hotel) => {
    switchHotel(hotel.id);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={dropRef} style={{ position: 'relative', userSelect: 'none' }}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'flex', alignItems: 'center',
          gap: compact ? 8 : 10,
          background: open
            ? 'rgba(72,160,100,0.1)'
            : 'rgba(72,160,100,0.05)',
          border: `1px solid ${open ? 'rgba(72,160,100,0.4)' : 'rgba(72,160,100,0.18)'}`,
          borderRadius: 12, padding: compact ? '7px 11px' : '8px 14px',
          cursor: 'pointer', transition: 'all 0.25s ease',
          boxShadow: open ? '0 0 0 3px rgba(72,160,100,0.1)' : 'none',
          minWidth: compact ? 'auto' : 220,
          maxWidth: compact ? 'auto' : 260,
        }}
      >
        {switching ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
            style={{ width: 28, height: 28, borderRadius: 8, border: '2px solid rgba(72,160,100,0.3)', borderTopColor: '#3a9b65', flexShrink: 0 }}
          />
        ) : activeHotel ? (
          <HotelAvatar hotel={activeHotel} size={28} showGlow={open} />
        ) : (
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(72,160,100,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Building2 size={14} color="#3a9b65" />
          </div>
        )}

        {!compact && (
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <div style={{
              fontSize: 12.5, fontWeight: 700,
              color: activeHotel ? 'var(--text-primary)' : 'var(--text-secondary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              maxWidth: 150,
            }}>
              {switching ? 'Switching…' : activeHotel ? activeHotel.name : 'Select Hotel'}
            </div>
            {activeHotel && !switching && (
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <MapPin size={9} />
                {activeHotel.city}
              </div>
            )}
          </div>
        )}

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ flexShrink: 0 }}
        >
          <ChevronDown size={13} color="var(--text-muted)" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              boxShadow: '0 16px 48px rgba(40,110,70,0.18), 0 4px 16px rgba(0,0,0,0.08)',
              zIndex: 1000,
              minWidth: 300, maxWidth: 340,
              overflow: 'hidden',
            }}
          >
            {/* Search */}
            <div style={{ padding: '12px 12px 8px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(72,160,100,0.06)',
                border: '1px solid rgba(72,160,100,0.15)',
                borderRadius: 10, padding: '7px 12px',
              }}>
                <Search size={13} color="var(--text-muted)" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search hotels…"
                  style={{
                    flex: 1, border: 'none', background: 'transparent',
                    fontSize: 12.5, color: 'var(--text-primary)',
                    outline: 'none', fontFamily: 'inherit',
                  }}
                />
                {search && (
                  <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                    <X size={12} color="var(--text-muted)" />
                  </button>
                )}
              </div>
            </div>

            {/* Header label */}
            <div style={{ padding: '0 16px 6px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {filtered.length} Hotel{filtered.length !== 1 ? 's' : ''}
            </div>

            {/* Hotel List */}
            <div style={{ maxHeight: 320, overflowY: 'auto', padding: '0 6px 8px' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No hotels found
                </div>
              ) : filtered.map((hotel, i) => {
                const isActive = activeHotel?.id === hotel.id;
                const plan = PLAN_STYLES[hotel.plan];
                return (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleSelect(hotel)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 10px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      background: isActive ? `${hotel.branding.primary}12` : 'transparent',
                      border: `1px solid ${isActive ? `${hotel.branding.primary}30` : 'transparent'}`,
                      marginBottom: 2,
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(72,160,100,0.06)';
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <HotelAvatar hotel={hotel} size={36} showGlow={isActive} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
                          {hotel.name}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: plan.color, background: plan.bg, padding: '1px 6px', borderRadius: 20, flexShrink: 0 }}>
                          {hotel.plan}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={9} /> {hotel.city}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Star size={9} fill="currentColor" /> {hotel.rating}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Zap size={9} /> {hotel.orders.toLocaleString()} orders
                        </span>
                      </div>
                    </div>

                    {isActive && (
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: hotel.branding.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Check size={11} color={hotel.branding.logoColor} strokeWidth={3} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{
              borderTop: '1px solid var(--border)',
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {hotels.filter(h => h.status === 'active').length} active properties
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3a9b65', display: 'inline-block' }} />
                Live data
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
