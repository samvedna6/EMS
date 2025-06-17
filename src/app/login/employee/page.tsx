"use client";

import LoginForm from '@/components/auth/LoginForm';

export default function EmployeeLoginPage() {
  return <LoginForm role="employee" redirectPath="/employee/dashboard" />;
}
