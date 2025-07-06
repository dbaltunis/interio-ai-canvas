
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Plus, Eye, MousePointer, Calendar, ArrowRight } from "lucide-react";
import { useClientEmails } from "@/hooks/useClientEmails";
import { EmailStatusBadge } from "../jobs/email-components/EmailStatusBadge";
import { EmailDetailDialog } from "../jobs/email-components/EmailDetailDialog";
import type { Email } from "@/hooks/useEmails";

interface ClientEmailHistoryProps {
  clientId: string;
  clientEmail?: string;
  onComposeEmail?: () => void;
}

export const ClientEmailHistory = ({ clientId, clientEmail, onComposeEmail }: ClientEmailHistoryProps) => {
  const { data: emails, isLoading } = useClientEmails(clientId);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailDetailOpen, setEmailDetailOpen] = useState(false);

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    setEmailDetailOpen(true);
  };

  const emailStats = emails ? {
    total: emails.length,
    sent: emails.filter(e => !['draft', 'queued'].includes(e.status)).length,
    opened: emails.filter(e => e.open_count > 0).length,
    clicked: emails.filter(e => e.click_count > 0).length,
    totalOpens: emails.reduce((sum, e) => sum + e.open_count, 0),
    totalClicks: emails.reduce((sum, e) => sum + e.click_count, 0)
  } : null;

  if (isLoading) {
    return <div className="text-center py-4">Loading email history...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Email Stats Overview */}
      {emailStats && emailStats.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{emailStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Emails</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{emailStats.sent}</div>
              <div className="text-sm text-muted-foreground">Sent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <Eye className="h-4 w-4 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{emailStats.totalOpens}</div>
              </div>
              <div className="text-sm text-muted-foreground">Total Opens</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <MousePointer className="h-4 w-4 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">{emailStats.totalClicks}</div>
              </div>
              <div className="text-sm text-muted-foreground">Total Clicks</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Email History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Communication History
            </CardTitle>
            {clientEmail && onComposeEmail && (
              <Button onClick={onComposeEmail} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Compose Email
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!emails || emails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No email communication yet</p>
              {clientEmail && onComposeEmail && (
                <Button onClick={onComposeEmail} className="mt-2" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Send First Email
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.slice(0, 10).map((email) => (
                  <TableRow key={email.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell onClick={() => handleEmailClick(email)}>
                      <div className="font-medium truncate max-w-[200px]">{email.subject}</div>
                    </TableCell>
                    <TableCell onClick={() => handleEmailClick(email)}>
                      <EmailStatusBadge status={email.status} />
                    </TableCell>
                    <TableCell onClick={() => handleEmailClick(email)}>
                      <div className="flex items-center gap-3">
                        {email.open_count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            {email.open_count}
                          </Badge>
                        )}
                        {email.click_count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <MousePointer className="h-3 w-3 mr-1" />
                            {email.click_count}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleEmailClick(email)}>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(email.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEmailClick(email)}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Email Detail Dialog */}
      <EmailDetailDialog
        open={emailDetailOpen}
        onOpenChange={setEmailDetailOpen}
        email={selectedEmail}
      />
    </div>
  );
};
