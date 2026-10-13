import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 'var(--radius-full)',
          background: 'var(--overdue-bg)',
          color: 'var(--overdue-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16
        }}
      >
        <AlertCircle size={32} />
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>404 - Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: 420, marginBottom: 24 }}>
        The board, task, or page you are looking for does not exist or has been moved.
      </p>
      <Link to="/board" className="btn btn-primary">
        <ArrowLeft size={16} />
        <span>Return to Workspace</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
