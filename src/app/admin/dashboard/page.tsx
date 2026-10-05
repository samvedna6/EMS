"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/contexts/TaskContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CreateTaskForm from '@/components/tasks/CreateTaskForm';
import TaskCard from '@/components/tasks/TaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Users,
  ListChecks,
  AlertTriangle,
  PieChart,
  Activity,
  CheckSquare,
  XSquare,
  Info,
  Building2,
  CalendarCheck,
  FileCheck2,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import dashboardService from '@/services/dashboardService';
import type { DashboardStats } from '@/types';

export default function AdminDashboardPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { tasks, getTaskCounts, loadingTasks } = useTasks();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const router = useRouter();

  const isAdminOrHR = currentUser?.role === 'admin' || currentUser?.role === 'hr';

  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdminOrHR)) {
      router.push('/login/admin');
    }
  }, [currentUser, authLoading, isAdminOrHR, router]);

  useEffect(() => {
    if (isAdminOrHR) {
      dashboardService
        .getStats()
        .then((data) => setStats(data))
        .catch((err) => console.error("Failed to load dashboard stats", err))
        .finally(() => setLoadingStats(false));
    }
  }, [isAdminOrHR]);

  if (authLoading || loadingTasks) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-full" />
        <div className="grid md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!currentUser || !isAdminOrHR) {
    return null;
  }

  const taskCounts = getTaskCounts();
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const emsQuickStats = [
    {
      title: "Total Employees",
      value: stats?.totalEmployees ?? 0,
      sub: `${stats?.activeEmployees ?? 0} active`,
      icon: <Users className="h-5 w-5 text-primary" />,
      link: "/admin/employees",
    },
    {
      title: "Departments",
      value: stats?.totalDepartments ?? 0,
      sub: "Active teams",
      icon: <Building2 className="h-5 w-5 text-accent" />,
      link: "/admin/departments",
    },
    {
      title: "Present Today",
      value: stats?.presentToday ?? 0,
      sub: `${stats?.absentToday ?? 0} absent`,
      icon: <CalendarCheck className="h-5 w-5 text-green-600" />,
      link: "/admin/attendance",
    },
    {
      title: "Pending Leaves",
      value: stats?.pendingLeaves ?? 0,
      sub: `${stats?.approvedLeaves ?? 0} approved`,
      icon: <FileCheck2 className="h-5 w-5 text-yellow-600" />,
      link: "/admin/leaves",
    },
  ];

  const summaryStats = [
    { title: "Total Tasks", value: taskCounts.total, icon: <ListChecks className="h-6 w-6 text-primary" />, color: "text-primary" },
    { title: "Pending Tasks", value: taskCounts.pending, icon: <Info className="h-6 w-6 text-yellow-500" />, color: "text-yellow-500" },
    { title: "Active Tasks", value: taskCounts.active, icon: <Activity className="h-6 w-6 text-blue-500" />, color: "text-blue-500" },
    { title: "Completed Tasks", value: taskCounts.completed, icon: <CheckSquare className="h-6 w-6 text-green-500" />, color: "text-green-500" },
    { title: "Failed Tasks", value: taskCounts.failed, icon: <XSquare className="h-6 w-6 text-red-500" />, color: "text-red-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time overview of workforce attendance, leaves, and team task deliverables.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/employees">
              Manage Staff <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Workforce Statistics */}
      <section>
        <h2 className="text-xl font-headline mb-3 flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-accent" /> Workforce Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {emsQuickStats.map((item) => (
            <Link key={item.title} href={item.link}>
              <Card className="shadow-md hover:shadow-lg transition-all hover:border-primary cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </CardTitle>
                  {item.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loadingStats ? '...' : item.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Tasks Statistics */}
      <section>
        <h2 className="text-xl font-headline mb-3 flex items-center">
          <PieChart className="mr-2 h-5 w-5 text-accent" /> Task Deliverables Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {summaryStats.map((stat) => (
            <Card key={stat.title} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Task Creation & All Tasks List */}
      <section className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <CreateTaskForm />
        </div>
        <div className="md:col-span-2">
          <h2 className="text-2xl font-headline mb-4 flex items-center">
            <FileText className="mr-2 h-6 w-6 text-accent" /> All Tasks
          </h2>
          {sortedTasks.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No tasks found in database.</p>
                  <p className="text-sm text-muted-foreground">Create a new task to get started.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {sortedTasks.map((task) => (
                <TaskCard key={task.id || task._id} task={task} showAssignee />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
