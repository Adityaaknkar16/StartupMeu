import React from 'react';
import { Search, X, Filter, ArrowUpDown, AlertCircle } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';

export const TaskFilterBar = ({
  search,
  setSearch,
  priority,
  setPriority,
  assignee,
  setAssignee,
  sortBy,
  setSortBy,
  dueFilter,
  setDueFilter,
  searchInputRef,
  onReset
}) => {
  const { activeProject } = useProjects();
  const members = activeProject?.members || [];

  // Calculate active filter count
  let activeFilterCount = 0;
  if (search) activeFilterCount++;
  if (priority) activeFilterCount++;
  if (assignee) activeFilterCount++;
  if (dueFilter) activeFilterCount++;
  if (sortBy && sortBy !== 'order') activeFilterCount++;

  return (
    <div className="filter-bar">
      {/* Search Input */}
      <div className="search-box">
        <Search size={16} className="search-icon" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search tasks... (press / to focus)"
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

      {/* Change 2: Sort By Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <ArrowUpDown size={15} color="var(--text-subtle)" />
        <select
          className="select-filter"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort tasks by"
        >
          <option value="order">Custom Column Order</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
          <option value="createdAt">Date Created</option>
        </select>
      </div>

      {/* Change 3: Due Date Filter Chips */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          onClick={() => setDueFilter((prev) => (prev === 'overdue' ? '' : 'overdue'))}
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: dueFilter === 'overdue' ? '1px solid var(--overdue-border)' : '1px solid var(--border-subtle)',
            background: dueFilter === 'overdue' ? 'var(--overdue-bg)' : 'var(--surface-input)',
            color: dueFilter === 'overdue' ? 'var(--overdue-color)' : 'var(--text-muted)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <AlertCircle size={13} />
          <span>Overdue</span>
        </button>

        <button
          type="button"
          onClick={() => setDueFilter((prev) => (prev === 'week' ? '' : 'week'))}
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: dueFilter === 'week' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
            background: dueFilter === 'week' ? 'var(--primary-glow)' : 'var(--surface-input)',
            color: dueFilter === 'week' ? 'var(--primary)' : 'var(--text-muted)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <span>Due This Week</span>
        </button>
      </div>

      {/* Change 9: Active Filter Count & Reset Button */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onReset}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <X size={14} />
          <span>Clear ({activeFilterCount})</span>
        </button>
      )}
    </div>
  );
};

export default TaskFilterBar;
