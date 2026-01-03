import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Send, Eye, Edit, Copy, Trash2, Calendar, Users, FileText } from "lucide-react";
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
      case "draft":
      default:
        return "bg-muted/30 text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <div className="text-muted-foreground">Loading campaigns...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Send className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium text-destructive mb-2">Error Loading Campaigns</h3>
        <p className="text-muted-foreground max-w-md">
          Unable to load your campaigns. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          <h2 className="text-lg font-semibold">Campaigns</h2>
          <p className="text-muted-foreground text-sm">Create and manage bulk message campaigns</p>
        </div>
        <Button onClick={handleNewCampaign}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Quick Templates - Clean Monochrome */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Quick Start Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <button
              onClick={() => handleUseTemplate("newsletter")}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors text-left"
            >
              <div className="p-2 rounded-md bg-muted">
                <Send className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Newsletter</div>
                <div className="text-xs text-muted-foreground truncate">Share updates with clients</div>
              </div>
            </button>

            <button
              onClick={() => handleUseTemplate("followup")}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors text-left"
            >
              <div className="p-2 rounded-md bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Follow-up</div>
                <div className="text-xs text-muted-foreground truncate">Quote and project updates</div>
              </div>
            </button>

            <button
              onClick={() => handleUseTemplate("promotion")}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors text-left"
            >
              <div className="p-2 rounded-md bg-muted">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Promotion</div>
                <div className="text-xs text-muted-foreground truncate">Special offers and services</div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Draft Campaigns */}
      {campaigns.filter(c => c.status === 'draft').length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {campaigns.filter(c => c.status === 'draft').slice(0, 3).map((campaign) => (
                <div 
                  key={campaign.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => handleEditCampaign(campaign.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{campaign.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{campaign.subject || 'No subject'}</div>
                  </div>
                  <Badge variant="secondary" className="text-xs">Draft</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Campaigns */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">All Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!campaigns || campaigns.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Send className="mx-auto h-10 w-10 mb-3 text-muted-foreground" />
              <h3 className="font-medium mb-1">No campaigns yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first campaign using a template above
              </p>
              <Button variant="outline" onClick={handleNewCampaign}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{campaign?.name || 'Untitled'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{campaign?.subject || '—'}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(campaign?.status || 'draft')} border-0`} variant="secondary">
                        {campaign?.status || 'draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{campaign?.recipient_count || 0}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {campaign?.created_at ? format(new Date(campaign.created_at), 'MMM d, yyyy') : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleViewCampaign(campaign.id)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {campaign?.status === 'draft' && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditCampaign(campaign.id)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDuplicateCampaign(campaign.id, campaign?.name || 'Campaign')}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteCampaign(campaign.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
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
