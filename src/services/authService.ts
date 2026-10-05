import api from './api';
import type { User } from '@/types';

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export const authService = {
  login: async (usernameOrEmail: string, password?: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/login', {
      username: usernameOrEmail,
      email: usernameOrEmail,
      password,
    });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('currentUser', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (userData: { name: string; username: string; email: string; password: string; role?: string }) => {
    const res = await api.post<LoginResponse>('/auth/register', userData);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('currentUser', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<{ success: boolean; user: User }>('/auth/me');
    return res.data.user;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  },
};

export default authService;
