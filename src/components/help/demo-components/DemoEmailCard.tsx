/**
 * DemoEmailCard - Extracted from EmailInbox.tsx
 * Presentation-only version for tutorial demos - 100% visual accuracy
 * No hooks, no data fetching - accepts static props
 */

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, CheckCircle2, XCircle, Eye, MousePointerClick, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoEmailCardProps {
  clientName: string;
  subject: string;
  preview: string;
  channel: "email" | "whatsapp";
  status: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed";
  timestamp: string;
  selected?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
}

// Status config matching EmailInbox.tsx
const getStatusConfig = (status: string) => {
  const configs: Record<string, { icon: any; color: string; label: string }> = {
    sent: { icon: Clock, color: "text-blue-500", label: "Sent" },
    delivered: { icon: CheckCircle2, color: "text-green-500", label: "Delivered" },
    opened: { icon: Eye, color: "text-purple-500", label: "Opened" },
    clicked: { icon: MousePointerClick, color: "text-primary", label: "Clicked" },
    bounced: { icon: XCircle, color: "text-orange-500", label: "Bounced" },
    failed: { icon: XCircle, color: "text-destructive", label: "Failed" },
  };
  return configs[status] || configs.sent;
};

// Avatar color logic
const getAvatarColor = (name: string) => {
  const colors = ['bg-info', 'bg-success', 'bg-primary', 'bg-warning', 'bg-secondary', 'bg-accent'];
  return colors[name.length % colors.length];
};

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const DemoEmailCard = ({
  clientName,
  subject,
  preview,
  channel,
  status,
  timestamp,
  selected = false,
  highlighted = false,
  onClick,
}: DemoEmailCardProps) => {
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;
  const ChannelIcon = channel === "email" ? Mail : MessageSquare;

  return (
    <div
      className={cn(
        "p-3 cursor-pointer transition-all border-b border-border hover:bg-muted/50",
        selected && "bg-primary/5 border-l-2 border-l-primary",
        highlighted && "ring-2 ring-primary ring-inset"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className={`${getAvatarColor(clientName)} text-primary-foreground text-xs font-semibold`}>
            {getInitials(clientName)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium truncate">{clientName}</span>
            <span className="text-[10px] text-muted-foreground shrink-0">{timestamp}</span>
          </div>

          {/* Subject */}
          <p className="text-xs font-medium truncate">{subject}</p>

          {/* Preview */}
          <p className="text-xs text-muted-foreground truncate">{preview}</p>

          {/* Footer row with badges */}
          <div className="flex items-center gap-2 pt-1">
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] gap-1">
              <ChannelIcon className="h-3 w-3" />
              {channel === "email" ? "Email" : "WhatsApp"}
            </Badge>
            <Badge variant="outline" className={`h-5 px-1.5 text-[10px] gap-1 ${statusConfig.color}`}>
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
