
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSendEmail } from "@/hooks/useSendEmail";
import { EmailStatusBadge } from "./EmailStatusBadge";
import { EmailTimeline } from "./EmailTimeline";
import { EmailStats } from "./EmailStats";
import { EmailActions } from "./EmailActions";
import { FollowUpComposer } from "./FollowUpComposer";

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
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();
  const sendEmailMutation = useSendEmail();

  if (!email) return null;

  const handleStartFollowUp = () => {
    setShowFollowUp(true);
  };

  const handleSendFollowUp = async (followUpEmail: { subject: string; content: string }) => {
    if (!followUpEmail.subject.trim() || !followUpEmail.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and content for the follow-up email.",
        variant: "destructive"
      });
      return;
    }

    try {
      await sendEmailMutation.mutateAsync({
        to: email.recipient_email,
        subject: followUpEmail.subject,
        content: followUpEmail.content
      });
      
      toast({
        title: "Follow-up Sent Successfully",
        description: `Follow-up email has been sent to ${email.recipient_email}`,
      });
      
      setShowFollowUp(false);
    } catch (error) {
      console.error("Failed to send follow-up email:", error);
      toast({
        title: "Send Failed",
        description: "Failed to send follow-up email. Please try again.",
        variant: "destructive",
      });
    }
  };

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
          <EmailStats email={email} />

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
          <EmailActions
            email={email}
            onResend={handleResend}
            onStartFollowUp={handleStartFollowUp}
            isResending={isResending || sendEmailMutation.isPending}
            showFollowUp={showFollowUp}
          />

          {/* Follow-up Email Composer */}
          {showFollowUp && (
            <FollowUpComposer
              email={email}
              onSend={handleSendFollowUp}
              onCancel={() => setShowFollowUp(false)}
              isSending={sendEmailMutation.isPending}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
