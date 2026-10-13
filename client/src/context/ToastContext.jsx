import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, Undo2 } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ type = 'success', message, action = null, duration = 4000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);

    const newToast = { id, type, message, action, duration };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const showSuccess = useCallback((message, options = {}) => {
    return showToast({ type: 'success', message, ...options });
  }, [showToast]);

  const showError = useCallback((message, options = {}) => {
    return showToast({ type: 'error', message, ...options });
  }, [showToast]);

  const showInfo = useCallback((message, options = {}) => {
    return showToast({ type: 'info', message, ...options });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        className="toast-container"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`toast-item toast-${toast.type}`}
                role="alert"
              >
                <div className="toast-icon">
                  {isSuccess && <CheckCircle2 size={20} className="icon-success" />}
                  {isError && <AlertCircle size={20} className="icon-error" />}
                  {!isSuccess && !isError && <Info size={20} className="icon-info" />}
                </div>

                <div className="toast-content">
                  <p className="toast-message">{toast.message}</p>
                </div>

                {toast.action && (
                  <button
                    type="button"
                    className="toast-action-btn"
                    onClick={() => {
                      toast.action.onClick();
                      removeToast(toast.id);
                    }}
                  >
                    <Undo2 size={14} />
                    <span>{toast.action.label || 'Undo'}</span>
                  </button>
                )}

                <button
                  type="button"
                  className="toast-close-btn"
                  onClick={() => removeToast(toast.id)}
                  aria-label="Close notification"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
