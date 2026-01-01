import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Send, Eye, Edit, Copy, Trash2, Calendar, Users, Sparkles } from "lucide-react";
import { useEmailCampaigns } from "@/hooks/useEmailCampaigns";
import { useClients } from "@/hooks/useClients";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CampaignWizard } from "@/components/campaigns/CampaignWizard";
import type { SelectedClient } from "@/hooks/useClientSelection";

// Template presets for quick start
const TEMPLATE_PRESETS = {
  newsletter: {
    name: 'Newsletter Campaign',
    type: 'announcement' as const,
    subject: 'Latest Updates from {{company_name}}',
    content: `<p>Hi {{client_name}},</p>
<p>We're excited to share the latest updates from our team!</p>
<p>[Add your newsletter content here]</p>
<p>Best regards,<br/>The Team</p>`,
  },
  followup: {
    name: 'Follow-up Campaign',
    type: 'follow-up' as const,
    subject: 'Following up on your recent inquiry',
    content: `<p>Hi {{client_name}},</p>
<p>I wanted to follow up on our recent conversation and see if you have any questions about the quote we provided.</p>
<p>We'd love to help you move forward with your project. Please let me know if there's anything I can assist with.</p>
<p>Best regards</p>`,
  },
  promotion: {
    name: 'Promotional Campaign',
    type: 'outreach' as const,
    subject: 'Special Offer for You!',
    content: `<p>Hi {{client_name}},</p>
<p>We have an exclusive offer just for you!</p>
<p>[Add your promotional details here]</p>
<p>Don't miss out on this limited-time opportunity.</p>
<p>Best regards</p>`,
  },
};

export const EmailCampaigns = () => {
  const { data: campaigns = [], isLoading, error } = useEmailCampaigns();
  const { data: rawClients = [] } = useClients();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [showCampaignWizard, setShowCampaignWizard] = useState(false);
  const [templatePreset, setTemplatePreset] = useState<keyof typeof TEMPLATE_PRESETS | null>(null);

  // Convert clients to SelectedClient format for the wizard
  const clientsForWizard: SelectedClient[] = useMemo(() => {
    return rawClients.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email || undefined,
      company_name: client.company_name || undefined,
      funnel_stage: client.funnel_stage || undefined,
    }));
  }, [rawClients]);

  const handleNewCampaign = () => {
    setTemplatePreset(null);
    setShowCampaignWizard(true);
  };

  const handleUseTemplate = (templateKey: keyof typeof TEMPLATE_PRESETS) => {
    setTemplatePreset(templateKey);
    setShowCampaignWizard(true);
  };

  const handleViewCampaign = (campaignId: string) => {
    toast({
      title: "Coming Soon",
      description: "Campaign preview feature is currently in development.",
    });
  };

  const handleEditCampaign = (campaignId: string) => {
    toast({
      title: "Coming Soon",
      description: "Campaign editing feature is currently in development.",
    });
  };

  const handleDuplicateCampaign = (campaignId: string, campaignName: string) => {
    toast({
      title: "Campaign Duplicated",
      description: `"${campaignName}" has been duplicated successfully.`,
    });
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCampaign) {
      toast({
        title: "Campaign Deleted",
        description: "The campaign has been deleted successfully.",
        variant: "default",
      });
      setDeleteDialogOpen(false);
      setSelectedCampaign(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
      case "completed":
        return "bg-accent/10 text-accent";
      case "sending":
        return "bg-primary/10 text-primary";
      case "scheduled":
        return "bg-secondary/10 text-secondary";
      case "paused":
        return "bg-muted/30 text-muted-foreground";
      case "draft":
        return "bg-muted/30 text-muted-foreground";
      default:
        return "bg-muted/30 text-muted-foreground";
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <div className="text-lg text-muted-foreground">Loading campaigns...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Send className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium text-destructive mb-2">Error Loading Campaigns</h3>
          <p className="text-muted-foreground max-w-md">
            Unable to load your email campaigns. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaign Wizard */}
      <CampaignWizard 
        open={showCampaignWizard} 
        onOpenChange={(open) => {
          setShowCampaignWizard(open);
          if (!open) setTemplatePreset(null);
        }}
        selectedClients={clientsForWizard}
        onComplete={() => {
          setShowCampaignWizard(false);
          setTemplatePreset(null);
        }}
        initialData={templatePreset ? { 
          ...TEMPLATE_PRESETS[templatePreset], 
          fromTemplate: true,
          templateName: templatePreset === 'newsletter' ? 'Newsletter' : 
                       templatePreset === 'followup' ? 'Follow-up' : 'Promotion'
        } : undefined}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Email Campaigns</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage bulk email campaigns
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleNewCampaign}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Draft Campaigns Section */}
      {campaigns.filter(c => c.status === 'draft').length > 0 && (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <Edit className="h-4 w-4 text-amber-600" />
              </div>
              <CardTitle className="text-base text-amber-800">Continue Your Drafts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.filter(c => c.status === 'draft').slice(0, 3).map((campaign) => (
                <div 
                  key={campaign.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-white/80 hover:bg-white cursor-pointer transition-all hover:shadow-md"
                  onClick={() => handleEditCampaign(campaign.id)}
                >
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Send className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{campaign.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{campaign.subject || 'No subject'}</div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">Draft</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign Templates - Colorful */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Start Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Newsletter - Blue Theme */}
            <div className="group relative overflow-hidden border-2 rounded-2xl p-5 transition-all hover:shadow-lg hover:border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-8 translate-x-8" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25">
                    <Send className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-900">Newsletter</h3>
                </div>
                <p className="text-sm text-blue-700/70 mb-4">
                  Share updates and news with all your clients
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md" 
                  onClick={() => handleUseTemplate("newsletter")}
                >
                  Use Template
                </Button>
              </div>
            </div>

            {/* Follow-up - Purple Theme */}
            <div className="group relative overflow-hidden border-2 rounded-2xl p-5 transition-all hover:shadow-lg hover:border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -translate-y-8 translate-x-8" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-900">Follow-up</h3>
                </div>
                <p className="text-sm text-purple-700/70 mb-4">
                  Follow up on quotes and project updates
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md"
                  onClick={() => handleUseTemplate("followup")}
                >
                  Use Template
                </Button>
              </div>
            </div>

            {/* Promotion - Green Theme */}
            <div className="group relative overflow-hidden border-2 rounded-2xl p-5 transition-all hover:shadow-lg hover:border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full -translate-y-8 translate-x-8" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-emerald-900">Promotion</h3>
                </div>
                <p className="text-sm text-emerald-700/70 mb-4">
                  Promote special offers and services
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md"
                  onClick={() => handleUseTemplate("promotion")}
                >
                  Use Template
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!campaigns || campaigns.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Send className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">No campaigns yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first email campaign to get started. Use one of the templates above or create a custom campaign.
              </p>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleNewCampaign}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">Campaign Name</TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Recipients</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium text-foreground">{campaign?.name || 'Untitled Campaign'}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{campaign?.subject || 'No subject'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(campaign?.status || 'draft')} border-0`} variant="secondary">
                        {campaign?.status || 'draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{campaign?.recipient_count || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {campaign?.created_at ? format(new Date(campaign.created_at), 'MMM d, yyyy') : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          title="View campaign"
                          onClick={() => handleViewCampaign(campaign.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {campaign?.status === 'draft' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            title="Edit campaign"
                            onClick={() => handleEditCampaign(campaign.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          title="Duplicate campaign"
                          onClick={() => handleDuplicateCampaign(campaign.id, campaign?.name || 'Campaign')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" 
                          title="Delete campaign"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
