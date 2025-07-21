
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, Eye, MousePointer, Clock, RefreshCw } from "lucide-react";
import { EmailStatusBadge } from "./EmailStatusBadge";
import type { Email } from "@/hooks/useEmails";

interface EmailDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: Email | null;
  onResendEmail?: (email: Email) => void;
  isResending?: boolean;
}

export const EmailDetailDialog = ({ open, onOpenChange, email, onResendEmail, isResending }: EmailDetailDialogProps) => {
  if (!email) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Email Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{email.subject}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>To: {email.recipient_email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(email.created_at).toLocaleString()}</span>
                </div>
                <EmailStatusBadge status={email.status || 'queued'} />
              </div>
            </CardHeader>
          </Card>

          {/* Email Analytics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Eye className="h-4 w-4 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-600">{email.open_count || 0}</span>
                </div>
                <div className="text-sm text-muted-foreground">Opens</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <MousePointer className="h-4 w-4 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">{email.click_count || 0}</span>
                </div>
                <div className="text-sm text-muted-foreground">Clicks</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">{email.time_spent_seconds || 0}s</span>
                </div>
                <div className="text-sm text-muted-foreground">Time Spent</div>
              </CardContent>
            </Card>
          </div>

          {/* Email Content */}
          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: email.content || 'No content available' }}
              />
            </CardContent>
          </Card>

          {/* Bounce Reason (if applicable) */}
          {email.bounce_reason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Bounce Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">{email.bounce_reason}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {onResendEmail && email.status !== 'sent' && email.status !== 'delivered' && (
            <div className="flex justify-end">
              <Button 
                onClick={() => onResendEmail(email)}
                disabled={isResending}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? 'Resending...' : 'Resend Email'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
