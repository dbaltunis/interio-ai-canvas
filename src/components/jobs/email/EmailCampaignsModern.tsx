import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, Send, Calendar, Users, FileText, Search,
  Grid3X3, List, Filter
} from "lucide-react";
import { useEmailCampaigns } from "@/hooks/useEmailCampaigns";
import { useClients } from "@/hooks/useClients";
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
import { CampaignCard } from "./CampaignCard";
import type { SelectedClient } from "@/hooks/useClientSelection";
import { cn } from "@/lib/utils";
import { PixelSendIcon } from "@/components/icons/PixelArtIcons";
import { getCampaignTemplates, CampaignTemplateKey } from "./EmailTemplateLibrary";

// Get templates from the shared source (localStorage backed)
const getTemplatePresets = () => {
  const templates = getCampaignTemplates();
  return {
    newsletter: {
      name: templates.newsletter.name,
      type: templates.newsletter.type,
      subject: templates.newsletter.subject,
      content: templates.newsletter.content,
    },
    followup: {
      name: templates.followup.name,
      type: templates.followup.type,
      subject: templates.followup.subject,
      content: templates.followup.content,
    },
    promotion: {
      name: templates.promotion.name,
      type: templates.promotion.type,
      subject: templates.promotion.subject,
      content: templates.promotion.content,
    },
  };
};

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'draft' | 'scheduled' | 'sent';

export const EmailCampaignsModern = () => {
  const { data: campaigns = [], isLoading, error } = useEmailCampaigns();
  const { data: rawClients = [] } = useClients();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [showCampaignWizard, setShowCampaignWizard] = useState(false);
  const [templatePreset, setTemplatePreset] = useState<CampaignTemplateKey | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get templates dynamically (they may have been edited)
  const TEMPLATE_PRESETS = useMemo(() => getTemplatePresets(), [showCampaignWizard]);

  const clientsForWizard: SelectedClient[] = useMemo(() => {
    return rawClients.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email || undefined,
      company_name: client.company_name || undefined,
      funnel_stage: client.funnel_stage || undefined,
    }));
  }, [rawClients]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = 
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'sent' ? ['sent', 'completed'].includes(campaign.status) : campaign.status === statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchTerm, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: campaigns.length,
    drafts: campaigns.filter(c => c.status === 'draft').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    sent: campaigns.filter(c => ['sent', 'completed'].includes(c.status)).length,
  }), [campaigns]);

  const handleNewCampaign = () => {
    setTemplatePreset(null);
    setShowCampaignWizard(true);
  };

  const handleUseTemplate = (templateKey: CampaignTemplateKey) => {
    setTemplatePreset(templateKey);
    setShowCampaignWizard(true);
  };

  const handleViewCampaign = (campaignId: string) => {
    toast({
      title: "Coming Soon",
      description: "Campaign preview feature is in development.",
    });
  };

  const handleEditCampaign = (campaignId: string) => {
    toast({
      title: "Coming Soon",
      description: "Campaign editing feature is in development.",
    });
  };

  const handleDuplicateCampaign = (campaignId: string, campaignName: string) => {
    toast({
      title: "Campaign Duplicated",
      description: `"${campaignName}" has been duplicated.`,
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
      });
      setDeleteDialogOpen(false);
      setSelectedCampaign(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading campaigns...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Send className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium text-destructive mb-2">Error Loading Campaigns</h3>
        <p className="text-muted-foreground max-w-md">
          Unable to load campaigns. Please try refreshing the page.
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Email Campaigns</h2>
          <p className="text-sm text-muted-foreground">Create and manage bulk email campaigns</p>
        </div>
        <Button onClick={handleNewCampaign} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Quick Start Templates */}
      <Card className="border-dashed bg-muted/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Quick Start Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { key: 'newsletter' as const, icon: Send, label: 'Newsletter', desc: 'Share updates with clients' },
              { key: 'followup' as const, icon: Calendar, label: 'Follow-up', desc: 'Quote and project updates' },
              { key: 'promotion' as const, icon: Users, label: 'Promotion', desc: 'Special offers and services' },
            ].map(template => (
              <button
                key={template.key}
                onClick={() => handleUseTemplate(template.key)}
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="p-2.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                  <template.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <div className="font-medium text-sm group-hover:text-primary transition-colors">
                    {template.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{template.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all' as const, label: 'All Campaigns', count: stats.total },
          { key: 'draft' as const, label: 'Drafts', count: stats.drafts },
          { key: 'scheduled' as const, label: 'Scheduled', count: stats.scheduled },
          { key: 'sent' as const, label: 'Sent', count: stats.sent },
        ].map(stat => (
          <button
            key={stat.key}
            onClick={() => setStatusFilter(stat.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
              statusFilter === stat.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {stat.label}
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs h-5 min-w-[20px] justify-center",
                statusFilter === stat.key && "bg-primary-foreground/20 text-primary-foreground"
              )}
            >
              {stat.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Search & View Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Campaigns Grid/List */}
      {filteredCampaigns.length === 0 ? (
        <Card className="bg-muted/10 border-dashed">
          <CardContent className="py-16">
            <div className="text-center">
              <PixelSendIcon className="mx-auto mb-4" size={64} />
              <h3 className="font-semibold text-lg mb-2">
                {searchTerm || statusFilter !== 'all' 
                  ? "No campaigns found" 
                  : "Ready to reach your clients!"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all'
                  ? "Try adjusting your search or filters"
                  : "Create your first email campaign to engage with multiple clients at once"}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={handleNewCampaign}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Campaign
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onView={handleViewCampaign}
              onEdit={handleEditCampaign}
              onDuplicate={handleDuplicateCampaign}
              onDelete={handleDeleteCampaign}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredCampaigns.map(campaign => (
                <div 
                  key={campaign.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleViewCampaign(campaign.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{campaign.name}</div>
                    <div className="text-sm text-muted-foreground truncate">{campaign.subject}</div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {campaign.recipient_count} recipients
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "shrink-0 capitalize",
                      campaign.status === 'sent' && "text-green-600 border-green-200",
                      campaign.status === 'draft' && "text-muted-foreground"
                    )}
                  >
                    {campaign.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
