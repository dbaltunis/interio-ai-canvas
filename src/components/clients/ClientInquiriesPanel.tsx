import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  CheckCheck, 
  Circle, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Package,
  Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { 
  useClientInquiries, 
  useMarkInquiryRead, 
  useMarkAllInquiriesRead,
  INQUIRY_TYPE_CONFIG,
  type ClientInquiry,
  type InquiryType
} from "@/hooks/useClientInquiries";
import { cn } from "@/lib/utils";

interface ClientInquiriesPanelProps {
  clientId: string;
  compact?: boolean;
}

const InquiryTypeBadge = ({ type }: { type: InquiryType }) => {
  const config = INQUIRY_TYPE_CONFIG[type] || INQUIRY_TYPE_CONFIG.general;
  
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "text-[10px] px-1.5 py-0 font-medium",
        config.bgColor,
        config.color
      )}
    >
      {config.label}
    </Badge>
  );
};

const InquiryItem = ({ 
  inquiry, 
  onMarkRead,
  expanded,
  onToggle
}: { 
  inquiry: ClientInquiry;
  onMarkRead: (id: string) => void;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const isUnread = !inquiry.is_read;
  const metadata = inquiry.metadata || {};
  
  return (
    <div 
      className={cn(
        "p-3 border rounded-lg transition-colors cursor-pointer hover:bg-muted/50",
        isUnread ? "bg-primary/5 border-primary/20" : "border-border/50"
      )}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isUnread && (
            <Circle className="h-2 w-2 fill-primary text-primary shrink-0" />
          )}
          <InquiryTypeBadge type={inquiry.inquiry_type as InquiryType} />
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isUnread && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(inquiry.id);
              }}
              title="Mark as read"
            >
              <CheckCheck className="h-3 w-3" />
            </Button>
          )}
          {expanded ? (
            <ChevronUp className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {/* Message preview or full message */}
      <div className={cn(
        "mt-2 text-sm",
        !expanded && "line-clamp-2"
      )}>
        {inquiry.message}
      </div>
      
      {/* Expanded metadata */}
      {expanded && Object.keys(metadata).length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
          {metadata.orderVolume && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Package className="h-3 w-3" />
              <span>Order Volume: {metadata.orderVolume}</span>
            </div>
          )}
          {metadata.productType && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ExternalLink className="h-3 w-3" />
              <span>Product: {metadata.productType}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Received: {new Date(inquiry.created_at).toLocaleString()}</span>
          </div>
          {inquiry.source && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ExternalLink className="h-3 w-3" />
              <span>Source: {inquiry.source}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ClientInquiriesPanel = ({ clientId, compact = false }: ClientInquiriesPanelProps) => {
  const { data: inquiries, isLoading } = useClientInquiries(clientId);
  const markRead = useMarkInquiryRead();
  const markAllRead = useMarkAllInquiriesRead();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const unreadCount = inquiries?.filter(i => !i.is_read).length || 0;
  const totalCount = inquiries?.length || 0;
  
  const handleMarkRead = (inquiryId: string) => {
    markRead.mutate({ inquiryId, clientId });
  };
  
  const handleMarkAllRead = () => {
    markAllRead.mutate(clientId);
  };

  if (isLoading) {
    return (
      <Card variant="analytics">
        <CardHeader className="py-2.5 px-3">
          <CardTitle className="text-xs font-medium flex items-center gap-1.5">
            <MessageSquare className="h-3 w-3" />
            Inquiries
          </CardTitle>
        </CardHeader>
        <CardContent className="py-0 pb-3 px-3">
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="analytics">
      <CardHeader className="py-2.5 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium flex items-center gap-1.5">
            <MessageSquare className="h-3 w-3" />
            Inquiries
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[10px] h-4 px-1.5 ml-1">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {totalCount}
            </Badge>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 text-[10px] px-1.5"
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-0 pb-3 px-3">
        {totalCount === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No inquiries yet</p>
            <p className="text-[10px] mt-1">New form submissions will appear here</p>
          </div>
        ) : (
          <ScrollArea className={compact ? "max-h-[200px]" : "max-h-[400px]"}>
            <div className="space-y-2 pr-2">
              {inquiries?.map((inquiry) => (
                <InquiryItem
                  key={inquiry.id}
                  inquiry={inquiry}
                  onMarkRead={handleMarkRead}
                  expanded={expandedId === inquiry.id}
                  onToggle={() => setExpandedId(
                    expandedId === inquiry.id ? null : inquiry.id
                  )}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
