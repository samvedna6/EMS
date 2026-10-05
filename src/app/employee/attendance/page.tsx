"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import attendanceService from '@/services/attendanceService';
import type { Attendance } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
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
  CalendarCheck,
  LogIn,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export default function EmployeeAttendancePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'employee')) {
      router.push('/login/employee');
    }
  }, [currentUser, authLoading, router]);

  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getMyAttendance();
      setTodayRecord(res.today);
      setHistory(res.data || []);
    } catch (err: any) {
      console.error("Error loading attendance:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'employee') {
      loadAttendance();
    }
  }, [currentUser, loadAttendance]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const rec = await attendanceService.checkIn();
      setTodayRecord(rec);
      toast({
        title: "Checked In Successfully",
        description: `Your check-in has been logged at ${format(new Date(), 'hh:mm a')}.`,
      });
      loadAttendance();
    } catch (err: any) {
      toast({
        title: "Check-in Failed",
        description: err.response?.data?.message || "Could not complete check-in.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const rec = await attendanceService.checkOut();
      setTodayRecord(rec);
      toast({
        title: "Checked Out Successfully",
        description: `Your check-out has been logged at ${format(new Date(), 'hh:mm a')}. Have a good evening!`,
      });
      loadAttendance();
    } catch (err: any) {
      toast({
        title: "Check-out Failed",
        description: err.response?.data?.message || "Could not complete check-out.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading) return <Skeleton className="h-64 w-full" />;
  if (!currentUser || currentUser.role !== 'employee') return null;

  const isCheckedIn = Boolean(todayRecord && todayRecord.checkIn);
  const isCheckedOut = Boolean(todayRecord && todayRecord.checkOut);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline text-primary flex items-center">
          <CalendarCheck className="mr-2 h-7 w-7" /> My Attendance
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Log your daily work hours, check-in, check-out, and view your attendance log.
        </p>
      </div>

      {/* Today's Punch Card */}
      <Card className="shadow-lg border-primary/30">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-headline flex items-center">
                <Clock className="mr-2 h-5 w-5 text-accent" /> Today's Status
              </CardTitle>
              <CardDescription>
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            </div>

            {todayRecord ? (
              <Badge className="bg-green-600 hover:bg-green-700 text-sm py-1 px-3">
                {todayRecord.status}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-sm py-1 px-3">
                Not Marked Yet
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-center">
            <div className="p-4 bg-muted/40 rounded-lg">
              <span className="text-xs text-muted-foreground">Check-In Time</span>
              <div className="text-lg font-bold mt-1">
                {todayRecord?.checkIn
                  ? format(new Date(todayRecord.checkIn), 'hh:mm:ss a')
                  : '—'}
              </div>
            </div>

            <div className="p-4 bg-muted/40 rounded-lg">
              <span className="text-xs text-muted-foreground">Check-Out Time</span>
              <div className="text-lg font-bold mt-1">
                {todayRecord?.checkOut
                  ? format(new Date(todayRecord.checkOut), 'hh:mm:ss a')
                  : '—'}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCheckIn}
                disabled={isCheckedIn || actionLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 shadow-md"
              >
                <LogIn className="mr-2 h-4 w-4" />
                {isCheckedIn ? 'Checked In' : 'Check In'}
              </Button>

              <Button
                onClick={handleCheckOut}
                disabled={!isCheckedIn || isCheckedOut || actionLoading}
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isCheckedOut ? 'Checked Out' : 'Check Out'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-accent" /> Attendance History
          </CardTitle>
          <CardDescription>Records of your past shifts and logged hours.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-headline font-semibold">No Attendance History</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1">
                You haven't logged any attendance shifts yet. Check in today to create your first log!
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Check-In</TableHead>
                  <TableHead>Check-Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((rec) => {
                  let badgeColor = 'bg-muted';
                  if (rec.status === 'Present') badgeColor = 'bg-green-600 hover:bg-green-700';
                  else if (rec.status === 'Half Day') badgeColor = 'bg-yellow-600 hover:bg-yellow-700';
                  else if (rec.status === 'Absent') badgeColor = 'bg-destructive hover:bg-destructive/90';
                  else if (rec.status === 'Leave') badgeColor = 'bg-accent hover:bg-accent/90';

                  return (
                    <TableRow key={rec._id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {rec.date}
                      </TableCell>
                      <TableCell className="text-xs">
                        {rec.checkIn ? format(new Date(rec.checkIn), 'hh:mm a') : '—'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {rec.checkOut ? format(new Date(rec.checkOut), 'hh:mm a') : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={badgeColor}>{rec.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
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
