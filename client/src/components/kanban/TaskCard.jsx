import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, Trash2, CheckSquare } from 'lucide-react';
import Avatar from '../common/Avatar';

export const TaskCard = ({ task, index, onEdit, onDelete, searchQuery = '' }) => {
  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate).getTime() < Date.now();

  // Change 4: Dynamic human-friendly relative due-date formatting
  const getRelativeDueLabel = (dueDateStr) => {
    if (!dueDateStr) return null;
    const dueTime = new Date(dueDateStr).setHours(23, 59, 59, 999);
    const now = Date.now();
    const diffDays = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));

    if (task.status === 'done') {
      return new Date(dueDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    if (diffDays < 0) {
      const pastDays = Math.abs(diffDays);
      return pastDays === 1 ? 'Overdue by 1 day' : `Overdue by ${pastDays} days`;
    }
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;

    return new Date(dueDateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const relativeDueText = getRelativeDueLabel(task.dueDate);

  // Change 11: Subtasks calculation
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  // Change 1: Search keyword highlighting
  const renderHighlightedText = (text, query) => {
    if (!query || !query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={i}
              style={{
                background: 'rgba(245, 158, 11, 0.35)',
                color: 'inherit',
                borderRadius: '2px',
                padding: '0 2px'
              }}
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
          onClick={() => onEdit(task)}
          tabIndex={0}
          role="button"
          aria-label={`Task: ${task.title}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEdit(task);
          }}
        >
          {/* Header with Priority and Delete Action */}
          <div className="task-card-header">
            <span className={`priority-chip priority-${task.priority}`}>
              {task.priority}
            </span>
            <button
              type="button"
              className="btn-icon"
              style={{ width: 26, height: 26, border: 'none', background: 'transparent' }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task);
              }}
              title="Delete task"
              aria-label="Delete task"
            >
              <Trash2 size={14} color="var(--text-subtle)" />
            </button>
          </div>

          {/* Title with search highlighting */}
          <h4 className="task-title">
            {renderHighlightedText(task.title, searchQuery)}
          </h4>

          {/* Optional snippet description */}
          {task.description && (
            <p className="task-description">
              {renderHighlightedText(task.description, searchQuery)}
            </p>
          )}

          {/* Subtasks mini badge if present */}
          {subtasks.length > 0 && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.72rem',
                color: completedSubtasks === subtasks.length ? 'var(--status-done)' : 'var(--text-muted)',
                marginBottom: 10,
                background: 'var(--surface-input)',
                padding: '2px 7px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <CheckSquare size={12} />
              <span>
                {completedSubtasks}/{subtasks.length} subtasks
              </span>
            </div>
          )}

          {/* Footer with Due Date & Assignee Avatar */}
          <div className="task-card-footer">
            <div className={`due-date-badge ${isOverdue ? 'is-overdue' : ''}`}>
              {relativeDueText ? (
                <>
                  <Calendar size={13} />
                  <span>{relativeDueText}</span>
                </>
              ) : (
                <span style={{ color: 'var(--text-subtle)' }}>No due date</span>
              )}
            </div>

            {task.assignee ? (
              <Avatar
                name={task.assignee.name}
                avatar={task.assignee.avatar}
                size={24}
              />
            ) : (
              <span
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-subtle)',
                  fontStyle: 'italic'
                }}
              >
                Unassigned
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
