import api from './api';
import type { Leave, LeaveStatus, LeaveType } from '@/types';

export const leaveService = {
  getLeaves: async (params?: { status?: string; leaveType?: string }): Promise<Leave[]> => {
    const res = await api.get<{ success: boolean; count: number; data: Leave[] }>('/leaves', { params });
    return res.data.data;
  },

  getMyLeaves: async (): Promise<Leave[]> => {
    const res = await api.get<{ success: boolean; count: number; data: Leave[] }>('/leaves/my');
    return res.data.data;
  },

  applyLeave: async (data: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }): Promise<Leave> => {
    const res = await api.post<{ success: boolean; message: string; data: Leave }>('/leaves', data);
    return res.data.data;
  },

  updateLeaveStatus: async (id: string, status: LeaveStatus, approvalRemarks?: string): Promise<Leave> => {
    const res = await api.put<{ success: boolean; message: string; data: Leave }>(`/leaves/${id}/status`, {
      status,
      approvalRemarks,
    });
    return res.data.data;
  },

  deleteLeave: async (id: string): Promise<boolean> => {
    const res = await api.delete<{ success: boolean; message: string }>(`/leaves/${id}`);
    return res.data.success;
  },
};

export default leaveService;
