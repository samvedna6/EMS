"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/contexts/TaskContext';
import { useRouter } from 'next/navigation';
import TaskCard from '@/components/tasks/TaskCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, ListChecks } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';


export default function EmployeeDashboardPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { getTasksForEmployee, loadingTasks } = useTasks();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'employee')) {
      router.push('/login/employee');
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || loadingTasks) {
    return (
       <div className="space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'employee') {
    return null; // Or a loading/access denied message
  }

  const employeeTasks = getTasksForEmployee(currentUser.id);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline text-primary">My Tasks</h1>
      
      {employeeTasks.length === 0 ? (
         <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center h-60 text-center">
                <ListChecks className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h2 className="text-2xl font-headline mb-2">No Tasks Assigned</h2>
                <p className="text-muted-foreground">You currently have no tasks assigned to you. Enjoy the peace!</p>
                <p className="text-sm text-muted-foreground mt-1">Check back later or contact your administrator if you believe this is an error.</p>
              </div>
            </CardContent>
          </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {employeeTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
