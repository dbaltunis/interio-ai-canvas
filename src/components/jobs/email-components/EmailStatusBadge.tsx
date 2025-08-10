
import { Badge } from "@/components/ui/badge";

interface EmailStatusBadgeProps {
  status: string;
}

export const EmailStatusBadge = ({ status }: EmailStatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sent':
        return 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/40';
      case 'delivered':
        return 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40';
      case 'opened':
        return 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/25 dark:text-primary dark:border-primary/40';
      case 'clicked':
        return 'bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/40';
      case 'bounced':
        return 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-700/40 dark:text-gray-300 dark:border-gray-600/60';
      case 'queued':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/40';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-700/40 dark:text-gray-300 dark:border-gray-600/60';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)}`} variant="secondary">
      {status}
    </Badge>
  );
};

