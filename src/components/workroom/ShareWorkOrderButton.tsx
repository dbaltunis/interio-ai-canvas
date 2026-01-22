import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Share2, Plus, Link2, RefreshCw } from 'lucide-react';
import { useShareLinks, type ShareLink } from '@/hooks/useShareLinks';
import { getAvailableTreatments } from '@/hooks/useWorkOrderSharing';
import { ShareLinkCard } from './ShareLinkCard';
import { CreateShareLinkForm } from './CreateShareLinkForm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { resyncAllWorkshopItemsForProject } from '@/hooks/useWorkshopItemSync';
import { showSuccessToast, showErrorToast } from '@/components/ui/use-toast';

interface ShareWorkOrderButtonProps {
  projectId: string | undefined;
  orientation?: 'portrait' | 'landscape';
}

export const ShareWorkOrderButton: React.FC<ShareWorkOrderButtonProps> = ({ projectId, orientation = 'landscape' }) => {
  const {
    shareLinks,
    isLoading,
    isCreating,
    createShareLink,
    deleteShareLink,
    getShareUrl,
  } = useShareLinks(projectId);

  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [availableTreatments, setAvailableTreatments] = useState<string[]>([]);
  const [isResyncing, setIsResyncing] = useState(false);

  // Load available treatments
  useEffect(() => {
    if (projectId) {
      getAvailableTreatments(projectId).then(setAvailableTreatments);
    }
  }, [projectId]);

  const handleCreateLink = async (input: Parameters<typeof createShareLink>[0]) => {
    // Include current orientation when creating link
    const result = await createShareLink({
      ...input,
      orientation: input.orientation || orientation,
    });
    if (result) {
      setShowCreateForm(false);
    }
  };

  const handleResyncData = async () => {
    if (!projectId) return;
    
    setIsResyncing(true);
    try {
      const result = await resyncAllWorkshopItemsForProject(projectId);
      if (result.success) {
        showSuccessToast(
          'Data refreshed', 
          `Synced ${result.count} items with latest values`,
          'normal'
        );
      } else {
        showErrorToast('Failed to refresh data', result.error);
      }
    } catch (error) {
      showErrorToast('Failed to refresh data');
    } finally {
      setIsResyncing(false);
    }
  };

  const totalViewers = shareLinks.reduce((sum, link) => sum + (link.viewer_count || 0), 0);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={shareLinks.length > 0 ? "default" : "outline"} 
          size="sm" 
          className="gap-2"
          disabled={!projectId}
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">
            {shareLinks.length > 0 ? 'Shared' : 'Share'}
          </span>
          {shareLinks.length > 0 && (
            <span className="ml-1 bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.5 rounded text-xs">
              {shareLinks.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Share Links</h4>
              <p className="text-xs text-muted-foreground">
                {shareLinks.length} link{shareLinks.length !== 1 ? 's' : ''}
                {totalViewers > 0 && ` · ${totalViewers} viewer${totalViewers !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {shareLinks.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResyncData}
                  disabled={isResyncing}
                  className="h-8 px-2"
                  title="Refresh shared data"
                >
                  <RefreshCw className={`h-4 w-4 ${isResyncing ? 'animate-spin' : ''}`} />
                </Button>
              )}
              {!showCreateForm && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowCreateForm(true)}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Link
                </Button>
              )}
            </div>
          </div>
        </div>

        {showCreateForm ? (
          <CreateShareLinkForm
            projectId={projectId}
            isCreating={isCreating}
            onSubmit={handleCreateLink}
            onCancel={() => setShowCreateForm(false)}
          />
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="p-3 space-y-2">
              {shareLinks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No share links yet</p>
                  <p className="text-xs">Create a link to share this work order</p>
                </div>
              ) : (
                shareLinks.map(link => (
                  <ShareLinkCard
                    key={link.id}
                    link={link}
                    onDelete={deleteShareLink}
                    getShareUrl={getShareUrl}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};
