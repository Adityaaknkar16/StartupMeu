import axiosClient from './axiosClient';

export const taskApi = {
  updateTask: (taskId, data) => axiosClient.put(`/tasks/${taskId}`, data),
  moveTask: (taskId, data) => axiosClient.patch(`/tasks/${taskId}/move`, data),
  deleteTask: (taskId) => axiosClient.delete(`/tasks/${taskId}`)
};

export default taskApi;
