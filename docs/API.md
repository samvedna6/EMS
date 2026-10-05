# TaskFlow EMS REST API Documentation

This document describes all REST API endpoints available in the **TaskFlow EMS** backend server.

- **Base URL (Local)**: `http://localhost:5000/api`
- **Default Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <jwt_token>` (for protected routes)

---

## Table of Contents
1. [System & Health](#1-system--health)
2. [Authentication & Profile](#2-authentication--profile)
3. [Dashboard Metrics](#3-dashboard-metrics)
4. [Employee Management](#4-employee-management)
5. [Department Management](#5-department-management)
6. [Attendance Management](#6-attendance-management)
7. [Leave Management](#7-leave-management)
8. [Task Management](#8-task-management)
9. [Standard Error Codes & Structure](#9-standard-error-codes--structure)

---

## 1. System & Health

### `GET /api/health`
Checks API server and database connection health.

- **Authentication**: None
- **Role**: Public
- **Request Body**: None
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "TaskFlow EMS API is running",
  "environment": "development",
  "database": {
    "status": "connected",
    "type": "MongoDB Atlas"
  },
  "timestamp": "2026-09-19T06:45:00.000Z"
}
```
- **Possible Errors**: None (Server returns 500 if internal crash occurs).

---

## 2. Authentication & Profile

### `POST /api/auth/register`
Creates a new user login credential.

- **Authentication**: None (or Admin)
- **Role**: Public / Admin
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "username": "jane_doe",
  "email": "jane.doe@company.com",
  "password": "password123",
  "role": "employee"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "6741...",
    "_id": "6741...",
    "name": "Jane Doe",
    "username": "jane_doe",
    "email": "jane.doe@company.com",
    "role": "employee"
  }
}
```
- **Possible Errors**:
  - `400 Bad Request`: User already exists with that email or username, or validation failure.

---

### `POST /api/auth/login`
Authenticates user and generates a signed JWT bearer token.

- **Authentication**: None
- **Role**: Public
- **Request Body**:
```json
{
  "username": "admin",
  "password": "password"
}
```
*(Note: `email` can also be passed in place of or alongside `username`)*
- **Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "6741...",
    "_id": "6741...",
    "name": "Admin User",
    "username": "admin",
    "email": "admin@taskflow.com",
    "role": "admin",
    "employeeProfile": null
  }
}
```
- **Possible Errors**:
  - `400 Bad Request`: Missing username/email or password.
  - `401 Unauthorized`: Invalid credentials (incorrect password or user not found).

---

### `GET /api/auth/me`
Retrieves currently authenticated user's session and profile.

- **Authentication**: Bearer Token
- **Role**: Any authenticated user (`admin`, `hr`, `employee`)
- **Request Body**: None
- **Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": "6741...",
    "_id": "6741...",
    "name": "Samvedna Kumari",
    "username": "samvedna_kumari",
    "email": "samvedna.kumari@taskflow.com",
    "role": "employee",
    "employeeProfile": {
      "_id": "6742...",
      "employeeId": "EMP0002",
      "firstName": "Samvedna",
      "lastName": "Kumari",
      "designation": "Lead UI/UX Designer"
    }
  }
}
```
- **Possible Errors**:
  - `401 Unauthorized`: Missing, invalid, or expired JWT.

---

## 3. Dashboard Metrics

### `GET /api/dashboard/stats`
Aggregates live workforce, department, attendance, and task statistics.

- **Authentication**: Bearer Token
- **Role**: Any authenticated user (Employees see their personal task counts; Admins/HR see organization totals)
- **Request Body**: None
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "totalEmployees": 9,
    "activeEmployees": 9,
    "inactiveEmployees": 0,
    "totalDepartments": 5,
    "presentToday": 8,
    "absentToday": 1,
    "pendingLeaves": 2,
    "approvedLeaves": 1,
    "tasks": {
      "total": 6,
      "pending": 2,
      "active": 2,
      "completed": 2,
      "failed": 0
    },
    "departments": [
      {
        "_id": "6743...",
        "name": "Engineering",
        "employeeCount": 5
      }
    ],
    "recentTasks": [...]
  }
}
```

---

## 4. Employee Management

### `GET /api/employees`
Lists employees with search, department/status filters, and pagination.

- **Authentication**: Bearer Token
- **Role**: `admin`, `hr`
- **Query Parameters**:
  - `search`: string (keyword matched against name, email, designation, employee ID)
  - `department`: ObjectId / string
  - `status`: `Active` | `Inactive`
  - `page`: number (default: 1)
  - `limit`: number (default: 50)
- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 9,
  "total": 9,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "_id": "6742...",
      "employeeId": "EMP0001",
      "firstName": "Ram",
      "lastName": "Sagar",
      "email": "ram.sagar@taskflow.com",
      "designation": "Senior Full Stack Developer",
      "department": {
        "_id": "6743...",
        "name": "Engineering"
      },
      "salary": 85000,
      "status": "Active"
    }
  ]
}
```

---

### `POST /api/employees`
Creates an employee profile and automatically establishes a user account.

- **Authentication**: Bearer Token
- **Role**: `admin`, `hr`
- **Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@company.com",
  "phone": "+1 555-0199",
  "designation": "Frontend Developer",
  "department": "6743...",
  "salary": 75000,
  "employmentType": "Full-Time",
  "status": "Active",
  "password": "password"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Employee and user account created successfully",
  "data": { ... }
}
```
- **Possible Errors**:
  - `400 Bad Request`: Missing required fields, invalid email format, negative salary, or duplicate email.
  - `403 Forbidden`: Employee role attempting mutation.

---

### `PUT /api/employees/:id`
Updates an existing employee record.

- **Authentication**: Bearer Token
- **Role**: `admin`, `hr`
- **Request Body**: (Any employee fields to update)
```json
{
  "designation": "Senior Frontend Developer",
  "salary": 82000
}
```
- **Response (200 OK)**: Updated employee object.
- **Possible Errors**:
  - `400 Bad Request`: Invalid email format or negative salary.
  - `404 Not Found`: Employee not found.

---

### `DELETE /api/employees/:id`
Deletes employee, unassigns department management roles, deletes pending tasks, and cleans up linked login credentials.

- **Authentication**: Bearer Token
- **Role**: `admin`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```
- **Possible Errors**:
  - `404 Not Found`: Employee not found.
  - `403 Forbidden`: Non-admin role attempting deletion.

---

## 5. Department Management

### `GET /api/departments`
Lists all departments with dynamically computed live employee counts.

- **Authentication**: Bearer Token
- **Role**: Any authenticated user
- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "6743...",
      "name": "Engineering",
      "description": "Software engineering and IT",
      "employeeCount": 5,
      "manager": {
        "_id": "6742...",
        "firstName": "Ram",
        "lastName": "Sagar"
      }
    }
  ]
}
```

---

### `POST /api/departments`
Creates a new organizational department.

- **Authentication**: Bearer Token
- **Role**: `admin`, `hr`
- **Request Body**:
```json
{
  "name": "Data Science",
  "description": "Machine learning and data warehousing",
  "manager": "6742..."
}
```
- **Response (201 Created)**: Created department object.
- **Possible Errors**:
  - `400 Bad Request`: Duplicate or empty department name.

---

### `DELETE /api/departments/:id`
Safely removes a department (with relational guard preventing deletion if staff are assigned).

- **Authentication**: Bearer Token
- **Role**: `admin`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Department deleted successfully"
}
```
- **Possible Errors**:
  - `400 Bad Request`: Cannot delete department because employees are currently assigned to it.
  - `404 Not Found`: Department not found.

---

## 6. Attendance Management

### `GET /api/attendance`
Company-wide attendance log.

- **Authentication**: Bearer Token
- **Role**: `admin`, `hr`
- **Query Parameters**: `date` (YYYY-MM-DD), `employee` (ObjectId), `status`
- **Response (200 OK)**: Array of attendance records.

---

### `GET /api/attendance/my`
Employee's personal attendance history and today's punch status.

- **Authentication**: Bearer Token
- **Role**: Authenticated employee
- **Response (200 OK)**:
```json
{
  "success": true,
  "today": {
    "_id": "6744...",
    "date": "2026-09-19",
    "checkIn": "2026-09-19T09:15:00.000Z",
    "checkOut": null,
    "status": "Present"
  },
  "data": [...]
}
```

---

### `POST /api/attendance/check-in`
Punches clock-in timestamp for the logged-in employee today.

- **Authentication**: Bearer Token
- **Role**: Authenticated employee
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": { ... }
}
```
- **Possible Errors**:
  - `400 Bad Request`: Employee has already checked in today (duplicate prevention).

---

### `POST /api/attendance/check-out`
Punches clock-out timestamp for the logged-in employee today.

- **Authentication**: Bearer Token
- **Role**: Authenticated employee
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Checked out successfully",
  "data": { ... }
}
```
- **Possible Errors**:
  - `400 Bad Request`: Must check in before checking out.

---

### `POST /api/attendance/mark`
Admin manual attendance override/logging.

- **Authentication**: Bearer Token
- **Role**: `admin`, `hr`
- **Request Body**:
```json
{
  "employeeId": "6742...",
  "date": "2026-09-19",
  "status": "Present",
  "notes": "Manual adjustment by HR"
}
```
- **Response (200 OK)**: Upserted attendance record.

---

## 7. Leave Management

### `GET /api/leaves`
Lists leave requests across the company with status filters.

- **Authentication**: Bearer Token
- **Role**: `admin`, `hr`
- **Query Parameters**: `status` (`Pending`, `Approved`, `Rejected`), `leaveType`
- **Response (200 OK)**: Array of leave applications.

---

### `GET /api/leaves/my`
Employee's personal leave requests and status history.

- **Authentication**: Bearer Token
- **Role**: Authenticated employee
- **Response (200 OK)**: Array of employee's leave records.

---

### `POST /api/leaves`
Applies for time-off.

- **Authentication**: Bearer Token
- **Role**: Authenticated employee
- **Request Body**:
```json
{
  "leaveType": "Annual",
  "startDate": "2026-10-01",
  "endDate": "2026-10-05",
  "reason": "Personal family travel"
}
```
- **Response (201 Created)**: Created leave application (status: `Pending`).
- **Possible Errors**:
  - `400 Bad Request`: Missing dates/reason, start date after end date, or invalid date format.

---

### `PUT /api/leaves/:id/status`
Approve or reject an employee leave request.

- **Authentication**: Bearer Token
- **Role**: `admin`, `hr`
- **Request Body**:
```json
{
  "status": "Approved",
  "approvalRemarks": "Approved. Enjoy your time off!"
}
```
- **Response (200 OK)**: Updated leave record with approval status and timestamp.

---

## 8. Task Management

### `GET /api/tasks`
Lists tasks. Admin/HR see all tasks; employees receive only tasks assigned to them.

- **Authentication**: Bearer Token
- **Role**: Any authenticated user
- **Query Parameters**: `status` (`pending`, `active`, `completed`, `failed`), `assignedTo`
- **Response (200 OK)**: Array of tasks.

---

### `POST /api/tasks`
Creates and assigns a task to an employee.

- **Authentication**: Bearer Token
- **Role**: `admin`, `hr`
- **Request Body**:
```json
{
  "title": "Upgrade Database Indexes",
  "description": "Analyze slow queries and add compound indexes.",
  "assignedTo": "6741...",
  "dueDate": "2026-09-25"
}
```
- **Response (201 Created)**: Created task record.
- **Possible Errors**:
  - `400 Bad Request`: Missing or blank title/description, invalid due date, or invalid assignedTo user.

---

### `PUT /api/tasks/:id/status`
Updates task progression status (`pending` -> `active` -> `completed` / `failed`).

- **Authentication**: Bearer Token
- **Role**: Assigned employee or Admin/HR
- **Request Body**:
```json
{
  "status": "completed"
}
```
- **Response (200 OK)**: Updated task record.
- **Possible Errors**:
  - `400 Bad Request`: Invalid status string.
  - `403 Forbidden`: Employee attempting to update a task not assigned to them.

---

### `DELETE /api/tasks/:id`
Removes a task from the system.

- **Authentication**: Bearer Token
- **Role**: `admin`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Task successfully removed"
}
```

---

## 9. Standard Error Codes & Structure

All error responses return a uniform JSON format:

```json
{
  "success": false,
  "message": "Descriptive human-readable explanation of error",
  "stack": null
}
```

| HTTP Status | Meaning | Typical Trigger |
|---|---|---|
| `400 Bad Request` | Client validation failure | Missing required fields, invalid email format, negative salary, start date > end date, duplicate record |
| `401 Unauthorized` | Authentication failure | Missing, expired, or malformed JWT token, or incorrect login password |
| `403 Forbidden` | Authorization failure | Insufficient role privileges (e.g. employee attempting admin CRUD operations) |
| `404 Not Found` | Resource missing | Record with given ID or route does not exist in database |
| `500 Server Error` | Unexpected exception | Internal runtime failure (sanitized; stack traces suppressed in production) |
