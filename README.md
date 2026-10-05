# TaskFlow EMS - Production-Style MERN Application

A full-stack enterprise **Employee Management & TaskFlow System** built with **Next.js**, **React**, **TypeScript**, **Node.js**, **Express**, and **MongoDB**. The platform provides role-based access control (RBAC) across three distinct organizational tiers: **Administrator**, **HR Manager**, and **Employee**.

---

## 1. System Overview & Key Features

TaskFlow EMS integrates staff records, organizational hierarchies, task lifecycles, real-time daily attendance, and leave requests into a unified, responsive interface:

- **Executive & Administrative Dashboards**: Live key performance indicators (KPIs) aggregated dynamically from MongoDB (total staff, active vs. inactive, department distribution, today's attendance rates, and pending leave counts).
- **Staff Directory (CRUD)**: Complete workforce management with instant keyword search, department and status filters, modal-driven creation/editing, and safe deletion protections.
- **Department Management**: Organizational structure management featuring live dynamically computed staff headcounts via single MongoDB aggregations and deletion prevention guards.
- **Task Delegation & Tracking**: Admin/HR task assignment with due dates, paired with employee progression transitions (`pending` → `active` → `completed` / `failed`).
- **Daily Attendance**: Punch card interface supporting Clock-In and Clock-Out, automatic working hour calculation, compound unique database indexes preventing duplicate punches, and administrator manual adjustment capabilities.
- **Time-Off & Leave Workflows**: Multi-category leave requests (`Casual`, `Sick`, `Annual`, `Unpaid`) with date range validation, automated status handling (`Pending` → `Approved` / `Rejected`), and manager feedback remarks.
- **Security & RBAC**: Stateless JSON Web Token (JWT) authentication, bcrypt password hashing (10 salt rounds), secure CORS origin matching, and centralized server-side error formatting.

---

## 2. Technology Stack

### Frontend
- **Framework**: **Next.js 15.3.3** (App Router architecture)
- **Library**: **React 18.3.1**
- **Language**: **TypeScript 5.0**
- **HTTP Client**: **Axios** (Centralized instance with automatic Bearer token injection and 401 interception)
- **Styling**: **Tailwind CSS** with CSS variables (Dusty Rose, Mauve, and Light Peach palette)
- **Component Primitives**: **Radix UI** (Dialog, AlertDialog, Select, Tabs, Toast)
- **Icons**: **Lucide React**
- **Charts & Dates**: **Recharts**, **date-fns**

### Backend
- **Runtime**: **Node.js** (v18+, tested on v22)
- **Framework**: **Express.js 4.21**
- **Database Driver**: **Mongoose 8.9** (Schema validation, indexing, and aggregation pipelines)
- **Database**: **MongoDB Atlas** (Cloud Production Database) with embedded disk-persisted fallback for offline local development
- **Security & Auth**: **jsonwebtoken (JWT)**, **bcryptjs** (Password hashing), **cors** (Configurable origin policy)
- **Environment**: **dotenv**

---

## 3. System Architecture & Access Flow

```
[ User Browser ]
       │
       ▼
[ Next.js 15 Frontend (Port 9002) ]
       │
       ▼ (Axios + Authorization: Bearer <token>)
[ Express.js REST API Server (Port 5000) ]
       │
       ├──► [ CORS & Body Parser Middlewares ]
       │
       ├──► [ Authentication Middleware (JWT Verification) ]
       │
       ├──► [ Role-Based Access Control (RBAC: Admin | HR | Employee) ]
       │
       ├──► [ Express Controllers (Business Logic & Validation) ]
       │
       └──► [ Mongoose Models (Employee, Department, Task, Attendance, Leave, User) ]
                   │
                   ▼
       [ MongoDB Database Engine ]
         ├─► Production: MongoDB Atlas (Cloud Cluster via MONGO_URI)
         └─► Local Development: Embedded Persistent Storage (backend/.data/db)
```

### Role-Based Access Control (RBAC) Flow

| Area / Feature | Administrator (`admin`) | HR Manager (`hr`) | Employee (`employee`) |
| :--- | :---: | :---: | :---: |
| **System Dashboard** | Full Org Stats | Full Org Stats | Personal Stats & Tasks |
| **Employee Directory** | Create, Read, Update, Delete | Create, Read, Update | Forbidden (403) |
| **Department Management** | Create, Read, Update, Delete | Create, Read, Update | Read Only |
| **Task Delegation** | Create, Assign, Delete | Create, Assign | Personal Tasks Only |
| **Attendance Review** | View Company & Override | View Company & Override | Clock-In / Out & Personal History |
| **Leave Approval** | Approve & Reject with Remarks | Approve & Reject with Remarks | Apply & Track Personal Status |

---

## 4. Project Structure

```
TaskFlow-EMS/
│
├── backend/                              # Express.js REST API & Mongoose Layer
│   ├── config/
│   │   └── db.js                         # Database connector (Atlas / local persistent fallback)
│   ├── controllers/                      # Business logic controllers
│   │   ├── attendanceController.js       # Daily punch & admin adjustment
│   │   ├── authController.js             # Register, Login, GetMe
│   │   ├── dashboardController.js        # Parallelized stats aggregations
│   │   ├── departmentController.js       # Department management with live counts
│   │   ├── employeeController.js         # Workforce directory & search
│   │   ├── leaveController.js            # Leave applications & approval lifecycle
│   │   ├── payrollController.js          # Salary & compensation
│   │   └── taskController.js             # Task delegation & status updates
│   ├── middleware/
│   │   ├── authMiddleware.js             # JWT verification & role authorizers
│   │   └── errorMiddleware.js            # Centralized exception handler
│   ├── models/                           # Mongoose Schemas & Indexes
│   │   ├── Attendance.js                 # Unique compound { employee, date }
│   │   ├── Department.js                 # Unique department name
│   │   ├── Employee.js                   # Unique employeeId & email, indexed dept
│   │   ├── Leave.js                      # Indexed employee & status
│   │   ├── Payroll.js                    # Salary and payment tracking
│   │   ├── Task.js                       # Indexed assignedTo & status
│   │   └── User.js                       # Unique username & email, bcrypt pre-save
│   ├── routes/                           # Modular Express REST route definitions
│   ├── utils/
│   │   ├── auditRunner.js                # 39-point automated integration test suite
│   │   └── seeder.js                     # Deterministic database seeder
│   ├── .env.example                      # Backend environment variable template
│   ├── .gitignore                        # Ignores node_modules, .env, and .data
│   ├── package.json
│   └── server.js                         # Backend entry point (Port 5000)
│
├── docs/
│   └── API.md                            # Comprehensive REST API reference guide
│
├── src/                                  # Next.js Frontend Application
│   ├── app/                              # Next.js App Router
│   │   ├── admin/
│   │   │   ├── attendance/               # Company-wide attendance & overrides
│   │   │   ├── dashboard/                # Executive KPI metrics & task manager
│   │   │   ├── departments/              # Department directory & assignment
│   │   │   ├── employees/                # Employee directory & CRUD modals
│   │   │   └── leaves/                   # Leave request approval workflows
│   │   ├── employee/
│   │   │   ├── attendance/               # Employee clock-in punch card
│   │   │   ├── dashboard/                # Personal task dashboard
│   │   │   └── leaves/                   # Leave application & status tracking
│   │   ├── login/
│   │   │   ├── admin/                    # Admin & HR login portal
│   │   │   └── employee/                 # Employee login portal
│   │   ├── layout.tsx                    # Root layout & providers
│   │   └── page.tsx                      # Landing page
│   ├── components/
│   │   ├── auth/                         # LoginForm component
│   │   ├── layout/                       # HeaderNavigation & layout components
│   │   ├── tasks/                        # TaskCard, CreateTaskForm
│   │   └── ui/                           # Radix UI primitives & design tokens
│   ├── contexts/
│   │   ├── AuthContext.tsx               # JWT token session provider
│   │   └── TaskContext.tsx               # Reactive task state management
│   ├── services/
│   │   ├── api.ts                        # Configured Axios client with Bearer interceptor
│   │   ├── attendanceService.ts
│   │   ├── authService.ts
│   │   ├── dashboardService.ts
│   │   ├── departmentService.ts
│   │   ├── employeeService.ts
│   │   ├── leaveService.ts
│   │   └── taskService.ts
│   └── types/                            # TypeScript interfaces
│
├── .env.local.example                    # Frontend environment variable template
├── .gitignore                            # Root git ignore
├── package.json
└── README.md
```

---

## 5. Environment Variables Configuration

### Frontend (`.env.local`)
Create a `.env.local` file in the root directory (based on `.env.local.example`):
```env
# URL of the backend REST API (must include /api)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory (based on `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection String
# Leave empty ONLY for local offline development (uses embedded engine)
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority

# JWT Secret & Expiration
JWT_SECRET=super_secret_jwt_key_taskflow_ems_2026_production
JWT_EXPIRE=7d

# Allowed Frontend Origins for CORS
FRONTEND_URL=http://localhost:9002
CLIENT_URL=http://localhost:9002
```

> **Security Note**: Never commit actual `.env` or `.env.local` files to version control. Both are protected by `.gitignore`.

---

## 6. Installation & Running Instructions

### Step 1: Start the Backend Server
```bash
cd backend
npm install

# Run database seeder (seeds initial departments, staff, tasks, attendance, leaves)
npm run seed

# Launch Express REST API server (runs on Port 5000)
npm run dev
```

### Step 2: Start the Next.js Frontend Server
In a separate terminal window at the project root:
```bash
npm install

# Launch Next.js development server (runs on Port 9002)
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

---

## 7. Pre-Seeded Development & Test Credentials

> [!WARNING]
> All default credentials below are provided **strictly for development and local testing**. In production environments, seeded passwords must be replaced with unique secrets.

| Role | Username | Email | Default Password | Initial Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin@taskflow.com` | `password` | Complete system privileges |
| **HR Manager** | `hr_user` | `hr@taskflow.com` | `password` | Staff & leave operations |
| **Employee (UI/UX)** | `samvedna_kumari` | `samvedna.kumari@taskflow.com` | `password` | Lead UI/UX Designer |
| **Employee (Dev)** | `ram_sagar` | `ram.sagar@taskflow.com` | `password` | Senior Full Stack Developer |
| **Employee (Frontend)** | `ankit_kumar` | `ankit.kumar@taskflow.com` | `password` | Frontend Engineer |
| **Employee (Backend)** | `kalpana` | `kalpana@taskflow.com` | `password` | Backend Specialist |
| **Employee (HR)** | `vidya` | `vidya@taskflow.com` | `password` | HR Coordinator |
| **Employee (DevOps)** | `prem_sagar` | `prem.sagar@taskflow.com` | `password` | DevOps Engineer |
| **Employee (Marketing)**| `sujoy_sagar` | `sujoy.sagar@taskflow.com` | `password` | Marketing Executive |
| **Employee (QA)** | `rajlaxmi` | `rajlaxmi@taskflow.com` | `password` | QA Automation Engineer |
| **Employee (Ops)** | `neha` | `neha@taskflow.com` | `password` | Operations Specialist |

---

## 8. MongoDB Atlas Production Setup

To transition from the local development engine to **MongoDB Atlas**:

1. **Create an Atlas Cluster**:
   - Register or sign in at [MongoDB Atlas](https://cloud.mongodb.com/).
   - Deploy a free M0 cluster (or dedicated M10+ tier).
2. **Configure Database User**:
   - In **Database Access**, add a user with `readWriteAnyDatabase` privileges.
   - Note the username and secure password.
3. **Configure Network Access**:
   - In **Network Access**, add your deployment server's IP address (or `0.0.0.0/0` with secure credentials).
4. **Obtain Connection String**:
   - Click **Connect** → **Drivers** → Select Node.js.
   - Copy the URI: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/ems_prod?retryWrites=true&w=majority`.
5. **Set in Backend Environment**:
   - Update `MONGO_URI` in `backend/.env` (or in your hosting provider's dashboard).
   - On startup, the backend server will explicitly log:
     ```
     [Database] MONGO_URI provided. Connecting to remote database...
     [Database] Connected to MongoDB Atlas: cluster0.mongodb.net
     ```

---

## 9. Verification & Build Commands

### TypeScript Verification
```bash
npm run typecheck
# Output: Exit code 0 (0 errors)
```

### Production Build
```bash
npm run build
# Output: Compiled successfully (15/15 static and dynamic routes)
```

### Full-Stack Automated Test Suite
```bash
node backend/utils/auditRunner.js
# Output: 39 PASSED | 0 FAILED across all 11 modules
```

---

## 10. Manual Configuration Required for Production Deployment

Before pushing to production environments (e.g. AWS, Render, Vercel, Railway):

1. **Database URI**: Provide a genuine `MONGO_URI` pointing to MongoDB Atlas.
2. **JWT Secret**: Generate a cryptographically random string (e.g. `openssl rand -base64 48`) for `JWT_SECRET`.
3. **Allowed CORS Origin**: Set `FRONTEND_URL` in `backend/.env` to the exact public URL of your frontend (e.g. `https://ems.yourdomain.com`).
4. **API Base URL**: Set `NEXT_PUBLIC_API_URL` in your frontend build settings to `https://api.yourdomain.com/api`.
5. **Default Credentials**: Execute a custom administrative seeding script or update default passwords to remove the development `password`.

---

## 11. Known Limitations & Future Enhancements

- **Real-time Notifications**: Currently updates via optimistic React state and REST API refetching; WebSockets / SSE can be integrated for instantaneous cross-user updates.
- **File Storage**: Profile pictures and document attachments currently store external image URLs; AWS S3 / Cloudinary integration can be added for direct multi-part uploads.
- **Automated Payroll Engine**: The `Payroll` model and endpoints exist in backend schema; automated monthly payslip generation and tax computation can be expanded in subsequent releases.
