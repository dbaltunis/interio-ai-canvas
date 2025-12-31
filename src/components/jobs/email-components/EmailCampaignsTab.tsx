import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Users, 
  MoreHorizontal, 
  Edit2, 
  Copy, 
  Trash2,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Pause,
  Send
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface EmailCampaignsTabProps {
  campaigns: any[];
  onCreateCampaign: () => void;
  onEditCampaign: (campaign: any) => void;
  isCreating: boolean;
}

const STATUS_CONFIG: Record<string, { 
  label: string; 
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}> = {
  'draft': { 
    label: 'Draft', 
    icon: Edit2,
    className: 'bg-muted text-muted-foreground border-border'
  },
  'scheduled': { 
    label: 'Scheduled', 
    icon: Calendar,
    className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
  },
  'sending': { 
    label: 'Sending', 
    icon: Send,
    className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'
  },
  'sent': { 
    label: 'Sent', 
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800'
  },
  'paused': { 
    label: 'Paused', 
    icon: Pause,
    className: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800'
  },
  'completed': { 
    label: 'Completed', 
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800'
  },
};

export const EmailCampaignsTab = ({ 
  campaigns, 
  onCreateCampaign, 
  onEditCampaign, 
  isCreating 
}: EmailCampaignsTabProps) => {
  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG['draft'];
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Email Campaigns</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage your email campaigns
          </p>
        </div>
        <Button 
          onClick={onCreateCampaign} 
          className="gap-2"
          disabled={isCreating}
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>
      
      {campaigns && campaigns.length > 0 ? (
        <div className="grid gap-3">
          {campaigns.map((campaign) => {
            const statusConfig = getStatusConfig(campaign.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <Card 
                key={campaign.id} 
                className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
                onClick={() => onEditCampaign(campaign)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Campaign Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground truncate">
                          {campaign.name}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`gap-1 text-xs shrink-0 ${statusConfig.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground truncate mb-2">
                        {campaign.subject || 'No subject line'}
                      </p>
                      
                      {/* Stats Row */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {campaign.recipient_count} recipients
                        </span>
                        {campaign.scheduled_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Scheduled
                          </span>
                        )}
                        {campaign.created_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onEditCampaign(campaign);
                        }}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h4 className="text-lg font-medium mb-2 text-foreground">No Campaigns Yet</h4>
              <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                Create professional email campaigns with AI-powered content suggestions, 
                personalization tokens, and spam detection.
              </p>
              <Button onClick={onCreateCampaign} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
