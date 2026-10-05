"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import leaveService from '@/services/leaveService';
import type { Leave, LeaveType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInCalendarDays } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  FileCheck2,
  PlusCircle,
  Calendar,
  Clock,
  AlertCircle,
  Trash2,
} from 'lucide-react';

export default function EmployeeLeavesPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply modal state
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'employee')) {
      router.push('/login/employee');
    }
  }, [currentUser, authLoading, router]);

  const loadLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const data = await leaveService.getMyLeaves();
      setLeaves(data || []);
    } catch (err: any) {
      console.error("Error loading employee leaves:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'employee') {
      loadLeaves();
    }
  }, [currentUser, loadLeaves]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide start date, end date, and reason for leave.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast({
        title: "Invalid Date Range",
        description: "End date cannot be earlier than start date.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await leaveService.applyLeave({
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });
      toast({
        title: "Leave Application Submitted",
        description: "Your request has been submitted for management review.",
      });
      setIsApplyOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      loadLeaves();
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.response?.data?.message || "Could not submit leave request.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    try {
      await leaveService.deleteLeave(leaveId);
      toast({
        title: "Leave Request Cancelled",
        description: "Your pending leave request has been cancelled.",
      });
      loadLeaves();
    } catch (err: any) {
      toast({
        title: "Cancellation Failed",
        description: err.response?.data?.message || "Could not cancel leave request.",
        variant: "destructive",
      });
    }
  };

  if (authLoading) return <Skeleton className="h-64 w-full" />;
  if (!currentUser || currentUser.role !== 'employee') return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline text-primary flex items-center">
            <FileCheck2 className="mr-2 h-7 w-7" /> My Leaves
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Apply for time off and review approval status of your leave requests.
          </p>
        </div>

        <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md hover:shadow-lg transition-shadow">
              <PlusCircle className="mr-2 h-4 w-4" /> Apply for Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline text-primary">
                Leave Application
              </DialogTitle>
              <DialogDescription>
                Submit a request for sick, casual, annual, or unpaid time off.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleApplyLeave} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="leaveType">Leave Category</Label>
                <Select
                  value={leaveType}
                  onValueChange={(val: LeaveType) => setLeaveType(val)}
                >
                  <SelectTrigger id="leaveType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Casual">Casual Leave</SelectItem>
                    <SelectItem value="Sick">Sick Leave</SelectItem>
                    <SelectItem value="Annual">Annual / Vacation Leave</SelectItem>
                    <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="startDate">From Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endDate">To Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason for Leave *</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide details regarding your leave request..."
                  rows={3}
                  required
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leave Applications Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-accent" /> Leave Applications History
          </CardTitle>
          <CardDescription>Track status and manager feedback on all submissions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-headline font-semibold">No Leave Requests</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1">
                You haven't submitted any leave applications yet. Click "Apply for Leave" above when needed.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((l) => {
                  const sDate = new Date(l.startDate);
                  const eDate = new Date(l.endDate);
                  const days = Math.max(1, differenceInCalendarDays(eDate, sDate) + 1);

                  let badgeColor = 'bg-muted';
                  if (l.status === 'Approved') badgeColor = 'bg-green-600 hover:bg-green-700';
                  else if (l.status === 'Pending') badgeColor = 'bg-yellow-500 hover:bg-yellow-600';
                  else if (l.status === 'Rejected') badgeColor = 'bg-destructive hover:bg-destructive/90';

                  return (
                    <TableRow key={l._id}>
                      <TableCell>
                        <Badge variant="outline">{l.leaveType}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {format(sDate, 'MMM d, yyyy')} - {format(eDate, 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-xs">
                        {days} {days === 1 ? 'day' : 'days'}
                      </TableCell>
                      <TableCell className="text-xs max-w-xs">
                        <p className="text-foreground">{l.reason}</p>
                        {l.approvalRemarks && (
                          <p className="text-muted-foreground italic mt-0.5 text-[11px]">
                            Manager Note: {l.approvalRemarks}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={badgeColor}>{l.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {l.status === 'Pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelLeave(l._id)}
                            className="h-8 text-destructive hover:bg-destructive/10 text-xs"
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" /> Cancel
                          </Button>
                        )}
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
