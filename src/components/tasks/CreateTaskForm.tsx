"use client";

import { useState, FormEvent } from 'react';
import { useTasks } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

export default function CreateTaskForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addTask, employees } = useTasks();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !description || !assignedTo) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const newTask = await addTask({ title, description, assignedTo });
      if (newTask) {
        toast({
          title: "Task Created",
          description: `Task "${title}" assigned to ${employees.find(emp => emp.id === assignedTo)?.name || 'employee'}.`,
        });
        setTitle('');
        setDescription('');
        setAssignedTo('');
      } else {
         toast({
          title: "Creation Failed",
          description: "Could not create the task. You might not have permission.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the task.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary flex items-center">
          <PlusCircle className="mr-2 h-6 w-6" />
          Create New Task
        </CardTitle>
        <CardDescription>Fill in the details to assign a new task to an employee.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Develop new feature"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Task Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the task..."
              required
              rows={4}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assignedTo">Assign To</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo} required>
              <SelectTrigger id="assignedTo" className="w-full">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name} ({employee.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Assigning Task...' : 'Assign Task'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
