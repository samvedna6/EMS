"use client";

import React, { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { TaskProvider } from '@/contexts/TaskContext';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <TaskProvider>
        {children}
      </TaskProvider>
    </AuthProvider>
  );
};
