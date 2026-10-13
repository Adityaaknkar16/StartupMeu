import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, X, CheckCircle, ArrowRight, UserPlus, FolderPlus } from 'lucide-react';
import { projectApi } from '../../api/projectApi';
import { useProjects } from '../../context/ProjectContext';
import Avatar from '../common/Avatar';
import { MESSAGES } from '../../constants/messages';

export const ActivityTimeline = ({ isOpen, onClose }) => {
  const { activeProject, boardVersion } = useProjects();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchActivities = async () => {
      if (!activeProject?._id || !isOpen) return;
      setIsLoading(true);
      try {
        const res = await projectApi.getProjectActivities(activeProject._id, 30);
        if (isMounted && res.success) {
          setActivities(res.data.activities || []);
        }
      } catch (err) {
        console.error('Failed to load activities:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchActivities();
    return () => {
      isMounted = false;
    };
  }, [activeProject?._id, isOpen, boardVersion]);

  // Relative time helper
  const formatTimeAgo = (dateStr) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const getActionDetails = (act) => {
    switch (act.action) {
      case 'created_task':
        return {
          icon: Activity,
          color: 'var(--primary)',
          label: `created task "${act.taskTitle}"`
        };
      case 'moved_task':
        return {
          icon: ArrowRight,
          color: 'var(--status-in-progress)',
          label: `moved "${act.taskTitle}" to ${act.details?.to || 'new column'}`
        };
      case 'updated_task':
        return {
          icon: CheckCircle,
          color: 'var(--status-done)',
          label: `updated task "${act.taskTitle}"`
        };
      case 'deleted_task':
        return {
          icon: X,
          color: 'var(--overdue-color)',
          label: `deleted task "${act.taskTitle}"`
        };
      case 'invited_member':
        return {
          icon: UserPlus,
          color: 'var(--priority-medium)',
          label: `invited ${act.details?.invitedUser || 'a new member'} to project`
        };
      case 'created_project':
        return {
          icon: FolderPlus,
          color: 'var(--primary)',
          label: 'created the project space'
        };
      default:
        return {
          icon: Activity,
          color: 'var(--text-subtle)',
          label: act.taskTitle ? `interacted with "${act.taskTitle}"` : 'updated project'
        };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: '#000',
              zIndex: 45
            }}
          />

          {/* Drawer Sidebar */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 380,
              maxWidth: '85vw',
              background: 'var(--surface-modal)',
              borderLeft: '1px solid var(--surface-glass-border)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column'
            }}
            aria-label="Activity timeline"
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Activity size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Activity Feed</h3>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={onClose}
                aria-label="Close timeline"
              >
                <X size={18} />
              </button>
            </div>

            {/* Activities List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {isLoading && activities.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: 40 }}>
                  Loading latest activities...
                </div>
              ) : activities.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: 40 }}>
                  {MESSAGES.EMPTY_STATE.NO_ACTIVITIES}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {activities.map((act) => {
                    const { label, color } = getActionDetails(act);

                    return (
                      <div
                        key={act._id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          position: 'relative'
                        }}
                      >
                        <Avatar
                          name={act.user?.name}
                          avatar={act.user?.avatar}
                          size={32}
                        />

                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.85rem', lineHeight: 1.4, color: 'var(--text-main)' }}>
                            <strong style={{ fontWeight: 600 }}>{act.user?.name || 'Someone'}</strong>{' '}
                            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                          </p>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--text-subtle)',
                              marginTop: 2,
                              display: 'inline-block'
                            }}
                          >
                            {formatTimeAgo(act.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default ActivityTimeline;
