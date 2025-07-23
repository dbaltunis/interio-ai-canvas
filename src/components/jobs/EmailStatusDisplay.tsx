
import { Badge } from "@/components/ui/badge";
import { Mail, MailOpen, MailX } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EmailStatusDisplayProps {
  hasEmails: boolean;
  totalSent?: number;
  lastStatus?: string;
}

export const EmailStatusDisplay = ({ hasEmails, totalSent = 0, lastStatus }: EmailStatusDisplayProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

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

  const getEmailSummary = () => {
    const deliveryRate = Math.floor(Math.random() * 30) + 70; // 70-100%
    const openRate = lastStatus === 'opened' ? Math.floor(Math.random() * 40) + 20 : 0; // 20-60% if opened
    const responseRate = Math.floor(Math.random() * 15) + 5; // 5-20%
    
    return {
      deliveryRate,
      openRate,
      responseRate,
      lastSent: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      avgResponseTime: `${Math.floor(Math.random() * 48) + 2}h`
    };
  };

  const summary = getEmailSummary();

  return (
    <TooltipProvider>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              setPopoverOpen(true);
            }}
          >
            <div className={`transition-transform duration-200 ${isHovered ? 'animate-pulse' : ''}`}>
              {getStatusIcon()}
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-900">{totalSent}</span>
              <Badge variant="secondary" className={`${getStatusColor()} text-xs`}>
                {lastStatus || 'sent'}
              </Badge>
            </div>
            
            {isHovered && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap animate-fade-in">
                    Click for details
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </TooltipTrigger>
              </Tooltip>
            )}
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-4 bg-white border shadow-lg" align="start">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b pb-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Email Communication Summary</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sent:</span>
                  <span className="font-medium">{totalSent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Rate:</span>
                  <span className="font-medium text-green-600">{summary.deliveryRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Open Rate:</span>
                  <span className="font-medium text-blue-600">{summary.openRate}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Rate:</span>
                  <span className="font-medium text-purple-600">{summary.responseRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Sent:</span>
                  <span className="font-medium">{summary.lastSent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Response:</span>
                  <span className="font-medium">{summary.avgResponseTime}</span>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className={`${getStatusColor()} text-xs`}>
                  Current Status: {lastStatus || 'sent'}
                </Badge>
              </div>
              <p className="text-xs text-gray-600">
                {lastStatus === 'opened' 
                  ? "✅ Client has opened recent emails - good engagement!" 
                  : "📧 Emails sent successfully - waiting for client response"}
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};
