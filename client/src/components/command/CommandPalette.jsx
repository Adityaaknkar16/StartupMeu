import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Folder,
  PlusCircle,
  Sun,
  Moon,
  Activity,
  BarChart2,
  HelpCircle,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const CommandPalette = ({
  isOpen,
  onClose,
  onOpenNewTask,
  onToggleTimeline,
  onToggleStats,
  onOpenHelp
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const { projects, selectProject } = useProjects();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build commands list
  const commands = [
    {
      id: 'new-task',
      title: 'Create New Task',
      shortcut: 'N',
      icon: PlusCircle,
      action: () => {
        onClose();
        onOpenNewTask();
      }
    },
    {
      id: 'toggle-theme',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      shortcut: 'T',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        toggleTheme();
        onClose();
      }
    },
    {
      id: 'view-stats',
      title: 'View Project Analytics Dashboard',
      shortcut: 'S',
      icon: BarChart2,
      action: () => {
        onClose();
        onToggleStats();
      }
    },
    {
      id: 'view-timeline',
      title: 'View Live Activity Timeline',
      shortcut: 'A',
      icon: Activity,
      action: () => {
        onClose();
        onToggleTimeline();
      }
    },
    {
      id: 'shortcuts-help',
      title: 'Keyboard Shortcuts Cheat Sheet',
      shortcut: '?',
      icon: HelpCircle,
      action: () => {
        onClose();
        onOpenHelp();
      }
    },
    ...projects.map((p) => ({
      id: `project-${p._id}`,
      title: `Jump to project: ${p.name}`,
      category: 'Projects',
      icon: Folder,
      action: () => {
        selectProject(p);
        onClose();
      }
    })),
    {
      id: 'logout',
      title: 'Sign Out',
      icon: LogOut,
      action: () => {
        onClose();
        logout();
      }
    }
  ];

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ alignItems: 'flex-start', paddingTop: '12vh' }}
        >
          <motion.div
            className="modal-content"
            style={{ maxWidth: 600, padding: 0 }}
            initial={{ scale: 0.96, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: -10 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                gap: 12
              }}
            >
              <Search size={20} color="var(--primary)" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search project... (Esc to exit)"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              />
              <span className="kbd">ESC</span>
            </div>

            {/* Commands List */}
            <div style={{ maxHeight: 380, overflowY: 'auto', padding: '8px' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No matching commands found.
                </div>
              ) : (
                filtered.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  const isSelected = idx === selectedIndex;

                  return (
                    <div
                      key={cmd.id}
                      onClick={() => cmd.action()}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'var(--surface-input)' : 'transparent',
                        cursor: 'pointer',
                        color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                        border: isSelected ? '1px solid var(--border-subtle)' : '1px solid transparent',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Icon size={18} color={isSelected ? 'var(--primary)' : 'inherit'} />
                        <span style={{ fontSize: '0.9rem', fontWeight: isSelected ? 600 : 500 }}>
                          {cmd.title}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {cmd.shortcut && <span className="kbd">{cmd.shortcut}</span>}
                        {isSelected && <ArrowRight size={14} color="var(--primary)" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer tip */}
            <div
              style={{
                padding: '10px 20px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'var(--text-subtle)'
              }}
            >
              <span>Navigate with ↑ and ↓</span>
              <span>Select with Enter</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
