import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, Settings, MessageSquare, Shield, Send, Users, 
  BarChart3, FileText, Sparkles, Inbox
} from "lucide-react";
import { EmailInbox } from "./email/EmailInbox";
import { EmailComposer } from "./email/EmailComposer";
import { EmailCampaignsModern } from "./email/EmailCampaignsModern";
import { EmailAnalyticsDashboard } from "./email/EmailAnalyticsDashboard";
import { EmailTemplateLibrary } from "./email/EmailTemplateLibrary";
import { EmailSettings } from "./email/EmailSettings";
import { useEmailSetupStatus } from "@/hooks/useIntegrationStatus";
import { useEmails } from "@/hooks/useEmails";
import { HelpDrawer } from "@/components/ui/help-drawer";
import { HelpIcon } from "@/components/ui/help-icon";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";
import { useHasPermission } from "@/hooks/usePermissions";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCanSendEmails } from "@/hooks/useCanSendEmails";
import { useToast } from "@/hooks/use-toast";

export const EmailManagement = () => {
  const [activeTab, setActiveTab] = useState("inbox");
  const [showComposer, setShowComposer] = useState(false);
  const canAccessEmails = useHasPermission('view_jobs');
  const [showHelp, setShowHelp] = useState(false);
  const { hasEmailSettings, isLoading: integrationLoading } = useEmailSetupStatus();
  const { data: emails = [] } = useEmails();
  const { user } = useAuth();
  const { toast } = useToast();
  const { canSendEmails, isPermissionLoaded } = useCanSendEmails();
  
  
  // Selected template for composer
  const [selectedTemplate, setSelectedTemplate] = useState<{ subject: string; content: string } | null>(null);

  // Let parent Suspense handle loading state
  if (canAccessEmails === undefined) {
    return null;
  }

  if (!canAccessEmails) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="p-6 text-center space-y-4">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Access Denied</h3>
              <p className="text-muted-foreground text-sm mt-1">
                You don't have permission to access messages. Please contact your administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEmailSettingsClick = () => {
    setActiveTab("settings");
  };

  // Let parent Suspense handle loading state
  if (integrationLoading) {
    return null;
  }

  const renderHeader = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Messages</h1>
          <SectionHelpButton sectionId="messages" size="sm" />
          <Badge variant="secondary" className="text-xs">
            {emails?.length || 0}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Button 
              onClick={() => {
                if (!isPermissionLoaded || !canSendEmails) {
                  toast({
                    title: "Permission Denied",
                    description: "You don't have permission to send emails.",
                    variant: "destructive",
                  });
                  return;
                }
                if (!hasEmailSettings) {
                  toast({
                    title: "Email Settings Required",
                    description: "Please configure your sender name and email in Settings first.",
                    variant: "destructive",
                  });
                  return;
                }
                setShowComposer(true);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!hasEmailSettings || !isPermissionLoaded || !canSendEmails}
            >
              <Send className="h-4 w-4 mr-2" />
              Compose
            </Button>
            {(!hasEmailSettings || !isPermissionLoaded || !canSendEmails) && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-50">
                <div className="bg-popover text-popover-foreground text-xs rounded-md p-2 shadow-lg border whitespace-nowrap">
                  {!isPermissionLoaded || !canSendEmails 
                    ? "You don't have permission to send emails."
                    : "Configure your sender email in Settings first"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-b border-border/50 rounded-none p-0 h-auto flex w-full justify-start gap-0">
          <TabsTrigger 
            value="inbox" 
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground"
          >
            <Inbox className="w-4 h-4" />
            Inbox
          </TabsTrigger>
          <TabsTrigger 
            value="campaigns" 
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground"
          >
            <Send className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground"
          >
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/5 rounded-none text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "campaigns":
        return (
          <div className="animate-fade-in">
            <EmailCampaignsModern />
          </div>
        );
      case "templates":
        return (
          <div className="animate-fade-in">
            <EmailTemplateLibrary 
              onSelectTemplate={(template) => {
                setSelectedTemplate(template);
                setShowComposer(true);
              }}
            />
          </div>
        );
      case "analytics":
        return (
          <div className="animate-fade-in">
            <EmailAnalyticsDashboard />
          </div>
        );
      case "settings":
        return (
          <Card className="bg-card border-border rounded-lg shadow-sm animate-fade-in">
            <CardContent className="p-6">
              <EmailSettings />
            </CardContent>
          </Card>
        );
      default:
        return (
          <div className="animate-fade-in">
            <EmailInbox onComposeClick={() => setShowComposer(true)} />
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-background">
      <div className="w-full px-6 py-6 space-y-6">
        {renderHeader()}
        {renderContent()}
      </div>

      {/* Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-card border rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <EmailComposer 
              onClose={() => {
                setShowComposer(false);
                setSelectedTemplate(null);
              }}
              initialSubject={selectedTemplate?.subject}
              initialContent={selectedTemplate?.content}
            />
          </div>
        </div>
      )}
      
      <HelpDrawer
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="Messages"
        sections={{
          purpose: {
            title: "What this page is for",
            content: "Send and track email and WhatsApp communications with clients. Create campaigns for bulk outreach and monitor message performance."
          },
          actions: {
            title: "Common actions",
            content: "Compose new messages, view message history, create bulk campaigns, and configure sender settings."
          },
          tips: {
            title: "Tips & best practices",
            content: "Use personalized subject lines. Keep messages concise and professional. Monitor open and click rates to improve engagement."
          },
          shortcuts: [
            { key: "Ctrl + M", description: "Compose new message" },
            { key: "Tab", description: "Switch between sections" }
          ]
        }}
      />

    </div>
  );
};

export default EmailManagement;
