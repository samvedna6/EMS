"use client";

import type { Task, TaskStatus } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TaskStatusBadge from './TaskStatusBadge';
import { useTasks } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Check, X, Play, User, CalendarDays, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface TaskCardProps {
  task: Task;
  showAssignee?: boolean; // For admin view
}

export default function TaskCard({ task, showAssignee = false }: TaskCardProps) {
  const { updateTaskStatus, getEmployeeNameById } = useTasks();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleStatusUpdate = async (newStatus: TaskStatus) => {
    const updatedTask = await updateTaskStatus(task.id, newStatus);
    if (updatedTask) {
      toast({
        title: "Task Updated",
        description: `Task "${task.title}" marked as ${newStatus}.`,
      });
    } else {
      toast({
        title: "Update Failed",
        description: `Could not update task "${task.title}".`,
        variant: "destructive",
      });
    }
  };

  const canPerformActions = currentUser?.role === 'employee' && currentUser.id === task.assignedTo;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-headline mb-1">{task.title}</CardTitle>
          <TaskStatusBadge status={task.status} />
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
             <CalendarDays className="h-3.5 w-3.5" />
            Created: {format(parseISO(task.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </div>
          {task.createdAt !== task.updatedAt && (
             <div className="flex items-center gap-1 mt-0.5">
                <Info className="h-3.5 w-3.5" />
                Updated: {format(parseISO(task.updatedAt), "MMM d, yyyy 'at' h:mm a")}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-foreground flex-grow">
        <p className="mb-3 whitespace-pre-wrap">{task.description}</p>
        {showAssignee && (
          <div className="text-xs text-muted-foreground mt-2 flex items-center">
            <User className="h-4 w-4 mr-1.5" />
            Assigned to: <strong>{getEmployeeNameById(task.assignedTo)}</strong>
          </div>
        )}
      </CardContent>
      {canPerformActions && (
        <CardFooter className="flex gap-2 pt-3 border-t mt-auto">
          {task.status === 'pending' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <Play className="mr-2 h-4 w-4" /> Accept Task
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Accept Task?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to accept and start working on the task: "{task.title}"? This will change its status to 'Active'.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleStatusUpdate('active')} className="bg-green-600 hover:bg-green-700">Accept</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {task.status === 'active' && (
            <>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
                    <Check className="mr-2 h-4 w-4" /> Mark Complete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Mark Task as Completed?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to mark the task "{task.title}" as completed?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleStatusUpdate('completed')} className="bg-primary hover:bg-primary/90">Mark Complete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
               <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <X className="mr-2 h-4 w-4" /> Mark Failed
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Mark Task as Failed?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to mark the task "{task.title}" as failed? This action should be taken if the task cannot be completed successfully.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleStatusUpdate('failed')} className="bg-destructive hover:bg-destructive/90">Mark Failed</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
