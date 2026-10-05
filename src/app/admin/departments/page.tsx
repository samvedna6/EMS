"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import departmentService from '@/services/departmentService';
import employeeService from '@/services/employeeService';
import type { Department, Employee } from '@/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  PlusCircle,
  Users,
  Edit2,
  Trash2,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

export default function AdminDepartmentsPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');

  const isAdminOrHR = currentUser?.role === 'admin' || currentUser?.role === 'hr';

  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdminOrHR)) {
      router.push('/login/admin');
    }
  }, [currentUser, authLoading, isAdminOrHR, router]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [deptRes, empRes] = await Promise.all([
        departmentService.getDepartments(),
        employeeService.getEmployees({ limit: 100 }),
      ]);
      setDepartments(deptRes || []);
      setEmployees(empRes.data || []);
    } catch (err: any) {
      toast({
        title: 'Error loading departments',
        description: err.response?.data?.message || 'Could not fetch departments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAdminOrHR) {
      loadData();
    }
  }, [isAdminOrHR, loadData]);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await departmentService.createDepartment({
        name: name.trim(),
        description: description.trim(),
        manager: managerId || undefined,
      });
      toast({
        title: 'Department Created',
        description: `Department "${name}" was created successfully.`,
      });
      setIsAddOpen(false);
      setName('');
      setDescription('');
      setManagerId('');
      loadData();
    } catch (err: any) {
      toast({
        title: 'Creation Failed',
        description: err.response?.data?.message || 'Failed to create department',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || !name.trim()) return;

    try {
      await departmentService.updateDepartment(selectedDept._id, {
        name: name.trim(),
        description: description.trim(),
        manager: (managerId as any) || undefined,
      });
      toast({
        title: 'Department Updated',
        description: `Department updated successfully.`,
      });
      setIsEditOpen(false);
      setSelectedDept(null);
      setName('');
      setDescription('');
      setManagerId('');
      loadData();
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err.response?.data?.message || 'Failed to update department',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDepartment = async (id: string, deptName: string) => {
    try {
      await departmentService.deleteDepartment(id);
      toast({
        title: 'Department Deleted',
        description: `Department "${deptName}" removed.`,
      });
      loadData();
    } catch (err: any) {
      toast({
        title: 'Deletion Failed',
        description: err.response?.data?.message || 'Failed to delete department',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (dept: Department) => {
    setSelectedDept(dept);
    setName(dept.name);
    setDescription(dept.description || '');
    setManagerId(dept.manager ? dept.manager._id : '');
    setIsEditOpen(true);
  };

  if (authLoading) return <Skeleton className="h-64 w-full" />;
  if (!currentUser || !isAdminOrHR) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline text-primary flex items-center">
            <Building2 className="mr-2 h-7 w-7" /> Department Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Organize company units, track staffing ratios, and designate department leadership.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md hover:shadow-lg transition-shadow">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline text-primary">
                Add New Department
              </DialogTitle>
              <DialogDescription>
                Create an organizational department to categorize teams and tasks.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDepartment} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Department Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Quality Assurance"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Department scope and responsibilities..."
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manager">Department Lead / Manager</Label>
                <Select value={managerId} onValueChange={setManagerId}>
                  <SelectTrigger id="manager">
                    <SelectValue placeholder="Select an employee (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName} ({emp.designation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Department</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <Card className="shadow-md">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-headline font-semibold">No Departments Found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              Add your first department to begin grouping employees and workloads.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <Card
              key={dept._id}
              className="shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-headline text-foreground flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 text-accent" />
                    {dept.name}
                  </CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1 font-mono text-xs">
                    <Users className="h-3 w-3" />
                    {dept.employeeCount} {dept.employeeCount === 1 ? 'member' : 'members'}
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-2 line-clamp-2">
                  {dept.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-xs text-muted-foreground pb-2">
                <div>
                  <strong>Manager / Lead:</strong>{' '}
                  {dept.manager
                    ? `${dept.manager.firstName} ${dept.manager.lastName}`
                    : 'Unassigned'}
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(dept)}
                  className="h-8"
                >
                  <Edit2 className="mr-1.5 h-3.5 w-3.5" /> Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="h-8">
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Department?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete department <strong>{dept.name}</strong>?
                        Employees assigned to this department will become unassigned.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteDepartment(dept._id, dept.name)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline text-primary">
              Edit Department
            </DialogTitle>
            <DialogDescription>Update department configuration.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateDepartment} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="editName">Department Name *</Label>
              <Input
                id="editName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editManager">Department Lead / Manager</Label>
              <Select value={managerId} onValueChange={setManagerId}>
                <SelectTrigger id="editManager">
                  <SelectValue placeholder="Select an employee (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName} ({emp.designation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
