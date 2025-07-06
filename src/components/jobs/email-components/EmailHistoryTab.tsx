
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, RefreshCw, Loader2, Plus } from "lucide-react";
import { EmailStatusBadge } from "./EmailStatusBadge";
import { EmailDetailDialog } from "./EmailDetailDialog";
import { useState } from "react";

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

interface EmailHistoryTabProps {
  emails: Email[] | undefined;
  emailsLoading: boolean;
  onComposeClick: () => void;
  onResendEmail: (email: Email) => void;
  isResending: boolean;
}

export const EmailHistoryTab = ({ 
  emails, 
  emailsLoading, 
  onComposeClick, 
  onResendEmail,
  isResending 
}: EmailHistoryTabProps) => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailDetailOpen, setEmailDetailOpen] = useState(false);

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    setEmailDetailOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-semibold">Email History</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      {emailsLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading emails...</span>
        </div>
      ) : emails && emails.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Opens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((email) => (
                  <TableRow 
                    key={email.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEmailClick(email)}
                  >
                    <TableCell>
                      <div className="font-medium truncate max-w-[200px]">{email.subject}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{email.recipient_email}</div>
                    </TableCell>
                    <TableCell>
                      <EmailStatusBadge status={email.status} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : 'Not sent'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{email.open_count || 0}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Emails Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start sending emails to see your email history here.
            </p>
            <Button onClick={onComposeClick}>
              <Plus className="h-4 w-4 mr-2" />
              Send Your First Email
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Email Detail Dialog */}
      <EmailDetailDialog
        open={emailDetailOpen}
        onOpenChange={setEmailDetailOpen}
        email={selectedEmail}
        onResendEmail={onResendEmail}
        isResending={isResending}
      />
    </div>
  );
};
