import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers,
  Sparkles,
  Zap,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async () => {
    const res = await login('alex@flowdeck.dev', 'Password123!');
    if (res.success) {
      navigate('/board');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Banner Navigation */}
      <header
        style={{
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--surface-glass)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="brand-icon">
            <Layers size={22} />
          </div>
          <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>FlowDeck</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {isAuthenticated ? (
            <Link to="/board" className="btn btn-primary">
              <span>Go to Board</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <button type="button" className="btn btn-secondary" onClick={handleQuickDemo}>
                <span>Instant Demo</span>
              </button>
              <Link to="/auth" className="btn btn-primary">
                <span>Sign In</span>
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '80px 24px 60px',
          maxWidth: 1100,
          margin: '0 auto',
          textAlign: 'center'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--priority-medium-bg)',
              color: 'var(--priority-medium)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: 24,
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <Sparkles size={16} />
            <span>Next-Generation Agile Orchestration</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: 20
            }}
          >
            Orchestrate Team Tasks with{' '}
            <span
              style={{
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Unmatched Velocity
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              maxWidth: 720,
              margin: '0 auto 36px',
              lineHeight: 1.6
            }}
          >
            FlowDeck blends tactile drag-and-drop Kanban simplicity with instant optimistic
            updates, command palettes, live timeline activity, and deep team productivity analytics.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap'
            }}
          >
            <Link to="/auth?tab=register" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
              <span>Get Started Free</span>
              <ArrowRight size={18} />
            </Link>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleQuickDemo}
              style={{ padding: '12px 24px', fontSize: '1rem' }}
            >
              <Zap size={18} color="var(--priority-medium)" />
              <span>Launch 1-Click Demo</span>
            </button>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            marginTop: 70,
            textAlign: 'left'
          }}
        >
          <div
            className="kanban-column"
            style={{
              padding: 24,
              border: '1px solid var(--surface-glass-border)',
              background: 'var(--surface-glass)'
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-glow)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}
            >
              <Zap size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
              Optimistic Drag-and-Drop
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Move cards with instantaneous UI updates. If an API request encounters a network hiccup,
              FlowDeck rolls back state smoothly with an alert toast.
            </p>
          </div>

          <div
            className="kanban-column"
            style={{
              padding: 24,
              border: '1px solid var(--surface-glass-border)',
              background: 'var(--surface-glass)'
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--status-done)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}
            >
              <BarChart3 size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
              Aggregation Analytics
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Interactive Recharts dashboards break down completion rings, priority allocations, and
              highlight overdue items before they slip through the cracks.
            </p>
          </div>

          <div
            className="kanban-column"
            style={{
              padding: 24,
              border: '1px solid var(--surface-glass-border)',
              background: 'var(--surface-glass)'
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(244, 63, 94, 0.15)',
                color: 'var(--priority-high)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}
            >
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
              Team Access & Timeline
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Invite teammates by email, manage owner controls, and watch recent project actions
              stream into the live activity timeline feed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
