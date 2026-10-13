import React, { useState, useRef } from 'react';
import Navbar from './Navbar';
import CommandPalette from '../command/CommandPalette';
import ShortcutsModal from '../command/ShortcutsModal';
import ActivityTimeline from '../timeline/ActivityTimeline';
import StatsDashboard from '../stats/StatsDashboard';
import CreateProjectModal from '../modals/CreateProjectModal';
import InviteMemberModal from '../modals/InviteMemberModal';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';

export const Layout = ({ children }) => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const searchInputRef = useRef(null);

  // Keyboard shortcuts integration
  useKeyboardShortcuts({
    onOpenCommandPalette: () => setIsCommandOpen(true),
    onNewTask: () => setIsNewTaskOpen(true),
    onFocusSearch: () => {
      searchInputRef.current?.focus();
    },
    onOpenHelp: () => setIsShortcutsHelpOpen(true),
    onEscape: () => {
      setIsCommandOpen(false);
      setIsShortcutsHelpOpen(false);
      setIsTimelineOpen(false);
      setIsStatsOpen(false);
      setIsCreateProjectOpen(false);
      setIsInviteMemberOpen(false);
      setIsNewTaskOpen(false);
    }
  });

  return (
    <div className="app-container">
      <Navbar
        onOpenCommandPalette={() => setIsCommandOpen(true)}
        onOpenNewTask={() => setIsNewTaskOpen(true)}
        onToggleTimeline={() => setIsTimelineOpen((prev) => !prev)}
        onToggleStats={() => setIsStatsOpen((prev) => !prev)}
        onOpenHelp={() => setIsShortcutsHelpOpen(true)}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
        onOpenInviteMember={() => setIsInviteMemberOpen(true)}
      />

      <main className="main-content">
        {React.cloneElement(children, {
          searchInputRef,
          isCreateModalOpen: isNewTaskOpen,
          setIsCreateModalOpen: setIsNewTaskOpen,
          onOpenNewTask: () => setIsNewTaskOpen(true)
        })}
      </main>

      {/* Global Overlays & Drawers */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpenNewTask={() => setIsNewTaskOpen(true)}
        onToggleTimeline={() => setIsTimelineOpen((prev) => !prev)}
        onToggleStats={() => setIsStatsOpen((prev) => !prev)}
        onOpenHelp={() => setIsShortcutsHelpOpen(true)}
      />

      <ShortcutsModal
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
      />

      <ActivityTimeline
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
      />

      <StatsDashboard
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />

      <InviteMemberModal
        isOpen={isInviteMemberOpen}
        onClose={() => setIsInviteMemberOpen(false)}
      />
    </div>
  );
};

export default Layout;
