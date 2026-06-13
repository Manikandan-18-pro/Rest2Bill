// ─── Menu Data ────────────────────────────────────────────────────────────────
// Emoji used as visual placeholders; swap with real image URLs as needed

export const CATEGORIES = [
  { id: 'all',       label: 'All',         emoji: '' },
  { id: 'starters',  label: 'Starters',    emoji: '' },
  { id: 'mains',     label: 'Mains',       emoji: '' },
  { id: 'grills',    label: 'Grills',      emoji: '' },
  { id: 'seafood',   label: 'Seafood',     emoji: '' },
  { id: 'breads',    label: 'Breads',      emoji: '' },
  { id: 'rice',      label: 'Rice',        emoji: '' },
  { id: 'desserts',  label: 'Desserts',    emoji: '' },
  { id: 'drinks',    label: 'Drinks',      emoji: '' },
];

export const MENU_ITEMS = [
  // ── Starters ──────────────────────────────────────────────────────────────
  { id: 1, cat: 'starters', name: 'Paneer Tikka',        price: 220, emoji: '', desc: 'Marinated cottage cheese, bell peppers, chargrilled in tandoor', badge: 'Popular', veg: true },
  { id: 2, cat: 'starters', name: 'Chicken 65',           price: 250, emoji: '', desc: 'Crispy deep-fried chicken with curry leaves & green chillies', badge: 'Spicy', veg: false },
  { id: 3, cat: 'starters', name: 'Veg Spring Rolls',     price: 160, emoji: '', desc: 'Golden crispy rolls filled with seasoned mixed vegetables', badge: null, veg: true },
  { id: 4, cat: 'starters', name: 'Mutton Seekh Kebab',   price: 320, emoji: '', desc: 'Hand-minced mutton with aromatic spices, cooked over coal', badge: 'Chef\'s Pick', veg: false },
  { id: 5, cat: 'starters', name: 'Fish Finger Fry',      price: 280, emoji: '', desc: 'Crispy battered fish with mint chutney and lemon wedges', badge: null, veg: false },

  // ── Mains ─────────────────────────────────────────────────────────────────
  { id: 6,  cat: 'mains', name: 'Butter Chicken',         price: 340, emoji: '', desc: 'Tender chicken in rich tomato-cream gravy with fenugreek', badge: 'Best Seller', veg: false },
  { id: 7,  cat: 'mains', name: 'Dal Makhani',            price: 220, emoji: '', desc: 'Slow-cooked black lentils with butter and cream, overnight preparation', badge: 'Popular', veg: true },
  { id: 8,  cat: 'mains', name: 'Palak Paneer',           price: 260, emoji: '', desc: 'Fresh cottage cheese cubes in silky spinach gravy', badge: null, veg: true },
  { id: 9,  cat: 'mains', name: 'Rogan Josh',             price: 380, emoji: '', desc: 'Kashmiri lamb curry with whole spices and aromatic red chilli', badge: 'Signature', veg: false },
  { id: 10, cat: 'mains', name: 'Chettinad Chicken',      price: 360, emoji: '', desc: 'Fiery South Indian curry with freshly ground chettinad masala', badge: 'Spicy', veg: false },
  { id: 11, cat: 'mains', name: 'Veg Kolhapuri',          price: 240, emoji: '', desc: 'Mixed vegetables in bold, spiced Kolhapuri sauce', badge: null, veg: true },

  // ── Grills ────────────────────────────────────────────────────────────────
  { id: 12, cat: 'grills', name: 'Tandoori Mixed Grill',  price: 680, emoji: '', desc: 'Platter of chicken tikka, seekh kebab & reshmi kebab', badge: 'For 2', veg: false },
  { id: 13, cat: 'grills', name: 'Peri Peri Chicken',     price: 380, emoji: '', desc: 'Half chicken marinated in fiery peri-peri sauce, grilled', badge: 'Spicy', veg: false },
  { id: 14, cat: 'grills', name: 'Mushroom Galouti',      price: 280, emoji: '', desc: 'Melt-in-mouth mushroom kebabs with saffron and rose water', badge: null, veg: true },

  // ── Seafood ───────────────────────────────────────────────────────────────
  { id: 15, cat: 'seafood', name: 'Prawn Masala',         price: 420, emoji: '', desc: 'Jumbo prawns in tangy coastal masala with coconut extract', badge: 'Chef\'s Pick', veg: false },
  { id: 16, cat: 'seafood', name: 'Fish Curry (Kerala)',  price: 360, emoji: '', desc: 'Traditional Kerala red fish curry with raw mango and kodampuli', badge: null, veg: false },
  { id: 17, cat: 'seafood', name: 'Crab Pepper Fry',      price: 540, emoji: '', desc: 'Fresh crab tossed in cracked pepper and curry leaf masala', badge: 'Signature', veg: false },

  // ── Breads ────────────────────────────────────────────────────────────────
  { id: 18, cat: 'breads', name: 'Butter Naan',           price:  50, emoji: '', desc: 'Soft leavened bread brushed with butter, baked in tandoor', badge: null, veg: true },
  { id: 19, cat: 'breads', name: 'Garlic Naan',           price:  70, emoji: '', desc: 'Fresh garlic and coriander naan, warm and fragrant', badge: 'Popular', veg: true },
  { id: 20, cat: 'breads', name: 'Parotta',               price:  40, emoji: '', desc: 'Flaky layered South Indian bread, made with refined flour', badge: null, veg: true },
  { id: 21, cat: 'breads', name: 'Laccha Paratha',        price:  60, emoji: '', desc: 'Whole wheat layered flatbread with ghee, crispy and light', badge: null, veg: true },

  // ── Rice ──────────────────────────────────────────────────────────────────
  { id: 22, cat: 'rice', name: 'Hyderabadi Biryani',      price: 380, emoji: '', desc: 'Slow-cooked basmati rice layered with aromatic mutton dum', badge: 'Best Seller', veg: false },
  { id: 23, cat: 'rice', name: 'Veg Dum Biryani',         price: 280, emoji: '', desc: 'Fragrant basmati with seasonal vegetables cooked dum style', badge: 'Popular', veg: true },
  { id: 24, cat: 'rice', name: 'Chicken Fried Rice',      price: 260, emoji: '', desc: 'Wok-tossed basmati with chicken, egg and spring onion', badge: null, veg: false },
  { id: 25, cat: 'rice', name: 'Jeera Rice',              price: 140, emoji: '', desc: 'Fragrant basmati tempered with cumin, ghee and bay leaf', badge: null, veg: true },

  // ── Desserts ──────────────────────────────────────────────────────────────
  { id: 26, cat: 'desserts', name: 'Gulab Jamun',         price:  90, emoji: '', desc: 'Soft milk solids dumplings soaked in rose saffron syrup', badge: null, veg: true },
  { id: 27, cat: 'desserts', name: 'Rasmalai',            price: 110, emoji: '', desc: 'Cottage cheese discs in saffron-cardamom milk, chilled', badge: 'Popular', veg: true },
  { id: 28, cat: 'desserts', name: 'Chocolate Lava Cake', price: 160, emoji: '', desc: 'Warm dark chocolate cake with molten centre, vanilla ice cream', badge: 'New', veg: true },
  { id: 29, cat: 'desserts', name: 'Kulfi Falooda',       price: 130, emoji: '', desc: 'Traditional frozen kulfi with rose syrup, vermicelli and basil', badge: null, veg: true },

  // ── Drinks ────────────────────────────────────────────────────────────────
  { id: 30, cat: 'drinks', name: 'Mango Lassi',           price:  90, emoji: '', desc: 'Thick yoghurt blended with Alphonso mango and cardamom', badge: 'Popular', veg: true },
  { id: 31, cat: 'drinks', name: 'Masala Chai',           price:  60, emoji: '', desc: 'Spiced Indian tea with ginger, cardamom and fresh milk', badge: null, veg: true },
  { id: 32, cat: 'drinks', name: 'Fresh Lime Soda',       price:  70, emoji: '', desc: 'Squeezed lime with sparkling water, choose sweet or salted', badge: null, veg: true },
  { id: 33, cat: 'drinks', name: 'Cold Coffee',           price: 100, emoji: '', desc: 'Blended with ice cream, strong espresso and milk', badge: null, veg: true },
  { id: 34, cat: 'drinks', name: 'Virgin Mojito',         price: 110, emoji: '', desc: 'Mint, lime, sugar syrup and soda with crushed ice', badge: 'New', veg: true },
];
