import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { MESSAGES } from '../../constants/messages';

export const ErrorRetry = ({
  message = MESSAGES.SYSTEM.SERVER_ERROR,
  onRetry,
  isRetrying = false
}) => {
  return (
    <div className="error-retry-container" role="alert">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--overdue-color)', fontWeight: 600 }}>
        <AlertCircle size={20} />
        <span>Something went wrong</span>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 400 }}>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onRetry}
          disabled={isRetrying}
          style={{ marginTop: 4 }}
        >
          <RefreshCw size={15} className={isRetrying ? 'spin' : ''} />
          <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
        </button>
      )}
    </div>
  );
};

export default ErrorRetry;
