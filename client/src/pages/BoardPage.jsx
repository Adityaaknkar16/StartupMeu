import React from 'react';
import { useProjects } from '../../context/ProjectContext';
import KanbanBoard from '../components/kanban/KanbanBoard';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';
import { FolderPlus, Users } from 'lucide-react';

export const BoardPage = ({
  searchInputRef,
  isCreateModalOpen,
  setIsCreateModalOpen,
  onOpenNewTask
}) => {
  const { activeProject, projects, isLoading } = useProjects();

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

  return (
    <div className="page-wrapper">
      {/* Board Header Section */}
      <div className="board-header">
        <div className="board-title-group">
          <h1>{activeProject?.name || 'Project Board'}</h1>
          {activeProject?.description && (
            <p>{activeProject.description}</p>
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
