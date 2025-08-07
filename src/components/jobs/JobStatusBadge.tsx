
import { Badge } from "@/components/ui/badge";
import { useJobStatuses } from "@/hooks/useJobStatuses";

interface JobStatusBadgeProps {
  status: string;
}

export const JobStatusBadge = ({ status }: JobStatusBadgeProps) => {
  const { data: jobStatuses = [] } = useJobStatuses();

  // Find the status details from the database - exact match first, then case-insensitive
  const statusDetails = jobStatuses.find(s => s.name === status) || 
                        jobStatuses.find(s => s.name.toLowerCase() === status.toLowerCase());

  const getStatusColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'gray': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
      'blue': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800', 
      'green': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
      'orange': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
      'red': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
      'primary': 'bg-primary/10 text-primary border-primary/20',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const displayColor = statusDetails 
    ? getStatusColor(statusDetails.color)
    : 'bg-gray-100 text-gray-800 border-gray-200';

  const displayLabel = statusDetails 
    ? statusDetails.name
    : status?.charAt(0).toUpperCase() + status?.slice(1).replace('_', ' ') || "Unknown";

  return (
    <Badge className={`${displayColor} font-medium px-2 py-1 text-xs`}>
      {displayLabel}
    </Badge>
  );
};
