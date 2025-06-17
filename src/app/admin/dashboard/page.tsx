"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/contexts/TaskContext';
import { useRouter } from 'next/navigation';
import CreateTaskForm from '@/components/tasks/CreateTaskForm';
import TaskCard from '@/components/tasks/TaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Users, ListChecks, AlertTriangle, PieChart, Activity, CheckSquare, XSquare, Info } from 'lucide-react';

export default function AdminDashboardPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { tasks, getTaskCounts, loadingTasks } = useTasks();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'admin')) {
      router.push('/login/admin');
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || loadingTasks) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-full" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return null; // Or a loading/access denied message, handled by useEffect redirect
  }

  const taskCounts = getTaskCounts();
  const sortedTasks = [...tasks].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  const summaryStats = [
    { title: "Total Tasks", value: taskCounts.total, icon: <ListChecks className="h-6 w-6 text-primary" />, color: "text-primary" },
    { title: "Pending Tasks", value: taskCounts.pending, icon: <Info className="h-6 w-6 text-yellow-500" />, color: "text-yellow-500" },
    { title: "Active Tasks", value: taskCounts.active, icon: <Activity className="h-6 w-6 text-blue-500" />, color: "text-blue-500" },
    { title: "Completed Tasks", value: taskCounts.completed, icon: <CheckSquare className="h-6 w-6 text-green-500" />, color: "text-green-500" },
    { title: "Failed Tasks", value: taskCounts.failed, icon: <XSquare className="h-6 w-6 text-red-500" />, color: "text-red-500" },
  ];


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline text-primary">Admin Dashboard</h1>
      
      <section>
        <h2 className="text-2xl font-headline mb-4 flex items-center"><PieChart className="mr-2 h-6 w-6 text-accent"/>Task Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {summaryStats.map(stat => (
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

      <section className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <CreateTaskForm />
        </div>
        <div className="md:col-span-2">
          <h2 className="text-2xl font-headline mb-4 flex items-center"><FileText className="mr-2 h-6 w-6 text-accent"/>All Tasks</h2>
           {sortedTasks.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No tasks found.</p>
                  <p className="text-sm text-muted-foreground">Create a new task to get started.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {sortedTasks.map(task => (
                <TaskCard key={task.id} task={task} showAssignee />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
