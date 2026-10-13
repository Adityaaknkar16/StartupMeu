import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  RefreshCw,
  X
} from 'lucide-react';
import { projectApi } from '../../api/projectApi';
import { useProjects } from '../../context/ProjectContext';
import ErrorRetry from '../common/ErrorRetry';
import Modal from '../common/Modal';

export const StatsDashboard = ({ isOpen, onClose }) => {
  const { activeProject, boardVersion } = useProjects();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    if (!activeProject?._id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await projectApi.getProjectStats(activeProject._id);
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to calculate stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen, activeProject?._id, boardVersion]);

  if (!isOpen) return null;

  const statusData = stats
    ? [
        { name: 'To Do', count: stats.statusCounts?.todo || 0, color: '#64748b' },
        { name: 'In Progress', count: stats.statusCounts?.['in-progress'] || 0, color: '#3b82f6' },
        { name: 'Done', count: stats.statusCounts?.done || 0, color: '#10b981' }
      ]
    : [];

  const priorityData = stats
    ? [
        { name: 'High', value: stats.priorityCounts?.high || 0, color: '#f43f5e' },
        { name: 'Medium', value: stats.priorityCounts?.medium || 0, color: '#f59e0b' },
        { name: 'Low', value: stats.priorityCounts?.low || 0, color: '#10b981' }
      ]
    : [];

  // Ring completion gauge data
  const completionRate = stats?.completionRate || 0;
  const progressRingData = [
    { name: 'Completed', value: completionRate, color: '#10b981' },
    { name: 'Remaining', value: Math.max(0, 100 - completionRate), color: 'rgba(255,255,255,0.08)' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${activeProject?.name || 'Project'} — Analytics & Insights`}
      maxWidth={720}
    >
      <div className="modal-body" style={{ padding: '20px 28px' }}>
        {error ? (
          <ErrorRetry message={error} onRetry={fetchStats} isRetrying={isLoading} />
        ) : isLoading && !stats ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Crunching aggregation analytics...
          </div>
        ) : (
          <div>
            {/* KPI Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
                gap: 12,
                marginBottom: 24
              }}
            >
              <div
                style={{
                  background: 'var(--surface-input)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Tasks</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: 4 }}>
                  {stats?.totalTasks || 0}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--surface-input)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--status-done)' }}>Completed</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-done)', marginTop: 4 }}>
                  {stats?.completedTasks || 0}
                </div>
              </div>

              <div
                style={{
                  background: stats?.overdueCount > 0 ? 'var(--overdue-bg)' : 'var(--surface-input)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: stats?.overdueCount > 0 ? '1px solid var(--overdue-border)' : '1px solid var(--border-subtle)'
                }}
              >
                <span style={{ fontSize: '0.75rem', color: stats?.overdueCount > 0 ? 'var(--overdue-color)' : 'var(--text-muted)' }}>
                  Overdue
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stats?.overdueCount > 0 ? 'var(--overdue-color)' : 'inherit', marginTop: 4 }}>
                  {stats?.overdueCount || 0}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--surface-input)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Velocity</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                  {stats?.completionRate || 0}%
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Progress Ring Card */}
              <div
                style={{
                  background: 'var(--surface-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Completion Ring</h4>
                <div style={{ width: '100%', height: 160, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={progressRingData}
                        dataKey="value"
                        innerRadius={50}
                        outerRadius={70}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={2}
                      >
                        {progressRingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none'
                    }}
                  >
                    <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>{completionRate}%</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Finished</span>
                  </div>
                </div>
              </div>

              {/* Status Breakdown Bar Chart */}
              <div
                style={{
                  background: 'var(--surface-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px'
                }}
              >
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Status Breakdown</h4>
                <div style={{ width: '100%', height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <XAxis dataKey="name" stroke="var(--text-subtle)" fontSize={11} />
                      <YAxis allowDecimals={false} stroke="var(--text-subtle)" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--surface-modal)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {statusData.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
};

export default StatsDashboard;
