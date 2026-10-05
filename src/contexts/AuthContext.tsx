"use client";

import type { User, Role } from '@/types';
import authService from '@/services/authService';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  login: (usernameOrEmail: string, password?: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('currentUser');

        if (token && storedUser) {
          try {
            const parsed: User = JSON.parse(storedUser);
            setCurrentUser(parsed);
            // Verify and refresh with backend
            const freshUser = await authService.getMe();
            setCurrentUser(freshUser);
            localStorage.setItem('currentUser', JSON.stringify(freshUser));
          } catch (verifyErr) {
            console.warn("Session verification warning:", verifyErr);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth state", error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (usernameOrEmail: string, password?: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await authService.login(usernameOrEmail, password);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        return res.user;
      }
      throw new Error(res.message || 'Login failed');
    } catch (err: any) {
      console.error("Login attempt error:", err.response?.data?.message || err.message);
      throw err; // Propagate the actual error up to LoginForm
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
