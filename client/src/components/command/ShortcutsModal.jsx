import React from 'react';
import Modal from '../common/Modal';

export const ShortcutsModal = ({ isOpen, onClose }) => {
  const shortcuts = [
    { key: 'Ctrl + K / ⌘K', description: 'Open Command Palette & Quick Project Switcher' },
    { key: 'N', description: 'Create New Task Dialog' },
    { key: '/', description: 'Quick Focus Search Input' },
    { key: '?', description: 'Open Keyboard Shortcuts Help' },
    { key: 'Esc', description: 'Close any active Dialog, Modal, or Palette' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" maxWidth={500}>
      <div className="modal-body" style={{ padding: '16px 24px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Boost your productivity with quick keyboard shortcuts built directly into FlowDeck.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-input)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 500 }}>
                {sc.description}
              </span>
              <span className="kbd" style={{ padding: '3px 8px' }}>
                {sc.key}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Got it
        </button>
      </div>
    </Modal>
  );
};

export default ShortcutsModal;
