
import { Badge } from "@/components/ui/badge";
import { Mail, MailOpen, MailX } from "lucide-react";

interface EmailStatusDisplayProps {
  hasEmails: boolean;
  totalSent?: number;
  lastStatus?: string;
}

export const EmailStatusDisplay = ({ hasEmails, totalSent = 0, lastStatus }: EmailStatusDisplayProps) => {
  if (!hasEmails || totalSent === 0) {
    return (
      <div className="flex items-center space-x-2">
        <MailX className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">No emails</span>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (lastStatus) {
      case 'opened':
        return <MailOpen className="h-4 w-4 text-green-500" />;
      case 'sent':
        return <Mail className="h-4 w-4 text-blue-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (lastStatus) {
      case 'opened':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {getStatusIcon()}
      <div className="flex items-center space-x-1">
        <span className="text-sm text-gray-900">{totalSent}</span>
        <Badge variant="secondary" className={`${getStatusColor()} text-xs`}>
          {lastStatus || 'sent'}
        </Badge>
      </div>
    </div>
  );
};
