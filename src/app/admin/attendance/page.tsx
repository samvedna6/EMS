"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import attendanceService from '@/services/attendanceService';
import employeeService from '@/services/employeeService';
import type { Attendance, Employee, AttendanceStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  AlertCircle,
  PlusCircle,
  Calendar,
} from 'lucide-react';

export default function AdminAttendancePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [records, setRecords] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Mark Modal
  const [isMarkOpen, setIsMarkOpen] = useState(false);
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [markStatus, setMarkStatus] = useState<AttendanceStatus>('Present');
  const [notes, setNotes] = useState('');

  const isAdminOrHR = currentUser?.role === 'admin' || currentUser?.role === 'hr';

  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdminOrHR)) {
      router.push('/login/admin');
    }
  }, [currentUser, authLoading, isAdminOrHR, router]);

  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const [attRes, empRes] = await Promise.all([
        attendanceService.getAttendance({
          date: selectedDate || undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        }),
        employeeService.getEmployees({ limit: 100 }),
      ]);
      setRecords(attRes || []);
      setEmployees(empRes.data || []);
    } catch (err: any) {
      toast({
        title: 'Error loading attendance',
        description: err.response?.data?.message || 'Failed to fetch attendance data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedStatus, toast]);

  useEffect(() => {
    if (isAdminOrHR) {
      loadAttendance();
    }
  }, [isAdminOrHR, loadAttendance]);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmployeeId) return;

    try {
      await attendanceService.markAttendance({
        employeeId: targetEmployeeId,
        date: selectedDate,
        status: markStatus,
        notes: notes || undefined,
      });

      toast({
        title: 'Attendance Recorded',
        description: 'Attendance updated successfully.',
      });
      setIsMarkOpen(false);
      setTargetEmployeeId('');
      setNotes('');
      loadAttendance();
    } catch (err: any) {
      toast({
        title: 'Recording Failed',
        description: err.response?.data?.message || 'Failed to record attendance',
        variant: 'destructive',
      });
    }
  };

  const presentCount = records.filter((r) => r.status === 'Present').length;
  const halfDayCount = records.filter((r) => r.status === 'Half Day').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;
  const leaveCount = records.filter((r) => r.status === 'Leave').length;

  if (authLoading) return <Skeleton className="h-64 w-full" />;
  if (!currentUser || !isAdminOrHR) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline text-primary flex items-center">
            <CalendarCheck className="mr-2 h-7 w-7" /> Workforce Attendance
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor daily check-ins, leaves, absences, and log attendance overrides.
          </p>
        </div>

        <Dialog open={isMarkOpen} onOpenChange={setIsMarkOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md hover:shadow-lg transition-shadow">
              <PlusCircle className="mr-2 h-4 w-4" /> Mark / Override Attendance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline text-primary">
                Record Attendance
              </DialogTitle>
              <DialogDescription>
                Manually record or adjust attendance status for any staff member.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleMarkAttendance} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="employee">Select Employee *</Label>
                <Select value={targetEmployeeId} onValueChange={setTargetEmployeeId} required>
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={markStatus}
                  onValueChange={(val: AttendanceStatus) => setMarkStatus(val)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                    <SelectItem value="Half Day">Half Day</SelectItem>
                    <SelectItem value="Leave">Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Remote work approved, medical appointment"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsMarkOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Attendance</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Present</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">{presentCount}</h3>
            </div>
            <CheckCircle2 className="h-7 w-7 text-green-600 opacity-80" />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Half Day</p>
              <h3 className="text-2xl font-bold text-yellow-600 mt-1">{halfDayCount}</h3>
            </div>
            <Clock className="h-7 w-7 text-yellow-600 opacity-80" />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Absent</p>
              <h3 className="text-2xl font-bold text-destructive mt-1">{absentCount}</h3>
            </div>
            <XCircle className="h-7 w-7 text-destructive opacity-80" />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">On Leave</p>
              <h3 className="text-2xl font-bold text-accent mt-1">{leaveCount}</h3>
            </div>
            <Calendar className="h-7 w-7 text-accent opacity-80" />
          </CardContent>
        </Card>
      </div>

      {/* Date and Status Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="filterDate" className="whitespace-nowrap text-sm">
                Select Date:
              </Label>
              <Input
                id="filterDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="filterStatus" className="whitespace-nowrap text-sm">
                Filter Status:
              </Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="filterStatus" className="max-w-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Half Day">Half Day</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records Table */}
      <Card className="shadow-md">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-headline font-semibold">No Attendance Records</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1">
                No attendance logs found for {selectedDate}. Use "Mark Attendance" or employee check-ins.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check-In</TableHead>
                  <TableHead>Check-Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((rec) => {
                  const empObj = typeof rec.employee === 'object' ? (rec.employee as Employee) : null;
                  const empName = empObj
                    ? `${empObj.firstName} ${empObj.lastName}`
                    : 'Employee';
                  const empId = empObj?.employeeId || '';
                  const designation = empObj?.designation || '';

                  let badgeColor = 'bg-muted';
                  if (rec.status === 'Present') badgeColor = 'bg-green-600 hover:bg-green-700';
                  else if (rec.status === 'Half Day') badgeColor = 'bg-yellow-600 hover:bg-yellow-700';
                  else if (rec.status === 'Absent') badgeColor = 'bg-destructive hover:bg-destructive/90';
                  else if (rec.status === 'Leave') badgeColor = 'bg-accent hover:bg-accent/90';

                  return (
                    <TableRow key={rec._id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{empName}</div>
                        <div className="text-xs text-muted-foreground">
                          {empId} {designation && `• ${designation}`}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{rec.date}</TableCell>
                      <TableCell className="text-xs">
                        {rec.checkIn ? format(new Date(rec.checkIn), 'hh:mm a') : '—'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {rec.checkOut ? format(new Date(rec.checkOut), 'hh:mm a') : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={badgeColor}>{rec.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {rec.notes || '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
