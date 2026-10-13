import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  ChevronDown,
  Plus,
  BarChart2,
  Activity,
  Sun,
  Moon,
  HelpCircle,
  LogOut,
  FolderPlus,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../common/Avatar';

export const Navbar = ({
  onOpenCommandPalette,
  onOpenNewTask,
  onToggleTimeline,
  onToggleStats,
  onOpenHelp,
  onOpenCreateProject,
  onOpenInviteMember
}) => {
  const { user, logout } = useAuth();
  const { projects, activeProject, selectProject } = useProjects();
  const { theme, toggleTheme } = useTheme();
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isOwner = activeProject && user && (activeProject.owner?._id === user._id || activeProject.owner === user._id);

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      {/* Brand & Active Project Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link to="/board" className="navbar-brand">
          <div className="brand-icon">
            <Layers size={22} />
          </div>
          <span>FlowDeck</span>
          <span className="brand-badge">PRO</span>
        </Link>

        {/* Active Project Switcher Dropdown */}
        {activeProject && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="project-selector"
              onClick={() => setIsProjectDropdownOpen((prev) => !prev)}
              aria-expanded={isProjectDropdownOpen}
              aria-haspopup="true"
            >
              <span>{activeProject.name}</span>
              <ChevronDown size={14} color="var(--text-subtle)" />
            </button>

            {isProjectDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  width: 240,
                  background: 'var(--surface-modal)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: 8,
                  zIndex: 50
                }}
              >
                <div style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
                  SWITCH PROJECT
                </div>
                {projects.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => {
                      selectProject(p);
                      setIsProjectDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: activeProject._id === p._id ? 'var(--surface-input)' : 'transparent',
                      border: 'none',
                      color: activeProject._id === p._id ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: activeProject._id === p._id ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    {p.name}
                  </button>
                ))}
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 0' }} />
                <button
                  type="button"
                  onClick={() => {
                    setIsProjectDropdownOpen(false);
                    onOpenCreateProject?.();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <FolderPlus size={15} />
                  <span>Create Project</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Center: Quick Command Palette Trigger */}
      <div className="navbar-center">
        <button
          type="button"
          className="cmd-shortcut-chip"
          onClick={onOpenCommandPalette}
          title="Search & Commands (Ctrl+K)"
        >
          <span>Jump to anything...</span>
          <span className="kbd">Ctrl K</span>
        </button>
      </div>

      {/* Actions & Profile */}
      <div className="navbar-actions">
        {/* Create Task Button */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenNewTask}
          title="Create New Task (N)"
        >
          <Plus size={16} />
          <span>New Task</span>
          <span className="kbd" style={{ background: 'rgba(0,0,0,0.2)', color: 'white' }}>N</span>
        </button>

        {/* Invite Member Button (Owner Only) */}
        {isOwner && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenInviteMember}
            title="Invite team member"
          >
            <UserPlus size={15} />
            <span>Invite</span>
          </button>
        )}

        {/* Stats Button */}
        <button
          type="button"
          className="btn-icon"
          onClick={onToggleStats}
          title="Project Statistics & Analytics"
          aria-label="View Project Analytics"
        >
          <BarChart2 size={18} />
        </button>

        {/* Timeline Button */}
        <button
          type="button"
          className="btn-icon"
          onClick={onToggleTimeline}
          title="Live Activity Timeline"
          aria-label="View Activity Feed"
        >
          <Activity size={18} />
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          className="btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle dark/light theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Keyboard Help */}
        <button
          type="button"
          className="btn-icon"
          onClick={onOpenHelp}
          title="Keyboard shortcuts (?)"
          aria-label="Keyboard shortcuts cheat sheet"
        >
          <HelpCircle size={18} />
        </button>

        {/* User Avatar & Logout Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-label="User profile menu"
          >
            <Avatar name={user?.name} avatar={user?.avatar} size={34} />
          </button>

          {isUserMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 200,
                background: 'var(--surface-modal)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: 8,
                zIndex: 50
              }}
            >
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {user?.name}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--overdue-color)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: 4
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
