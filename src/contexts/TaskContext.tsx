"use client";

import type { Task, TaskStatus, User } from '@/types';
import { mockTasks, mockUsers } from '@/lib/mockData';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface TaskContextType {
  tasks: Task[];
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'assignedBy'>) => Promise<Task | null>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<Task | null>;
  getTasksForEmployee: (employeeId: string) => Task[];
  getTaskCounts: () => { total: number; pending: number; active: number; completed: number; failed: number };
  getEmployeeNameById: (employeeId: string) => string;
  employees: User[];
  loadingTasks: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Load initial tasks (simulating fetching from a backend)
    setLoadingTasks(true);
    // Simulate API call
    setTimeout(() => {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        try {
          setTasks(JSON.parse(storedTasks));
        } catch (e) {
          console.error("Failed to parse tasks from localStorage", e);
          setTasks(mockTasks); // Fallback to mockTasks
          localStorage.setItem('tasks', JSON.stringify(mockTasks));
        }
      } else {
        setTasks(mockTasks);
        localStorage.setItem('tasks', JSON.stringify(mockTasks));
      }
      setLoadingTasks(false);
    }, 500);
  }, []);

  useEffect(() => {
    // Persist tasks to localStorage whenever they change
    if (!loadingTasks) { // Only save if not in initial load phase
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, loadingTasks]);


  const employees = mockUsers.filter(user => user.role === 'employee');

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'assignedBy'>): Promise<Task | null> => {
    if (!currentUser || currentUser.role !== 'admin') return null;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      assignedBy: currentUser.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    return newTask;
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<Task | null> => {
     // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    let updatedTask: Task | null = null;
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          updatedTask = { ...task, status, updatedAt: new Date().toISOString() };
          return updatedTask;
        }
        return task;
      })
    );
    return updatedTask;
  };

  const getTasksForEmployee = (employeeId: string): Task[] => {
    return tasks.filter(task => task.assignedTo === employeeId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getTaskCounts = () => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      active: tasks.filter(t => t.status === 'active').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
    };
  };

  const getEmployeeNameById = (employeeId: string): string => {
    const employee = mockUsers.find(user => user.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTaskStatus, getTasksForEmployee, getTaskCounts, getEmployeeNameById, employees, loadingTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
