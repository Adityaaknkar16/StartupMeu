import axiosClient from './axiosClient';

export const projectApi = {
  getProjects: () => axiosClient.get('/projects'),
  getProject: (id) => axiosClient.get(`/projects/${id}`),
  createProject: (data) => axiosClient.post('/projects', data),
  updateProject: (id, data) => axiosClient.put(`/projects/${id}`, data),
  deleteProject: (id) => axiosClient.delete(`/projects/${id}`),
  inviteMember: (id, data) => axiosClient.post(`/projects/${id}/invite`, data),
  getProjectStats: (id) => axiosClient.get(`/projects/${id}/stats`),
  getProjectActivities: (id, limit = 30) => axiosClient.get(`/projects/${id}/activities?limit=${limit}`),
  getProjectTasks: (id, params = {}) => axiosClient.get(`/projects/${id}/tasks`, { params }),
  createTask: (id, data) => axiosClient.post(`/projects/${id}/tasks`, data)
};

export default projectApi;
