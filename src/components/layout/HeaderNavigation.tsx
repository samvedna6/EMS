
"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, LogOut, UserCircle2, ShieldCheck, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HeaderNavigation() {
  const { currentUser, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline text-primary hover:text-primary/80 transition-colors">
          <ClipboardCheck className="w-7 h-7" />
          <span>TaskFlow</span>
        </Link>
        <nav className="flex items-center gap-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : currentUser ? (
            <>
              <span className="text-sm text-foreground hidden sm:inline">
                Welcome, <strong className="font-medium">{currentUser.name}</strong> ({currentUser.role})
              </span>
              {currentUser.role === 'admin' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/dashboard">
                    <ShieldCheck className="mr-2 h-4 w-4" /> Admin Dashboard
                  </Link>
                </Button>
              )}
              {currentUser.role === 'employee' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/employee/dashboard">
                    <ClipboardList className="mr-2 h-4 w-4" /> My Tasks
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
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
