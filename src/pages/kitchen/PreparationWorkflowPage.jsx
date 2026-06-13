import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChefHat, Workflow } from 'lucide-react';

export default function PreparationWorkflowPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
      style={{ padding: '8px 0' }}
    >
      <button
        onClick={() => navigate(`/kitchen/orders/${id}`)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24,
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        <ArrowLeft size={15} /> Back to Order {id}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <ChefHat size={22} color="#2478c8" />
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Preparation Workflow
        </h1>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>
        Order <strong style={{ color: '#2478c8' }}>{id}</strong> · step-by-step prep guide
      </p>

      {/* Placeholder — build your workflow steps here */}
      <div style={{
        padding: 32, borderRadius: 16, textAlign: 'center',
        background: 'rgba(36,120,200,0.06)', border: '1px dashed rgba(36,120,200,0.25)',
      }}>
        <Workflow size={32} color="rgba(36,120,200,0.4)" style={{ marginBottom: 12 }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Workflow steps for <strong>{id}</strong> will appear here.
        </p>
      </div>
    </motion.div>
  );
}
