
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  CheckCircle,
  Send,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSendEmail } from "@/hooks/useSendEmail";
import { EmailStatusBadge } from "./EmailStatusBadge";
import { EmailTimeline } from "./EmailTimeline";
import { RichTextEditor } from "./RichTextEditor";

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
  const [followUpEmail, setFollowUpEmail] = useState({
    subject: "",
    content: ""
  });
  const { toast } = useToast();
  const sendEmailMutation = useSendEmail();

  if (!email) return null;

  const canResend = ['bounced', 'failed'].includes(email.status);

  // Generate suggested follow-up content
  const generateFollowUpContent = () => {
    const timeSinceSent = email.sent_at ? Math.floor((Date.now() - new Date(email.sent_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    let suggestedContent = "";
    if (email.open_count === 0) {
      suggestedContent = `<p>Hi ${email.recipient_name || "there"},</p><p>I wanted to follow up on the email I sent ${timeSinceSent > 0 ? `${timeSinceSent} days ago` : 'recently'} regarding "${email.subject}".</p><p>I understand you're probably busy, but I wanted to make sure you received my message and see if you have any questions.</p><p>Please let me know if there's a better time to discuss this or if you need any additional information.</p><p>Best regards</p>`;
    } else {
      suggestedContent = `<p>Hi ${email.recipient_name || "there"},</p><p>Thank you for opening my previous email about "${email.subject}". I wanted to follow up to see if you have any questions or if you'd like to discuss this further.</p><p>I'm happy to provide additional details or schedule a call at your convenience.</p><p>Looking forward to hearing from you.</p><p>Best regards</p>`;
    }
    
    return suggestedContent;
  };

  const handleStartFollowUp = () => {
    const suggestedContent = generateFollowUpContent();
    setFollowUpEmail({
      subject: `Re: ${email.subject}`,
      content: suggestedContent
    });
    setShowFollowUp(true);
  };

  const handleSendFollowUp = async () => {
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
      setFollowUpEmail({ subject: "", content: "" });
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

  const handleCopyContent = () => {
    // Remove HTML tags for copying
    const textContent = email.content.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(textContent);
    toast({ 
      title: "Content Copied", 
      description: "Email content copied to clipboard (HTML tags removed)" 
    });
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
              onClick={handleStartFollowUp}
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

          {/* Follow-up Email Composer */}
          {showFollowUp && (
            <>
              <Separator />
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Follow-up Email
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFollowUp(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-blue-800">Subject</label>
                    <Input
                      value={followUpEmail.subject}
                      onChange={(e) => setFollowUpEmail(prev => ({ ...prev, subject: e.target.value }))}
                      className="bg-white border-blue-300 focus:border-blue-500"
                      placeholder="Follow-up subject..."
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-blue-800">Message</label>
                    <RichTextEditor
                      value={followUpEmail.content}
                      onChange={(content) => setFollowUpEmail(prev => ({ ...prev, content }))}
                      placeholder="Write your follow-up message..."
                      className="min-h-[200px] bg-white"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      AI has suggested content based on the original email's engagement
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowFollowUp(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendFollowUp}
                      disabled={sendEmailMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendEmailMutation.isPending ? "Sending..." : "Send Follow-up"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
