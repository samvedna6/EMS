
import type { User, Task, Role, TaskStatus } from '@/types';

export const mockUsers: User[] = [
  { id: 'admin1', username: 'admin', password: 'password', role: 'admin', name: 'Admin User' },
  { id: 'emp1', username: 'employee1', password: 'password', role: 'employee', name: 'Alice Smith' },
  { id: 'emp2', username: 'employee2', password: 'password', role: 'employee', name: 'Bob Johnson' },
  { id: 'emp3', username: 'employee3', password: 'password', role: 'employee', name: 'Charlie Brown' },
];

export const mockTasks: Task[] = [];
