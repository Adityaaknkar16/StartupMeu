import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, Trash2 } from 'lucide-react';
import Avatar from '../common/Avatar';

export const TaskCard = ({ task, index, onEdit, onDelete }) => {
  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate).getTime() < Date.now();

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    : null;

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

          {/* Title */}
          <h4 className="task-title">{task.title}</h4>

          {/* Optional snippet description */}
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          {/* Footer with Due Date & Assignee Avatar */}
          <div className="task-card-footer">
            <div className={`due-date-badge ${isOverdue ? 'is-overdue' : ''}`}>
              {formattedDueDate ? (
                <>
                  <Calendar size={13} />
                  <span>{formattedDueDate} {isOverdue ? '(Overdue)' : ''}</span>
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
