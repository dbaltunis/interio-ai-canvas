
import { Badge } from "@/components/ui/badge";

interface JobStatusBadgeProps {
  status: string;
}

export const JobStatusBadge = ({ status }: JobStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return { 
          color: "bg-green-100 text-green-800 border-green-200", 
          label: "Completed" 
        };
      case "in_progress":
      case "in-production":
        return { 
          color: "bg-blue-100 text-blue-800 border-blue-200", 
          label: "In Progress" 
        };
      case "quote":
        return { 
          color: "bg-purple-100 text-purple-800 border-purple-200", 
          label: "Quote" 
        };
      case "planning":
        return { 
          color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
          label: "Planning" 
        };
      case "draft":
        return { 
          color: "bg-gray-100 text-gray-800 border-gray-200", 
          label: "Draft" 
        };
      case "approved":
        return { 
          color: "bg-green-100 text-green-700 border-green-200", 
          label: "Approved" 
        };
      case "cancelled":
        return { 
          color: "bg-red-100 text-red-800 border-red-200", 
          label: "Cancelled" 
        };
      default:
        return { 
          color: "bg-gray-100 text-gray-800 border-gray-200", 
          label: status || "Unknown" 
        };
    }
  };

  const { color, label } = getStatusConfig(status);

  return (
    <Badge className={`${color} font-medium px-2 py-1 text-xs`}>
      {label}
    </Badge>
  );
};
