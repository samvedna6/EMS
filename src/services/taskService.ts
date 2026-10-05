import api from './api';
import type { Task, TaskStatus } from '@/types';

export const taskService = {
  getTasks: async (params?: { assignedTo?: string; status?: string }): Promise<Task[]> => {
    const res = await api.get<{ success: boolean; data: Task[] }>('/tasks', { params });
    return res.data.data;
  },

  getTaskById: async (id: string): Promise<Task> => {
    const res = await api.get<{ success: boolean; data: Task }>(`/tasks/${id}`);
    return res.data.data;
  },

  createTask: async (taskData: {
    title: string;
    description: string;
    assignedTo: string;
    dueDate?: string;
  }): Promise<Task> => {
    const res = await api.post<{ success: boolean; data: Task }>('/tasks', taskData);
    return res.data.data;
  },

  updateTaskStatus: async (id: string, status: TaskStatus): Promise<Task> => {
    const res = await api.put<{ success: boolean; data: Task }>(`/tasks/${id}/status`, { status });
    return res.data.data;
  },

  deleteTask: async (id: string): Promise<boolean> => {
    const res = await api.delete<{ success: boolean; message: string }>(`/tasks/${id}`);
    return res.data.success;
  },
};

export default taskService;
