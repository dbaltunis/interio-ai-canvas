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
import { EmailStatusBadge } from "./email-components/EmailStatusBadge";
import { RichTextEditor } from "./email-components/RichTextEditor";
import { EmailRowActions } from "./email-components/EmailRowActions";

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
  const [customTemplateDialogOpen, setCustomTemplateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
    template_type: "custom" as const
  });
  const [activeTabValue, setActiveTabValue] = useState("compose");

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

  const handleSendEmail = async (attachments: File[] = []) => {
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
      selectedQuotes: selectedQuotes.length,
      attachments: attachments.length
    });

    for (const recipient of allRecipients) {
      try {
        await sendEmailMutation.mutateAsync({
          to: recipient,
          subject: newEmail.subject,
          content: newEmail.content,
          template_id: newEmail.template_id || undefined,
          client_id: selectedClients.find(c => c.email === recipient)?.id,
          attachments: attachments
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

  const handleFollowUp = async (email: any) => {
    // Set up a new email with the same recipient
    setNewEmail({
      recipient_email: email.recipient_email,
      subject: `Re: ${email.subject}`,
      content: `<p>Following up on our previous conversation...</p><br><br><p>---</p><p>Original email sent on ${new Date(email.sent_at).toLocaleDateString()}:</p><blockquote style="border-left: 3px solid #ccc; padding-left: 10px; margin: 10px 0; color: #666;">${email.content}</blockquote>`,
      template_id: ""
    });
    
    // Switch to compose tab
    setActiveTabValue("compose");
    
    toast({
      title: "Follow-up Email Started",
      description: "Compose your follow-up email below.",
    });
  };

  const handleCreateCustomTemplate = () => {
    createTemplateMutation.mutate({
      ...newTemplate,
      variables: [],
      active: true
    });
    setNewTemplate({
      name: "",
      subject: "",
      content: "",
      template_type: "custom"
    });
    setCustomTemplateDialogOpen(false);
  };

  if (kpisLoading) {
    return <div className="flex items-center justify-center h-64">Loading email data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Prominent New Email Button */}
      <div className="flex items-center justify-between bg-gradient-to-r from-brand-primary to-brand-accent p-4 rounded-lg shadow-lg">
        <div className="text-white">
          <h2 className="text-xl font-bold">Email Marketing Hub</h2>
          <p className="text-brand-primary-foreground/80">Manage your email campaigns and communications</p>
        </div>
        <Button 
          size="lg"
          onClick={() => setActiveTabValue("compose")}
          className="bg-white text-brand-primary hover:bg-gray-50 font-semibold px-8 py-3 shadow-lg transform transition-all hover:scale-105"
        >
          <Mail className="h-5 w-5 mr-2" />
          + New Email
        </Button>
      </div>
      {/* Basic KPIs Dashboard */}
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
      <Tabs value={activeTabValue} onValueChange={setActiveTabValue} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full bg-gray-50 p-1 rounded-lg">
          <TabsTrigger 
            value="history" 
            className="flex items-center gap-2 data-[state=active]:bg-brand-primary data-[state=active]:text-white"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
            <span className="sm:hidden">Hist</span>
          </TabsTrigger>
          <TabsTrigger 
            value="compose" 
            className="flex items-center gap-2 data-[state=active]:bg-brand-primary data-[state=active]:text-white"
          >
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Compose</span>
            <span className="sm:hidden">Write</span>
          </TabsTrigger>
          <TabsTrigger 
            value="campaigns" 
            className="flex items-center gap-2 data-[state=active]:bg-brand-primary data-[state=active]:text-white"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Campaigns</span>
            <span className="sm:hidden">Camps</span>
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className="flex items-center gap-2 data-[state=active]:bg-brand-primary data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
            <span className="sm:hidden">Temps</span>
          </TabsTrigger>
        </TabsList>

        {/* Email History Tab - Now First */}
        <TabsContent value="history">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-xl font-bold text-brand-primary">Email History & Analytics</h3>
                <p className="text-brand-neutral">Track and manage all your sent emails</p>
              </div>
              <Button 
                onClick={() => setActiveTabValue("compose")}
                className="bg-brand-primary hover:bg-brand-accent text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Compose
              </Button>
            </div>
            
            {emailsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                <span className="ml-2 text-brand-neutral">Loading emails...</span>
              </div>
            ) : (
              <Card className="shadow-lg border-brand-secondary/20">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-brand-secondary/5">
                        <TableHead className="font-semibold text-brand-primary">Recipient</TableHead>
                        <TableHead className="font-semibold text-brand-primary">Subject</TableHead>
                        <TableHead className="font-semibold text-brand-primary">Status</TableHead>
                        <TableHead className="font-semibold text-brand-primary">Engagement</TableHead>
                        <TableHead className="font-semibold text-brand-primary">Sent</TableHead>
                        <TableHead className="font-semibold text-brand-primary">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emails?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center gap-3">
                              <Mail className="h-12 w-12 text-gray-300" />
                              <div>
                                <p className="text-gray-500 font-medium">No emails sent yet</p>
                                <p className="text-gray-400 text-sm">Start by composing your first email</p>
                              </div>
                              <Button 
                                onClick={() => setActiveTabValue("compose")}
                                className="bg-brand-primary hover:bg-brand-accent"
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Send Your First Email
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        emails?.map((email) => (
                          <TableRow 
                            key={email.id} 
                            className="hover:bg-brand-secondary/5 cursor-pointer transition-colors"
                            onClick={() => handleEmailClick(email)}
                          >
                            <TableCell className="font-medium">
                              <div>
                                <p className="text-brand-primary">{email.recipient_name || email.recipient_email}</p>
                                {email.recipient_name && (
                                  <p className="text-xs text-brand-neutral">{email.recipient_email}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <p className="truncate text-brand-neutral">{email.subject}</p>
                            </TableCell>
                            <TableCell>
                              <EmailStatusBadge status={email.status} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                {email.open_count > 0 && (
                                  <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                                    {email.open_count} opens
                                  </Badge>
                                )}
                                {email.click_count > 0 && (
                                  <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                                    {email.click_count} clicks
                                  </Badge>
                                )}
                                {email.open_count === 0 && email.click_count === 0 && (
                                  <span className="text-gray-400">No activity</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-brand-neutral">
                              {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : "Draft"}
                            </TableCell>
                            <TableCell>
                              <EmailRowActions 
                                email={email} 
                                onView={() => handleEmailClick(email)}
                                onFollowUp={() => handleFollowUp(email)}
                                onResend={() => {/* TODO: implement resend */}}
                                isResending={false}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Compose Email Tab */}
        <TabsContent value="compose">
          <div className="space-y-4">
            {/* Client and Quote Selectors */}
            <div className="flex flex-col sm:flex-row gap-3">
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-lg font-semibold">Email Templates</h3>
              <Button 
                className="flex items-center gap-2 w-full sm:w-auto"
                onClick={() => setCustomTemplateDialogOpen(true)}
              >
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {predefinedEmailTemplates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium truncate">{template.name}</h4>
                            <Badge variant="outline" className="text-xs mt-1">{template.category}</Badge>
                          </div>
                          <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => handleCreateTemplateFromPredefined(template)}
                          >
                            Save Template
                          </Button>
                          <Button 
                            size="sm"
                            className="w-full sm:w-auto"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates?.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium truncate">{template.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{template.template_type.replace(/_/g, ' ')}</p>
                      </div>
                      <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm"
                        className="w-full"
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

            {/* Custom Template Creation Dialog */}
            <Dialog open={customTemplateDialogOpen} onOpenChange={setCustomTemplateDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Custom Template</DialogTitle>
                  <DialogDescription>
                    Create a reusable email template for your business
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template_name">Template Name</Label>
                    <Input
                      id="template_name"
                      placeholder="e.g., Quote Follow-up"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="template_subject">Subject Line</Label>
                    <Input
                      id="template_subject"
                      placeholder="Email subject..."
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="template_content">Email Content</Label>
                    <RichTextEditor
                      value={newTemplate.content}
                      onChange={(content) => setNewTemplate(prev => ({ ...prev, content }))}
                      placeholder="Start typing your template content..."
                      className="min-h-[250px]"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setCustomTemplateDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateCustomTemplate}
                      disabled={!newTemplate.name || !newTemplate.subject || !newTemplate.content || createTemplateMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Email Campaigns</h3>
              <Button 
                onClick={handleCreateCampaign} 
                className="flex items-center gap-2"
                disabled={createCampaignMutation.isPending}
              >
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            </div>
            
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

        {/* History Tab with Dynamic Opens and Status */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Email History</CardTitle>
              <CardDescription>Track all sent emails with real-time status updates</CardDescription>
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
                            <EmailStatusBadge 
                              status={email.status} 
                              openCount={email.open_count}
                              clickCount={email.click_count}
                            />
                          </TableCell>
                           <TableCell onClick={() => handleEmailClick(email)}>
                             <div className="flex items-center gap-1">
                               <Eye className={`h-3 w-3 ${email.open_count > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                               <span className={email.open_count > 0 ? 'font-medium' : 'text-gray-500'}>
                                 {email.open_count}
                               </span>
                             </div>
                           </TableCell>
                          <TableCell onClick={() => handleEmailClick(email)}>
                            {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : '-'}
                          </TableCell>
                           <TableCell>
                             <EmailRowActions 
                               email={email}
                               onView={() => handleEmailClick(email)}
                               onFollowUp={() => handleFollowUp(email)}
                               onResend={async () => {
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
                               isResending={sendEmailMutation.isPending}
                             />
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
