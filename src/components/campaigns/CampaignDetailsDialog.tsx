import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Send, Calendar, Users, Clock, Mail, FileText 
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { EmailCampaign } from "@/hooks/useEmailCampaigns";

interface CampaignDetailsDialogProps {
  campaign: EmailCampaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CampaignDetailsDialog = ({
  campaign,
  open,
  onOpenChange,
}: CampaignDetailsDialogProps) => {
  if (!campaign) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'sent':
      case 'completed':
        return { 
          label: 'Sent', 
          className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          icon: Send
        };
      case 'sending':
        return { 
          label: 'Sending', 
          className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          icon: Send
        };
      case 'scheduled':
        return { 
          label: 'Scheduled', 
          className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
          icon: Calendar
        };
      case 'paused':
        return { 
          label: 'Paused', 
          className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
          icon: Clock
        };
      case 'draft':
      default:
        return { 
          label: 'Draft', 
          className: 'bg-muted text-muted-foreground',
          icon: FileText
        };
    }
  };

  const statusConfig = getStatusConfig(campaign.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Badge className={cn("text-xs font-medium border-0", statusConfig.className)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-semibold mt-2">
            {campaign.name || 'Untitled Campaign'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Subject Line */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Mail className="h-4 w-4" />
                Subject Line
              </div>
              <p className="text-base bg-muted/50 rounded-lg p-3">
                {campaign.subject || 'No subject line'}
              </p>
            </div>

            <Separator />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  Recipients
                </div>
                <p className="text-2xl font-bold">{campaign.recipient_count || 0}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  {campaign.sent_at ? 'Sent' : campaign.scheduled_at ? 'Scheduled' : 'Created'}
                </div>
                <p className="text-lg font-semibold">
                  {campaign.sent_at 
                    ? format(new Date(campaign.sent_at), 'MMM d, yyyy h:mm a')
                    : campaign.scheduled_at
                      ? format(new Date(campaign.scheduled_at), 'MMM d, yyyy h:mm a')
                      : format(new Date(campaign.created_at), 'MMM d, yyyy')
                  }
                </p>
              </div>
            </div>

            <Separator />

            {/* Content Preview */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                <FileText className="h-4 w-4" />
                Email Content
              </div>
              <div 
                className="bg-background border rounded-lg p-4 prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: campaign.content || '<p class="text-muted-foreground italic">No content</p>' 
                }}
              />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
