import api from './api';
import type { Attendance, AttendanceStatus } from '@/types';

export const attendanceService = {
  getAttendance: async (params?: { date?: string; employee?: string; status?: string }): Promise<Attendance[]> => {
    const res = await api.get<{ success: boolean; count: number; data: Attendance[] }>('/attendance', { params });
    return res.data.data;
  },

  getMyAttendance: async (): Promise<{ today: Attendance | null; data: Attendance[] }> => {
    const res = await api.get<{ success: boolean; today: Attendance | null; data: Attendance[] }>('/attendance/my');
    return res.data;
  },

  checkIn: async (): Promise<Attendance> => {
    const res = await api.post<{ success: boolean; message: string; data: Attendance }>('/attendance/check-in');
    return res.data.data;
  },

  checkOut: async (): Promise<Attendance> => {
    const res = await api.post<{ success: boolean; message: string; data: Attendance }>('/attendance/check-out');
    return res.data.data;
  },

  markAttendance: async (data: {
    employeeId: string;
    date?: string;
    status: AttendanceStatus;
    checkIn?: string;
    checkOut?: string;
    notes?: string;
  }): Promise<Attendance> => {
    const res = await api.post<{ success: boolean; message: string; data: Attendance }>('/attendance/mark', data);
    return res.data.data;
  },
};

export default attendanceService;
