import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectApi } from '../api/projectApi';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { MESSAGES } from '../constants/messages';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [boardVersion, setBoardVersion] = useState(0);

  const refreshBoard = useCallback(() => {
    setBoardVersion((v) => v + 1);
  }, []);

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await projectApi.getProjects();
      if (res.success) {
        const list = res.data.projects || [];
        setProjects(list);
        if (list.length > 0 && !activeProject) {
          // Default to first project
          setActiveProject(list[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, activeProject]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    } else {
      setProjects([]);
      setActiveProject(null);
    }
  }, [isAuthenticated]);

  const selectProject = (projectOrId) => {
    if (typeof projectOrId === 'string') {
      const found = projects.find((p) => p._id === projectOrId);
      if (found) setActiveProject(found);
    } else {
      setActiveProject(projectOrId);
    }
  };

  const createProject = async (name, description) => {
    try {
      const res = await projectApi.createProject({ name, description });
      if (res.success) {
        const newProj = res.data.project;
        setProjects((prev) => [newProj, ...prev]);
        setActiveProject(newProj);
        showSuccess(res.message || MESSAGES.PROJECT.CREATE_SUCCESS);
        return { success: true, project: newProj };
      }
      return { success: false };
    } catch (err) {
      showError(err.message || 'Failed to create project');
      return { success: false, errors: err.errors || [] };
    }
  };

  const inviteMember = async (projectId, email, role = 'member') => {
    try {
      const res = await projectApi.inviteMember(projectId, { email, role });
      if (res.success) {
        const updated = res.data.project;
        setProjects((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
        if (activeProject?._id === updated._id) {
          setActiveProject(updated);
        }
        showSuccess(res.message || MESSAGES.MEMBER.INVITE_SUCCESS);
        refreshBoard();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      showError(err.message || 'Failed to invite member');
      return { success: false, errors: err.errors || [] };
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const res = await projectApi.deleteProject(projectId);
      if (res.success) {
        const remaining = projects.filter((p) => p._id !== projectId);
        setProjects(remaining);
        if (activeProject?._id === projectId) {
          setActiveProject(remaining[0] || null);
        }
        showSuccess(res.message || MESSAGES.PROJECT.DELETE_SUCCESS);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      showError(err.message || 'Failed to delete project');
      return { success: false };
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        isLoading,
        boardVersion,
        refreshBoard,
        fetchProjects,
        selectProject,
        createProject,
        inviteMember,
        deleteProject
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
