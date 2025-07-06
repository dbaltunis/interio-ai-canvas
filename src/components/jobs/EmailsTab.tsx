import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmails, useEmailKPIs } from "@/hooks/useEmails";
import { useEmailCampaigns, useCreateEmailCampaign, useUpdateEmailCampaign } from "@/hooks/useEmailCampaigns";
import { useEmailTemplates, useCreateEmailTemplate } from "@/hooks/useEmailTemplates";
import { useSendEmail } from "@/hooks/useSendEmail";
import { useEmailSettings, useUpdateEmailSettings } from "@/hooks/useEmailSettings";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { EmailKPIsDashboard } from "./email-components/EmailKPIsDashboard";
import { EmailTabsNavigation } from "./email-components/EmailTabsNavigation";
import { EmailIntegrationBanners } from "./email-components/EmailIntegrationBanners";
import { EmailHistoryTab } from "./email-components/EmailHistoryTab";
import { EmailComposeTab } from "./email-components/EmailComposeTab";
import { EmailTemplatesTab } from "./email-components/EmailTemplatesTab";
import { EmailCampaignsTab } from "./email-components/EmailCampaignsTab";
import { EmailSettingsDialog } from "./email-components/EmailSettingsDialog";
import { CampaignBuilder } from "./email-components/CampaignBuilder";
import { TemplateVariableEditor } from "./email-components/TemplateVariableEditor";
import { EmailPreviewDialog } from "./email-components/EmailPreviewDialog";
import { ClientSelector } from "./email-components/ClientSelector";
import { QuoteSelector } from "./email-components/QuoteSelector";
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

  const handleEditCampaign = (campaign: any) => {
    setEditingCampaign(campaign);
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

      {/* Integration and Settings Banners */}
      <EmailIntegrationBanners
        hasSendGridIntegration={hasSendGridIntegration}
        hasEmailSettings={!!emailSettings?.from_email}
        onEmailSettingsClick={() => setEmailSettingsOpen(true)}
      />

      {/* Main Email Interface */}
      <Tabs value={activeTabValue} onValueChange={setActiveTabValue} className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <EmailTabsNavigation activeTab={activeTabValue} onTabChange={setActiveTabValue} />
          
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
          <EmailComposeTab
            selectedClients={selectedClients}
            setSelectedClients={setSelectedClients}
            selectedQuotes={selectedQuotes}
            setSelectedQuotes={setSelectedQuotes}
            newEmail={newEmail}
            setNewEmail={setNewEmail}
            onSendEmail={handleSendEmail}
            previewDialogOpen={previewDialogOpen}
            setPreviewDialogOpen={setPreviewDialogOpen}
            sendEmailMutation={sendEmailMutation}
            emailSettings={emailSettings}
          />
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
          <EmailCampaignsTab
            campaigns={campaigns}
            onCreateCampaign={handleCreateCampaign}
            onEditCampaign={handleEditCampaign}
            isCreating={createCampaignMutation.isPending}
          />
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

      {/* Email Settings Dialog */}
      <EmailSettingsDialog
        open={emailSettingsOpen}
        onOpenChange={setEmailSettingsOpen}
        emailSettings={newEmailSettings}
        onSave={(settings) => {
          setNewEmailSettings(settings);
          handleSaveEmailSettings();
        }}
      />

      {/* Other Dialogs */}
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
