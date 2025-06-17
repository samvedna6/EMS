import type { User, Task, Role, TaskStatus } from '@/types';

export const mockUsers: User[] = [
  { id: 'admin1', username: 'admin', password: 'password', role: 'admin', name: 'Admin User' },
  { id: 'emp1', username: 'employee1', password: 'password', role: 'employee', name: 'Alice Smith' },
  { id: 'emp2', username: 'employee2', password: 'password', role: 'employee', name: 'Bob Johnson' },
  { id: 'emp3', username: 'employee3', password: 'password', role: 'employee', name: 'Charlie Brown' },
];

export const mockTasks: Task[] = [
  {
    id: 'task1',
    title: 'Design Landing Page Mockup',
    description: 'Create a high-fidelity mockup for the new landing page based on the provided wireframes. Focus on modern UI/UX principles.',
    assignedTo: 'emp1',
    assignedBy: 'admin1',
    status: 'pending',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // Due in 4 days
  },
  {
    id: 'task2',
    title: 'Develop API Authentication',
    description: 'Implement JWT-based authentication for the core API. Ensure all endpoints are protected appropriately.',
    assignedTo: 'emp2',
    assignedBy: 'admin1',
    status: 'active',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Due in 7 days
  },
  {
    id: 'task3',
    title: 'Write User Documentation',
    description: 'Draft the initial user guide for the new features released in Q2. Include screenshots and step-by-step instructions.',
    assignedTo: 'emp1',
    assignedBy: 'admin1',
    status: 'completed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: 'task4',
    title: 'Client Presentation Setup',
    description: 'Prepare the presentation deck and demo environment for the upcoming client meeting on Friday.',
    assignedTo: 'emp3',
    assignedBy: 'admin1',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Due in 2 days
  },
   {
    id: 'task5',
    title: 'Database Schema Review',
    description: 'Review the proposed database schema changes for the upcoming module and provide feedback.',
    assignedTo: 'emp2',
    assignedBy: 'admin1',
    status: 'failed',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

