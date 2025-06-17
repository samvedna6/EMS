import type { TaskStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FileClock, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export default function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const statusConfig = {
    pending: {
      icon: <FileClock className="h-3.5 w-3.5" />,
      text: 'Pending',
      badgeVariant: 'outline',
      className: 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:border-yellow-400 dark:text-yellow-300 dark:bg-yellow-900/30',
    },
    active: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      text: 'Active',
      badgeVariant: 'default',
      className: 'bg-blue-500/10 text-blue-600 border-blue-500/50 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/50',
    },
    completed: {
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      text: 'Completed',
      badgeVariant: 'default',
      className: 'bg-green-500/10 text-green-600 border-green-500/50 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/50',
    },
    failed: {
      icon: <XCircle className="h-3.5 w-3.5" />,
      text: 'Failed',
      badgeVariant: 'destructive',
      className: 'bg-red-500/10 text-red-600 border-red-500/50 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/50',
    },
  };

  const currentStatus = statusConfig[status] || {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    text: 'Unknown',
    badgeVariant: 'secondary',
    className: '',
  };

  return (
    <Badge variant={currentStatus.badgeVariant as any} className={cn("flex items-center gap-1.5 w-fit text-xs py-1 px-2", currentStatus.className, className)}>
      {currentStatus.icon}
      <span>{currentStatus.text}</span>
    </Badge>
  );
}
