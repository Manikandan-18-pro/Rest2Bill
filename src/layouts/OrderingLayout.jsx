import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CartProvider } from '../context/CartContext';
import CartSidebar from '../components/ordering/CartSidebar';
import FloatingCartButton from '../components/ordering/FloatingCartButton';

export default function OrderingLayout() {
  const location = useLocation();
  const isReviewPage = location.pathname.includes('/order/review');

  return (
    <CartProvider>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0d1f14 0%, #142b1c 35%, #1a3824 65%, #122419 100%)',
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background ambient orbs */}
        <div style={{
          position: 'fixed', top: '-10vh', right: '-5vw',
          width: '55vw', height: '55vw', maxWidth: 480,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(58,155,101,0.18) 0%, transparent 65%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'fixed', bottom: '-8vh', left: '-8vw',
          width: '50vw', height: '50vw', maxWidth: 420,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(58,155,101,0.12) 0%, transparent 65%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        {/* Subtle grain texture overlay */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.48, ease: [0.16,1,0.3,1] } }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)', transition: { duration: 0.24 } }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating cart button - hidden on review page */}
        {!isReviewPage && <FloatingCartButton />}

        {/* Cart sidebar */}
        <CartSidebar />
      </div>
    </CartProvider>
  );
}
