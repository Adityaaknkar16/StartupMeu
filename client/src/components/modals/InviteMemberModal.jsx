import React, { useState } from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import { useProjects } from '../../context/ProjectContext';

export const InviteMemberModal = ({ isOpen, onClose }) => {
  const { activeProject, inviteMember } = useProjects();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrors({ email: 'Email address is required' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const res = await inviteMember(activeProject._id, email.trim(), role);
    setIsSubmitting(false);

    if (res.success) {
      setEmail('');
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
    <Modal isOpen={isOpen} onClose={onClose} title={`Invite to ${activeProject?.name}`} maxWidth={460}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Collaborate seamlessly. Enter the team member's email address to grant access.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="member-email">
              Teammate's Email Address <span style={{ color: 'var(--overdue-color)' }}>*</span>
            </label>
            <input
              id="member-email"
              type="email"
              className="form-input"
              placeholder="e.g. maya@flowdeck.dev"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              autoFocus
            />
            {errors.email && (
              <div className="field-error">
                <AlertCircle size={13} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="member-role">
              Role
            </label>
            <select
              id="member-role"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="member">Member (Can create, move, and edit tasks)</option>
              <option value="owner">Co-Owner (Can manage project settings and invite)</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            <UserPlus size={16} />
            <span>{isSubmitting ? 'Sending invite...' : 'Send Invite'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteMemberModal;
