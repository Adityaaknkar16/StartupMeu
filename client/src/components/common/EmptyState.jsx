import React from 'react';
import { Layers, Plus } from 'lucide-react';
import { MESSAGES } from '../../constants/messages';

export const EmptyState = ({
  icon: Icon = Layers,
  title = MESSAGES.EMPTY_STATE.NO_TASKS,
  description = 'Add tasks to get started collaborating with your team.',
  actionLabel = 'Create Task',
  onAction
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={26} />
      </div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 4, color: 'var(--text-main)' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: onAction ? 16 : 0, maxWidth: 300 }}>
        {description}
      </p>
      {onAction && (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          <Plus size={16} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
