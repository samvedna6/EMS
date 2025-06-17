# Project Report: TaskFlow - Employee Task Management System

## 1. Introduction

TaskFlow is a web application designed to streamline task management within a team. It provides a platform for administrators to create and assign tasks to employees, and for employees to view and manage their assigned tasks. The primary goal of TaskFlow is to offer an intuitive and efficient way to organize workflows, track progress, and improve team productivity. This project serves as a demonstration of modern web development practices using a Next.js-based stack.

## 2. Objectives

*   To develop a role-based application with distinct functionalities for administrators and employees.
*   To implement user authentication.
*   To enable administrators to create, assign, monitor, and remove tasks.
*   To provide employees with a personalized dashboard to view and update their tasks.
*   To build a responsive and user-friendly interface.

## 3. Features Implemented

### 3.1. User Roles & Authentication
*   **Two User Roles:** Administrator and Employee.
*   **Login:** Separate login forms for admins and employees. User credentials (username/password) are validated against mock data.
*   **Session Management:** User sessions are managed using browser `localStorage` to persist login status.
*   **Role-Based Access Control:** Dashboards and functionalities are restricted based on the logged-in user's role.

### 3.2. Administrator Dashboard & Functionalities
*   **Dashboard Overview:** Displays summary statistics of tasks (Total, Pending, Active, Completed, Failed).
*   **Task Creation:** Admins can create new tasks, providing a title, detailed description, assign an employee, and set an optional due date.
*   **Task Listing:** View all tasks created in the system, sorted by creation date.
*   **Task Assignment:** Assign tasks to specific employees from a list.
*   **Task Removal:** Admins can remove any task from the system, with a confirmation step.
*   **View Task Details:** Each task is displayed on a card showing its title, description, creation/update timestamps, due date, status, and assigned employee. Tasks assigned to employees who no longer exist are shown as assigned to "Unknown Employee" and can still be removed.

### 3.3. Employee Dashboard & Functionalities
*   **Personalized Task View:** Employees see a list of tasks specifically assigned to them, sorted by creation date.
*   **Task Status Updates:** Employees can update the status of their tasks:
    *   Accept a 'Pending' task to move it to 'Active'.
    *   Mark an 'Active' task as 'Completed'.
    *   Mark an 'Active' task as 'Failed'.
*   **Task Details:** View full details of assigned tasks, including due dates and status.
*   **Visual Cues:** Due dates are highlighted if they are overdue, due today, or due soon.

### 3.4. User Interface (UI) & User Experience (UX)
*   **Modern Design:** Clean and professional interface built with ShadCN UI components and Tailwind CSS.
*   **Responsive Layout:** The application is designed to work across various screen sizes.
*   **Intuitive Navigation:** Clear header navigation and distinct dashboard views.
*   **Notifications:** Toast notifications are used for actions like login success/failure and task operations.
*   **Confirmation Dialogs:** Used for critical actions like task removal or status changes to prevent accidental operations.

## 4. Technologies Used

*   **Frontend Framework:** Next.js (with App Router)
*   **UI Library:** React
*   **Component Library:** ShadCN UI
*   **Styling:** Tailwind CSS
*   **Language:** TypeScript
*   **State Management:** React Context API (for Auth and Tasks)
*   **Client-Side Storage:** Browser `localStorage` (for persisting user sessions and task data in this prototype)
*   **Icons:** Lucide React
*   **Date Formatting:** `date-fns`
*   **Form Handling:** Standard React state and form elements.
*   **AI Integration (Stack Inclusion):** Genkit is included in the `package.json` and initial configuration is present, indicating readiness for potential AI features, though not actively used in the core task management flow developed so far.

## 5. System Architecture

TaskFlow is primarily a client-side application built with Next.js.
*   **Routing:** Utilizes the Next.js App Router for defining pages and layouts. Client-side components (`"use client"`) are used extensively.
*   **Components:** The UI is built using reusable React components, many of which are from the ShadCN UI library, promoting a modular and maintainable codebase.
*   **Data Management:**
    *   User and task data are initially sourced from mock data arrays in `src/lib/mockData.ts`.
    *   For runtime persistence during a user's session and across sessions (within the same browser), the application uses the browser's `localStorage`. This simulates database persistence for the prototype.
    *   `AuthContext` and `TaskContext` (React Context API) manage the application state related to authentication and tasks respectively. These contexts encapsulate the logic for interacting with `localStorage` and updating the UI.
*   **Styling:** Tailwind CSS is used for utility-first styling, with a custom theme defined in `src/app/globals.css` and component-specific styles where needed.

## 6. Project Setup and Running

1.  **Dependencies:** The project relies on Node.js and npm (or yarn). Key dependencies are listed in `package.json` and include Next.js, React, Tailwind CSS, ShadCN UI components, Lucide Icons, and Genkit.
2.  **Installation:** Run `npm install` to install project dependencies.
3.  **Development Server:** Run `npm run dev` to start the Next.js development server, typically available at `http://localhost:9002`.

## 7. Conclusion

TaskFlow successfully demonstrates the development of a functional task management application with role-based access and essential CRUD (Create, Read, Update, Delete) operations for tasks. It leverages a modern web technology stack to provide a responsive and user-friendly experience. While currently using mock data and `localStorage` for persistence (typical for a prototype or a front-end focused project), it establishes a solid foundation that could be readily extended with a dedicated backend database and more advanced features in the future. The project effectively meets the objectives of creating distinct user roles, managing tasks through their lifecycle, and providing a clear interface for both administrators and employees.

## 8. Future Scope (Optional Suggestions)

*   Integration with a proper backend database (e.g., Firebase Firestore, Supabase, PostgreSQL) for robust data storage and multi-user capabilities beyond a single browser.
*   Real-time updates for task changes using technologies like WebSockets.
*   Advanced filtering, sorting, and searching capabilities for tasks.
*   File attachments or rich text descriptions for tasks.
*   A more comprehensive notification system (e.g., email or in-app notifications for new assignments, status changes, or overdue tasks).
*   User profile management and settings.
*   Implementation of AI-powered features using the integrated Genkit (e.g., task summarization, smart suggestions for task assignments or due dates, natural language task creation).
