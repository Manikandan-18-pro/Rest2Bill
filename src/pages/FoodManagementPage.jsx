import { useState, useRef, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useAuth } from '../components/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit3, Search, Filter, Clock, Image as ImageIcon,
  Check, X, ToggleLeft, ToggleRight, ChefHat, Tag, DollarSign,
  Leaf, Flame, Star, Zap, Eye, EyeOff, Upload, AlertCircle,
  Sunrise, Salad, UtensilsCrossed, Sandwich, Wheat, Beef, Fish, Cake, Coffee, Utensils,
  Ban, CheckCircle, Circle, XCircle,
} from 'lucide-react';

// ─── Time slot definitions ────────────────────────────────────────────────────
const TIME_SLOTS = [
  { id: 'morning',   label: 'Morning',   time: '6:00 AM – 11:00 AM', color: '#f39c12', bg: '#fef9e7' },
  { id: 'afternoon', label: 'Afternoon', time: '11:00 AM – 3:00 PM', color: '#e67e22', bg: '#fef0e0' },
  { id: 'evening',   label: 'Evening',   time: '3:00 PM – 7:00 PM',  color: '#9b59b6', bg: '#f5eef8' },
  { id: 'night',     label: 'Night',     time: '7:00 PM – 11:00 PM', color: '#2478c8', bg: '#eaf4fd' },
];

const CATEGORIES = [
  { id: 'breakfast', label: 'Breakfast', icon: Sunrise },
  { id: 'starters',  label: 'Starters',  icon: Salad },
  { id: 'mains',     label: 'Mains',     icon: UtensilsCrossed },
  { id: 'breads',    label: 'Breads',    icon: Sandwich },
  { id: 'rice',      label: 'Rice',      icon: Wheat },
  { id: 'grills',    label: 'Grills',    icon: Beef },
  { id: 'seafood',   label: 'Seafood',   icon: Fish },
  { id: 'desserts',  label: 'Desserts',  icon: Cake },
  { id: 'drinks',    label: 'Drinks',    icon: Coffee },
];

const BADGES = ['Popular', 'Chef\'s Pick', 'Best Seller', 'New', 'Spicy', 'Signature', 'For 2', null];

const INITIAL_FOODS = [
  {
    id: 1, name: 'Idly', category: 'breakfast', price: 60, veg: true, badge: 'Popular',
    desc: 'Soft steamed rice cakes served with sambar and chutney',
    image: null, enabled: true,
    timeSlots: ['morning'],
  },
  {
    id: 2, name: 'Masala Dosa', category: 'breakfast', price: 80, veg: true, badge: null,
    desc: 'Crispy fermented crepe filled with spiced potato masala',
    image: null, enabled: true,
    timeSlots: ['morning', 'afternoon'],
  },
  {
    id: 3, name: 'Butter Chicken', category: 'mains', price: 340, veg: false, badge: 'Best Seller',
    desc: 'Tender chicken in rich tomato-cream gravy with fenugreek',
    image: null, enabled: true,
    timeSlots: ['afternoon', 'evening', 'night'],
  },
  {
    id: 4, name: 'Paneer Tikka', category: 'starters', price: 220, veg: true, badge: 'Popular',
    desc: 'Marinated cottage cheese, bell peppers, chargrilled in tandoor',
    image: null, enabled: true,
    timeSlots: ['afternoon', 'evening', 'night'],
  },
  {
    id: 5, name: 'Gulab Jamun', category: 'desserts', price: 90, veg: true, badge: null,
    desc: 'Soft milk solids dumplings soaked in rose saffron syrup',
    image: null, enabled: true,
    timeSlots: ['afternoon', 'evening', 'night'],
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
function getCurrentSlot() {
  const h = new Date().getHours();
  if (h >= 6  && h < 11) return 'morning';
  if (h >= 11 && h < 15) return 'afternoon';
  if (h >= 15 && h < 19) return 'evening';
  if (h >= 19 && h < 23) return 'night';
  return null;
}

// ─── Empty Form ───────────────────────────────────────────────────────────────
const emptyForm = () => ({
  name: '', category: 'mains', price: '', veg: true, badge: null,
  desc: '', image: null, enabled: true,
  timeSlots: ['afternoon', 'evening', 'night'],
});

// ─── Image uploader ───────────────────────────────────────────────────────────
function ImageUploader({ value, onChange }) {
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange(ev.target.result); // base64 data URL — persists across sessions
    };
    reader.readAsDataURL(file);
    // Reset input value so the same file can be picked again after clearing
    e.target.value = '';
  };

  const handleClick = () => {
    // Reset value before opening so re-selecting same file triggers onChange
    if (fileRef.current) fileRef.current.value = '';
    fileRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: '100%', height: 140, borderRadius: 12,
        border: `2px dashed ${value ? 'transparent' : 'var(--border-accent)'}`,
        background: value ? 'transparent' : 'var(--bg-elevated)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', overflow: 'hidden', position: 'relative',
        transition: 'all 0.2s',
      }}
    >
      {value ? (
        <>
          <img src={value} alt="food" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}
          >
            <Upload size={22} color="#fff" />
            <span style={{ color: '#fff', fontSize: 12, marginTop: 6, fontWeight: 600 }}>Click to change image</span>
          </div>
        </>
      ) : (
        <>
          <ImageIcon size={28} color="var(--gold)" strokeWidth={1.5} />
          <span style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8 }}>Click to upload food photo</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 3 }}>JPG, PNG, WEBP</span>
        </>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}

// ─── Time Slot Picker ─────────────────────────────────────────────────────────
function TimeSlotPicker({ value, onChange }) {
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter(v => v !== id));
    else onChange([...value, id]);
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {TIME_SLOTS.map(slot => {
        const active = value.includes(slot.id);
        return (
          <motion.div
            key={slot.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => toggle(slot.id)}
            style={{
              padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
              border: `1.5px solid ${active ? slot.color : 'var(--border)'}`,
              background: active ? slot.bg : 'var(--bg-elevated)',
              transition: 'all 0.18s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Clock size={13} color={active ? slot.color : 'var(--text-muted)'} />
              <span style={{ fontSize: 12, fontWeight: 600, color: active ? slot.color : 'var(--text-secondary)' }}>
                {slot.label}
              </span>
              {active && <Check size={11} color={slot.color} style={{ marginLeft: 'auto' }} />}
            </div>
            <div style={{ fontSize: 10, color: active ? slot.color : 'var(--text-muted)', opacity: 0.85 }}>
              {slot.time}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Food Form Modal ──────────────────────────────────────────────────────────
function FoodFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || emptyForm());
  const isEdit = !!initial;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const valid = form.name.trim() && form.price && Number(form.price) > 0 && form.timeSlots.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', borderRadius: 20, width: '100%', maxWidth: 560,
          maxHeight: '90vh', overflow: 'auto', boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 28px 16px', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChefHat size={18} color="var(--gold)" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                {isEdit ? 'Edit Food Item' : 'Add New Food Item'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Fill in the details below
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Image */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block' }}>
                FOOD PHOTO
              </label>
              {form.image && (
                <button
                  onClick={() => set('image', null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#d63b3b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                >
                  <X size={11} /> Remove
                </button>
              )}
            </div>
            <ImageUploader value={form.image} onChange={v => set('image', v)} />
          </div>

          {/* Name */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
              FOOD NAME *
            </label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Idly, Butter Chicken..."
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                border: '1.5px solid var(--border)', background: 'var(--bg-elevated)',
                color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                fontFamily: 'DM Sans, sans-serif',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
              DESCRIPTION
            </label>
            <textarea
              value={form.desc}
              onChange={e => set('desc', e.target.value)}
              placeholder="Briefly describe the dish..."
              rows={2}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10, resize: 'vertical',
                border: '1.5px solid var(--border)', background: 'var(--bg-elevated)',
                color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                fontFamily: 'DM Sans, sans-serif',
              }}
            />
          </div>

          {/* Price + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                PRICE (₹) *
              </label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="number" min={0} value={form.price}
                  onChange={e => set('price', e.target.value)}
                  placeholder="0"
                  style={{
                    width: '100%', padding: '11px 14px 11px 34px', borderRadius: 10,
                    border: '1.5px solid var(--border)', background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                CATEGORY
              </label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: '1.5px solid var(--border)', background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                  fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                }}
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Veg + Badge */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                TYPE
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[true, false].map(v => (
                  <button
                    key={String(v)}
                    onClick={() => set('veg', v)}
                    style={{
                      flex: 1, padding: '9px 0', borderRadius: 9, cursor: 'pointer',
                      border: `1.5px solid ${form.veg === v ? (v ? '#2e8b57' : '#d63b3b') : 'var(--border)'}`,
                      background: form.veg === v ? (v ? '#eafaf1' : '#fdf0f0') : 'var(--bg-elevated)',
                      color: form.veg === v ? (v ? '#2e8b57' : '#d63b3b') : 'var(--text-secondary)',
                      fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 5, transition: 'all 0.18s',
                    }}
                  >
                    {v ? <Leaf size={12} /> : <Flame size={12} />}
                    {v ? 'Veg' : 'Non-Veg'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                BADGE
              </label>
              <select
                value={form.badge || ''}
                onChange={e => set('badge', e.target.value || null)}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: '1.5px solid var(--border)', background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                  fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                }}
              >
                <option value="">None</option>
                {BADGES.filter(Boolean).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
              AVAILABLE TIME SLOTS *
            </label>
            <TimeSlotPicker value={form.timeSlots} onChange={v => set('timeSlots', v)} />
            {form.timeSlots.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <AlertCircle size={12} color="#d63b3b" />
                <span style={{ fontSize: 11, color: '#d63b3b' }}>Select at least one time slot</span>
              </div>
            )}
          </div>

          {/* Active toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderRadius: 12, background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Active on Menu</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Customers can see and order this item
              </div>
            </div>
            <motion.div
              whileTap={{ scale: 0.92 }}
              onClick={() => set('enabled', !form.enabled)}
              style={{ cursor: 'pointer' }}
            >
              {form.enabled
                ? <ToggleRight size={30} color="var(--gold)" />
                : <ToggleLeft size={30} color="var(--text-muted)" />}
            </motion.div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '12px', borderRadius: 11,
                border: '1.5px solid var(--border)', background: 'transparent',
                color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => valid && onSave(form)}
              style={{
                flex: 2, padding: '12px', borderRadius: 11,
                border: 'none',
                background: valid ? 'linear-gradient(135deg, var(--gold), var(--gold-bright))' : 'var(--border)',
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: valid ? 'pointer' : 'not-allowed',
                fontFamily: 'DM Sans, sans-serif', boxShadow: valid ? 'var(--shadow-md)' : 'none',
              }}
            >
              {isEdit ? 'Save Changes' : 'Add Food Item'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Food Card ────────────────────────────────────────────────────────────────
function FoodCard({ food, onToggle, onEdit, onDelete }) {
  const currentSlot = getCurrentSlot();
  const isAvailableNow = currentSlot && (food.timeSlots || []).includes(currentSlot);
  const cat = CATEGORIES.find(c => c.id === food.category);
  const slots = TIME_SLOTS.filter(s => (food.timeSlots || []).includes(s.id));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.28 }}
      style={{
        background: 'var(--bg-card)', borderRadius: 16,
        border: `1.5px solid ${food.enabled ? 'var(--border)' : 'rgba(214,59,59,0.2)'}`,
        overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
        opacity: food.enabled ? 1 : 0.72,
        transition: 'border 0.2s, opacity 0.2s',
      }}
    >
      {/* Image strip */}
      <div style={{
        height: 120, background: food.image ? 'transparent' : 'var(--bg-elevated)',
        position: 'relative', overflow: 'hidden',
      }}>
        {food.image ? (
          <img src={food.image} alt={food.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {cat?.icon ? <cat.icon size={40} style={{ color: 'var(--text-muted)', opacity: 0.5 }} /> : <Utensils size={40} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />}
          </div>
        )}

        {/* Top badges */}
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4 }}>
          {food.badge && (
            <span style={{
              padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
              background: '#2d9e5f', color: '#fff',
            }}>{food.badge}</span>
          )}
          <span style={{
            padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
            background: food.veg ? '#2e8b57' : '#d63b3b', color: '#fff',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {food.veg ? <Circle size={8} fill="#fff" /> : <Circle size={8} fill="#fff" />}
              {food.veg ? 'VEG' : 'NON'}
            </span>
          </span>
        </div>

        {/* Status pill */}
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <span style={{
            padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
            background: food.enabled
              ? (isAvailableNow ? '#eafaf1' : '#fef9e7')
              : '#fdf0f0',
            color: food.enabled
              ? (isAvailableNow ? '#2e8b57' : '#e67e22')
              : '#d63b3b',
            border: `1px solid ${food.enabled ? (isAvailableNow ? '#2e8b5740' : '#e67e2240') : '#d63b3b40'}`,
          }}>
            {!food.enabled
              ? <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Ban size={10} />Disabled</span>
              : isAvailableNow
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><CheckCircle size={10} />Available Now</span>
                : <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} />Not Now</span>
            }
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{food.name}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)', whiteSpace: 'nowrap', marginLeft: 8 }}>
            ₹{food.price}
          </div>
        </div>
        {food.desc && (
          <div style={{
            fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {food.desc}
          </div>
        )}

        {/* Time slots */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {slots.map(s => (
            <span key={s.id} style={{
              padding: '2px 7px', borderRadius: 5, fontSize: 10, fontWeight: 500,
              background: s.bg, color: s.color, border: `1px solid ${s.color}30`,
            }}>
              <Clock size={8} style={{ display: 'inline', marginRight: 3 }} />
              {s.label}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onToggle(food.id)}
            title={food.enabled ? 'Disable item' : 'Enable item'}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer',
              border: `1.5px solid ${food.enabled ? '#d63b3b40' : 'var(--gold-pulse)'}`,
              background: food.enabled ? '#fdf0f0' : 'var(--gold-dim)',
              color: food.enabled ? '#d63b3b' : 'var(--gold)',
              fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 5, transition: 'all 0.18s',
            }}
          >
            {food.enabled ? <><EyeOff size={12} /> Disable</> : <><Eye size={12} /> Enable</>}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onEdit(food)}
            style={{
              width: 34, borderRadius: 8, cursor: 'pointer',
              border: '1.5px solid var(--border)', background: 'var(--bg-elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Edit3 size={13} color="var(--text-secondary)" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onDelete(food.id)}
            style={{
              width: 34, borderRadius: 8, cursor: 'pointer',
              border: '1.5px solid rgba(214,59,59,0.25)', background: '#fdf0f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Trash2 size={13} color="#d63b3b" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FoodManagementPage() {
  const { activeHotelId } = useHotel();
  const { getToken } = useAuth();

  const [foods, setFoods] = useState(INITIAL_FOODS);  // show sample data until fetch completes

  // Helper: auth headers
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  });

  // Load menu from backend when hotel changes
  useEffect(() => {
    if (!activeHotelId) return;
    fetch(`/api/menu?hotel_id=${encodeURIComponent(activeHotelId)}`, {
      headers: authHeaders(),
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const normalize = (item) => ({
          ...item,
          category: item.category || item.cat || 'mains',
          timeSlots: Array.isArray(item.timeSlots) && item.timeSlots.length
            ? item.timeSlots
            : ['morning', 'afternoon', 'evening', 'night'],
          enabled: item.enabled !== false,
          image: item.image || item.image_url || null,
        });
        const normalized = data.map(normalize);
        setFoods(normalized.length ? normalized : INITIAL_FOODS);
      })
      .catch(() => setFoods(INITIAL_FOODS));
  }, [activeHotelId]);

  // Save full menu to backend
  const saveMenuToBackend = async (updatedFoods) => {
    if (!activeHotelId) return;
    try {
      // Ensure items have the fields the backend expects
      const items = updatedFoods.map(f => ({
        ...f,
        cat: f.cat || f.category || 'mains',
        hotel_id: activeHotelId,
      }));
      await fetch('/api/menu/bulk', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ hotel_id: activeHotelId, items }),
      });
    } catch {}
  };

  // Wrap setFoods to also sync backend
  const updateFoods = (updater) => {
    setFoods(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveMenuToBackend(next);
      return next;
    });
  };
  const [modal, setModal]     = useState(null); // null | 'add' | food-object
  const [search, setSearch]   = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all | enabled | disabled | available-now

  const currentSlot = getCurrentSlot();

  const filtered = foods.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat === 'all' || f.category === filterCat;
    const matchStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'enabled' ? f.enabled :
      filterStatus === 'disabled' ? !f.enabled :
      filterStatus === 'available-now' ? (f.enabled && currentSlot && (f.timeSlots || []).includes(currentSlot)) :
      true;
    return matchSearch && matchCat && matchStatus;
  });

  const handleSave = (form) => {
    if (typeof modal === 'object' && modal?.id) {
      updateFoods(prev => prev.map(f => f.id === modal.id ? { ...f, ...form } : f));
    } else {
      updateFoods(prev => [...prev, { ...form, id: Date.now(), price: Number(form.price) }]);
    }
    setModal(null);
  };

  const handleToggle = (id) => updateFoods(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  const handleDelete = (id) => updateFoods(prev => prev.filter(f => f.id !== id));

  const stats = {
    total: foods.length,
    enabled: foods.filter(f => f.enabled).length,
    disabled: foods.filter(f => !f.enabled).length,
    availableNow: foods.filter(f => f.enabled && currentSlot && (f.timeSlots || []).includes(currentSlot)).length,
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -0.5 }}>
            Food Management
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Add, edit and control food availability by time slot
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setModal('add')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px',
            borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--gold), var(--gold-bright))',
            color: '#fff', fontSize: 14, fontWeight: 700,
            boxShadow: '0 4px 16px rgba(56,196,114,0.35)',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <Plus size={16} /> Add Food Item
        </motion.button>
      </div>

      {/* Stats strip */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Items',     value: stats.total,        color: 'var(--gold)',    icon: ChefHat },
          { label: 'Active',          value: stats.enabled,      color: '#2e8b57',        icon: Eye },
          { label: 'Disabled',        value: stats.disabled,     color: '#d63b3b',        icon: EyeOff },
          { label: 'Available Now',   value: stats.availableNow, color: '#e67e22',        icon: Clock },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{
            background: 'var(--bg-card)', borderRadius: 14, padding: '16px 18px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${color}15`,
            }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: -0.5 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search food items..."
            style={{
              width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10,
              border: '1.5px solid var(--border)', background: 'var(--bg-card)',
              color: 'var(--text-primary)', fontSize: 13, outline: 'none',
              fontFamily: 'DM Sans, sans-serif',
            }}
          />
        </div>

        {/* Category filter */}
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          style={{
            padding: '10px 14px', borderRadius: 10,
            border: '1.5px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-primary)', fontSize: 13, outline: 'none',
            fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
          }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'enabled', label: 'Active' },
            { id: 'disabled', label: 'Disabled' },
            { id: 'available-now', label: 'Available Now' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilterStatus(id)}
              style={{
                padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${filterStatus === id ? 'var(--gold)' : 'var(--border)'}`,
                background: filterStatus === id ? 'var(--gold-dim)' : 'var(--bg-card)',
                color: filterStatus === id ? 'var(--gold)' : 'var(--text-secondary)',
                transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Current time slot info */}
      {currentSlot && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
          padding: '8px 14px', borderRadius: 10, background: 'var(--gold-dim)',
          border: '1px solid var(--border-accent)', width: 'fit-content',
        }}>
          <Clock size={13} color="var(--gold)" />
          <span style={{ fontSize: 12, color: 'var(--text-gold)', fontWeight: 500 }}>
            Current time slot: <strong>{TIME_SLOTS.find(s => s.id === currentSlot)?.label}</strong>
            {' '}({TIME_SLOTS.find(s => s.id === currentSlot)?.time})
          </span>
        </div>
      )}

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}
          >
            <ChefHat size={40} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 15, fontWeight: 600 }}>No food items found</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your filters or add a new item</div>
          </motion.div>
        ) : (
          <div className="food-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
            {filtered.map(food => (
              <FoodCard
                key={food.id}
                food={food}
                onToggle={handleToggle}
                onEdit={f => setModal(f)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <FoodFormModal
            initial={typeof modal === 'object' ? modal : null}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}