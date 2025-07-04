
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  CheckCircle, 
  Eye, 
  AlertCircle, 
  Clock,
  Loader2,
  Mail
} from "lucide-react";

interface EmailStatusBadgeProps {
  status: string;
  openCount?: number;
}

export const EmailStatusBadge = ({ status, openCount = 0 }: EmailStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'sending':
        return {
          variant: 'secondary' as const,
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'Sending...',
          color: 'text-blue-600'
        };
      case 'sent':
        return {
          variant: 'outline' as const,
          icon: <Send className="h-3 w-3" />,
          text: 'Sent',
          color: 'text-gray-600'
        };
      case 'delivered':
        return {
          variant: 'default' as const,
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'Delivered',
          color: 'text-green-600'
        };
      case 'opened':
        return {
          variant: 'default' as const,
          icon: <Eye className="h-3 w-3" />,
          text: `Opened ${openCount > 1 ? `(${openCount}x)` : ''}`,
          color: 'text-blue-600'
        };
      case 'bounced':
      case 'failed':
        return {
          variant: 'destructive' as const,
          icon: <AlertCircle className="h-3 w-3" />,
          text: status === 'bounced' ? 'Bounced' : 'Failed',
          color: 'text-red-600'
        };
      case 'draft':
        return {
          variant: 'outline' as const,
          icon: <Mail className="h-3 w-3" />,
          text: 'Draft',
          color: 'text-gray-500'
        };
      default:
        return {
          variant: 'outline' as const,
          icon: <Clock className="h-3 w-3" />,
          text: 'Unknown',
          color: 'text-gray-500'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 w-fit ${config.color}`}>
      {config.icon}
      <span className="capitalize">{config.text}</span>
    </Badge>
  );
};
