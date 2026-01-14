import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, UserPlus, Eye, EyeOff, Trash2, 
  Clock, Mail, Phone, Check, X 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ShareRecipient } from '@/hooks/useWorkOrderRecipients';

interface RecipientsListProps {
  recipients: ShareRecipient[];
  isLoading: boolean;
  onAddRecipient: (recipient: {
    name: string;
    email?: string;
    phone?: string;
    permission?: string;
  }) => Promise<boolean>;
  onRemoveRecipient: (recipientId: string) => Promise<boolean>;
}

export const RecipientsList: React.FC<RecipientsListProps> = ({
  recipients,
  isLoading,
  onAddRecipient,
  onRemoveRecipient,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecipient, setNewRecipient] = useState({
    name: '',
    email: '',
    phone: '',
    permission: 'view' as 'view' | 'edit',
  });
  const [isAdding, setIsAdding] = useState(false);

  // Only show active recipients
  const activeRecipients = recipients.filter(r => r.is_active);

  const isRecentlyViewed = (lastAccessed: string | null | undefined): boolean => {
    if (!lastAccessed) return false;
    const hoursSinceAccess = (Date.now() - new Date(lastAccessed).getTime()) / (1000 * 60 * 60);
    return hoursSinceAccess < 24;
  };

  const handleAddRecipient = async () => {
    if (!newRecipient.name.trim()) return;
    
    setIsAdding(true);
    const success = await onAddRecipient({
      name: newRecipient.name,
      email: newRecipient.email || undefined,
      phone: newRecipient.phone || undefined,
      permission: newRecipient.permission,
    });
    
    if (success) {
      setNewRecipient({ name: '', email: '', phone: '', permission: 'view' });
      setShowAddForm(false);
    }
    setIsAdding(false);
  };

  const handleRemove = async (recipientId: string) => {
    await onRemoveRecipient(recipientId);
  };

  return (
    <div className="border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-3 pb-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          Shared With ({activeRecipients.length})
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <UserPlus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="px-3 pb-3 space-y-2">
          <Input
            placeholder="Name *"
            value={newRecipient.name}
            onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
            className="h-8 text-xs"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Email"
              type="email"
              value={newRecipient.email}
              onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
              className="h-8 text-xs flex-1"
            />
            <Select 
              value={newRecipient.permission} 
              onValueChange={(v) => setNewRecipient(prev => ({ ...prev, permission: v as 'view' | 'edit' }))}
            >
              <SelectTrigger className="h-8 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> View
                  </span>
                </SelectItem>
                <SelectItem value="edit">
                  <span className="flex items-center gap-1">
                    <EyeOff className="h-3 w-3" /> Edit
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-7 flex-1 text-xs"
              onClick={handleAddRecipient}
              disabled={!newRecipient.name.trim() || isAdding}
            >
              {isAdding ? 'Adding...' : 'Add Recipient'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => setShowAddForm(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Recipients List */}
      {isLoading ? (
        <div className="px-3 pb-3 text-xs text-muted-foreground">Loading...</div>
      ) : activeRecipients.length === 0 ? (
        <div className="px-3 pb-3 text-xs text-muted-foreground">
          No recipients added yet
        </div>
      ) : (
        <div className="px-3 pb-3 space-y-1.5 max-h-40 overflow-y-auto">
          {activeRecipients.map((recipient) => (
            <div
              key={recipient.id}
              className="flex items-center gap-2 p-1.5 rounded bg-muted/30 hover:bg-muted/50 group"
            >
              {/* View status dot */}
              <span
                className={`h-2 w-2 rounded-full flex-shrink-0 ${
                  isRecentlyViewed(recipient.last_accessed_at)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
                title={
                  recipient.last_accessed_at
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

              {/* View count */}
              <div className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Eye className="h-2.5 w-2.5" />
                {recipient.access_count || 0}
              </div>

              {/* Remove button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                onClick={() => handleRemove(recipient.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
