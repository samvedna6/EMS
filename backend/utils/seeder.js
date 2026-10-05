const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');

const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');

const seedData = async (shouldDisconnect = false) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    console.log('[Seeder] Clearing old database records...');
    await Promise.all([
      User.deleteMany(),
      Employee.deleteMany(),
      Department.deleteMany(),
      Task.deleteMany(),
      Attendance.deleteMany(),
      Leave.deleteMany(),
      Payroll.deleteMany(),
    ]);

    console.log('[Seeder] Creating Departments...');
    const departments = await Department.create([
      { name: 'Engineering', description: 'Software engineering, architecture, and IT operations' },
      { name: 'Human Resources', description: 'Talent management, employee relations, and compliance' },
      { name: 'Product & Design', description: 'UI/UX design, product strategy, and user research' },
      { name: 'Marketing', description: 'Growth, brand marketing, and market communication' },
      { name: 'Operations', description: 'Internal logistics, facilities, and administration' },
    ]);

    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.name] = d._id;
    });

    console.log('[Seeder] Creating Admin and HR users...');
    const adminUser = await User.create({
      name: 'Admin User',
      username: 'admin',
      email: 'admin@taskflow.com',
      password: 'password',
      role: 'admin',
    });

    const hrUser = await User.create({
      name: 'HR Manager',
      username: 'hr_user',
      email: 'hr@taskflow.com',
      password: 'password',
      role: 'hr',
    });

    console.log('[Seeder] Creating Prototype Employees...');
    const employeeData = [
      {
        name: 'Ram Sagar',
        username: 'ram_sagar',
        email: 'ram.sagar@taskflow.com',
        designation: 'Senior Full Stack Developer',
        dept: 'Engineering',
        salary: 85000,
        phone: '+1 555-0101',
      },
      {
        name: 'Samvedna Kumari',
        username: 'samvedna_kumari',
        email: 'samvedna.kumari@taskflow.com',
        designation: 'Lead UI/UX Designer',
        dept: 'Product & Design',
        salary: 80000,
        phone: '+1 555-0102',
      },
      {
        name: 'Ankit Kumar',
        username: 'ankit_kumar',
        email: 'ankit.kumar@taskflow.com',
        designation: 'Frontend Engineer',
        dept: 'Engineering',
        salary: 72000,
        phone: '+1 555-0103',
      },
      {
        name: 'Kalpana',
        username: 'kalpana',
        email: 'kalpana@taskflow.com',
        designation: 'Backend Specialist',
        dept: 'Engineering',
        salary: 75000,
        phone: '+1 555-0104',
      },
      {
        name: 'Vidya',
        username: 'vidya',
        email: 'vidya@taskflow.com',
        designation: 'HR Coordinator',
        dept: 'Human Resources',
        salary: 62000,
        phone: '+1 555-0105',
      },
      {
        name: 'Prem Sagar',
        username: 'prem_sagar',
        email: 'prem.sagar@taskflow.com',
        designation: 'DevOps Engineer',
        dept: 'Engineering',
        salary: 78000,
        phone: '+1 555-0106',
      },
      {
        name: 'Sujoy Sagar',
        username: 'sujoy_sagar',
        email: 'sujoy.sagar@taskflow.com',
        designation: 'Marketing Executive',
        dept: 'Marketing',
        salary: 60000,
        phone: '+1 555-0107',
      },
      {
        name: 'RajLaxmi',
        username: 'rajlaxmi',
        email: 'rajlaxmi@taskflow.com',
        designation: 'QA Automation Engineer',
        dept: 'Engineering',
        salary: 68000,
        phone: '+1 555-0108',
      },
      {
        name: 'Neha',
        username: 'neha',
        email: 'neha@taskflow.com',
        designation: 'Operations Specialist',
        dept: 'Operations',
        salary: 58000,
        phone: '+1 555-0109',
      },
    ];

    const createdEmployees = [];
    const createdUsers = [];

    for (let i = 0; i < employeeData.length; i++) {
      const item = employeeData[i];
      const names = item.name.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || 'Employee';

      const user = await User.create({
        name: item.name,
        username: item.username,
        email: item.email,
        password: 'password',
        role: 'employee',
      });

      const employee = await Employee.create({
        user: user._id,
        employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
        firstName,
        lastName,
        email: item.email,
        phone: item.phone,
        department: deptMap[item.dept],
        designation: item.designation,
        salary: item.salary,
        status: 'Active',
        employmentType: 'Full-Time',
        dateOfBirth: new Date(1995, 2 + i, 10 + i),
        joiningDate: new Date(2023, 0, 15 + i),
        address: `${100 + i * 12} Innovation Way, Tech Park`,
        emergencyContact: {
          name: `${firstName} Emergency Contact`,
          phone: item.phone,
          relationship: 'Family',
        },
      });

      user.employeeProfile = employee._id;
      await user.save();

      createdEmployees.push(employee);
      createdUsers.push(user);
    }

    // Update department employee counts
    for (const dept of departments) {
      const count = await Employee.countDocuments({ department: dept._id });
      dept.employeeCount = count;
      await dept.save();
    }

    console.log('[Seeder] Creating Tasks...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const tasksData = [
      {
        title: 'Revamp Dashboard UI Components',
        description: 'Update the card layouts and status badges to conform to modern responsive standards.',
        assignedTo: createdUsers[1]._id, // Samvedna Kumari
        assignedBy: adminUser._id,
        status: 'active',
        dueDate: tomorrow,
      },
      {
        title: 'Design Authentication Flow Wireframes',
        description: 'Create Figma interactive prototypes for login, registration, and reset screens.',
        assignedTo: createdUsers[1]._id, // Samvedna Kumari
        assignedBy: adminUser._id,
        status: 'completed',
        dueDate: yesterday,
      },
      {
        title: 'Implement RESTful API Endpoints for Attendance',
        description: 'Build check-in, check-out, and daily status calculation endpoints with MongoDB indexes.',
        assignedTo: createdUsers[0]._id, // Ram Sagar
        assignedBy: adminUser._id,
        status: 'active',
        dueDate: in3Days,
      },
      {
        title: 'Optimize Database Query Indexes',
        description: 'Analyze aggregation pipeline performance and create compound indexes for employees and tasks.',
        assignedTo: createdUsers[3]._id, // Kalpana
        assignedBy: adminUser._id,
        status: 'pending',
        dueDate: tomorrow,
      },
      {
        title: 'Configure CI/CD Pipelines for Staging',
        description: 'Automate build verification and test deployment with containerized services.',
        assignedTo: createdUsers[5]._id, // Prem Sagar
        assignedBy: adminUser._id,
        status: 'pending',
        dueDate: in3Days,
      },
      {
        title: 'Conduct Employee Onboarding Workshop',
        description: 'Facilitate new joiner orientation on company tools and policies.',
        assignedTo: createdUsers[4]._id, // Vidya
        assignedBy: hrUser._id,
        status: 'completed',
        dueDate: yesterday,
      },
    ];

    await Task.create(tasksData);

    console.log('[Seeder] Creating Attendance records...');
    const todayStr = now.toISOString().split('T')[0];

    for (let i = 0; i < createdEmployees.length; i++) {
      const emp = createdEmployees[i];
      const checkInTime = new Date();
      checkInTime.setHours(9, 15 + i * 2, 0);

      // Make first 7 present, 1 absent, 1 half-day
      let status = 'Present';
      if (i === 7) status = 'Absent';
      if (i === 8) status = 'Half Day';

      await Attendance.create({
        employee: emp._id,
        user: emp.user,
        date: todayStr,
        checkIn: status !== 'Absent' ? checkInTime : undefined,
        status,
        notes: status === 'Half Day' ? 'Doctor appointment in morning' : undefined,
      });
    }

    console.log('[Seeder] Creating Leave records...');
    await Leave.create([
      {
        employee: createdEmployees[1]._id, // Samvedna Kumari
        user: createdUsers[1]._id,
        leaveType: 'Annual',
        startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        reason: 'Family vacation and personal travel',
        status: 'Pending',
      },
      {
        employee: createdEmployees[2]._id, // Ankit Kumar
        user: createdUsers[2]._id,
        leaveType: 'Sick',
        startDate: yesterday,
        endDate: todayStr,
        reason: 'Viral fever recovery',
        status: 'Approved',
        approvedBy: adminUser._id,
        approvalRemarks: 'Approved. Get well soon!',
      },
      {
        employee: createdEmployees[0]._id, // Ram Sagar
        user: createdUsers[0]._id,
        leaveType: 'Casual',
        startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        reason: 'Home renovation meeting',
        status: 'Pending',
      },
    ]);

    console.log('====================================================');
    console.log('       EMS MERN Database Seeded Successfully!       ');
    console.log('====================================================');
    console.log('[SECURITY NOTICE] The accounts below are for DEVELOPMENT/TESTING ONLY.');
    console.log('[SECURITY NOTICE] Do NOT use default passwords in production.');
    console.log('----------------------------------------------------');
    console.log('Admin Account (Full System Control):');
    console.log('  Username: admin');
    console.log('  Email:    admin@taskflow.com');
    console.log('  Password: password (DEV ONLY)');
    console.log('');
    console.log('HR Manager Account:');
    console.log('  Username: hr_user');
    console.log('  Email:    hr@taskflow.com');
    console.log('  Password: password (DEV ONLY)');
    console.log('');
    console.log('Sample Employee Accounts (password: password - DEV ONLY):');
    console.log('  - samvedna_kumari (samvedna.kumari@taskflow.com) [UI/UX Lead]');
    console.log('  - ram_sagar       (ram.sagar@taskflow.com)       [Sr Full Stack]');
    console.log('  - ankit_kumar     (ankit.kumar@taskflow.com)     [Frontend]');
    console.log('  - kalpana         (kalpana@taskflow.com)         [Backend]');
    console.log('  - vidya           (vidya@taskflow.com)           [HR Coordinator]');
    console.log('  - prem_sagar      (prem.sagar@taskflow.com)      [DevOps]');
    console.log('  - sujoy_sagar     (sujoy.sagar@taskflow.com)     [Marketing]');
    console.log('  - rajlaxmi        (rajlaxmi@taskflow.com)        [QA Automation]');
    console.log('  - neha            (neha@taskflow.com)            [Operations]');
    console.log('====================================================');

    if (shouldDisconnect) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seeder] Error seeding data:', error);
    if (shouldDisconnect) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;
