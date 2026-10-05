"use client";

import type { Task, TaskStatus, User, Employee } from '@/types';
import taskService from '@/services/taskService';
import employeeService from '@/services/employeeService';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface TaskContextType {
  tasks: Task[];
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'assignedBy'>) => Promise<Task | null>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<Task | null>;
  removeTask: (taskId: string) => Promise<boolean>;
  getTasksForEmployee: (employeeId: string) => Task[];
  getTaskCounts: () => { total: number; pending: number; active: number; completed: number; failed: number };
  getEmployeeNameById: (employeeId: string) => string;
  employees: User[];
  loadingTasks: boolean;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const { currentUser } = useAuth();

  const fetchTasksAndEmployees = useCallback(async () => {
    if (!currentUser) {
      setTasks([]);
      setLoadingTasks(false);
      return;
    }

    setLoadingTasks(true);
    try {
      // Fetch tasks from real backend
      const tasksData = await taskService.getTasks();
      setTasks(tasksData);

      // Fetch employees for assignment list
      const empRes = await employeeService.getEmployees({ limit: 100 });
      if (empRes.data) {
        const mappedUsers: User[] = empRes.data.map((emp) => ({
          id: (emp.user && emp.user._id) || emp._id,
          _id: (emp.user && emp.user._id) || emp._id,
          name: `${emp.firstName} ${emp.lastName}`,
          username: emp.user?.username || emp.employeeId,
          email: emp.email,
          role: 'employee',
        }));
        setEmployees(mappedUsers);
      }
    } catch (err) {
      console.error("Failed to load tasks or employees from backend", err);
    } finally {
      setLoadingTasks(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTasksAndEmployees();
  }, [fetchTasksAndEmployees]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'assignedBy'>): Promise<Task | null> => {
    if (!currentUser || currentUser.role === 'employee') return null;
    try {
      const newTask = await taskService.createTask({
        title: taskData.title,
        description: taskData.description,
        assignedTo: taskData.assignedTo,
        dueDate: taskData.dueDate,
      });
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (error) {
      console.error("Failed to create task", error);
      return null;
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<Task | null> => {
    try {
      const updated = await taskService.updateTaskStatus(taskId, status);
      setTasks((prev) => prev.map((t) => (t.id === taskId || t._id === taskId ? updated : t)));
      return updated;
    } catch (error) {
      console.error("Failed to update task status", error);
      return null;
    }
  };

  const removeTask = async (taskId: string): Promise<boolean> => {
    if (!currentUser || currentUser.role === 'employee') return false;
    try {
      const success = await taskService.deleteTask(taskId);
      if (success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId && t._id !== taskId));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to remove task", error);
      return false;
    }
  };

  const getTasksForEmployee = (employeeId: string): Task[] => {
    return tasks.filter((task) => {
      const assignedId = task.assignedTo;
      const assignedUserId = task.assignedToUser?._id;
      return (
        assignedId === employeeId ||
        assignedUserId === employeeId ||
        (currentUser && (task.assignedTo === currentUser.id || task.assignedTo === currentUser._id))
      );
    });
  };

  const getTaskCounts = () => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      active: tasks.filter((t) => t.status === 'active').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      failed: tasks.filter((t) => t.status === 'failed').length,
    };
  };

  const getEmployeeNameById = (employeeId: string): string => {
    // Check if task has populated assignedToUser
    const matchingEmployee = employees.find(
      (user) => user.id === employeeId || user._id === employeeId
    );
    if (matchingEmployee) return matchingEmployee.name;

    const taskMatch = tasks.find(
      (t) => t.assignedTo === employeeId || t.assignedToUser?._id === employeeId
    );
    if (taskMatch?.assignedToUser?.name) return taskMatch.assignedToUser.name;

    return 'Unknown Employee';
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTaskStatus,
        removeTask,
        getTasksForEmployee,
        getTaskCounts,
        getEmployeeNameById,
        employees,
        loadingTasks,
        refreshTasks: fetchTasksAndEmployees,
      }}
    >
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
