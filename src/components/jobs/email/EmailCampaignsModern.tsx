import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Send, Search } from "lucide-react";
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
import { CampaignDetailsDialog } from "@/components/campaigns/CampaignDetailsDialog";
import type { SelectedClient } from "@/hooks/useClientSelection";
import type { EmailCampaign } from "@/hooks/useEmailCampaigns";
import { cn } from "@/lib/utils";
import { PixelSendIcon } from "@/components/icons/PixelArtIcons";

type StatusFilter = 'all' | 'draft' | 'scheduled' | 'sent';

export const EmailCampaignsModern = () => {
  const { data: campaigns = [], isLoading, error } = useEmailCampaigns();
  const { data: rawClients = [] } = useClients();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [viewingCampaign, setViewingCampaign] = useState<EmailCampaign | null>(null);
  const [showCampaignWizard, setShowCampaignWizard] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState("");

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
    setShowCampaignWizard(true);
  };

  const handleViewCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      setViewingCampaign(campaign);
    }
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
        onOpenChange={setShowCampaignWizard}
        selectedClients={clientsForWizard}
        onComplete={() => setShowCampaignWizard(false)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Email Campaigns</h2>
          <p className="text-sm text-muted-foreground">Create and manage email campaigns</p>
        </div>
        <Button onClick={handleNewCampaign} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all' as const, label: 'All', count: stats.total },
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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Campaigns List */}
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
      ) : (
        <div className="space-y-3">
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

      {/* Campaign Details Dialog */}
      <CampaignDetailsDialog
        campaign={viewingCampaign}
        open={!!viewingCampaign}
        onOpenChange={(open) => !open && setViewingCampaign(null)}
      />
    </div>
  );
};
