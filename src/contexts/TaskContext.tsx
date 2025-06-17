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
    setLoadingTasks(true);
    setTimeout(() => {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        try {
          const parsedTasks: Task[] = JSON.parse(storedTasks);
          // Ensure all tasks have date fields as strings
          const validatedTasks = parsedTasks.map(task => ({
            ...task,
            createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: task.updatedAt ? new Date(task.updatedAt).toISOString() : new Date().toISOString(),
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
          }));
          setTasks(validatedTasks);
        } catch (e) {
          console.error("Failed to parse tasks from localStorage", e);
          setTasks(mockTasks); 
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
    if (!loadingTasks) { 
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, loadingTasks]);


  const employees = mockUsers.filter(user => user.role === 'employee');

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'assignedBy'>): Promise<Task | null> => {
    if (!currentUser || currentUser.role !== 'admin') return null;
    await new Promise(resolve => setTimeout(resolve, 300));
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      assignedBy: currentUser.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // dueDate is already part of taskData
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    return newTask;
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<Task | null> => {
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
