import React from 'react';

export const TaskCardSkeleton = () => (
  <div className="task-card" style={{ opacity: 0.65 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
      <div className="skeleton" style={{ width: 60, height: 18 }} />
      <div className="skeleton" style={{ width: 20, height: 20, borderRadius: '50%' }} />
    </div>
    <div className="skeleton" style={{ width: '85%', height: 18, marginBottom: 8 }} />
    <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 16 }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
      <div className="skeleton" style={{ width: 70, height: 16 }} />
      <div className="skeleton" style={{ width: 24, height: 24, borderRadius: '50%' }} />
    </div>
  </div>
);

export const BoardSkeleton = () => (
  <div className="kanban-board">
    {[1, 2, 3].map((col) => (
      <div key={col} className="kanban-column" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="skeleton" style={{ width: 120, height: 22 }} />
          <div className="skeleton" style={{ width: 30, height: 22, borderRadius: 12 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      </div>
    ))}
  </div>
);

export default BoardSkeleton;
