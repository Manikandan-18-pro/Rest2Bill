import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BarChart2, History, User,
  ChevronLeft, ChevronRight, ChevronDown,
  LogOut, Menu, X,
  ShieldCheck, ChefHat, Crown,
  DollarSign, Utensils, ShoppingBag, Receipt,
  ClipboardList, Workflow, Building2, Globe, BarChart3, Users,
  QrCode, UtensilsCrossed, LayoutGrid,
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { useAuth } from './AuthContext';

const ADMIN_NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    label: 'Statistics', icon: BarChart2,
    children: [
      { path: '/statistics/revenue', label: 'Revenue',  icon: DollarSign },
      { path: '/statistics/food',    label: 'Food',     icon: Utensils },
      { path: '/statistics/orders',  label: 'Orders',   icon: ShoppingBag },
    ],
  },
  {
    label: 'Admin Panel', icon: UtensilsCrossed,
    children: [
      { path: '/admin/food',       label: 'Food Management', icon: ChefHat    },
      { path: '/admin/qr-creator', label: 'QR Creator',      icon: QrCode     },
      { path: '/admin/tables',     label: 'Table Management',icon: LayoutGrid  },
    ],
  },
  { path: '/history',          label: 'Billing History', icon: History },
  { path: '/billing/generate', label: 'Generate Bill',   icon: Receipt  },
  { path: '/profile',          label: 'Profile',         icon: User     },
];

const SUPER_ADMIN_NAV_ITEMS = [
  { path: '/superadmin/dashboard', label: 'SA Dashboard',    icon: Globe     },
  { path: '/superadmin/hotels',    label: 'Hotel Mgmt',      icon: Building2 },
  { path: '/superadmin/analytics', label: 'Global Analytics',icon: BarChart3 },
  { path: '/superadmin/users',     label: 'User Management', icon: Users     },
  { path: '/profile',              label: 'Profile',         icon: User      },
];

const KITCHEN_NAV_ITEMS = [
  { path: '/kitchen/dashboard', label: 'Kitchen Dashboard', icon: ChefHat       },
  { path: '/kitchen/orders',    label: 'Kitchen Orders',    icon: ClipboardList },
  { path: '/profile',           label: 'Profile',           icon: User          },
];

const ROLE_ICONS  = { admin: ShieldCheck, kitchen: ChefHat, super_admin: Crown };
const ROLE_COLORS = { admin: '#2d9e5f', kitchen: '#2478c8', super_admin: '#d63b3b' };

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const { activeHotel } = useHotel();
  const navigate = useNavigate();
  const location = useLocation();
  const statsActive = location.pathname.startsWith('/statistics');
  const adminActive = location.pathname.startsWith('/admin');
  const [statsOpen, setStatsOpen] = useState(statsActive);
  const [adminOpen, setAdminOpen] = useState(adminActive);

  const RoleIcon  = ROLE_ICONS[user?.role] || ShieldCheck;
  const roleColor = ROLE_COLORS[user?.role] || '#2d9e5f';
  const navItems  = user?.role === 'kitchen' ? KITCHEN_NAV_ITEMS : user?.role === 'super_admin' ? SUPER_ADMIN_NAV_ITEMS : ADMIN_NAV_ITEMS;

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleCollapse = () => setCollapsed(v => { if (!v) { setStatsOpen(false); setAdminOpen(false); } return !v; });

  function NavItem({ item, isMobile, depth = 0 }) {
    const isParent  = !!item.children;
    const isActive  = !isParent && location.pathname === item.path;
    const isAnyChildActive = isParent && item.children.some(c => location.pathname === c.path);
    const isExpanded = isParent && (
      (item.label === 'Statistics' && statsOpen) ||
      (item.label === 'Admin Panel' && adminOpen)
    );
    const show = !collapsed || isMobile;

    if (isParent) {
      return (
        <div style={{ marginBottom: 3 }}>
          <motion.div
            whileHover={{ x: show ? 4 : 0, transition: { type: "spring", stiffness: 400, damping: 28 } }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={() => {
              if (!show) {
                if (item.label === 'Admin Panel') { navigate('/admin/food'); return; }
                navigate('/statistics/revenue'); return;
              }
              if (item.label === 'Statistics') setStatsOpen(v => !v);
              else if (item.label === 'Admin Panel') setAdminOpen(v => !v);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: show ? '10px 12px' : '11px 0',
              justifyContent: show ? 'flex-start' : 'center',
              borderRadius: 11,
              background: isAnyChildActive ? `${roleColor}12` : 'transparent',
              border: isAnyChildActive ? `1px solid ${roleColor}25` : '1px solid transparent',
              cursor: 'pointer', position: 'relative',
              transition: 'background 0.22s ease, border 0.22s ease',
            }}
            onMouseEnter={e => { if (!isAnyChildActive) e.currentTarget.style.background = 'rgba(74,163,107,0.08)'; }}
            onMouseLeave={e => { if (!isAnyChildActive) e.currentTarget.style.background = 'transparent'; }}
          >
            {isAnyChildActive && show && (
              <motion.div layoutId="activeBar" style={{
                position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)',
                width: 3, height: '55%', borderRadius: 3,
                background: `linear-gradient(180deg, ${roleColor}, ${roleColor}60)`,
                boxShadow: `0 0 8px ${roleColor}80`,
              }} />
            )}
            <item.icon size={17} color={isAnyChildActive ? roleColor : '#3e4257'} style={{ flexShrink: 0, transition: 'color 0.2s' }} />
            <AnimatePresence>
              {show && (
                <motion.span
                  initial={{ opacity: 0, width: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, width: 'auto', filter: 'blur(0px)' }} exit={{ opacity: 0, width: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2 }}
                  style={{ flex: 1, fontSize: 13.5, fontWeight: isAnyChildActive ? 600 : 400, color: isAnyChildActive ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', transition: 'color 0.2s', letterSpacing: '0.01em' }}
                >{item.label}</motion.span>
              )}
            </AnimatePresence>
            {show && (
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
                <ChevronDown size={13} color="#3e4257" />
              </motion.div>
            )}
          </motion.div>

          <AnimatePresence initial={false}>
            {isExpanded && show && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ margin: '4px 0 4px 14px', borderLeft: `1px solid ${roleColor}20`, paddingLeft: 10 }}>
                  {item.children.map(child => <NavItem key={child.path} item={child} isMobile={isMobile} depth={1} />)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <NavLink to={item.path} onClick={() => isMobile && setMobileOpen(false)} style={{ textDecoration: 'none', display: 'block', marginBottom: 3 }}>
        {({ isActive: navActive }) => (
          <motion.div
            whileHover={{ x: show ? 4 : 0, transition: { type: "spring", stiffness: 400, damping: 28 } }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              display: 'flex', alignItems: 'center', gap: depth === 1 ? 8 : 10,
              padding: show ? (depth === 1 ? '8px 10px' : '10px 12px') : '11px 0',
              justifyContent: show ? 'flex-start' : 'center',
              borderRadius: 11,
              background: navActive ? `${roleColor}12` : 'transparent',
              border: navActive ? `1px solid ${roleColor}25` : '1px solid transparent',
              cursor: 'pointer', position: 'relative',
              transition: 'background 0.22s ease, border 0.22s ease',
            }}
            onMouseEnter={e => { if (!navActive) e.currentTarget.style.background = 'rgba(74,163,107,0.08)'; }}
            onMouseLeave={e => { if (!navActive) e.currentTarget.style.background = 'transparent'; }}
          >
            {navActive && show && depth === 0 && (
              <motion.div layoutId="activeBar" style={{
                position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)',
                width: 3, height: '55%', borderRadius: 3,
                background: `linear-gradient(180deg, ${roleColor}, ${roleColor}60)`,
                boxShadow: `0 0 8px ${roleColor}80`,
              }} />
            )}
            {navActive && depth === 1 && (
              <motion.div layoutId="subActiveBar" style={{
                position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)',
                width: 3, height: '50%', borderRadius: 3,
                background: roleColor, boxShadow: `0 0 6px ${roleColor}70`,
              }} />
            )}
            <item.icon
              size={depth === 1 ? 13 : 17}
              color={navActive ? roleColor : '#3e4257'}
              style={{ flexShrink: 0, transition: 'color 0.2s' }}
            />
            <AnimatePresence>
              {show && (
                <motion.span
                  initial={{ opacity: 0, width: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, width: 'auto', filter: 'blur(0px)' }} exit={{ opacity: 0, width: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2 }}
                  style={{ fontSize: depth === 1 ? 12.5 : 13.5, fontWeight: navActive ? 600 : 400, color: navActive ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', transition: 'color 0.2s', letterSpacing: '0.01em' }}
                >{item.label}</motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </NavLink>
    );
  }

  function SidebarContent({ isMobile = false }) {
    const show = !collapsed || isMobile;
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Brand */}
        <div style={{
          padding: show ? '18px 16px' : '18px 0',
          display: 'flex', alignItems: 'center',
          justifyContent: show ? 'space-between' : 'center',
          borderBottom: '1px solid var(--border)',
          minHeight: 'var(--header-height)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <motion.div
              whileHover={{ scale: 1.08, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                width: 38, height: 38, flexShrink: 0, borderRadius: 11,
                background: `linear-gradient(135deg, ${roleColor}20 0%, ${roleColor}08 100%)`,
                border: `1px solid ${roleColor}28`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19,
                boxShadow: `0 4px 16px ${roleColor}14`,
              }}>< Utensils size={19} style={{ color: roleColor }} /></motion.div>
            <AnimatePresence>
              {show && (
                <motion.div
                  initial={{ opacity: 0, width: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, width: 'auto', filter: 'blur(0px)' }} exit={{ opacity: 0, width: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.22 }}
                  style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                >
                  <div style={{
                    fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, fontSize: 17,
                    background: `linear-gradient(135deg, var(--text-primary), ${roleColor})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    letterSpacing: '-0.01em',
                  }}>Rest2Bill</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', marginTop: 1 }}>PREMIUM</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!isMobile && (
            <motion.button
              whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
              onClick={handleCollapse}
              style={{
                background: 'rgba(74,163,107,0.08)', border: '1px solid var(--border)',
                borderRadius: 9, width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${roleColor}14`; e.currentTarget.style.borderColor = `${roleColor}30`; e.currentTarget.style.color = roleColor; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,163,107,0.08)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </motion.button>
          )}
          {isMobile && (
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* User Badge */}
        <AnimatePresence>
          {show && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 11px',
                background: `${roleColor}0c`, border: `1px solid ${roleColor}20`,
                borderRadius: 11,
                transition: 'all 0.25s ease',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: `${roleColor}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <RoleIcon size={14} color={roleColor} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>
                    {user?.name || 'User'}
                  </div>
                  <div style={{ fontSize: 10.5, color: roleColor, fontWeight: 500, textTransform: 'capitalize', letterSpacing: '0.03em' }}>
                    {user?.role?.replace('_', ' ')}
                  </div>
                </div>
                {/* Online dot */}
                <div style={{ marginLeft: 'auto', position: 'relative' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#27a06b', boxShadow: '0 0 6px rgba(76,175,147,0.8)' }} />
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(76,175,147,0.4)', animation: 'pulse-ring 2s ease-out infinite' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed avatar */}
        {!show && (
          <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'center', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: `${roleColor}15`, border: `1px solid ${roleColor}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RoleIcon size={15} color={roleColor} />
            </div>
          </div>
        )}

        {/* Nav label */}
        <AnimatePresence>
          {show && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '14px 18px 6px', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}
            >Navigation</motion.p>
          )}
        </AnimatePresence>

        {/* Nav */}
        <nav style={{ flex: 1, padding: show ? '4px 8px' : '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
          {navItems.map(item => (
            <NavItem key={item.path || item.label} item={item} isMobile={isMobile} />
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: show ? '10px 8px' : '10px 0', borderTop: '1px solid var(--border)' }}>
          <motion.button
            whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 360, damping: 24 } }} whileTap={{ scale: 0.96 }}
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: 10, justifyContent: show ? 'flex-start' : 'center',
              padding: show ? '10px 12px' : '10px 0',
              borderRadius: 11, background: 'none', border: '1px solid transparent',
              color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.22s ease',
              fontFamily: 'DM Sans, sans-serif',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(224,85,85,0.08)'; e.currentTarget.style.color = '#d63b3b'; e.currentTarget.style.border = '1px solid rgba(224,85,85,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.border = '1px solid transparent'; }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            <AnimatePresence>
              {show && (
                <motion.span
                  initial={{ opacity: 0, width: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, width: 'auto', filter: 'blur(0px)' }} exit={{ opacity: 0, width: 0, filter: 'blur(4px)' }}
                  style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', letterSpacing: '0.01em' }}
                >Sign Out</motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 72 : 268 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          zIndex: 50, overflow: 'hidden', display: 'none',
        }}
        className="desktop-sidebar"
      >
        <SidebarContent />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,40,0.5)', zIndex: 100, backdropFilter: 'blur(6px)' }}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 268, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', zIndex: 101 }}
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function MobileMenuButton({ onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }}
      onClick={onClick}
      style={{
        background: 'rgba(74,163,107,0.08)', border: '1px solid var(--border)',
        borderRadius: 10, width: 38, height: 38,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'var(--text-secondary)',
      }}
    >
      <Menu size={17} />
    </motion.button>
  );
}