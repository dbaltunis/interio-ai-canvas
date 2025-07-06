import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings,
  Plus,
  Clock,
  Users,
  FileText,
  Mail,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmails, useEmailKPIs } from "@/hooks/useEmails";
import { useEmailCampaigns, useCreateEmailCampaign, useUpdateEmailCampaign } from "@/hooks/useEmailCampaigns";
import { useEmailTemplates, useCreateEmailTemplate } from "@/hooks/useEmailTemplates";
import { useSendEmail } from "@/hooks/useSendEmail";
import { useEmailSettings, useUpdateEmailSettings } from "@/hooks/useEmailSettings";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { EmailPreviewDialog } from "./email-components/EmailPreviewDialog";
import { ClientSelector } from "./email-components/ClientSelector";
import { QuoteSelector } from "./email-components/QuoteSelector";
import { CampaignBuilder } from "./email-components/CampaignBuilder";
import { EmailKPIsDashboard } from "./email-components/EmailKPIsDashboard";
import { TemplateVariableEditor } from "./email-components/TemplateVariableEditor";
import { EmailComposer } from "./email-components/EmailComposer";
import { EmailHistoryTab } from "./email-components/EmailHistoryTab";
import { EmailTemplatesTab } from "./email-components/EmailTemplatesTab";

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
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [selectedClients, setSelectedClients] = useState<any[]>([]);
  const [selectedQuotes, setSelectedQuotes] = useState<any[]>([]);
  const [newEmailSettings, setNewEmailSettings] = useState({
    from_email: "",
    from_name: "",
    reply_to_email: "",
    signature: ""
  });
  const [activeTabValue, setActiveTabValue] = useState("history");
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);

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

  const handleResendEmail = async (email: any) => {
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
  };

  const handleApplyTemplate = (subject: string, content: string, templateId?: string) => {
    setNewEmail({
      ...newEmail,
      subject,
      content,
      template_id: templateId || ""
    });
  };

  if (kpisLoading) {
    return <div className="flex items-center justify-center h-64">Loading email data...</div>;
  }

  return (
    <div className="space-y-6">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">Hist</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Campaigns</span>
              <span className="sm:hidden">Camps</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
              <span className="sm:hidden">Temps</span>
            </TabsTrigger>
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Compose</span>
              <span className="sm:hidden">Email</span>
            </TabsTrigger>
          </TabsList>
          
          <Button 
            onClick={() => setComposeDialogOpen(true)}
            className="bg-primary hover:bg-accent text-primary-foreground shadow-lg transition-all duration-200 hover:shadow-xl w-full sm:w-auto"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Email
          </Button>
        </div>

        {/* History Tab */}
        <TabsContent value="history">
          <EmailHistoryTab
            emails={emails}
            emailsLoading={emailsLoading}
            onComposeClick={() => setComposeDialogOpen(true)}
            onResendEmail={handleResendEmail}
            isResending={sendEmailMutation.isPending}
          />
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

            {/* Email Composer with Appointment Scheduler Integration */}
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

            {/* Email Preview Dialog */}
            <EmailPreviewDialog
              open={previewDialogOpen}
              onOpenChange={setPreviewDialogOpen}
              template={{
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
          <EmailTemplatesTab
            templates={templates}
            onCreateTemplate={(templateData) => createTemplateMutation.mutate(templateData)}
            onApplyTemplate={handleApplyTemplate}
            isCreating={createTemplateMutation.isPending}
          />
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
                        <div className={`px-2 py-1 rounded text-xs ${campaign.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {campaign.status}
                        </div>
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

      </Tabs>

      {/* Compose Email Dialog */}
      <Dialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Compose New Email</DialogTitle>
            <DialogDescription>
              Create and send a new email to your clients with appointment booking links
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
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

            {/* Email Composer with Appointment Scheduler Integration */}
            <EmailComposer
              newEmail={newEmail}
              setNewEmail={setNewEmail}
              selectedClients={selectedClients}
              selectedQuotes={selectedQuotes}
              onSendEmail={(attachments) => {
                handleSendEmail(attachments);
                setComposeDialogOpen(false);
              }}
              onPreviewEmail={() => setPreviewDialogOpen(true)}
              sendEmailMutation={sendEmailMutation}
              emailSettings={emailSettings}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* All Dialogs */}
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

      <EmailPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        template={{
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
  );
};
