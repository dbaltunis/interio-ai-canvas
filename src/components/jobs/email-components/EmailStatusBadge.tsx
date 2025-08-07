
import { Badge } from "@/components/ui/badge";

interface EmailStatusBadgeProps {
  status: string;
}

export const EmailStatusBadge = ({ status }: EmailStatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'opened':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'clicked':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'bounced':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'queued':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border`} variant="secondary">
      {status}
    </Badge>
  );
};
