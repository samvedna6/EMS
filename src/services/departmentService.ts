import api from './api';
import type { Department } from '@/types';

export const departmentService = {
  getDepartments: async (): Promise<Department[]> => {
    const res = await api.get<{ success: boolean; count: number; data: Department[] }>('/departments');
    return res.data.data;
  },

  getDepartmentById: async (id: string): Promise<Department> => {
    const res = await api.get<{ success: boolean; data: Department }>(`/departments/${id}`);
    return res.data.data;
  },

  createDepartment: async (data: { name: string; description?: string; manager?: string }): Promise<Department> => {
    const res = await api.post<{ success: boolean; data: Department }>('/departments', data);
    return res.data.data;
  },

  updateDepartment: async (id: string, data: Partial<Department>): Promise<Department> => {
    const res = await api.put<{ success: boolean; data: Department }>(`/departments/${id}`, data);
    return res.data.data;
  },

  deleteDepartment: async (id: string): Promise<boolean> => {
    const res = await api.delete<{ success: boolean; message: string }>(`/departments/${id}`);
    return res.data.success;
  },
};

export default departmentService;
