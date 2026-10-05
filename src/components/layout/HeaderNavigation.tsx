"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  ClipboardCheck,
  LogOut,
  ShieldCheck,
  ClipboardList,
  Users,
  Building2,
  CalendarCheck,
  FileCheck2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HeaderNavigation() {
  const { currentUser, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isAdminOrHR = currentUser?.role === 'admin' || currentUser?.role === 'hr';

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-headline text-primary hover:text-primary/80 transition-colors mr-2"
        >
          <ClipboardCheck className="w-7 h-7" />
          <span>TaskFlow EMS</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : currentUser ? (
            <>
              {isAdminOrHR && (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/dashboard">
                      <ShieldCheck className="mr-1.5 h-4 w-4" /> Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/employees">
                      <Users className="mr-1.5 h-4 w-4" /> Employees
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/departments">
                      <Building2 className="mr-1.5 h-4 w-4" /> Departments
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/attendance">
                      <CalendarCheck className="mr-1.5 h-4 w-4" /> Attendance
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/leaves">
                      <FileCheck2 className="mr-1.5 h-4 w-4" /> Leaves
                    </Link>
                  </Button>
                </>
              )}

              {currentUser.role === 'employee' && (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/employee/dashboard">
                      <ClipboardList className="mr-1.5 h-4 w-4" /> My Tasks
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/employee/attendance">
                      <CalendarCheck className="mr-1.5 h-4 w-4" /> Attendance
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/employee/leaves">
                      <FileCheck2 className="mr-1.5 h-4 w-4" /> Leaves
                    </Link>
                  </Button>
                </>
              )}

              <span className="text-sm text-foreground hidden lg:inline ml-2 pl-2 border-l border-border">
                Welcome, <strong className="font-medium">{currentUser.name}</strong> ({currentUser.role})
              </span>

              <Button variant="outline" size="sm" onClick={handleLogout} className="ml-1">
                <LogOut className="mr-1.5 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login/admin">Admin Login</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/login/employee">Employee Login</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
