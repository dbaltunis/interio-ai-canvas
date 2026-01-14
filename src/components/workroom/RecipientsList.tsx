import React from 'react';
import { 
  Eye, Clock, Mail, Phone, User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ShareRecipient } from '@/hooks/useWorkOrderRecipients';

interface RecipientsListProps {
  recipients: ShareRecipient[];
  isLoading: boolean;
  onAddRecipient?: (recipient: {
    name: string;
    email?: string;
    phone?: string;
    permission?: string;
  }) => Promise<boolean>;
  onRemoveRecipient?: (recipientId: string) => Promise<boolean>;
}

export const RecipientsList: React.FC<RecipientsListProps> = ({
  recipients,
  isLoading,
}) => {
  // Show all recipients who have accessed (have last_accessed_at), sorted by most recent
  const activeRecipients = recipients
    .filter(r => r.is_active || r.last_accessed_at) // Include viewer-created sessions even if is_active=false
    .sort((a, b) => {
      const aTime = a.last_accessed_at ? new Date(a.last_accessed_at).getTime() : 0;
      const bTime = b.last_accessed_at ? new Date(b.last_accessed_at).getTime() : 0;
      return bTime - aTime;
    });

  const isRecentlyViewed = (lastAccessed: string | null | undefined): boolean => {
    if (!lastAccessed) return false;
    const hoursSinceAccess = (Date.now() - new Date(lastAccessed).getTime()) / (1000 * 60 * 60);
    return hoursSinceAccess < 24;
  };

  const isCurrentlyActive = (lastAccessed: string | null | undefined): boolean => {
    if (!lastAccessed) return false;
    const minutesSinceAccess = (Date.now() - new Date(lastAccessed).getTime()) / (1000 * 60);
    return minutesSinceAccess < 5; // Active in last 5 minutes
  };

  if (isLoading) {
    return (
      <div className="border-t border-border">
        <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5 animate-pulse" />
          Loading viewers...
        </div>
      </div>
    );
  }

  if (activeRecipients.length === 0) {
    return (
      <div className="border-t border-border">
        <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          No one has viewed this yet
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 pb-2 text-xs font-medium text-muted-foreground">
        <Eye className="h-3.5 w-3.5" />
        Recent Viewers ({activeRecipients.length})
      </div>

      {/* Viewers List */}
      <div className="px-3 pb-3 space-y-1.5 max-h-40 overflow-y-auto">
        {activeRecipients.map((recipient) => (
          <div
            key={recipient.id}
            className="flex items-center gap-2 p-1.5 rounded bg-muted/30"
          >
            {/* View status dot */}
            <span
              className={`h-2 w-2 rounded-full flex-shrink-0 ${
                isCurrentlyActive(recipient.last_accessed_at)
                  ? 'bg-green-500 animate-pulse'
                  : isRecentlyViewed(recipient.last_accessed_at)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
              }`}
              title={
                isCurrentlyActive(recipient.last_accessed_at)
                  ? 'Currently viewing'
                  : recipient.last_accessed_at
                    ? `Last viewed ${formatDistanceToNow(new Date(recipient.last_accessed_at), { addSuffix: true })}`
                    : 'Not yet viewed'
              }
            />

            {/* Name & contact info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">
                {recipient.recipient_name}
              </div>
              {(recipient.recipient_email || recipient.recipient_phone) && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {recipient.recipient_email && (
                    <span className="flex items-center gap-0.5 truncate">
                      <Mail className="h-2.5 w-2.5" />
                      {recipient.recipient_email}
                    </span>
                  )}
                  {recipient.recipient_phone && (
                    <span className="flex items-center gap-0.5">
                      <Phone className="h-2.5 w-2.5" />
                      {recipient.recipient_phone}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Last accessed time */}
            {recipient.last_accessed_at && (
              <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(recipient.last_accessed_at), { addSuffix: true })}
              </div>
            )}

            {/* View count */}
            {(recipient.access_count || 0) > 1 && (
              <div className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Eye className="h-2.5 w-2.5" />
                {recipient.access_count}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
