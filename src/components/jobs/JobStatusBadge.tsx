
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface JobStatusBadgeProps {
  statusId: string | null | undefined;
  fallbackText?: string;
}

export const JobStatusBadge = ({ statusId, fallbackText = "No Status" }: JobStatusBadgeProps) => {
  // Fetch status details by ID
  const { data: statusDetails } = useQuery({
    queryKey: ["job_status", statusId],
    queryFn: async () => {
      if (!statusId) return null;
      
      const { data, error } = await supabase
        .from("job_statuses")
        .select("*")
        .eq("id", statusId)
        .single();

      if (error) {
        console.error("Error fetching status:", error);
        return null;
      }
      return data;
    },
    enabled: !!statusId,
    staleTime: 5 * 60 * 1000,
  });

  const getStatusColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'gray': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-200 dark:border-gray-600',
      'blue': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-600/30 dark:text-blue-200 dark:border-blue-500/50', 
      'green': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-600/30 dark:text-green-200 dark:border-green-500/50',
      'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-600/30 dark:text-yellow-200 dark:border-yellow-500/50',
      'orange': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-600/30 dark:text-orange-200 dark:border-orange-500/50',
      'red': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-600/30 dark:text-red-200 dark:border-red-500/50',
      'primary': 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/30 dark:text-primary dark:border-primary/50',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-200 dark:border-gray-600';
  };

  const displayColor = statusDetails 
    ? getStatusColor(statusDetails.color)
    : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-200 dark:border-gray-600';

  const displayLabel = statusDetails ? statusDetails.name : fallbackText;

  return (
    <Badge className={`${displayColor} font-medium px-2 py-1 text-xs`}>
      {displayLabel}
    </Badge>
  );
};
