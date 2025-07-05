
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
  clickCount?: number;
}

export const EmailStatusBadge = ({ status, openCount = 0, clickCount = 0 }: EmailStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'queued':
        return {
          variant: 'secondary' as const,
          icon: <Clock className="h-3 w-3" />,
          text: 'Queued',
          bgColor: 'bg-blue-100 dark:bg-blue-900',
          textColor: 'text-blue-800 dark:text-blue-200'
        };
      case 'sent':
        return {
          variant: 'outline' as const,
          icon: <Send className="h-3 w-3" />,
          text: 'Sent',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          textColor: 'text-gray-800 dark:text-gray-200'
        };
      case 'received':
        return {
          variant: 'default' as const,
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'Received',
          bgColor: 'bg-green-100 dark:bg-green-900',
          textColor: 'text-green-800 dark:text-green-200'
        };
      case 'opened':
        return {
          variant: 'default' as const,
          icon: <Eye className="h-3 w-3" />,
          text: `Opened${openCount > 1 ? ` (${openCount}x)` : ''}`,
          bgColor: 'bg-blue-100 dark:bg-blue-900',
          textColor: 'text-blue-800 dark:text-blue-200'
        };
      case 'clicked':
        return {
          variant: 'default' as const,
          icon: <Eye className="h-3 w-3" />,
          text: `Clicked${clickCount > 1 ? ` (${clickCount}x)` : ''}`,
          bgColor: 'bg-purple-100 dark:bg-purple-900',
          textColor: 'text-purple-800 dark:text-purple-200'
        };
      case 'bounced':
      case 'failed':
        return {
          variant: 'destructive' as const,
          icon: <AlertCircle className="h-3 w-3" />,
          text: status === 'bounced' ? 'Bounced' : 'Failed',
          bgColor: 'bg-red-100 dark:bg-red-900',
          textColor: 'text-red-800 dark:text-red-200'
        };
      case 'draft':
        return {
          variant: 'outline' as const,
          icon: <Mail className="h-3 w-3" />,
          text: 'Draft',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          textColor: 'text-gray-600 dark:text-gray-400'
        };
      default:
        return {
          variant: 'outline' as const,
          icon: <Clock className="h-3 w-3" />,
          text: 'Unknown',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          textColor: 'text-gray-500 dark:text-gray-400'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant={config.variant} 
      className={`flex items-center gap-1 w-fit font-semibold border-0 ${config.bgColor} ${config.textColor}`}
    >
      {config.icon}
      <span>{config.text}</span>
    </Badge>
  );
};
