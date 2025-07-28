
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Mail, Search, Filter, Eye, Archive, Download } from "lucide-react";
import { useEmails, useEmailKPIs } from "@/hooks/useEmails";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useSendEmail } from "@/hooks/useSendEmail";
import { format } from "date-fns";
import { EmailDetailDialog } from "../email-components/EmailDetailDialog";
import { EmailRowActions } from "../email-components/EmailRowActions";
import { FollowUpComposer } from "../email-components/FollowUpComposer";
import { useToast } from "@/hooks/use-toast";

interface EmailDashboardProps {
  showFilters?: boolean;
  setShowFilters?: (show: boolean) => void;
}

export const EmailDashboard = ({ showFilters = false, setShowFilters }: EmailDashboardProps = {}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [showEmailDetail, setShowEmailDetail] = useState(false);
  const [followUpEmailId, setFollowUpEmailId] = useState<string | null>(null);

  const { data: emails = [] } = useEmails();
  const { data: kpis } = useEmailKPIs();
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const sendEmailMutation = useSendEmail();
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "queued":
        return "bg-blue-100 text-blue-800";
      case "failed":
      case "bounced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.recipient_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || email.status === statusFilter;
    const matchesClient = clientFilter === "all" || email.client_id === clientFilter;
    const matchesProject = projectFilter === "all" || 
                          projects.find(p => p.client_id === email.client_id)?.id === projectFilter;
    
    return matchesSearch && matchesStatus && matchesClient && matchesProject;
  });

  const handleViewEmail = (email: any) => {
    setSelectedEmail(email);
    setShowEmailDetail(true);
  };

  const handleStartFollowUp = (emailId: string) => {
    setFollowUpEmailId(emailId);
  };

  const handleSendFollowUp = async (emailId: string, followUpData: { subject: string; content: string }) => {
    const originalEmail = emails.find(e => e.id === emailId);
    if (!originalEmail) return;

    try {
      await sendEmailMutation.mutateAsync({
        to: originalEmail.recipient_email,
        subject: followUpData.subject,
        content: followUpData.content,
        client_id: originalEmail.client_id,
      });
      
      setFollowUpEmailId(null);
      toast({
        title: "Follow-up Sent",
        description: "Your follow-up email has been sent successfully",
      });
    } catch (error) {
      console.error("Failed to send follow-up:", error);
    }
  };

  const handleResendEmail = async (email: any) => {
    try {
      await sendEmailMutation.mutateAsync({
        to: email.recipient_email,
        subject: email.subject,
        content: email.content,
        client_id: email.client_id,
      });
      
      toast({
        title: "Email Resent",
        description: "The email has been resent successfully",
      });
    } catch (error) {
      console.error("Failed to resend email:", error);
    }
  };

  // Calculate improved KPIs including bounced/failed
  const totalEmails = emails.length;
  const deliveredEmails = emails.filter(e => e.status === 'delivered').length;
  const bouncedEmails = emails.filter(e => ['bounced', 'failed'].includes(e.status)).length;
  const openedEmails = emails.filter(e => e.open_count > 0).length;
  const clickedEmails = emails.filter(e => e.click_count > 0).length;

  const deliveryRate = totalEmails > 0 ? Math.round((deliveredEmails / totalEmails) * 100) : 0;
  const bounceRate = totalEmails > 0 ? Math.round((bouncedEmails / totalEmails) * 100) : 0;
  const openRate = deliveredEmails > 0 ? Math.round((openedEmails / deliveredEmails) * 100) : 0;
  const clickRate = deliveredEmails > 0 ? Math.round((clickedEmails / deliveredEmails) * 100) : 0;

  return (
    <div className="space-y-6">

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email List */}
      <Card>
        <CardContent className="p-0">
          {filteredEmails.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No emails found</h3>
              <p className="text-gray-500 mb-4">No emails match your current filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Subject</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Recipient</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Status</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Sent</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors">Engagement</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmails.map((email) => (
                  <TableRow 
                    key={email.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewEmail(email)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleViewEmail(email)}
                        className="font-medium text-gray-900 hover:text-blue-600 text-left"
                      >
                        {email.subject}
                      </button>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleViewEmail(email)}
                        className="text-sm hover:text-blue-600 text-left"
                      >
                        <div>{email.recipient_email}</div>
                        {email.client_id && (
                          <div className="text-xs text-gray-500">
                            {clients.find(c => c.id === email.client_id)?.name}
                          </div>
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(email.status)} border-0`} variant="secondary">
                        {email.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {email.sent_at ? format(new Date(email.sent_at), 'MMM d, yyyy HH:mm') : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-xs">
                        {email.open_count > 0 && (
                          <Badge variant="outline" className="text-green-600 border-green-300">
                            {email.open_count} opens
                          </Badge>
                        )}
                        {email.click_count > 0 && (
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            {email.click_count} clicks
                          </Badge>
                        )}
                        {email.open_count === 0 && email.click_count === 0 && email.status === 'delivered' && (
                          <span className="text-gray-400">No activity</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <EmailRowActions
                        email={email}
                        onView={() => handleViewEmail(email)}
                        onFollowUp={() => handleStartFollowUp(email.id)}
                        onResend={() => handleResendEmail(email)}
                        isResending={sendEmailMutation.isPending}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Follow-up Composer */}
      {followUpEmailId && (
        <Card>
          <CardContent className="p-4">
            <FollowUpComposer
              email={emails.find(e => e.id === followUpEmailId)!}
              onSend={(followUpData) => handleSendFollowUp(followUpEmailId, followUpData)}
              onCancel={() => setFollowUpEmailId(null)}
              isSending={sendEmailMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Email Detail Dialog */}
      <EmailDetailDialog
        open={showEmailDetail}
        onOpenChange={setShowEmailDetail}
        email={selectedEmail}
        onResendEmail={handleResendEmail}
        isResending={sendEmailMutation.isPending}
      />
    </div>
  );
};
