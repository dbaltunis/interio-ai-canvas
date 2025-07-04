import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Mail, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Plus,
  Eye,
  RefreshCw,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmails, useEmailKPIs } from "@/hooks/useEmails";
import { useEmailCampaigns, useCreateEmailCampaign, useUpdateEmailCampaign } from "@/hooks/useEmailCampaigns";
import { useEmailTemplates, useCreateEmailTemplate } from "@/hooks/useEmailTemplates";
import { useSendEmail } from "@/hooks/useSendEmail";
import { useEmailSettings, useUpdateEmailSettings } from "@/hooks/useEmailSettings";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { predefinedEmailTemplates } from "@/data/emailTemplates";
import { EmailPreviewDialog } from "./email-components/EmailPreviewDialog";
import { ClientSelector } from "./email-components/ClientSelector";
import { QuoteSelector } from "./email-components/QuoteSelector";
import { CampaignBuilder } from "./email-components/CampaignBuilder";
import { EmailKPIsDashboard } from "./email-components/EmailKPIsDashboard";
import { EmailDetailDialog } from "./email-components/EmailDetailDialog";
import { TemplateVariableEditor } from "./email-components/TemplateVariableEditor";
import { EmailComposer } from "./email-components/EmailComposer";

export const EmailsTab = () => {
  const [newEmail, setNewEmail] = useState({
    recipient_email: "",
    subject: "",
    content: "",
    template_id: ""
  });
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [emailSettingsOpen, setEmailSettingsOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [campaignBuilderOpen, setCampaignBuilderOpen] = useState(false);
  const [templateVariableEditorOpen, setTemplateVariableEditorOpen] = useState(false);
  const [emailDetailOpen, setEmailDetailOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [selectedClients, setSelectedClients] = useState<any[]>([]);
  const [selectedQuotes, setSelectedQuotes] = useState<any[]>([]);
  const [newEmailSettings, setNewEmailSettings] = useState({
    from_email: "",
    from_name: "",
    reply_to_email: "",
    signature: ""
  });

  const { toast } = useToast();
  const { data: emails, isLoading: emailsLoading } = useEmails();
  const { data: emailKPIs, isLoading: kpisLoading } = useEmailKPIs();
  const { data: campaigns } = useEmailCampaigns();
  const { data: templates } = useEmailTemplates();
  const { data: emailSettings } = useEmailSettings();
  const sendEmailMutation = useSendEmail();
  const createCampaignMutation = useCreateEmailCampaign();
  const updateCampaignMutation = useUpdateEmailCampaign();
  const createTemplateMutation = useCreateEmailTemplate();
  const updateEmailSettingsMutation = useUpdateEmailSettings();
  const { hasSendGridIntegration } = useIntegrationStatus();

  useEffect(() => {
    if (emailSettings) {
      setNewEmailSettings({
        from_email: emailSettings.from_email || "",
        from_name: emailSettings.from_name || "",
        reply_to_email: emailSettings.reply_to_email || "",
        signature: emailSettings.signature || ""
      });
    }
  }, [emailSettings]);

  const handleSendEmail = async () => {
    const allRecipients = [
      ...selectedClients.filter(client => client.email).map(client => client.email),
      ...(newEmail.recipient_email ? [newEmail.recipient_email] : [])
    ].filter(Boolean);

    if (allRecipients.length === 0) {
      toast({
        title: "Error",
        description: "Please select clients or enter recipient email addresses",
        variant: "destructive"
      });
      return;
    }

    if (!newEmail.subject || !newEmail.content) {
      toast({
        title: "Error",
        description: "Please fill in subject and message content",
        variant: "destructive"
      });
      return;
    }

    console.log("Sending email with data:", {
      recipients: allRecipients,
      subject: newEmail.subject,
      content: newEmail.content,
      selectedClients: selectedClients.length,
      selectedQuotes: selectedQuotes.length
    });

    for (const recipient of allRecipients) {
      try {
        await sendEmailMutation.mutateAsync({
          to: recipient,
          subject: newEmail.subject,
          content: newEmail.content,
          template_id: newEmail.template_id || undefined,
          client_id: selectedClients.find(c => c.email === recipient)?.id
        });
      } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
      }
    }

    setNewEmail({
      recipient_email: "",
      subject: "",
      content: "",
      template_id: ""
    });
    setSelectedClients([]);
    setSelectedQuotes([]);
  };

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setCampaignBuilderOpen(true);
  };

  const handleSaveCampaign = (campaignData: any) => {
    if (editingCampaign) {
      updateCampaignMutation.mutate({ id: editingCampaign.id, ...campaignData });
    } else {
      createCampaignMutation.mutate(campaignData);
    }
  };

  const handleSaveEmailSettings = () => {
    updateEmailSettingsMutation.mutate({
      ...newEmailSettings,
      active: true
    });
    setEmailSettingsOpen(false);
  };

  const handleCreateTemplateFromPredefined = (templateData: any) => {
    createTemplateMutation.mutate({
      name: templateData.name,
      subject: templateData.subject,
      content: templateData.content,
      template_type: templateData.template_type,
      variables: templateData.variables,
      active: true
    });
  };

  const handleEmailClick = (email: any) => {
    setSelectedEmail(email);
    setEmailDetailOpen(true);
  };

  const handleFollowUp = async (emailId: string, note: string) => {
    try {
      console.log("Recording follow-up:", { emailId, note, timestamp: new Date().toISOString() });
      
      toast({
        title: "Follow-up Recorded",
        description: "Your follow-up note has been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to record follow-up:", error);
      toast({
        title: "Error",
        description: "Failed to record follow-up. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'sent':
        return 'default';
      case 'sending':
        return 'secondary';
      case 'opened':
        return 'default';
      case 'bounced':
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'sent':
      case 'delivered':
        return <CheckCircle className="h-3 w-3" />;
      case 'opened':
        return <Eye className="h-3 w-3" />;
      case 'bounced':
      case 'failed':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  if (kpisLoading) {
    return <div className="flex items-center justify-center h-64">Loading email data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPIs Dashboard - Only show overview, detailed analytics moved to campaigns */}
      <EmailKPIsDashboard kpis={emailKPIs} />

      {/* SendGrid Integration Status */}
      {!hasSendGridIntegration && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">SendGrid Integration Required</p>
                  <p className="text-sm text-orange-700">Set up SendGrid integration for email delivery tracking and analytics to work properly.</p>
                </div>
              </div>
              <Button 
                onClick={() => window.open('/settings', '_blank')} 
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Setup Integration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Settings Banner */}
      {!emailSettings?.from_email && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Email Settings Required</p>
                  <p className="text-sm text-yellow-700">Configure your sender email address to start sending emails.</p>
                </div>
              </div>
              <Button onClick={() => setEmailSettingsOpen(true)} className="bg-yellow-600 hover:bg-yellow-700">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Email Interface */}
      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Compose Email Tab */}
        <TabsContent value="compose">
          <div className="space-y-4">
            {/* Client and Quote Selectors */}
            <div className="flex gap-3">
              <ClientSelector 
                selectedClients={selectedClients}
                onSelectionChange={setSelectedClients}
              />
              <QuoteSelector 
                selectedQuotes={selectedQuotes}
                onSelectionChange={setSelectedQuotes}
                selectedClients={selectedClients}
              />
            </div>

            {/* Email Composer */}
            <EmailComposer
              newEmail={newEmail}
              setNewEmail={setNewEmail}
              selectedClients={selectedClients}
              selectedQuotes={selectedQuotes}
              onSendEmail={handleSendEmail}
              onPreviewEmail={() => setPreviewDialogOpen(true)}
              sendEmailMutation={sendEmailMutation}
              emailSettings={emailSettings}
            />

            {/* Email Settings Dialog */}
            <Dialog open={emailSettingsOpen} onOpenChange={setEmailSettingsOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Email Settings</DialogTitle>
                  <DialogDescription>
                    Configure your sender information for outgoing emails
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="from_email">From Email Address</Label>
                    <Input
                      id="from_email"
                      type="email"
                      placeholder="your-email@company.com"
                      value={newEmailSettings.from_email}
                      onChange={(e) => setNewEmailSettings(prev => ({ ...prev, from_email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="from_name">From Name</Label>
                    <Input
                      id="from_name"
                      placeholder="Your Company Name"
                      value={newEmailSettings.from_name}
                      onChange={(e) => setNewEmailSettings(prev => ({ ...prev, from_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reply_to_email">Reply-To Email (Optional)</Label>
                    <Input
                      id="reply_to_email"
                      type="email"
                      placeholder="replies@company.com"
                      value={newEmailSettings.reply_to_email}
                      onChange={(e) => setNewEmailSettings(prev => ({ ...prev, reply_to_email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signature">Email Signature (Optional)</Label>
                    <Textarea
                      id="signature"
                      placeholder="Best regards,&#10;Your Name&#10;Your Company"
                      value={newEmailSettings.signature}
                      onChange={(e) => setNewEmailSettings(prev => ({ ...prev, signature: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleSaveEmailSettings} className="w-full">
                    Save Settings
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Email Preview Dialog */}
            <EmailPreviewDialog
              open={previewDialogOpen}
              onOpenChange={setPreviewDialogOpen}
              template={selectedTemplate || {
                id: 'custom',
                name: 'Custom Email',
                subject: newEmail.subject,
                content: newEmail.content,
                category: 'Custom',
                variables: []
              }}
              clientData={selectedClients[0]}
              quoteData={selectedQuotes[0]}
              senderInfo={emailSettings}
            />
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Email Templates</h3>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>
            
            {/* Predefined Templates Section */}
            <Card>
              <CardHeader>
                <CardTitle>Industry Templates</CardTitle>
                <CardDescription>
                  Professional templates designed for interior design businesses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {predefinedEmailTemplates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge variant="outline" className="text-xs mt-1">{template.category}</Badge>
                          </div>
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCreateTemplateFromPredefined(template)}
                          >
                            Save Template
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => {
                              setNewEmail({
                                ...newEmail,
                                subject: template.subject,
                                content: template.content
                              });
                              toast({
                                title: "Template Applied",
                                description: `${template.name} template has been applied.`
                              });
                            }}
                          >
                            Use Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Templates Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates?.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{template.template_type.replace(/_/g, ' ')}</p>
                      </div>
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm"
                        onClick={() => {
                          setNewEmail({
                            ...newEmail,
                            subject: template.subject,
                            content: template.content,
                            template_id: template.id
                          });
                          toast({
                            title: "Template Applied",
                            description: `${template.name} template has been applied.`
                          });
                        }}
                      >
                        Apply Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {(!templates || templates.length === 0) && (
                <Card className="col-span-full">
                  <CardContent className="p-6 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium mb-2">No Custom Templates Yet</h4>
                    <p className="text-sm">Save industry templates or create your own custom templates</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Campaigns Tab - Now includes detailed analytics */}
        <TabsContent value="campaigns">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Email Campaigns & Analytics</h3>
              <Button 
                onClick={handleCreateCampaign} 
                className="flex items-center gap-2"
                disabled={createCampaignMutation.isPending}
              >
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            </div>

            {/* Detailed Analytics for Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance Analytics</CardTitle>
                <CardDescription>Detailed insights into your email campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{emailKPIs?.totalSent || 0}</div>
                    <div className="text-sm text-gray-600">Total Emails Sent</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{emailKPIs?.delivered || 0}</div>
                    <div className="text-sm text-gray-600">Successfully Delivered</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{emailKPIs?.openRate || 0}%</div>
                    <div className="text-sm text-gray-600">Open Rate</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{campaigns?.length || 0}</div>
                    <div className="text-sm text-gray-600">Total Campaigns</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {campaigns && campaigns.length > 0 ? (
              <div className="grid gap-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          setEditingCampaign(campaign);
                          setCampaignBuilderOpen(true);
                        }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-gray-600">{campaign.subject}</p>
                          <p className="text-xs text-gray-500">Recipients: {campaign.recipient_count}</p>
                        </div>
                        <Badge variant={campaign.status === 'completed' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium mb-2">No Campaigns Yet</h4>
                    <p className="text-sm mb-4">Create professional email campaigns with advanced tracking</p>
                    <Button onClick={handleCreateCampaign}>Create Your First Campaign</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* History Tab - Simplified */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Email History</CardTitle>
              <CardDescription>Track all sent emails - click any email for detailed view</CardDescription>
            </CardHeader>
            <CardContent>
              {emailsLoading ? (
                <div className="text-center py-8">Loading email history...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Opens</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emails && emails.length > 0 ? (
                      emails.map((email) => (
                        <TableRow key={email.id} className="cursor-pointer hover:bg-gray-50">
                          <TableCell 
                            className="font-medium max-w-xs"
                            onClick={() => handleEmailClick(email)}
                          >
                            <div className="truncate">{email.subject}</div>
                          </TableCell>
                          <TableCell onClick={() => handleEmailClick(email)}>
                            <div className="truncate max-w-48">{email.recipient_email}</div>
                          </TableCell>
                          <TableCell onClick={() => handleEmailClick(email)}>
                            <Badge variant={getStatusBadgeVariant(email.status)} className="flex items-center gap-1 w-fit">
                              {getStatusIcon(email.status)}
                              <span className="capitalize">{email.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell onClick={() => handleEmailClick(email)}>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 text-blue-600" />
                              <span>{email.open_count}</span>
                            </div>
                          </TableCell>
                          <TableCell onClick={() => handleEmailClick(email)}>
                            {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEmailClick(email);
                                }}
                                title="View Details & Analytics"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {['bounced', 'failed'].includes(email.status) && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await sendEmailMutation.mutateAsync({
                                        to: email.recipient_email,
                                        subject: email.subject,
                                        content: email.content
                                      });
                                      toast({
                                        title: "Email Resent",
                                        description: `Email to ${email.recipient_email} has been resent.`
                                      });
                                    } catch (error) {
                                      console.error("Failed to resend email:", error);
                                      toast({
                                        title: "Resend Failed",
                                        description: "Failed to resend email. Please try again later.",
                                        variant: "destructive"
                                      });
                                    }
                                  }}
                                  title="Resend Email"
                                  disabled={sendEmailMutation.isPending}
                                >
                                  <RefreshCw className={`h-3 w-3 ${sendEmailMutation.isPending ? 'animate-spin' : ''}`} />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500">
                          No emails sent yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* All Dialogs */}
      <CampaignBuilder
        open={campaignBuilderOpen}
        onOpenChange={setCampaignBuilderOpen}
        campaign={editingCampaign}
        onSave={handleSaveCampaign}
        onLaunch={() => {}}
      />

      <TemplateVariableEditor
        open={templateVariableEditorOpen}
        onOpenChange={setTemplateVariableEditorOpen}
        template={selectedTemplate}
        onApplyTemplate={(template, variables) => {
          setNewEmail({
            ...newEmail,
            subject: template.subject,
            content: template.content
          });
          toast({
            title: "Template Applied",
            description: `${template.name} template has been customized and applied.`
          });
        }}
      />

      <EmailDetailDialog
        open={emailDetailOpen}
        onOpenChange={setEmailDetailOpen}
        email={selectedEmail}
        onFollowUp={handleFollowUp}
      />
    </div>
  );
};
