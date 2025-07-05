
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  Eye, 
  MousePointer, 
  Clock, 
  RefreshCw, 
  MessageSquare,
  Calendar,
  User,
  AlertCircle,
  Copy,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSendEmail } from "@/hooks/useSendEmail";
import { EmailStatusBadge } from "./EmailStatusBadge";
import { EmailTimeline } from "./EmailTimeline";

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

interface EmailDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: Email | null;
  onFollowUp?: (emailId: string, note: string) => void;
}

export const EmailDetailDialog = ({ open, onOpenChange, email, onFollowUp }: EmailDetailDialogProps) => {
  const [followUpNote, setFollowUpNote] = useState("");
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();
  const sendEmailMutation = useSendEmail();

  if (!email) return null;

  const canResend = ['bounced', 'failed'].includes(email.status);

  const handleResend = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      await sendEmailMutation.mutateAsync({
        to: email.recipient_email,
        subject: email.subject,
        content: email.content
      });
      
      toast({
        title: "Email Resent Successfully",
        description: `Email has been resent to ${email.recipient_email}`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to resend email:", error);
      toast({
        title: "Resend Failed",
        description: "Failed to resend email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleFollowUp = () => {
    if (onFollowUp && followUpNote.trim()) {
      onFollowUp(email.id, followUpNote);
      setFollowUpNote("");
      setShowFollowUp(false);
      toast({
        title: "Follow-up Recorded",
        description: "Your follow-up note has been saved successfully."
      });
    }
  };

  const handleCopyContent = () => {
    // Remove HTML tags for copying
    const textContent = email.content.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(textContent);
    toast({ 
      title: "Content Copied", 
      description: "Email content copied to clipboard (HTML tags removed)" 
    });
  };

  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Function to render HTML content safely
  const renderEmailContent = (htmlContent: string) => {
    // Simple HTML to text conversion for display
    const textContent = htmlContent
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/div>/gi, '\n')
      .replace(/<div[^>]*>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    
    return textContent;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5" />
            <div className="flex-1">
              <DialogTitle className="text-left">{email.subject}</DialogTitle>
              <DialogDescription className="text-left">
                To: {email.recipient_name || email.recipient_email}
              </DialogDescription>
            </div>
            <EmailStatusBadge status={email.status} openCount={email.open_count} clickCount={email.click_count} />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dynamic Email Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Eye className={`h-4 w-4 ${email.open_count > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <div className="text-lg font-semibold">
                {email.open_count}
              </div>
              <div className="text-xs text-gray-600">
                {email.open_count === 0 ? 'Not Opened' : 
                 email.open_count === 1 ? 'Opened Once' : 
                 'Multiple Opens'}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <MousePointer className="h-4 w-4 mx-auto mb-1 text-purple-600" />
              <div className="text-lg font-semibold">{email.click_count}</div>
              <div className="text-xs text-gray-600">Clicks</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="h-4 w-4 mx-auto mb-1 text-orange-600" />
              <div className="text-lg font-semibold">N/A</div>
              <div className="text-xs text-gray-600">Time Spent*</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <div className="text-xs font-semibold">
                {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-xs text-gray-600">Sent Date</div>
            </div>
          </div>

          {/* Enhanced Email Timeline */}
          <EmailTimeline email={email} />

          {/* Bounce/Error Info */}
          {email.bounce_reason && (
            <div className={`p-4 rounded-lg border ${
              email.bounce_reason.includes('temporarily deferred') 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className={`h-4 w-4 ${
                  email.bounce_reason.includes('temporarily deferred')
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`} />
                <span className={`font-medium ${
                  email.bounce_reason.includes('temporarily deferred')
                    ? 'text-yellow-800'
                    : 'text-red-800'
                }`}>
                  {email.bounce_reason.includes('temporarily deferred') 
                    ? 'Delivery Delayed' 
                    : 'Delivery Issue'}
                </span>
              </div>
              <p className={`text-sm ${
                email.bounce_reason.includes('temporarily deferred')
                  ? 'text-yellow-700'
                  : 'text-red-700'
              }`}>
                {email.bounce_reason}
                {email.bounce_reason.includes('temporarily deferred') && (
                  <span className="block mt-1 text-xs">
                    This is temporary - the email will be retried automatically.
                  </span>
                )}
              </p>
            </div>
          )}
          
          {/* Time Spent Disclaimer */}
          <div className="text-xs text-gray-500 mt-2">
            *Time spent tracking is not available with current email provider
          </div>

          <Separator />

          {/* Email Content Preview */}
          <div>
            <h4 className="font-semibold mb-3">Email Content</h4>
            <div className="p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {renderEmailContent(email.content)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {canResend && (
              <Button 
                onClick={handleResend}
                disabled={isResending || sendEmailMutation.isPending}
                className="flex items-center gap-2"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? "Resending..." : "Resend Email"}
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={() => onFollowUp?.(email.id, "")}
              className="flex items-center gap-2"
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

        </div>
      </DialogContent>
    </Dialog>
  );
};
