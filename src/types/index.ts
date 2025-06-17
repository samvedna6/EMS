export type Role = 'admin' | 'employee';

export type User = {
  id: string;
  username: string;
  password?: string; // Password should ideally not be stored or passed around like this in a real app
  role: Role;
  name: string;
};

export type TaskStatus = 'pending' | 'active' | 'completed' | 'failed';

export type Task = {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // Employee User ID
  assignedBy: string; // Admin User ID
  status: TaskStatus;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  dueDate?: string; // Optional ISO Date string
};

