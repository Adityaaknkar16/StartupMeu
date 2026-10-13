import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import EmptyState from '../common/EmptyState';

export const KanbanColumn = ({
  columnId,
  title,
  tasks = [],
  onNewTask,
  onEditTask,
  onDeleteTask
}) => {
  return (
    <div className="kanban-column" id={`column-${columnId}`}>
      {/* Column Header */}
      <div className="column-header">
        <div className="column-title">
          <span className={`column-indicator indicator-${columnId}`} />
          <span>{title}</span>
          <span className="column-count">{tasks.length}</span>
        </div>
        <button
          type="button"
          className="btn-icon"
          style={{ width: 30, height: 30 }}
          onClick={() => onNewTask(columnId)}
          title={`Add task to ${title}`}
          aria-label={`Add task to ${title}`}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Droppable Task Container */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="task-list"
            style={{
              background: snapshot.isDraggingOver
                ? 'rgba(99, 102, 241, 0.05)'
                : 'transparent',
              transition: 'background var(--transition-fast)'
            }}
          >
            {tasks.length === 0 ? (
              <EmptyState
                title="No tasks here"
                description={`No items in ${title}. Add one to start.`}
                actionLabel="Add Task"
                onAction={() => onNewTask(columnId)}
              />
            ) : (
              tasks.map((task, index) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  index={index}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
