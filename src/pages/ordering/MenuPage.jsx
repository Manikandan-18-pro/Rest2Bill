import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, ShoppingBag, Plus, Minus, ChevronLeft,
  Utensils, AlertCircle, Loader2,
  Salad, Soup, Flame, Wheat, Fish, IceCream, Coffee, UtensilsCrossed,
  Drumstick, Egg, Sun, CupSoda, BookOpen,
} from 'lucide-react';

// ── Category icon map ──────────────────────────────────────────────────────────
const CAT_ICONS = {
  starters:  Salad,
  mains:     UtensilsCrossed,
  rice:      Utensils,
  breads:    Wheat,
  grills:    Flame,
  seafood:   Fish,
  desserts:  IceCream,
  drinks:    CupSoda,
  beverages: Coffee,
  breakfast: Egg,
};
function getCatIcon(cat) {
  const Icon = CAT_ICONS[cat] || Utensils;
  return Icon;
}
import { useCart } from '../../context/CartContext';

// ── Design tokens ──────────────────────────────────────────────────────────────
const D = {
  bg:          '#f0f7f2',
  bgCard:      '#ffffff',
  accent:      '#2a7a4b',
  accentDark:  '#1e5c38',
  accentLight: '#4caf74',
  accentBg:    '#edf7f1',
  text:        '#0d1f14',
  textSub:     '#2e5040',
  textMuted:   '#6a9478',
  border:      'rgba(42,122,75,0.14)',
  headerBg:    'rgba(240,247,242,0.96)',
  gold:        '#c8903a',
  pillActive:  '#2a7a4b',
};

// ── Google Fonts ───────────────────────────────────────────────────────────────
const FONT_LINK = document.createElement('link');
FONT_LINK.rel = 'stylesheet';
FONT_LINK.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=DM+Sans:wght@400;500;600;700&display=swap';
if (!document.head.querySelector('[href*="Cormorant+Garamond"]')) document.head.appendChild(FONT_LINK);

// ── Category config — order, labels ───────────────────────────────────────────
const CAT_CONFIG = {
  starters:  { label: 'Starters',      order: 1 },
  mains:     { label: 'Main Course',   order: 2 },
  rice:      { label: 'Rice & Biryani',order: 3 },
  breads:    { label: 'Breads',        order: 4 },
  grills:    { label: 'Grills',        order: 5 },
  seafood:   { label: 'Seafood',       order: 6 },
  desserts:  { label: 'Sweets',        order: 7 },
  drinks:    { label: 'Cold Drinks',   order: 8 },
  beverages: { label: 'Beverages',     order: 9 },
  breakfast: { label: 'Breakfast',     order: 0 },
};

function getCatLabel(cat) { return CAT_CONFIG[cat]?.label || cat; }
function getCatOrder(cat) { return CAT_CONFIG[cat]?.order ?? 99; }

// ── Image map ──────────────────────────────────────────────────────────────────
const NAME_IMAGE_MAP = [
  { keys: ['biryani'],                                              url: 'https://images.unsplash.com/photo-1563379091339-03246963c4b1?w=600&q=80' },
  { keys: ['paneer tikka'],                                         url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80' },
  { keys: ['butter chicken'],                                       url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80' },
  { keys: ['dal makhani','dal'],                                    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80' },
  { keys: ['palak paneer','palak'],                                 url: 'https://images.unsplash.com/photo-1601050690293-ee6e17c4cfd9?w=600&q=80' },
  { keys: ['coffee','cappuccino','latte','espresso'],               url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80' },
  { keys: ['tea','chai'],                                           url: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&q=80' },
  { keys: ['dosa','dosai'],                                         url: 'https://images.unsplash.com/photo-1630514969818-94aeee312d67?w=600&q=80' },
  { keys: ['idli','idly'],                                          url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80' },
  { keys: ['vada','medu'],                                          url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80' },
  { keys: ['samosa'],                                               url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80' },
  { keys: ['naan'],                                                 url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&q=80' },
  { keys: ['roti','chapati','paratha'],                             url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80' },
  { keys: ['fried rice'],                                           url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80' },
  { keys: ['burger'],                                               url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80' },
  { keys: ['sandwich'],                                             url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80' },
  { keys: ['pizza'],                                                url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80' },
  { keys: ['chicken','tandoori'],                                   url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80' },
  { keys: ['mutton','lamb'],                                        url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80' },
  { keys: ['kebab','seekh'],                                        url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80' },
  { keys: ['fish'],                                                 url: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=600&q=80' },
  { keys: ['prawn','shrimp'],                                       url: 'https://images.unsplash.com/photo-1565680018093-ebb6b9ab5460?w=600&q=80' },
  { keys: ['crab','seafood'],                                       url: 'https://images.unsplash.com/photo-1550367083-9fa5411cb303?w=600&q=80' },
  { keys: ['juice','smoothie'],                                     url: 'https://images.unsplash.com/photo-1534353473418-4cfa0861c3b5?w=600&q=80' },
  { keys: ['lassi','shake'],                                        url: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&q=80' },
  { keys: ['cold'],                                                 url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&q=80' },
  { keys: ['ice cream','gelato','kulfi'],                           url: 'https://images.unsplash.com/photo-1570197571499-166b36435e9f?w=600&q=80' },
  { keys: ['gulab jamun','rasgulla'],                               url: 'https://images.unsplash.com/photo-1601050690293-ee6e17c4cfd9?w=600&q=80' },
  { keys: ['halwa','kheer','payasam'],                              url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80' },
  { keys: ['cake','pastry','brownie','waffle'],                     url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80' },
  { keys: ['soup'],                                                 url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80' },
  { keys: ['salad'],                                                url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80' },
  { keys: ['spring roll'],                                          url: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600&q=80' },
  { keys: ['rogan josh'],                                           url: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=600&q=80' },
];
const FALLBACK_CAT_IMAGES = {
  starters:  'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600&q=80',
  mains:     'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
  rice:      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80',
  breads:    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
  grills:    'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
  seafood:   'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=600&q=80',
  desserts:  'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80',
  drinks:    'https://images.unsplash.com/photo-1534353473418-4cfa0861c3b5?w=600&q=80',
  beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80',
  breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80',
  default:   'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
};

function resolveImage(item) {
  if (item.image_url && item.image_url.trim()) return item.image_url.trim();
  const name = (item.name || '').toLowerCase();
  for (const entry of NAME_IMAGE_MAP) {
    if (entry.keys.some(k => name.includes(k))) return entry.url;
  }
  return FALLBACK_CAT_IMAGES[item.cat] || FALLBACK_CAT_IMAGES.default;
}

// ── Responsive hook ────────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isMobile;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MenuPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const table   = params.get('table') || sessionStorage.getItem('rms_table') || '1';
  const hotelId = (
    params.get('hotel') || params.get('hotel_id') || params.get('hotelId') ||
    sessionStorage.getItem('rms_hotel_id') || ''
  );
  if (hotelId) sessionStorage.setItem('rms_hotel_id', hotelId);
  if (table)   sessionStorage.setItem('rms_table', table);

  const { items: cartItems, addItem, updateQty, setIsOpen, totalItems } = useCart();
  const [menuItems, setMenuItems]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [activeCat, setActiveCat]         = useState('all');
  const [search, setSearch]               = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchRef = useRef(null);
  const catNavRef = useRef(null);
  const isMobile  = useIsMobile();

  // ── Fetch menu ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hotelId) { setError('No hotel specified. Please scan the correct QR code.'); setLoading(false); return; }
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/menu-items?hotel_id=${encodeURIComponent(hotelId)}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const raw = await res.json();
        const h = new Date().getHours();
        const slot = h>=6&&h<11?'morning':h>=11&&h<15?'afternoon':h>=15&&h<19?'evening':h>=19&&h<23?'night':null;
        const mapped = raw
          .filter(i => i.enabled !== false)
          .filter(i => !slot || !i.timeSlots || i.timeSlots.includes(slot))
          .map(i => ({
            id:        i.id,
            name:      i.name,
            cat:       (i.cat || i.category || 'mains').toLowerCase().trim(),
            price:     parseFloat(i.price),
            image_url: i.image || i.image_url || '',
            veg:       i.veg,
            badge:     i.badge || null,
            desc:      i.desc || '',
          }));
        setMenuItems(mapped);
      } catch (err) {
        if (err.name !== 'AbortError') setError('Could not load menu. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [hotelId]);

  useEffect(() => {
    if (showMobileSearch && searchRef.current) setTimeout(() => searchRef.current?.focus(), 100);
  }, [showMobileSearch]);

  // ── Derived data ───────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const found = [...new Set(menuItems.map(i => i.cat).filter(Boolean))];
    return found.sort((a, b) => getCatOrder(a) - getCatOrder(b));
  }, [menuItems]);

  const filtered = useMemo(() => {
    let list = activeCat === 'all' ? menuItems : menuItems.filter(i => i.cat === activeCat);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(i => i.name.toLowerCase().includes(q)); }
    return list;
  }, [menuItems, activeCat, search]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(item => { if (!groups[item.cat]) groups[item.cat] = []; groups[item.cat].push(item); });
    return categories.filter(c => groups[c]).map(cat => ({ cat, items: groups[cat] }));
  }, [filtered, categories]);

  const getQty   = id => cartItems.find(i => i.id === id)?.qty || 0;
  const handleAdd = item => addItem({ id: item.id, name: item.name, price: item.price, cat: item.cat });
  const handleInc = item => updateQty(item.id, getQty(item.id) + 1);
  const handleDec = item => updateQty(item.id, getQty(item.id) - 1);

  // Scroll category pill into view
  const selectCat = (cat) => {
    setActiveCat(cat);
    // scroll pill into view
    if (catNavRef.current) {
      const btn = catNavRef.current.querySelector(`[data-cat="${cat}"]`);
      btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:'100vh', background:D.bg, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1, ease:'linear' }}>
        <Loader2 size={36} color={D.accent} />
      </motion.div>
      <p style={{ color:D.textSub, fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>Loading menu…</p>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) return (
    <div style={{ minHeight:'100vh', background:D.bg, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', padding:32, textAlign:'center', gap:16 }}>
      <AlertCircle size={44} color="#c0392b" />
      <p style={{ color:D.text, fontFamily:"'DM Sans',sans-serif", fontSize:16, fontWeight:600 }}>{error}</p>
      <motion.button whileTap={{ scale:0.95 }} onClick={() => window.location.reload()}
        style={{ padding:'12px 28px', borderRadius:999, border:'none', background:D.accent, color:'#fff', fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
        Retry
      </motion.button>
    </div>
  );

  // ── Main ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:D.bg, fontFamily:"'DM Sans',sans-serif" }}>

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <div style={{
        position:'sticky', top:0, zIndex:40,
        background: D.headerBg,
        backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderBottom:`1px solid ${D.border}`,
        boxShadow:'0 2px 20px rgba(13,31,20,0.08)',
      }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding: isMobile ? '12px 16px 0' : '16px 28px 0' }}>

          {/* Top row */}
          <div style={{ display:'flex', alignItems:'center', gap: isMobile ? 10 : 14, marginBottom: isMobile ? 12 : 14 }}>
            <motion.button
              whileHover={{ scale:1.05 }} whileTap={{ scale:0.9 }}
              onClick={() => navigate(`/order?table=${table}&hotel=${hotelId}`)}
              style={{
                width: isMobile ? 36 : 42, height: isMobile ? 36 : 42, borderRadius:999, flexShrink:0,
                background: D.accent, border:'none',
                display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                boxShadow:'0 4px 14px rgba(42,122,75,0.35)',
              }}>
              <ChevronLeft size={isMobile ? 18 : 20} color="#fff" strokeWidth={2.5} />
            </motion.button>

            <div style={{ flex:1, minWidth:0 }}>
              <h1 style={{
                fontFamily:"'Cormorant Garamond',serif",
                fontSize: isMobile ? 24 : 30, fontWeight:700, fontStyle:'italic',
                color:D.text, lineHeight:1.1, margin:0,
                letterSpacing:'-0.01em',
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              }}>Our Menu</h1>
              <p style={{ color:D.textMuted, fontSize: isMobile ? 11 : 12, marginTop:1, fontWeight:500, letterSpacing:'0.02em' }}>
                Table {table} &nbsp;·&nbsp; {menuItems.length} dishes
              </p>
            </div>

            {/* Desktop search */}
            {!isMobile && (
              <div style={{ position:'relative', width:220, display:'flex', alignItems:'center' }}>
                <Search size={14} color={D.textMuted} style={{ position:'absolute', left:14, pointerEvents:'none' }} />
                <input
                  ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search dishes…"
                  style={{
                    width:'100%', padding:'9px 34px 9px 36px',
                    background:'#fff', border:`1.5px solid ${D.border}`,
                    borderRadius:999, color:D.text, fontSize:13,
                    fontFamily:"'DM Sans',sans-serif", outline:'none',
                    boxShadow:'0 2px 8px rgba(13,31,20,0.06)',
                    transition:'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor=D.accent; e.target.style.boxShadow=`0 0 0 3px rgba(42,122,75,0.12)`; }}
                  onBlur={e => { e.target.style.borderColor=D.border; e.target.style.boxShadow='0 2px 8px rgba(13,31,20,0.06)'; }}
                />
                {search && (
                  <motion.button whileTap={{ scale:0.85 }} onClick={() => setSearch('')}
                    style={{ position:'absolute', right:10, background:'rgba(42,122,75,0.1)', border:'none', borderRadius:999, width:22, height:22, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <X size={11} color={D.accent} />
                  </motion.button>
                )}
              </div>
            )}

            {/* Mobile search toggle */}
            {isMobile && (
              <motion.button whileTap={{ scale:0.9 }} onClick={() => setShowMobileSearch(v => !v)}
                style={{
                  width:36, height:36, borderRadius:999, flexShrink:0,
                  background: showMobileSearch ? D.accent : '#fff',
                  border:`1.5px solid ${D.accent}`,
                  display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                }}>
                <Search size={16} color={showMobileSearch ? '#fff' : D.accent} />
              </motion.button>
            )}

            {/* Cart */}
            <motion.button
              whileHover={{ scale:1.06 }} whileTap={{ scale:0.93 }}
              onClick={() => setIsOpen(true)}
              style={{
                position:'relative', width: isMobile ? 36 : 46, height: isMobile ? 36 : 46, borderRadius:999, flexShrink:0,
                background: totalItems > 0 ? D.accent : '#fff',
                border:`2px solid ${D.accent}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', transition:'all 0.25s ease',
                boxShadow: totalItems > 0 ? '0 4px 20px rgba(42,122,75,0.40)' : '0 2px 8px rgba(13,31,20,0.1)',
              }}>
              <ShoppingBag size={isMobile ? 16 : 18} color={totalItems > 0 ? '#fff' : D.accent} />
              {totalItems > 0 && (
                <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                  transition={{ type:'spring', stiffness:500, damping:20 }}
                  style={{
                    position:'absolute', top:-6, right:-6,
                    width:18, height:18, borderRadius:999,
                    background:'#e74c3c', color:'#fff',
                    fontSize:9, fontWeight:700,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    border:`2px solid ${D.bg}`,
                  }}>
                  {totalItems}
                </motion.div>
              )}
            </motion.button>
          </div>

          {/* Mobile expandable search */}
          <AnimatePresence>
            {isMobile && showMobileSearch && (
              <motion.div
                initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                exit={{ opacity:0, height:0 }} transition={{ duration:0.2 }}
                style={{ overflow:'hidden', marginBottom:10 }}
              >
                <div style={{ position:'relative', display:'flex', alignItems:'center', paddingBottom:4 }}>
                  <Search size={14} color={D.textMuted} style={{ position:'absolute', left:14, pointerEvents:'none' }} />
                  <input
                    ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search dishes…"
                    style={{
                      width:'100%', padding:'10px 36px 10px 38px',
                      background:'#fff', border:`1.5px solid ${D.border}`,
                      borderRadius:999, color:D.text, fontSize:16,
                      fontFamily:"'DM Sans',sans-serif", outline:'none',
                    }}
                    onFocus={e => { e.target.style.borderColor=D.accent; }}
                    onBlur={e => { e.target.style.borderColor=D.border; }}
                  />
                  {search && (
                    <motion.button whileTap={{ scale:0.85 }} onClick={() => setSearch('')}
                      style={{ position:'absolute', right:12, background:'rgba(42,122,75,0.1)', border:'none', borderRadius:999, width:22, height:22, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <X size={11} color={D.accent} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Category pills ──────────────────────────────────────────────── */}
          <div ref={catNavRef} style={{
            display:'flex', gap: isMobile ? 6 : 8,
            overflowX:'auto', paddingBottom:14,
            scrollbarWidth:'none', msOverflowStyle:'none',
            WebkitOverflowScrolling:'touch',
          }}>
            {/* "All" pill */}
            {[{ id:'all', label:'All', Icon: BookOpen }, ...categories.map(c => ({ id:c, label:getCatLabel(c), Icon: getCatIcon(c) }))].map(({ id, label, Icon }) => {
              const active = activeCat === id;
              return (
                <motion.button
                  key={id} data-cat={id}
                  whileTap={{ scale:0.94 }}
                  onClick={() => selectCat(id)}
                  style={{
                    display:'flex', alignItems:'center', gap: isMobile ? 4 : 6,
                    padding: isMobile ? '7px 14px' : '8px 18px',
                    borderRadius:999,
                    border: active ? 'none' : `1.5px solid ${D.border}`,
                    cursor:'pointer', whiteSpace:'nowrap', flexShrink:0,
                    fontSize: isMobile ? 12 : 13, fontWeight: active ? 700 : 500,
                    fontFamily:"'DM Sans',sans-serif",
                    transition:'all 0.2s ease',
                    background: active ? D.accent : '#fff',
                    color: active ? '#fff' : D.textSub,
                    boxShadow: active ? '0 4px 16px rgba(42,122,75,0.30)' : '0 1px 4px rgba(13,31,20,0.06)',
                  }}>
                  <Icon size={isMobile ? 13 : 14} strokeWidth={2} color={active ? '#fff' : D.accent} />
                  {label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding: isMobile ? '4px 12px 100px' : '4px 28px 100px' }}>

        {filtered.length === 0 ? (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            style={{ textAlign:'center', padding:'80px 20px' }}>
            <Utensils size={52} color={D.textMuted} strokeWidth={1.2} style={{ marginBottom:20 }} />
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: isMobile ? 22 : 28, fontWeight:700, fontStyle:'italic', color:D.text, marginBottom:8 }}>No dishes found</p>
            <p style={{ color:D.textMuted, fontSize:14 }}>Try a different search or category</p>
          </motion.div>
        ) : (
          grouped.map(({ cat, items }, groupIdx) => (
            <motion.section
              key={cat}
              initial={{ opacity:0, y:24 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay: groupIdx * 0.06, duration:0.5, ease:[0.16,1,0.3,1] }}
            >
              {/* Category heading */}
              <div style={{
                display:'flex', alignItems:'center', gap: isMobile ? 10 : 16,
                margin: isMobile ? '28px 0 14px' : '40px 0 20px',
              }}>
                {(() => { const CatIcon = getCatIcon(cat); return <CatIcon size={isMobile ? 20 : 26} color={D.accent} strokeWidth={1.8} />; })()}
                <h2 style={{
                  fontFamily:"'Cormorant Garamond',serif",
                  fontSize: isMobile ? 22 : 28, fontWeight:700, fontStyle:'italic',
                  color:D.text, margin:0, letterSpacing:'-0.01em', whiteSpace:'nowrap',
                }}>{getCatLabel(cat)}</h2>
                <div style={{ flex:1, height:'1.5px', background:`linear-gradient(to right, rgba(42,122,75,0.35), transparent)`, borderRadius:2 }} />
                <span style={{
                  fontSize:11, fontWeight:600, color:D.accent,
                  background: D.accentBg, border:`1px solid rgba(42,122,75,0.2)`,
                  borderRadius:999, padding:'3px 10px',
                  fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap',
                }}>
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Grid */}
              <div style={{
                display:'grid',
                gridTemplateColumns: isMobile
                  ? 'repeat(2, 1fr)'
                  : 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: isMobile ? 12 : 20,
              }}>
                {items.map((item, idx) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    qty={getQty(item.id)}
                    delay={groupIdx * 0.06 + idx * 0.04}
                    onAdd={() => handleAdd(item)}
                    onInc={() => handleInc(item)}
                    onDec={() => handleDec(item)}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </motion.section>
          ))
        )}
      </div>

      <style>{`
        ::-webkit-scrollbar { display: none; }
        * { box-sizing: border-box; }
        @media (max-width: 639px) { input { font-size: 16px !important; } }
      `}</style>
    </div>
  );
}

// ── Food Card ──────────────────────────────────────────────────────────────────
function FoodCard({ item, qty, delay, onAdd, onInc, onDec, isMobile }) {
  const isActive = qty > 0;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered]     = useState(false);
  const imgSrc  = resolveImage(item);
  const fallback = FALLBACK_CAT_IMAGES[item.cat] || FALLBACK_CAT_IMAGES.default;

  return (
    <motion.div
      layout
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0, transition:{ delay, duration:0.45, ease:[0.16,1,0.3,1] } }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        background: D.bgCard,
        borderRadius: isMobile ? 16 : 20,
        overflow:'hidden',
        boxShadow: hovered
          ? '0 16px 48px rgba(13,31,20,0.16), 0 4px 12px rgba(13,31,20,0.08)'
          : '0 2px 12px rgba(13,31,20,0.08), 0 1px 3px rgba(13,31,20,0.05)',
        border: isActive ? `2px solid ${D.accent}` : '2px solid transparent',
        transition:'box-shadow 0.3s ease, border-color 0.3s ease, transform 0.2s ease',
        transform: hovered && !isMobile ? 'translateY(-5px)' : 'translateY(0)',
      }}
    >
      {/* Image */}
      <div style={{ height: isMobile ? 130 : 190, position:'relative', overflow:'hidden', background:'#ede8e0' }}>
        {!imgLoaded && (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {(() => { const CatIcon = getCatIcon(item.cat); return <CatIcon size={32} color={D.textMuted} strokeWidth={1.2} style={{ opacity:0.4 }} />; })()}
          </div>
        )}
        <motion.img
          src={imgSrc} alt={item.name} loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={e => { e.target.src = fallback; setImgLoaded(true); }}
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration:0.4, ease:[0.16,1,0.3,1] }}
          style={{ width:'100%', height:'100%', objectFit:'cover', opacity: imgLoaded ? 1 : 0, transition:'opacity 0.4s ease', display:'block' }}
        />

        {/* Veg/Non-veg indicator */}
        <div style={{
          position:'absolute', top:8, left:8,
          width: isMobile ? 16 : 18, height: isMobile ? 16 : 18,
          border:`2px solid ${item.veg === false ? '#c0392b' : '#27ae60'}`,
          borderRadius:3, background:'#fff',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 1px 4px rgba(0,0,0,0.15)',
        }}>
          <div style={{
            width: isMobile ? 8 : 9, height: isMobile ? 8 : 9, borderRadius:'50%',
            background: item.veg === false ? '#c0392b' : '#27ae60',
          }} />
        </div>

        {/* Badge */}
        {item.badge && (
          <div style={{
            position:'absolute', top:8, right:8,
            background: D.accent,
            borderRadius:999, padding: isMobile ? '2px 7px' : '3px 9px',
            fontSize: isMobile ? 8 : 9, fontWeight:700, color:'#fff',
            letterSpacing:'0.5px', textTransform:'uppercase',
            fontFamily:"'DM Sans',sans-serif",
            boxShadow:'0 2px 8px rgba(42,122,75,0.4)',
          }}>
            {item.badge}
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: isMobile ? '10px 12px 12px' : '14px 16px 16px' }}>
        <h3 style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize: isMobile ? 14 : 17, fontWeight:700,
          color:D.text, margin:'0 0 2px',
          lineHeight:1.3, letterSpacing:'-0.01em',
          display:'-webkit-box', WebkitLineClamp: isMobile ? 2 : 2,
          WebkitBoxOrient:'vertical', overflow:'hidden',
        }}>
          {item.name}
        </h3>

        {item.desc && !isMobile && (
          <p style={{
            fontSize:11.5, color:D.textMuted, margin:'0 0 8px', lineHeight:1.4,
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
            fontFamily:"'DM Sans',sans-serif",
          }}>
            {item.desc}
          </p>
        )}

        <p style={{
          fontFamily:"'DM Sans',sans-serif",
          fontSize: isMobile ? 15 : 19, fontWeight:700,
          color: D.accent, margin: item.desc && !isMobile ? '0 0 10px' : '4px 0 10px',
          letterSpacing:'-0.02em',
        }}>
          ₹{item.price}
        </p>

        {/* Add / Qty */}
        <AnimatePresence mode="wait">
          {qty === 0 ? (
            <motion.button
              key="add"
              initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
              transition={{ duration:0.15 }}
              whileTap={{ scale:0.97 }}
              onClick={onAdd}
              style={{
                width:'100%', padding: isMobile ? '9px 0' : '11px 0',
                borderRadius:999, border:'none',
                background: D.accent, color:'#fff',
                fontSize: isMobile ? 12 : 13.5, fontWeight:700,
                fontFamily:"'DM Sans',sans-serif", cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                boxShadow:'0 4px 16px rgba(42,122,75,0.30)',
                letterSpacing:'0.01em',
              }}
            >
              <Plus size={isMobile ? 13 : 14} strokeWidth={3} />
              {isMobile ? 'Add' : 'Add to Meal'}
            </motion.button>
          ) : (
            <motion.div
              key="qty"
              initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
              transition={{ duration:0.15 }}
              style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                background: D.accent, borderRadius:999,
                padding: isMobile ? '3px 3px 3px 12px' : '4px 4px 4px 16px',
                boxShadow:'0 4px 16px rgba(42,122,75,0.30)',
              }}>
              {!isMobile && (
                <span style={{ color:'#fff', fontSize:12, fontWeight:600, fontFamily:"'DM Sans',sans-serif", opacity:0.9 }}>
                  In Cart
                </span>
              )}
              <div style={{ display:'flex', alignItems:'center', gap: isMobile ? 2 : 4, marginLeft:'auto' }}>
                <motion.button whileTap={{ scale:0.85 }} onClick={onDec}
                  style={{
                    width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius:999, border:'none',
                    background:'rgba(255,255,255,0.18)', color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                  }}>
                  <Minus size={isMobile ? 12 : 13} strokeWidth={3} />
                </motion.button>
                <motion.span key={qty}
                  initial={{ scale:1.4 }} animate={{ scale:1 }} transition={{ duration:0.2, type:'spring' }}
                  style={{ color:'#fff', fontSize: isMobile ? 14 : 15, fontWeight:800, minWidth: isMobile ? 22 : 26, textAlign:'center', fontFamily:"'DM Sans',sans-serif" }}>
                  {qty}
                </motion.span>
                <motion.button whileTap={{ scale:0.85 }} onClick={onInc}
                  style={{
                    width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius:999, border:'none',
                    background:'#fff', color:D.accent,
                    display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                  }}>
                  <Plus size={isMobile ? 12 : 13} strokeWidth={3} color={D.accent} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}