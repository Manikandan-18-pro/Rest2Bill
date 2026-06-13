import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const pageVariants = {
  initial: { opacity: 0, y: 18, filter: 'blur(8px)', scale: 0.99 },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)', scale: 1,
    transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -10, filter: 'blur(5px)', scale: 0.99,
    transition: { duration: 0.26, ease: [0.4, 0, 0.2, 1] } },
};

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const marginLeft = isMobile ? 0 : (collapsed ? 72 : 268);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <motion.div
        animate={{ marginLeft }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}
        className="main-content"
      >
        <Header onMobileMenuOpen={() => setMobileOpen(true)} />

        <main
          style={{ flex: 1, overflow: 'auto', position: 'relative', padding: isMobile ? '14px' : '28px' }}
        >
          {/* Ambient page glow */}
          <div style={{
            position: 'fixed', top: 0, right: 0, width: '45vw', height: '45vh',
            background: 'radial-gradient(ellipse at top right, rgba(72,160,100,0.1) 0%, transparent 65%)',
            pointerEvents: 'none', zIndex: 0,
          }} />
          <div style={{
            position: 'fixed', bottom: 0, left: '15vw', width: '30vw', height: '30vh',
            background: 'radial-gradient(ellipse at bottom, rgba(72,160,100,0.06) 0%, transparent 65%)',
            pointerEvents: 'none', zIndex: 0,
          }} />

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ position: 'relative', zIndex: 1 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}