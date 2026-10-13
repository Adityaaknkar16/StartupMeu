import React, { useState, useEffect } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { projectApi } from '../../api/projectApi';
import KanbanBoard from '../components/kanban/KanbanBoard';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';
import { FolderPlus, Download } from 'lucide-react';

export const BoardPage = ({
  searchInputRef,
  isCreateModalOpen,
  setIsCreateModalOpen,
  onOpenNewTask
}) => {
  const { activeProject, projects, isLoading, boardVersion } = useProjects();
  const { showSuccess, showError } = useToast();
  const [stats, setStats] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchMiniStats = async () => {
      if (!activeProject?._id) return;
      try {
        const res = await projectApi.getProjectStats(activeProject._id);
        if (isMounted && res.success) {
          setStats(res.data);
        }
      } catch (e) {
        // Silent background fetch for mini progress bar
      }
    };
    fetchMiniStats();
    return () => {
      isMounted = false;
    };
  }, [activeProject?._id, boardVersion]);

  // Change 7: Export Board Tasks to CSV
  const handleExportCSV = async () => {
    if (!activeProject?._id) return;
    setIsExporting(true);
    try {
      const res = await projectApi.exportProjectTasks(activeProject._id);
      if (res.success && res.data.tasks) {
        const taskList = res.data.tasks;
        const headers = ['Title', 'Status', 'Priority', 'Assignee', 'Due Date', 'Created At'];
        const rows = taskList.map((t) => [
          `"${(t.title || '').replace(/"/g, '""')}"`,
          `"${t.status}"`,
          `"${t.priority}"`,
          `"${t.assignee}"`,
          `"${t.dueDate}"`,
          `"${new Date(t.createdAt).toLocaleDateString()}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${activeProject.name.toLowerCase().replace(/\s+/g, '_')}_tasks.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showSuccess('Project tasks exported as CSV');
      }
    } catch (err) {
      showError('Failed to export tasks');
    } finally {
      setIsExporting(false);
    }
  };

  if (!activeProject && !isLoading && projects.length === 0) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          icon={FolderPlus}
          title="No projects yet"
          description="Create your first team workspace to begin organizing tasks and collaborating."
          actionLabel="Create Project"
        />
      </div>
    );
  }

  const members = activeProject?.members || [];
  const completionRate = stats?.completionRate || 0;
  const totalTasks = stats?.totalTasks || 0;
  const completedTasks = stats?.completedTasks || 0;

  return (
    <div className="page-wrapper">
      {/* Board Header Section */}
      <div className="board-header">
        <div className="board-title-group" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1>{activeProject?.name || 'Project Board'}</h1>
            {/* Export CSV button (Change 7) */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleExportCSV}
              disabled={isExporting}
              style={{ padding: '4px 10px', fontSize: '0.75rem', height: 28 }}
              title="Export all tasks as CSV"
            >
              <Download size={13} />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>
          </div>

          {activeProject?.description && (
            <p style={{ marginTop: 4 }}>{activeProject.description}</p>
          )}

          {/* Change 5: Project Progress Bar in Header */}
          {totalTasks > 0 && (
            <div style={{ maxWidth: 360, marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: 4 }}>
                <span>Progress: {completionRate}%</span>
                <span>{completedTasks} of {totalTasks} tasks done</span>
              </div>
              <div
                style={{
                  height: 6,
                  width: '100%',
                  background: 'var(--surface-input)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${completionRate}%`,
                    background: 'var(--accent-gradient)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Team Members Avatar Stack */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
            {members.slice(0, 5).map((m, idx) => (
              <div
                key={m.user?._id || idx}
                style={{
                  marginLeft: idx === 0 ? 0 : -8,
                  zIndex: 10 - idx
                }}
              >
                <Avatar
                  name={m.user?.name}
                  avatar={m.user?.avatar}
                  size={32}
                />
              </div>
            ))}
            {members.length > 5 && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginLeft: 6,
                  color: 'var(--text-muted)'
                }}
              >
                +{members.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <KanbanBoard
        searchInputRef={searchInputRef}
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
      />
    </div>
  );
};

export default BoardPage;
