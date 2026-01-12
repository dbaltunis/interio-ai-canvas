import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Reply, RefreshCw, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCanSendEmails } from "@/hooks/useCanSendEmails";
import { useCanViewEmailKPIs } from "@/hooks/useCanViewEmailKPIs";

interface EmailRowActionsProps {
  email: any;
  onView: () => void;
  onFollowUp: () => void;
  onResend: () => void;
  isResending: boolean;
}

export const EmailRowActions = ({ 
  email, 
  onView, 
  onFollowUp, 
  onResend, 
  isResending 
}: EmailRowActionsProps) => {
  const { toast } = useToast();
  const { canSendEmails, isPermissionLoaded: isSendEmailsPermissionLoaded } = useCanSendEmails();
  const { canViewEmailKPIs, isPermissionLoaded: isViewPermissionLoaded } = useCanViewEmailKPIs();
  
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email.recipient_email);
    toast({
      title: "Email Copied",
      description: "Recipient email address copied to clipboard"
    });
  };

  const handleViewClick = () => {
    if (!isViewPermissionLoaded || !canViewEmailKPIs) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to view email performance metrics.",
        variant: "destructive",
      });
      return;
    }
    onView();
  };
  
  const handleFollowUpClick = () => {
    if (!isSendEmailsPermissionLoaded || !canSendEmails) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to send emails.",
        variant: "destructive",
      });
      return;
    }
    onFollowUp();
  };

  const canResend = ['bounced', 'failed'].includes(email.status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => e.stopPropagation()}
          className="h-8 w-8 p-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover text-popover-foreground border shadow-lg z-50">
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleViewClick();
          }}
          disabled={!isViewPermissionLoaded || !canViewEmailKPIs}
          className={!isViewPermissionLoaded || !canViewEmailKPIs ? "opacity-50 cursor-not-allowed" : ""}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleFollowUpClick();
          }}
          disabled={!isSendEmailsPermissionLoaded || !canSendEmails}
          className={!isSendEmailsPermissionLoaded || !canSendEmails ? "opacity-50 cursor-not-allowed" : ""}
        >
          <Reply className="h-4 w-4 mr-2" />
          Send Follow-up
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleCopyEmail();
          }}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Email
        </DropdownMenuItem>
        {canResend && (
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              onResend();
            }}
            disabled={isResending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
            {isResending ? 'Resending...' : 'Resend Email'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};