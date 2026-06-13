import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function FloatingCartButton() {
  const { totalItems, total, setIsOpen } = useCart();

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.button
          initial={{ y: 100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          whileHover={{ scale: 1.04, boxShadow: '0 20px 56px rgba(58,155,101,0.55)' }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed', bottom: 28, right: 24, zIndex: 50,
            background: 'linear-gradient(135deg, #3a9b65 0%, #2e7d50 100%)',
            border: '1px solid rgba(58,155,101,0.5)',
            borderRadius: 20,
            padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(58,155,101,0.4), 0 2px 0 rgba(255,255,255,0.12) inset',
            minWidth: 160,
          }}
        >
          {/* Badge */}
          <div style={{
            position: 'relative',
            width: 36, height: 36, borderRadius: 12,
            background: 'rgba(0,0,0,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <ShoppingBag size={18} color="#fff" />
            <motion.div
              key={totalItems}
              initial={{ scale: 1.5 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              style={{
                position: 'absolute', top: -7, right: -7,
                width: 19, height: 19, borderRadius: 10,
                background: '#d63b3b',
                border: '2px solid #1a3824',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800,
                color: '#fff', fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {totalItems}
            </motion.div>
          </div>

          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={{
              fontSize: 11, color: 'rgba(255,255,255,0.65)',
              fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.06em',
              textTransform: 'uppercase', marginBottom: 1,
            }}>
              View Cart
            </p>
            <motion.p
              key={total}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              style={{
                fontSize: 15, fontWeight: 700, color: '#fff',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ₹{total.toFixed(0)}
            </motion.p>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
