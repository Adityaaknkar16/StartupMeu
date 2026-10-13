import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, AlertCircle, ArrowRight, Zap, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MESSAGES } from '../constants/messages';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, login, register } = useAuth();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/board');
    }
  }, [isAuthenticated, navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Client preliminary validation
    const localErrors = {};
    if (activeTab === 'register' && !name.trim()) {
      localErrors.name = 'Name is required';
    }
    if (!email.trim()) {
      localErrors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      localErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      localErrors.password = 'Password is required';
    } else if (password.length < 8) {
      localErrors.password = MESSAGES.AUTH.PASSWORD_MIN_LENGTH;
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    setIsSubmitting(true);

    if (activeTab === 'login') {
      const res = await login(email, password);
      setIsSubmitting(false);
      if (res.success) {
        navigate('/board');
      } else if (res.errors) {
        const map = {};
        res.errors.forEach((err) => {
          map[err.field || 'credentials'] = err.message;
        });
        setErrors(map);
      }
    } else {
      const res = await register(name, email, password);
      setIsSubmitting(false);
      if (res.success) {
        navigate('/board');
      } else if (res.errors) {
        const map = {};
        res.errors.forEach((err) => {
          map[err.field] = err.message;
        });
        setErrors(map);
      }
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setIsSubmitting(true);
    const res = await login(demoEmail, 'Password123!');
    setIsSubmitting(false);
    if (res.success) {
      navigate('/board');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--surface-modal)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--surface-glass-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          padding: '36px 32px'
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
            <div className="brand-icon">
              <Layers size={22} />
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>FlowDeck</span>
          </Link>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 6 }}>
            {activeTab === 'login' ? 'Sign in to access your team workspaces' : 'Create an account to start orchestrating tasks'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--surface-input)',
            borderRadius: 'var(--radius-md)',
            padding: 4,
            marginBottom: 24
          }}
        >
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'login' ? 'var(--surface-card)' : 'transparent',
              color: activeTab === 'login' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'register' ? 'var(--surface-card)' : 'transparent',
              color: activeTab === 'register' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="register-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                  }}
                />
              </div>
              {errors.name && (
                <div className="field-error">
                  <AlertCircle size={13} />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              placeholder="e.g. alex@flowdeck.dev"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
            />
            {errors.email && (
              <div className="field-error">
                <AlertCircle size={13} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              className="form-input"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
            />
            {errors.password && (
              <div className="field-error">
                <AlertCircle size={13} />
                <span>{errors.password}</span>
              </div>
            )}
            {errors.credentials && (
              <div className="field-error">
                <AlertCircle size={13} />
                <span>{errors.credentials}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: 8 }}
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? 'Authenticating...' : activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* 1-Click Demo Accounts Section */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Zap size={14} color="var(--priority-medium)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Instant Demo Sign In
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleDemoLogin('alex@flowdeck.dev')}
              style={{ fontSize: '0.8rem', padding: '8px' }}
              disabled={isSubmitting}
            >
              Alex (Owner)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleDemoLogin('maya@flowdeck.dev')}
              style={{ fontSize: '0.8rem', padding: '8px' }}
              disabled={isSubmitting}
            >
              Maya (Dev)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
