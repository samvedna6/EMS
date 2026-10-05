import api from './api';
import type { Employee } from '@/types';

export interface EmployeeQueryParams {
  search?: string;
  department?: string;
  status?: string;
  designation?: string;
  page?: number;
  limit?: number;
}

export interface EmployeesResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: Employee[];
}

export const employeeService = {
  getEmployees: async (params?: EmployeeQueryParams): Promise<EmployeesResponse> => {
    const res = await api.get<EmployeesResponse>('/employees', { params });
    return res.data;
  },

  getEmployeeById: async (id: string): Promise<Employee> => {
    const res = await api.get<{ success: boolean; data: Employee }>(`/employees/${id}`);
    return res.data.data;
  },

  createEmployee: async (employeeData: Partial<Employee> & { username?: string; password?: string }): Promise<Employee> => {
    const res = await api.post<{ success: boolean; data: Employee }>('/employees', employeeData);
    return res.data.data;
  },

  updateEmployee: async (id: string, employeeData: Partial<Employee>): Promise<Employee> => {
    const res = await api.put<{ success: boolean; data: Employee }>(`/employees/${id}`, employeeData);
    return res.data.data;
  },

  deleteEmployee: async (id: string): Promise<boolean> => {
    const res = await api.delete<{ success: boolean; message: string }>(`/employees/${id}`);
    return res.data.success;
  },
};

export default employeeService;
