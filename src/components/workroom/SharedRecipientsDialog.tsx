import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  User, 
  Mail, 
  Phone, 
  Clock, 
  Eye, 
  Trash2, 
  UserPlus,
  CheckCircle,
  XCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface ShareRecipient {
  id: string;
  recipient_name: string;
  recipient_email?: string | null;
  recipient_phone?: string | null;
  shared_at: string;
  last_accessed_at?: string | null;
  access_count: number;
  is_active: boolean;
  notes?: string | null;
}

interface SharedRecipientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: ShareRecipient[];
  onRemove: (id: string) => Promise<boolean>;
  onAddRecipient: () => void;
  isLoading?: boolean;
}

export const SharedRecipientsDialog: React.FC<SharedRecipientsDialogProps> = ({
  open,
  onOpenChange,
  recipients,
  onRemove,
  onAddRecipient,
  isLoading = false
}) => {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    await onRemove(id);
    setRemovingId(null);
  };

  const activeRecipients = recipients.filter(r => r.is_active);
  const inactiveRecipients = recipients.filter(r => !r.is_active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Shared With ({activeRecipients.length})
          </DialogTitle>
          <DialogDescription>
            People who have access to this work order.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading recipients...
            </div>
          ) : recipients.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No recipients yet</p>
              <p className="text-sm mt-1">Add someone to track who has access.</p>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              {activeRecipients.map((recipient) => (
                <RecipientCard 
                  key={recipient.id}
                  recipient={recipient}
                  onRemove={handleRemove}
                  isRemoving={removingId === recipient.id}
                />
              ))}
              
              {inactiveRecipients.length > 0 && (
                <>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider pt-4 pb-2 border-t">
                    Removed Recipients
                  </div>
                  {inactiveRecipients.map((recipient) => (
                    <RecipientCard 
                      key={recipient.id}
                      recipient={recipient}
                      onRemove={handleRemove}
                      isRemoving={removingId === recipient.id}
                      isInactive
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onAddRecipient} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Recipient
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface RecipientCardProps {
  recipient: ShareRecipient;
  onRemove: (id: string) => void;
  isRemoving: boolean;
  isInactive?: boolean;
}

const RecipientCard: React.FC<RecipientCardProps> = ({
  recipient,
  onRemove,
  isRemoving,
  isInactive = false
}) => {
  const hasAccessed = recipient.access_count > 0;
  
  return (
    <div className={`p-3 rounded-lg border ${isInactive ? 'opacity-50 bg-muted/30' : 'bg-card'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium truncate">{recipient.recipient_name}</span>
            {hasAccessed ? (
              <Badge variant="secondary" className="text-xs gap-1 flex-shrink-0">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Viewed
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs gap-1 flex-shrink-0">
                <XCircle className="h-3 w-3 text-muted-foreground" />
                Not viewed
              </Badge>
            )}
          </div>
          
          <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
            {recipient.recipient_email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span className="truncate">{recipient.recipient_email}</span>
              </div>
            )}
            {recipient.recipient_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span>{recipient.recipient_phone}</span>
              </div>
            )}
          </div>
          
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Shared {formatDistanceToNow(new Date(recipient.shared_at), { addSuffix: true })}
            </div>
            {hasAccessed && recipient.last_accessed_at && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Last viewed {formatDistanceToNow(new Date(recipient.last_accessed_at), { addSuffix: true })}
                {recipient.access_count > 1 && ` (${recipient.access_count}×)`}
              </div>
            )}
          </div>
          
          {recipient.notes && (
            <p className="mt-2 text-xs text-muted-foreground italic">
              {recipient.notes}
            </p>
          )}
        </div>
        
        {!isInactive && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(recipient.id)}
            disabled={isRemoving}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
