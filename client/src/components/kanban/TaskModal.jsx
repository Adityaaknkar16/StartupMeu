import React, { useState, useEffect } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import Modal from '../common/Modal';
import { useProjects } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { projectApi } from '../../api/projectApi';
import { taskApi } from '../../api/taskApi';
import { MESSAGES } from '../../constants/messages';

export const TaskModal = ({ isOpen, onClose, taskToEdit = null, defaultStatus = 'todo', onTaskSaved }) => {
  const { activeProject } = useProjects();
  const { showSuccess, showError } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [priority, setPriority] = useState('medium');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status || 'todo');
      setPriority(taskToEdit.priority || 'medium');
      setAssignee(taskToEdit.assignee?._id || taskToEdit.assignee || '');
      setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('medium');
      setAssignee('');
      setDueDate('');
    }
    setErrors({});
  }, [taskToEdit, defaultStatus, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: 'Task title cannot be empty' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignee: assignee || null,
      dueDate: dueDate || null
    };

    try {
      if (taskToEdit) {
        // Update task
        const res = await taskApi.updateTask(taskToEdit._id, payload);
        if (res.success) {
          showSuccess(res.message || MESSAGES.TASK.UPDATE_SUCCESS);
          onTaskSaved?.(res.data.task);
          onClose();
        }
      } else {
        // Create task
        const res = await projectApi.createTask(activeProject._id, payload);
        if (res.success) {
          showSuccess(res.message || MESSAGES.TASK.CREATE_SUCCESS);
          onTaskSaved?.(res.data.task);
          onClose();
        }
      }
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const fieldErrorMap = {};
        err.errors.forEach((e) => {
          fieldErrorMap[e.field] = e.message;
        });
        setErrors(fieldErrorMap);
      } else {
        showError(err.message || 'Failed to save task');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const members = activeProject?.members || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Task' : 'Create New Task'}
      maxWidth={580}
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* Task Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Task Title <span style={{ color: 'var(--overdue-color)' }}>*</span>
            </label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              placeholder="e.g. Set up Redis caching for board aggregation"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
              }}
              autoFocus
            />
            {errors.title && (
              <div className="field-error">
                <AlertCircle size={13} />
                <span>{errors.title}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-description">
              Description (Optional)
            </label>
            <textarea
              id="task-description"
              className="form-textarea"
              rows={3}
              placeholder="Add key objectives, criteria, or context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Status & Priority Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-status">
                Status
              </label>
              <select
                id="task-status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-assignee">
                Assignee
              </label>
              <select
                id="task-assignee"
                className="form-select"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user?._id || m.user} value={m.user?._id || m.user}>
                    {m.user?.name || 'Member'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-duedate">
                Due Date
              </label>
              <input
                id="task-duedate"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            <Check size={16} />
            <span>{isSubmitting ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Task'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
