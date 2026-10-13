import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';

export const TaskFilterBar = ({
  search,
  setSearch,
  priority,
  setPriority,
  assignee,
  setAssignee,
  searchInputRef,
  onReset
}) => {
  const { activeProject } = useProjects();
  const members = activeProject?.members || [];

  const hasActiveFilters = search || priority || assignee;

  return (
    <div className="filter-bar">
      {/* Search Input */}
      <div className="search-box">
        <Search size={16} className="search-icon" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search tasks by title or details... (press / to focus)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search tasks"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-subtle)'
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Priority Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Filter size={15} color="var(--text-subtle)" />
        <select
          className="select-filter"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>

      {/* Assignee Filter */}
      <div>
        <select
          className="select-filter"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          aria-label="Filter by assignee"
        >
          <option value="">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          {members.map((m) => (
            <option key={m.user?._id || m.user} value={m.user?._id || m.user}>
              {m.user?.name || 'Member'}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onReset}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <X size={14} />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  );
};

export default TaskFilterBar;
