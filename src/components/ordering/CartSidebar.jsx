import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ChevronRight, Tag, Utensils } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useEffect, useState } from 'react';

const EASE = [0.16, 1, 0.3, 1];

// Light sage theme
const D = {
  bg:          '#dceedd',
  card:        '#ffffff',
  text:        '#1a3a28',
  textSub:     '#4a7a5a',
  textMuted:   '#7aaa88',
  accent:      '#4a9b63',
  accentDark:  '#2e6644',
  accentLight: 'rgba(74,155,99,0.1)',
  border:      'rgba(26,58,40,0.08)',
  borderAccent: 'rgba(26,58,40,0.12)',
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function CartSidebar() {
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
  const { items, removeItem, updateQty, clearAll, isOpen, setIsOpen, totalItems, subtotal, tax, total } = useCart();
  const isMobile = useIsMobile();

  // Prevent body scroll when cart is open on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, isMobile]);

  const handleReview = () => {
    setIsOpen(false);
    setTimeout(() => navigate(`/order/review?table=${table}&hotel=${hotelId}`), 100);
  };

  // On mobile: slides up from bottom (sheet), on desktop: slides in from right (panel)
  const panelVariants = isMobile
    ? {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit:    { y: '100%' },
      }
    : {
        initial: { x: '100%' },
        animate: { x: 0 },
        exit:    { x: '100%' },
      };

  const panelStyle = isMobile
    ? {
        position: 'fixed', left: 0, right: 0, bottom: 0,
        height: '92vh',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        borderLeft: 'none',
        zIndex: 61,
        background: D.bg,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 40px rgba(26,58,40,0.18)',
      }
    : {
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: 420, zIndex: 61,
        background: D.bg,
        borderLeft: `1px solid ${D.border}`,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(26,58,40,0.12)',
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 60,
              background: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Panel / Bottom Sheet */}
          <motion.div
            initial={panelVariants.initial}
            animate={panelVariants.animate}
            exit={panelVariants.exit}
            transition={{ type: 'spring', stiffness: 380, damping: 36, mass: 0.9 }}
            style={panelStyle}
          >
            {/* Mobile drag handle */}
            {isMobile && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
                <div style={{
                  width: 40, height: 4, borderRadius: 99,
                  background: 'rgba(26,58,40,0.18)',
                }} />
              </div>
            )}

            {/* Glow edge (desktop only) */}
            {!isMobile && (
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0, width: 1,
                background: `linear-gradient(180deg, transparent 0%, ${D.borderAccent} 40%, ${D.borderAccent} 60%, transparent 100%)`,
                pointerEvents: 'none',
              }} />
            )}

            {/* ── Header ────────────────────────────────────────────────── */}
            <div style={{
              padding: isMobile ? '8px 20px 14px' : '20px 24px 18px',
              borderBottom: `1px solid ${D.border}`,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 14,
                background: D.accentLight,
                border: `1px solid ${D.borderAccent}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ShoppingBag size={20} color={D.accent} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22, fontWeight: 700, color: D.text, lineHeight: 1.1,
                }}>Your Cart</h2>
                <p style={{ color: D.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                  {totalItems} item{totalItems !== 1 ? 's' : ''} · Table {table}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                onClick={() => setIsOpen(false)}
                style={{
                  width: 36, height: 36, borderRadius: 11,
                  background: 'rgba(26,58,40,0.08)', border: `1px solid ${D.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} color={D.textSub} />
              </motion.button>
            </div>

            {/* ── Items ─────────────────────────────────────────────────── */}
            <div style={{
              flex: 1, overflowY: 'auto',
              padding: isMobile ? '12px 16px' : '16px 24px',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}>
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  style={{ textAlign: 'center', padding: '60px 20px' }}
                >
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                    <ShoppingBag size={52} color={D.textMuted} />
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: D.text, marginBottom: 8 }}>
                    Cart is empty
                  </p>
                  <p style={{ color: D.textMuted, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
                    Add some delicious items from the menu
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => setIsOpen(false)}
                    style={{
                      marginTop: 24, padding: '12px 24px', borderRadius: 12, border: `1px solid ${D.borderAccent}`,
                      background: D.accentLight, color: D.accent,
                      fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Browse Menu
                  </motion.button>
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map(item => (
                    <CartItem
                      key={item.id}
                      item={item}
                      isMobile={isMobile}
                      onInc={() => updateQty(item.id, item.qty + 1)}
                      onDec={() => updateQty(item.id, item.qty - 1)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </AnimatePresence>
              )}

              {/* Clear all */}
              {items.length > 0 && (
                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  whileHover={{ color: '#c85555' }}
                  onClick={clearAll}
                  style={{
                    width: '100%', marginTop: 8, padding: '10px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: D.textMuted, fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'color 0.2s',
                  }}
                >
                  <Trash2 size={13} />
                  Clear all items
                </motion.button>
              )}
            </div>

            {/* ── Order Summary & CTA ────────────────────────────────────── */}
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: isMobile ? '16px 16px 28px' : '20px 24px 28px',
                  borderTop: `1px solid ${D.border}`,
                  background: 'rgba(74,155,99,0.04)',
                }}
              >
                {/* Promo chip */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: D.accentLight, border: `1px solid ${D.borderAccent}`,
                  borderRadius: 10, padding: '8px 14px', marginBottom: 14,
                }}>
                  <Tag size={13} color={D.accent} />
                  <span style={{ color: D.accent, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                    Fresh & made-to-order
                  </span>
                </div>

                {/* Bill rows */}
                {[
                  { label: 'Subtotal', value: `₹${subtotal.toFixed(0)}` },
                  { label: 'GST (5%)', value: `₹${tax.toFixed(0)}` },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 8,
                  }}>
                    <span style={{ color: D.textMuted, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{row.label}</span>
                    <span style={{ color: D.textSub, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: D.border, margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: D.text }}>Total</span>
                  <motion.span
                    key={total}
                    initial={{ scale: 1.15, color: D.accent }} animate={{ scale: 1, color: D.accent }}
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: D.accent }}
                  >
                    ₹{total.toFixed(0)}
                  </motion.span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.025, boxShadow: '0 8px 24px rgba(74,155,99,0.2)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReview}
                  style={{
                    width: '100%', padding: isMobile ? '14px 24px' : '16px 24px',
                    borderRadius: 16, border: 'none',
                    background: `linear-gradient(135deg, ${D.accent} 0%, ${D.accentDark} 100%)`,
                    color: '#fff', fontSize: isMobile ? 15 : 16, fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 12px rgba(74,155,99,0.15)',
                  }}
                >
                  Review & Confirm Order
                  <ChevronRight size={18} strokeWidth={2.5} />
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CartItem({ item, onInc, onDec, onRemove, isMobile }) {
  const D = {
    text:        '#1a3a28',
    accent:      '#4a9b63',
    accentLight: 'rgba(74,155,99,0.1)',
    borderAccent: 'rgba(26,58,40,0.12)',
    textMuted:   '#7aaa88',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      style={{ overflow: 'hidden' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14,
        padding: isMobile ? '12px 0' : '14px 0',
        borderBottom: `1px solid ${D.borderAccent}`,
      }}>
        {/* Icon box */}
        <div style={{
          width: isMobile ? 42 : 50, height: isMobile ? 42 : 50,
          borderRadius: isMobile ? 12 : 14, flexShrink: 0,
          background: D.accentLight,
          border: `1px solid ${D.borderAccent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Utensils size={isMobile ? 16 : 20} color={D.accent} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: isMobile ? 15 : 16, fontWeight: 600,
            color: D.text, marginBottom: 3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {item.name}
          </p>
          <p style={{
            color: D.accent, fontSize: isMobile ? 13 : 14, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            ₹{(item.price * item.qty).toFixed(0)}
          </p>
        </div>

        {/* Qty controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8, flexShrink: 0 }}>
          <motion.button whileTap={{ scale: 0.85 }} onClick={onDec} style={{
            width: isMobile ? 30 : 28, height: isMobile ? 30 : 28,
            borderRadius: isMobile ? 10 : 8,
            background: 'rgba(26,58,40,0.08)', border: `1px solid ${D.borderAccent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <Minus size={12} color={D.textMuted} strokeWidth={2.5} />
          </motion.button>

          <motion.span
            key={item.qty}
            initial={{ scale: 1.25 }} animate={{ scale: 1 }}
            style={{ fontSize: 14, fontWeight: 700, color: D.accent, minWidth: 16, textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}
          >
            {item.qty}
          </motion.span>

          <motion.button whileTap={{ scale: 0.85 }} onClick={onInc} style={{
            width: isMobile ? 30 : 28, height: isMobile ? 30 : 28,
            borderRadius: isMobile ? 10 : 8,
            background: D.accentLight, border: `1px solid ${D.borderAccent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <Plus size={12} color={D.accent} strokeWidth={2.5} />
          </motion.button>

          <motion.button whileTap={{ scale: 0.85 }} onClick={onRemove} style={{
            width: isMobile ? 30 : 28, height: isMobile ? 30 : 28,
            borderRadius: isMobile ? 10 : 8, marginLeft: 2,
            background: 'rgba(200,85,85,0.08)', border: '1px solid rgba(200,85,85,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <Trash2 size={12} color="#c85555" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}