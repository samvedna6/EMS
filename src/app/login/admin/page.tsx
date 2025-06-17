"use client";

import LoginForm from '@/components/auth/LoginForm';

export default function AdminLoginPage() {
  return <LoginForm role="admin" redirectPath="/admin/dashboard" />;
}
