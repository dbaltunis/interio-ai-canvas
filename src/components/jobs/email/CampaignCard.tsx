import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MoreHorizontal, Eye, Edit, Copy, Trash2, 
  Send, Calendar, Users, TrendingUp, Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { EmailCampaign } from "@/hooks/useEmailCampaigns";

interface CampaignCardProps {
  campaign: EmailCampaign;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onSend?: (id: string) => void;
}

export const CampaignCard = ({
  campaign,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onSend,
}: CampaignCardProps) => {
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
          className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse',
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
          icon: Edit
        };
    }
  };

  const statusConfig = getStatusConfig(campaign.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:border-primary/30">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn("text-xs font-medium border-0", statusConfig.className)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
              {campaign.name || 'Untitled Campaign'}
            </h3>
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {campaign.subject || 'No subject line'}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onView(campaign.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {campaign.status === 'draft' && (
                <DropdownMenuItem onClick={() => onEdit(campaign.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Campaign
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDuplicate(campaign.id, campaign.name)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(campaign.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{campaign.recipient_count || 0}</span>
            <span className="text-muted-foreground">recipients</span>
          </div>
          
          {(campaign.status === 'sent' || campaign.status === 'completed') && (
            <div className="flex items-center gap-1.5 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Sent</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-xs text-muted-foreground">
            {campaign.sent_at 
              ? `Sent ${format(new Date(campaign.sent_at), 'MMM d, yyyy')}`
              : campaign.scheduled_at
                ? `Scheduled for ${format(new Date(campaign.scheduled_at), 'MMM d, yyyy')}`
                : `Created ${format(new Date(campaign.created_at), 'MMM d, yyyy')}`
            }
          </span>
          
          {campaign.status === 'draft' && onSend && (
            <Button 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => onSend(campaign.id)}
            >
              <Send className="h-3 w-3 mr-1.5" />
              Send Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
