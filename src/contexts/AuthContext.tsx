"use client";

import type { User, Role } from '@/types';
import { mockUsers } from '@/lib/mockData';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  login: (usernameOrUser: string | User, password?: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Try to load user from localStorage on initial mount
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        // Validate user against mockUsers to ensure it's a valid session
        const validUser = mockUsers.find(u => u.id === parsedUser.id && u.role === parsedUser.role);
        if (validUser) {
          setCurrentUser(validUser);
        } else {
          localStorage.removeItem('currentUser'); // Clear invalid stored user
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('currentUser');
    }
    setLoading(false);
  }, []);

  const login = async (usernameOrUser: string | User, password?: string): Promise<User | null> => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let foundUser: User | undefined;

    if (typeof usernameOrUser === 'string') {
      const username = usernameOrUser;
      foundUser = mockUsers.find(
        (user) => user.username === username && user.password === password
      );
    } else { // Used for auto-login from storage if needed, or direct user object login
      foundUser = mockUsers.find(u => u.id === usernameOrUser.id);
    }

    if (foundUser) {
      const userToStore = { ...foundUser };
      delete userToStore.password; // Don't store password
      setCurrentUser(userToStore);
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      setLoading(false);
      return userToStore;
    }
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setLoading(false);
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
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
