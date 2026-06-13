import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Hotel Registry ─────────────────────────────────────────────────────────
export const HOTELS = [
  {
    id: 'hotel_001',
    name: 'Grand Spice Palace',
    shortName: 'GSP',
    city: 'Mumbai',
    state: 'Maharashtra',
    plan: 'Enterprise',
    status: 'active',
    cuisine: 'North Indian, Mughlai',
    tables: 40,
    staff: 18,
    revenue: '₹2.1L',
    orders: 1842,
    rating: 4.9,
    joinedDate: '12 Jan 2024',
    phone: '+91 98200 11234',
    email: 'gsp@grandspice.in',
    branding: {
      primary: '#c0392b',
      accent: '#e74c3c',
      secondary: '#f39c12',
      gradient: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 50%, #f39c12 100%)',
      logoInitials: 'GSP',
      tagline: 'A Royal Culinary Experience',
      logoColor: '#ffffff',
      bgPattern: 'mughal',
    },
  },
  {
    id: 'hotel_002',
    name: 'The Curry Leaf',
    shortName: 'TCL',
    city: 'Delhi',
    state: 'Delhi',
    plan: 'Pro',
    status: 'active',
    cuisine: 'South Indian, Pan-Asian',
    tables: 32,
    staff: 14,
    revenue: '₹1.8L',
    orders: 1620,
    rating: 4.8,
    joinedDate: '5 Mar 2024',
    phone: '+91 98100 22345',
    email: 'info@curryleaf.in',
    branding: {
      primary: '#16a085',
      accent: '#1abc9c',
      secondary: '#2ecc71',
      gradient: 'linear-gradient(135deg, #16a085 0%, #1abc9c 60%, #2ecc71 100%)',
      logoInitials: 'TCL',
      tagline: 'Flavours of the South',
      logoColor: '#ffffff',
      bgPattern: 'leaves',
    },
  },
  {
    id: 'hotel_003',
    name: 'Saffron Heights',
    shortName: 'SH',
    city: 'Bangalore',
    state: 'Karnataka',
    plan: 'Pro',
    status: 'active',
    cuisine: 'Continental, Indian',
    tables: 28,
    staff: 12,
    revenue: '₹1.6L',
    orders: 1430,
    rating: 4.7,
    joinedDate: '20 Apr 2024',
    phone: '+91 98400 33456',
    email: 'hello@saffronheights.in',
    branding: {
      primary: '#8e44ad',
      accent: '#9b59b6',
      secondary: '#e67e22',
      gradient: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 50%, #e67e22 100%)',
      logoInitials: 'SH',
      tagline: 'Elevated Dining, Elevated Living',
      logoColor: '#ffffff',
      bgPattern: 'geometric',
    },
  },
  {
    id: 'hotel_004',
    name: 'Royal Darbar',
    shortName: 'RD',
    city: 'Jaipur',
    state: 'Rajasthan',
    plan: 'Basic',
    status: 'active',
    cuisine: 'Rajasthani, Indian',
    tables: 24,
    staff: 10,
    revenue: '₹1.2L',
    orders: 1100,
    rating: 4.6,
    joinedDate: '8 Jun 2024',
    phone: '+91 94100 44567',
    email: 'royal@darbar.in',
    branding: {
      primary: '#d4a017',
      accent: '#f1c40f',
      secondary: '#e74c3c',
      gradient: 'linear-gradient(135deg, #b8860b 0%, #d4a017 50%, #f1c40f 100%)',
      logoInitials: 'RD',
      tagline: 'Where Royalty Dines',
      logoColor: '#1a1a1a',
      bgPattern: 'rajasthan',
    },
  },
  {
    id: 'hotel_005',
    name: 'Marina Bay Kitchen',
    shortName: 'MBK',
    city: 'Chennai',
    state: 'Tamil Nadu',
    plan: 'Basic',
    status: 'active',
    cuisine: 'Seafood, South Indian',
    tables: 20,
    staff: 9,
    revenue: '₹98K',
    orders: 890,
    rating: 4.5,
    joinedDate: '15 Jul 2024',
    phone: '+91 98300 55678',
    email: 'info@marinabay.in',
    branding: {
      primary: '#2980b9',
      accent: '#3498db',
      secondary: '#1abc9c',
      gradient: 'linear-gradient(135deg, #1a5276 0%, #2980b9 50%, #3498db 100%)',
      logoInitials: 'MBK',
      tagline: 'Fresh from the Ocean',
      logoColor: '#ffffff',
      bgPattern: 'waves',
    },
  },
  {
    id: 'hotel_006',
    name: 'Urban Masala Co.',
    shortName: 'UMC',
    city: 'Pune',
    state: 'Maharashtra',
    plan: 'Enterprise',
    status: 'active',
    cuisine: 'Fusion, Modern Indian',
    tables: 35,
    staff: 16,
    revenue: '₹1.5L',
    orders: 1350,
    rating: 4.8,
    joinedDate: '12 Nov 2024',
    phone: '+91 98200 10123',
    email: 'info@urbanmasala.in',
    branding: {
      primary: '#e67e22',
      accent: '#f39c12',
      secondary: '#c0392b',
      gradient: 'linear-gradient(135deg, #e67e22 0%, #f39c12 60%, #c0392b 100%)',
      logoInitials: 'UMC',
      tagline: 'Modern Spice, Timeless Taste',
      logoColor: '#ffffff',
      bgPattern: 'urban',
    },
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────
const HotelContext = createContext(null);

export function HotelProvider({ children }) {
  // Read user reactively so HotelContext updates right after login (not just on refresh)
  function readUser() {
    try { return JSON.parse(sessionStorage.getItem('rms_user') || 'null'); } catch { return null; }
  }

  const [_user, setUser] = useState(readUser);
  const isAdmin = _user?.role === 'admin';
  const adminHotelId = _user?.hotelId || null;

  // Re-sync whenever sessionStorage is updated by AuthContext login/logout
  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'rms_user' || e.key === null) {
        setUser(readUser());
      }
    }
    window.addEventListener('storage', onStorage);

    return () => { window.removeEventListener('storage', onStorage); };
  }, []);

  const [activeHotelId, setActiveHotelId] = useState(() => {
    const u = readUser();
    if (u?.role === 'admin' && u?.hotelId) {
      sessionStorage.setItem('rms_active_hotel', u.hotelId);
      return u.hotelId;
    }
    return sessionStorage.getItem('rms_active_hotel') || null;
  });

  // When user changes (e.g. after login), update activeHotelId immediately
  useEffect(() => {
    if (isAdmin && adminHotelId) {
      sessionStorage.setItem('rms_active_hotel', adminHotelId);
      setActiveHotelId(adminHotelId);
    }
  }, [isAdmin, adminHotelId]);
  const [switching, setSwitching] = useState(false);
  const [switchTarget, setSwitchTarget] = useState(null);

  // Admin only sees their own hotel; super_admin sees all
  const visibleHotels = isAdmin
    ? HOTELS.filter(h => h.id === adminHotelId)
    : HOTELS;

  const activeHotel = HOTELS.find(h => h.id === activeHotelId) || null;

  const switchHotel = useCallback((hotelId) => {
    if (isAdmin) return;  // admin cannot switch hotels
    if (hotelId === activeHotelId) return;
    setSwitchTarget(hotelId);
    setSwitching(true);

    setTimeout(() => {
      setActiveHotelId(hotelId);
      sessionStorage.setItem('rms_active_hotel', hotelId);
      setSwitching(false);
      setSwitchTarget(null);
    }, 600);
  }, [activeHotelId, isAdmin]);

  const clearHotel = useCallback(() => {
    if (isAdmin) return;  // admin stays locked to their hotel
    setActiveHotelId(null);
    sessionStorage.removeItem('rms_active_hotel');
  }, [isAdmin]);

  // Apply branding CSS vars when active hotel changes
  useEffect(() => {
    const hotel = HOTELS.find(h => h.id === activeHotelId);
    const root = document.documentElement;

    if (hotel) {
      root.style.setProperty('--hotel-primary', hotel.branding.primary);
      root.style.setProperty('--hotel-accent', hotel.branding.accent);
      root.style.setProperty('--hotel-secondary', hotel.branding.secondary);
      root.style.setProperty('--hotel-gradient', hotel.branding.gradient);
      root.style.setProperty('--hotel-logo-color', hotel.branding.logoColor);
    } else {
      root.style.removeProperty('--hotel-primary');
      root.style.removeProperty('--hotel-accent');
      root.style.removeProperty('--hotel-secondary');
      root.style.removeProperty('--hotel-gradient');
      root.style.removeProperty('--hotel-logo-color');
    }
  }, [activeHotelId]);

  return (
    <HotelContext.Provider value={{
      hotels: visibleHotels,
      activeHotel,
      activeHotelId,
      switchHotel,
      clearHotel,
      switching,
      switchTarget,
      isAdmin,
    }}>
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error('useHotel must be used inside HotelProvider');
  return ctx;
}