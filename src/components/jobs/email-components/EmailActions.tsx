
import { Button } from "@/components/ui/button";
import { RefreshCw, MessageSquare, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Email {
  id: string;
  subject: string;
  content: string;
  recipient_email: string;
  recipient_name?: string;
  status: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  open_count: number;
  click_count: number;
  time_spent_seconds: number;
  bounce_reason?: string;
}

interface EmailActionsProps {
  email: Email;
  onResend: () => void;
  onStartFollowUp: () => void;
  isResending: boolean;
  showFollowUp: boolean;
}

export const EmailActions = ({ 
  email, 
  onResend, 
  onStartFollowUp, 
  isResending, 
  showFollowUp 
}: EmailActionsProps) => {
  const { toast } = useToast();
  const canResend = ['bounced', 'failed'].includes(email.status);

  const handleCopyContent = () => {
    // Remove HTML tags for copying
    const textContent = email.content.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(textContent);
    toast({ 
      title: "Content Copied", 
      description: "Email content copied to clipboard (HTML tags removed)" 
    });
  };

  return (
    <div className="flex flex-wrap gap-3">
      {canResend && (
        <Button 
          onClick={onResend}
          disabled={isResending}
          className="flex items-center gap-2"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
          {isResending ? "Resending..." : "Resend Email"}
        </Button>
      )}
      
      <Button 
        variant="outline"
        onClick={onStartFollowUp}
        className="flex items-center gap-2"
        disabled={showFollowUp}
      >
        <MessageSquare className="h-4 w-4" />
        Send Follow-up Email
      </Button>

      <Button 
        variant="outline"
        onClick={handleCopyContent}
        className="flex items-center gap-2"
      >
        <Copy className="h-4 w-4" />
        Copy Content
      </Button>
    </div>
  );
};
