import React, { useState } from 'react';
import { FolderPlus, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import { useProjects } from '../../context/ProjectContext';

export const CreateProjectModal = ({ isOpen, onClose }) => {
  const { createProject } = useProjects();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: 'Project name is required' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const res = await createProject(name.trim(), description.trim());
    setIsSubmitting(false);

    if (res.success) {
      setName('');
      setDescription('');
      onClose();
    } else if (res.errors) {
      const map = {};
      res.errors.forEach((err) => {
        map[err.field] = err.message;
      });
      setErrors(map);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" maxWidth={480}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="project-name">
              Project Name <span style={{ color: 'var(--overdue-color)' }}>*</span>
            </label>
            <input
              id="project-name"
              type="text"
              className="form-input"
              placeholder="e.g. Mobile App Overhaul"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              autoFocus
            />
            {errors.name && (
              <div className="field-error">
                <AlertCircle size={13} />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="project-description">
              Description (Optional)
            </label>
            <textarea
              id="project-description"
              className="form-textarea"
              rows={3}
              placeholder="Describe the milestone or goal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            <FolderPlus size={16} />
            <span>{isSubmitting ? 'Creating...' : 'Create Project'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
