/**
 * DemoCampaignCard - Extracted from CampaignCard.tsx
 * Presentation-only version for tutorial demos - 100% visual accuracy
 * No hooks, no data fetching - accepts static props
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Send, Clock, CheckCircle2, AlertCircle, XCircle,
  MoreHorizontal, Eye, Users, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoCampaignCardProps {
  name: string;
  subject: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  recipientCount: number;
  openRate?: number;
  clickRate?: number;
  dateLabel: string;
  highlighted?: boolean;
  onClick?: () => void;
}

// Status config matching CampaignCard.tsx
const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; className: string; icon: any }> = {
    draft: { 
      label: "Draft", 
      className: "bg-muted text-muted-foreground border-border", 
      icon: Clock 
    },
    scheduled: { 
      label: "Scheduled", 
      className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800", 
      icon: Calendar 
    },
    sending: { 
      label: "Sending", 
      className: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800", 
      icon: Send 
    },
    sent: { 
      label: "Sent", 
      className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800", 
      icon: CheckCircle2 
    },
    failed: { 
      label: "Failed", 
      className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800", 
      icon: XCircle 
    },
  };
  return configs[status] || configs.draft;
};

export const DemoCampaignCard = ({
  name,
  subject,
  status,
  recipientCount,
  openRate,
  clickRate,
  dateLabel,
  highlighted = false,
  onClick,
}: DemoCampaignCardProps) => {
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card 
      className={cn(
        "overflow-hidden cursor-pointer hover:shadow-md transition-all border-border/50",
        highlighted && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn("text-[10px] gap-1 border", statusConfig.className)}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
            <h4 className="font-semibold text-sm truncate">{name}</h4>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{subject}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{recipientCount} recipients</span>
          </div>
          {openRate !== undefined && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              <span>{openRate}% opened</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-[10px] text-muted-foreground">{dateLabel}</span>
          {status === "draft" && (
            <Button size="sm" className="h-7 text-xs px-3">
              <Send className="h-3 w-3 mr-1" />
              Send
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
