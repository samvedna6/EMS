"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import leaveService from '@/services/leaveService';
import type { Leave, Employee, LeaveStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInCalendarDays } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from '@/components/ui/dialog';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export default function AdminLeavesPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Status update modal
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [actionStatus, setActionStatus] = useState<LeaveStatus | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdminOrHR = currentUser?.role === 'admin' || currentUser?.role === 'hr';

  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdminOrHR)) {
      router.push('/login/admin');
    }
  }, [currentUser, authLoading, isAdminOrHR, router]);

  const loadLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const data = await leaveService.getLeaves({
        status: activeTab !== 'all' ? activeTab : undefined,
      });
      setLeaves(data || []);
    } catch (err: any) {
      toast({
        title: 'Error loading leaves',
        description: err.response?.data?.message || 'Failed to fetch leave applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => {
    if (isAdminOrHR) {
      loadLeaves();
    }
  }, [isAdminOrHR, loadLeaves]);

  const openActionModal = (leave: Leave, status: LeaveStatus) => {
    setSelectedLeave(leave);
    setActionStatus(status);
    setApprovalRemarks('');
    setIsModalOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!selectedLeave || !actionStatus) return;

    try {
      await leaveService.updateLeaveStatus(selectedLeave._id, actionStatus, approvalRemarks);
      toast({
        title: `Leave ${actionStatus}`,
        description: `The leave request has been marked as ${actionStatus.toLowerCase()}.`,
      });
      setIsModalOpen(false);
      setSelectedLeave(null);
      loadLeaves();
    } catch (err: any) {
      toast({
        title: 'Action Failed',
        description: err.response?.data?.message || 'Could not update leave status',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) return <Skeleton className="h-64 w-full" />;
  if (!currentUser || !isAdminOrHR) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline text-primary flex items-center">
            <FileCheck2 className="mr-2 h-7 w-7" /> Leave Requests Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review, approve, or reject employee time-off requests.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Pending">Pending</TabsTrigger>
            <TabsTrigger value="Approved">Approved</TabsTrigger>
            <TabsTrigger value="Rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Leaves List Table */}
      <Card className="shadow-md">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-headline font-semibold">No Leave Requests</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1">
                There are no leave applications matching the selected filter.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave) => {
                  const empObj = typeof leave.employee === 'object' ? (leave.employee as Employee) : null;
                  const empName = empObj
                    ? `${empObj.firstName} ${empObj.lastName}`
                    : 'Employee';
                  const empId = empObj?.employeeId || '';
                  const designation = empObj?.designation || '';

                  const startDate = new Date(leave.startDate);
                  const endDate = new Date(leave.endDate);
                  const days = Math.max(1, differenceInCalendarDays(endDate, startDate) + 1);

                  let badgeColor = 'bg-muted';
                  if (leave.status === 'Approved') badgeColor = 'bg-green-600 hover:bg-green-700';
                  else if (leave.status === 'Pending') badgeColor = 'bg-yellow-500 hover:bg-yellow-600';
                  else if (leave.status === 'Rejected') badgeColor = 'bg-destructive hover:bg-destructive/90';

                  return (
                    <TableRow key={leave._id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{empName}</div>
                        <div className="text-xs text-muted-foreground">
                          {empId} {designation && `• ${designation}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{leave.leaveType}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-medium">
                          {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                        </div>
                        <div className="text-muted-foreground">
                          {days} {days === 1 ? 'day' : 'days'}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-foreground max-w-xs">
                        <p className="line-clamp-2">{leave.reason}</p>
                        {leave.approvalRemarks && (
                          <p className="text-muted-foreground italic mt-0.5 text-[11px]">
                            Remarks: {leave.approvalRemarks}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={badgeColor}>{leave.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {leave.status === 'Pending' ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openActionModal(leave, 'Approved')}
                              className="bg-green-600 hover:bg-green-700 h-8 text-xs"
                            >
                              <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openActionModal(leave, 'Rejected')}
                              className="h-8 text-xs"
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Processed</span>
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

      {/* Approve/Reject Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline text-primary">
              {actionStatus === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </DialogTitle>
            <DialogDescription>
              Provide optional feedback or remarks for the employee.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="remarks">Remarks / Note to Employee (Optional)</Label>
              <Input
                id="remarks"
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                placeholder="e.g. Approved. Enjoy your time off!"
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStatus}
              className={actionStatus === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive hover:bg-destructive/90'}
            >
              Confirm {actionStatus}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
