export type Role = 'admin' | 'hr' | 'employee';

export interface User {
  id: string;
  _id?: string;
  username: string;
  name: string;
  email?: string;
  password?: string;
  role: Role;
  employeeProfile?: any;
}

export type TaskStatus = 'pending' | 'active' | 'completed' | 'failed';

export interface Task {
  id: string;
  _id?: string;
  title: string;
  description: string;
  assignedTo: string; // Employee User ID
  assignedToUser?: {
    _id: string;
    name: string;
    username: string;
    email?: string;
  };
  assignedBy: string; // Admin User ID
  assignedByUser?: {
    _id: string;
    name: string;
    username: string;
  };
  status: TaskStatus;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  dueDate?: string; // Optional ISO Date string
}

export interface Department {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  manager?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    designation: string;
  };
  employeeCount: number;
  createdAt?: string;
}

export interface Employee {
  _id: string;
  id?: string;
  user?: {
    _id: string;
    username: string;
    role: string;
  };
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  department?: Department | string;
  designation: string;
  joiningDate?: string;
  salary: number;
  employmentType?: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  status: 'Active' | 'Inactive';
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'Leave';

export interface Attendance {
  _id: string;
  id?: string;
  employee: Employee | string;
  user: User | string;
  date: string; // YYYY-MM-DD
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  notes?: string;
  createdAt?: string;
}

export type LeaveType = 'Casual' | 'Sick' | 'Annual' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Leave {
  _id: string;
  id?: string;
  employee: Employee | string;
  user: User | string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approvedBy?: User | string;
  approvalRemarks?: string;
  createdAt?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalDepartments: number;
  presentToday: number;
  absentToday: number;
  pendingLeaves: number;
  approvedLeaves: number;
  tasks: {
    total: number;
    pending: number;
    active: number;
    completed: number;
    failed: number;
  };
  departments: Array<{
    _id: string;
    name: string;
    employeeCount: number;
  }>;
  recentTasks: any[];
}
