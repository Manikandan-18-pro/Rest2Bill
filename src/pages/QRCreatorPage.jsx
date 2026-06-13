import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Download, Copy, Check, Table2, Printer,
  RefreshCw, Settings2, Palette, Image as ImageIcon,
  ExternalLink, Share2, Eye, ChevronDown, AlertCircle,
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';

// ─── Inline QR library (pure-JS, no npm needed) ──────────────────────────────
// We'll use a canvas-based approach drawing QR via the qrcodejs CDN approach
// but since we can't install packages easily, we'll use a data-URL approach
// via the Google Charts API (offline-capable with canvas fallback)

const QR_COLORS = [
  { label: 'Forest',   fg: '#1a3a28', bg: '#ffffff' },
  { label: 'Emerald',  fg: '#2e8b57', bg: '#eafaf1' },
  { label: 'Navy',     fg: '#1a2744', bg: '#ffffff' },
  { label: 'Crimson',  fg: '#c0392b', bg: '#fff9f9' },
  { label: 'Purple',   fg: '#6c3483', bg: '#fdf4ff' },
  { label: 'Charcoal', fg: '#2c3e50', bg: '#ecf0f1' },
  { label: 'Gold',     fg: '#7d5a00', bg: '#fffbf0' },
  { label: 'Classic',  fg: '#000000', bg: '#ffffff' },
];

const QR_SIZES = [
  { label: 'Small (150px)',  value: 150 },
  { label: 'Medium (250px)', value: 250 },
  { label: 'Large (400px)',  value: 400 },
  { label: 'XL (600px)',     value: 600 },
];

function generateQRUrl(text, size, fg, bg) {
  const fgHex = fg.replace('#', '');
  const bgHex = bg.replace('#', '');
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${fgHex}&bgcolor=${bgHex}&format=png&margin=10`;
}

// ─── QR Preview Card ──────────────────────────────────────────────────────────
function QRPreviewCard({ qr, onDownload, onCopy, copied }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 20, overflow: 'hidden',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)',
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 20px', background: 'linear-gradient(135deg, var(--gold), var(--gold-bright))',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <QrCode size={20} color="#fff" />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Table {qr.table} QR Code</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>
            {qr.label || `Table ${qr.table}`}
          </div>
        </div>
      </div>

      {/* QR image */}
      <div style={{
        padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center',
        background: qr.bg, minHeight: 180,
      }}>
        {!imgLoaded && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={20} color="var(--text-muted)" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Generating QR...</span>
          </div>
        )}
        <img
          src={qr.imgUrl}
          alt={`QR Table ${qr.table}`}
          onLoad={() => setImgLoaded(true)}
          style={{ display: imgLoaded ? 'block' : 'none', maxWidth: '100%', borderRadius: 8 }}
        />
      </div>

      {/* URL */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{
          padding: '10px 12px', borderRadius: 10, background: 'var(--bg-elevated)',
          border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-secondary)',
          wordBreak: 'break-all', fontFamily: 'monospace',
        }}>
          {qr.url}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 20px' }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onCopy(qr.url)}
          style={{
            flex: 1, padding: '9px 0', borderRadius: 9, cursor: 'pointer',
            border: '1.5px solid var(--border)', background: copied ? 'var(--gold-dim)' : 'var(--bg-elevated)',
            color: copied ? 'var(--gold)' : 'var(--text-secondary)',
            fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 5, transition: 'all 0.18s',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy URL</>}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onDownload(qr)}
          style={{
            flex: 1, padding: '9px 0', borderRadius: 9, cursor: 'pointer',
            border: 'none', background: 'linear-gradient(135deg, var(--gold), var(--gold-bright))',
            color: '#fff', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 5,
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <Download size={12} /> Download
        </motion.button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QRCreatorPage() {
  const { activeHotelId, activeHotel } = useHotel();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  const [baseUrl, setBaseUrl]   = useState(window.location.origin + '/order');
  const [tableFrom, setTableFrom] = useState(1);
  const [tableTo, setTableTo]   = useState(5);
  const [tableLabel, setTableLabel] = useState('Table');
  const [selectedColor, setSelectedColor] = useState(QR_COLORS[0]);
  const [selectedSize, setSelectedSize]   = useState(QR_SIZES[1]);
  const [generated, setGenerated] = useState([]);
  const [copied, setCopied] = useState(null);
  const [tab, setTab] = useState('generator'); // generator | preview
  const [noHotelError, setNoHotelError] = useState(false);

  // Build the full URL with hotel_id embedded so the menu page knows which hotel's food to show
  const buildOrderUrl = (tableNum) =>
    `${baseUrl}?table=${tableNum}&hotel=${activeHotelId || ''}`;

  const handleGenerate = () => {
    if (!activeHotelId) { setNoHotelError(true); setTimeout(() => setNoHotelError(false), 3000); return; }
    setNoHotelError(false);
    const from = Math.max(1, Math.min(tableFrom, 200));
    const to   = Math.max(from, Math.min(tableTo, 200));
    const qrs = [];
    for (let t = from; t <= to; t++) {
      const url = buildOrderUrl(t);
      qrs.push({
        table: t,
        label: `${tableLabel} ${t}`,
        url,
        fg: selectedColor.fg,
        bg: selectedColor.bg,
        size: selectedSize.value,
        imgUrl: generateQRUrl(url, selectedSize.value, selectedColor.fg, selectedColor.bg),
      });
    }
    setGenerated(qrs);
    setTab('preview');
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (qr) => {
    const a = document.createElement('a');
    a.href = qr.imgUrl;
    a.download = `QR-${qr.label.replace(/\s+/g, '-')}.png`;
    a.target = '_blank';
    a.click();
  };

  const handleDownloadAll = () => {
    generated.forEach((qr, i) => {
      setTimeout(() => handleDownload(qr), i * 400);
    });
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -0.5 }}>
          QR Code Creator
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          Generate table QR codes so guests can scan and order directly from their phones
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {[
          { id: 'generator', label: 'Generator', icon: Settings2 },
          { id: 'preview',   label: `Preview ${generated.length > 0 ? `(${generated.length})` : ''}`, icon: Eye },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px',
              borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              border: `1.5px solid ${tab === id ? 'var(--gold)' : 'var(--border)'}`,
              background: tab === id ? 'var(--gold-dim)' : 'var(--bg-card)',
              color: tab === id ? 'var(--gold)' : 'var(--text-secondary)',
              transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif',
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'generator' ? (
          <motion.div
            key="gen"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: 20, alignItems: 'start' }}
            className="qr-layout"
          >
            {/* Left: settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* URL Settings */}
              <div style={{
                background: 'var(--bg-card)', borderRadius: 16, padding: '22px',
                border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ExternalLink size={14} color="var(--gold)" /> URL Configuration
                </h3>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                    BASE URL
                  </label>
                  <input
                    value={baseUrl}
                    onChange={e => setBaseUrl(e.target.value)}
                    placeholder="https://yourapp.com/order"
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 10,
                      border: '1.5px solid var(--border)', background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    The QR will point to: <span style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{baseUrl}?table=N&hotel={activeHotelId || '…'}</span>
                  </div>
                </div>
              </div>

              {/* Table Range */}
              <div style={{
                background: 'var(--bg-card)', borderRadius: 16, padding: '22px',
                border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Table2 size={14} color="var(--gold)" /> Table Configuration
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                      FROM TABLE
                    </label>
                    <input
                      type="number" min={1} max={200} value={tableFrom}
                      onChange={e => setTableFrom(Number(e.target.value))}
                      style={{
                        width: '100%', padding: '11px 14px', borderRadius: 10,
                        border: '1.5px solid var(--border)', background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                      TO TABLE
                    </label>
                    <input
                      type="number" min={1} max={200} value={tableTo}
                      onChange={e => setTableTo(Number(e.target.value))}
                      style={{
                        width: '100%', padding: '11px 14px', borderRadius: 10,
                        border: '1.5px solid var(--border)', background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                      LABEL PREFIX
                    </label>
                    <input
                      value={tableLabel}
                      onChange={e => setTableLabel(e.target.value)}
                      placeholder="Table"
                      style={{
                        width: '100%', padding: '11px 14px', borderRadius: 10,
                        border: '1.5px solid var(--border)', background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                  Will generate <strong style={{ color: 'var(--gold)' }}>{Math.max(0, tableTo - tableFrom + 1)}</strong> QR code(s)
                </div>
              </div>

              {/* Color & Size */}
              <div style={{
                background: 'var(--bg-card)', borderRadius: 16, padding: '22px',
                border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Palette size={14} color="var(--gold)" /> Appearance
                </h3>

                {/* Color presets */}
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, display: 'block' }}>
                  COLOR SCHEME
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                  {QR_COLORS.map(c => (
                    <motion.div
                      key={c.label}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setSelectedColor(c)}
                      style={{
                        borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                        border: `2px solid ${selectedColor.label === c.label ? 'var(--gold)' : 'var(--border)'}`,
                        transition: 'border 0.15s',
                      }}
                    >
                      <div style={{ height: 36, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 3, background: c.fg,
                          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, padding: 3,
                        }}>
                          {[...Array(9)].map((_, i) => (
                            <div key={i} style={{ background: i % 2 === 0 ? c.fg : c.bg, borderRadius: 1 }} />
                          ))}
                        </div>
                      </div>
                      <div style={{
                        padding: '4px', textAlign: 'center', fontSize: 10, fontWeight: 600,
                        color: selectedColor.label === c.label ? 'var(--gold)' : 'var(--text-muted)',
                        background: 'var(--bg-elevated)',
                      }}>
                        {c.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Size */}
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                  QR CODE SIZE
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {QR_SIZES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setSelectedSize(s)}
                      style={{
                        padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                        border: `1.5px solid ${selectedSize.value === s.value ? 'var(--gold)' : 'var(--border)'}`,
                        background: selectedSize.value === s.value ? 'var(--gold-dim)' : 'var(--bg-elevated)',
                        color: selectedSize.value === s.value ? 'var(--gold)' : 'var(--text-secondary)',
                        transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: generate panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Hotel badge — shows which hotel's menu the QR will serve */}
              {activeHotel && (
                <div style={{
                  background: 'var(--bg-elevated)', borderRadius: 12, padding: '12px 16px',
                  border: '1.5px solid var(--gold)', display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <AlertCircle size={14} color="var(--gold)" />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.05em' }}>LINKED HOTEL</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 1 }}>{activeHotel.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1, fontFamily: 'monospace' }}>ID: {activeHotelId}</div>
                  </div>
                </div>
              )}

              {/* Preview sample */}
              <div style={{
                background: 'var(--bg-card)', borderRadius: 16, padding: '22px',
                border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 14 }}>
                  SAMPLE PREVIEW
                </div>
                <div style={{
                  background: selectedColor.bg, borderRadius: 12, padding: 16,
                  display: 'inline-block', border: '1px solid var(--border)',
                }}>
                  <img
                    src={generateQRUrl(buildOrderUrl(tableFrom), 150, selectedColor.fg, selectedColor.bg)}
                    alt="QR sample"
                    style={{ display: 'block', borderRadius: 6 }}
                  />
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {tableLabel} {tableFrom}
                </div>
                <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {buildOrderUrl(tableFrom)}
                </div>
              </div>

              {/* Summary */}
              <div style={{
                background: 'var(--bg-elevated)', borderRadius: 14, padding: '16px',
                border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>SUMMARY</div>
                {[
                  ['Tables', `${tableFrom} – ${tableTo}`],
                  ['Count', `${Math.max(0, tableTo - tableFrom + 1)} QR codes`],
                  ['Size', `${selectedSize.value} × ${selectedSize.value} px`],
                  ['Color', selectedColor.label],
                  ['Hotel', activeHotel?.name || '–'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* No hotel error */}
              {noHotelError && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(224,85,85,0.1)', border: '1.5px solid rgba(224,85,85,0.35)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <AlertCircle size={14} color="#e05555" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#e05555' }}>
                    No hotel selected. Please select a hotel from the sidebar first.
                  </span>
                </div>
              )}

              {/* Generate button */}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleGenerate}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, var(--gold), var(--gold-bright))',
                  color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 4px 16px rgba(58,155,101,0.35)',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                <QrCode size={18} />
                Generate {Math.max(0, tableTo - tableFrom + 1)} QR Code{tableTo - tableFrom !== 0 ? 's' : ''}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          >
            {generated.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                <QrCode size={48} strokeWidth={1} style={{ marginBottom: 14, opacity: 0.4 }} />
                <div style={{ fontSize: 15, fontWeight: 600 }}>No QR codes generated yet</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Configure and generate QR codes in the Generator tab</div>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setTab('generator')}
                  style={{
                    marginTop: 16, padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                    border: 'none', background: 'var(--gold)', color: '#fff',
                    fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  Go to Generator
                </motion.button>
              </div>
            ) : (
              <>
                {/* Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{generated.length}</strong> QR codes generated
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTab('generator')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                        borderRadius: 9, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        border: '1.5px solid var(--border)', background: 'var(--bg-card)',
                        color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      <RefreshCw size={12} /> Re-configure
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownloadAll}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                        borderRadius: 9, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                        border: 'none', background: 'linear-gradient(135deg, var(--gold), var(--gold-bright))',
                        color: '#fff', fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      <Download size={12} /> Download All
                    </motion.button>
                  </div>
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {generated.map(qr => (
                    <QRPreviewCard
                      key={qr.table}
                      qr={qr}
                      onDownload={handleDownload}
                      onCopy={handleCopy}
                      copied={copied === qr.url}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}