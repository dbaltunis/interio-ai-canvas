import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, Link2, Lock, X, Check, Copy, 
  ExternalLink, LockOpen, Eye, EyeOff, Circle
} from 'lucide-react';
import { useWorkOrderSharing } from '@/hooks/useWorkOrderSharing';
import { useWorkOrderRecipients, ShareRecipient } from '@/hooks/useWorkOrderRecipients';
import { copyToClipboard } from '@/lib/clipboard';
import { formatDistanceToNow } from 'date-fns';

interface ShareWorkOrderButtonProps {
  projectId: string | undefined;
}

type DocumentType = 'work_order' | 'installation' | 'fitting';
type ContentFilter = 'all' | 'client_only';

export const ShareWorkOrderButton: React.FC<ShareWorkOrderButtonProps> = ({ projectId }) => {
  const { 
    isSharing, 
    shareData, 
    generateToken, 
    setWorkOrderPIN, 
    removeWorkOrderPIN,
    revokeAccess,
    getShareData,
    updateShareSettings
  } = useWorkOrderSharing(projectId);

  const {
    recipients,
    activeCount,
    addRecipient,
    removeRecipient
  } = useWorkOrderRecipients(projectId);

  const [documentType, setDocumentType] = useState<DocumentType>('work_order');
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');
  const [showPINDialog, setShowPINDialog] = useState(false);
  const [showViewPINDialog, setShowViewPINDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [showPINValue, setShowPINValue] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isAddingEmail, setIsAddingEmail] = useState(false);

  useEffect(() => {
    if (projectId) {
      getShareData();
    }
  }, [projectId, getShareData]);

  const handleCopyLink = async () => {
    if (shareData?.url) {
      const success = await copyToClipboard(shareData.url);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      return;
    }
    
    const result = await generateToken();
    if (result) {
      const success = await copyToClipboard(result.url);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handlePreview = async () => {
    let url = shareData?.url;
    if (!url) {
      const result = await generateToken();
      url = result?.url;
    }
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleDocumentTypeChange = async (value: DocumentType) => {
    setDocumentType(value);
    await updateShareSettings({ documentType: value, contentFilter });
  };

  const handleContentFilterChange = async (value: ContentFilter) => {
    setContentFilter(value);
    await updateShareSettings({ documentType, contentFilter: value });
  };

  const handleSetPIN = async () => {
    if (pin.length === 4) {
      const success = await setWorkOrderPIN(pin);
      if (success) {
        setShowPINDialog(false);
        setPin('');
        getShareData();
      }
    }
  };

  const handleRemovePIN = async () => {
    const success = await removeWorkOrderPIN();
    if (success) {
      setShowViewPINDialog(false);
    }
  };

  const handleCopyPIN = async (pinValue: string) => {
    const success = await copyToClipboard(pinValue);
    if (success) {
      setPinCopied(true);
      setTimeout(() => setPinCopied(false), 2000);
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) return;
    
    setIsAddingEmail(true);
    
    // Ensure share link exists first
    if (!shareData) {
      await generateToken();
    }
    
    const success = await addRecipient({
      name: newEmail.split('@')[0],
      email: newEmail.trim()
    });
    
    if (success) {
      setNewEmail('');
    }
    setIsAddingEmail(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const isShared = !!shareData;
  const hasPIN = !!shareData?.pin;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={isShared ? "default" : "outline"} 
            size="sm" 
            className="gap-2"
            disabled={!projectId || isSharing}
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isSharing ? 'Sharing...' : isShared ? 'Shared' : 'Share'}
            </span>
            {hasPIN && <Lock className="h-3 w-3" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 bg-background z-50 p-0">
          {/* Share Section */}
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Share</span>
              {hasPIN && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Lock className="h-3 w-3" />
                  Protected
                </Badge>
              )}
            </div>
            
            {/* Document Type Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Document</Label>
              <Select value={documentType} onValueChange={(v) => handleDocumentTypeChange(v as DocumentType)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work_order">Work Order</SelectItem>
                  <SelectItem value="installation">Installation Instructions</SelectItem>
                  <SelectItem value="fitting">Fitting Instructions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Content Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Include</Label>
              <Select value={contentFilter} onValueChange={(v) => handleContentFilterChange(v as ContentFilter)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All content</SelectItem>
                  <SelectItem value="client_only">Client details only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Copy Link + Preview Row */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-2"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" />
                    Copy Link
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePreview}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </div>
          
          <DropdownMenuSeparator className="my-0" />
          
          {/* People with Access Section */}
          <div className="p-3 space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              People with access
            </Label>
            
            {/* Recipients List */}
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {recipients.filter(r => r.is_active).map((recipient) => (
                <RecipientRow 
                  key={recipient.id} 
                  recipient={recipient} 
                  onRemove={removeRecipient}
                />
              ))}
              
              {activeCount === 0 && (
                <p className="text-xs text-muted-foreground py-2">
                  No one has been added yet
                </p>
              )}
            </div>
            
            {/* Add Email Input */}
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Add email..."
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm"
                disabled={isAddingEmail}
              />
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleAddEmail}
                disabled={!newEmail.includes('@') || isAddingEmail}
                className="h-8"
              >
                Add
              </Button>
            </div>
          </div>
          
          <DropdownMenuSeparator className="my-0" />
          
          {/* PIN & Revoke Section */}
          <div className="p-2">
            {hasPIN ? (
              <DropdownMenuItem onClick={() => setShowViewPINDialog(true)} className="gap-2">
                <Eye className="h-4 w-4" />
                <span>View PIN: ****</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setShowPINDialog(true)} className="gap-2">
                <Lock className="h-4 w-4" />
                <span>Add PIN Protection</span>
              </DropdownMenuItem>
            )}
            
            {isShared && (
              <DropdownMenuItem 
                onClick={revokeAccess} 
                className="gap-2 text-destructive focus:text-destructive"
              >
                <X className="h-4 w-4" />
                <span>Revoke Access</span>
              </DropdownMenuItem>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Set PIN Dialog */}
      <Dialog open={showPINDialog} onOpenChange={setShowPINDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Set PIN Protection</DialogTitle>
            <DialogDescription>
              Add a 4-digit PIN to protect this work order.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="pin">4-Digit PIN</Label>
            <Input
              id="pin"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="0000"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="text-center text-2xl tracking-[0.5em] mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPINDialog(false);
              setPin('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSetPIN}
              disabled={pin.length !== 4}
            >
              Set PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Manage PIN Dialog */}
      <Dialog open={showViewPINDialog} onOpenChange={setShowViewPINDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>PIN Protection</DialogTitle>
            <DialogDescription>
              This work order is protected with a PIN.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl font-mono font-bold tracking-[0.3em] bg-muted px-6 py-3 rounded-lg">
                {showPINValue ? shareData?.pin : '****'}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPINValue(!showPINValue)}
              >
                {showPINValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {showPINValue && shareData?.pin && (
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2"
                onClick={() => handleCopyPIN(shareData.pin!)}
              >
                {pinCopied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    PIN Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy PIN
                  </>
                )}
              </Button>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowViewPINDialog(false);
                setShowPINDialog(true);
              }}
              className="gap-2"
            >
              <Lock className="h-4 w-4" />
              Change PIN
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemovePIN}
              className="gap-2"
            >
              <LockOpen className="h-4 w-4" />
              Remove PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Inline recipient row component
interface RecipientRowProps {
  recipient: ShareRecipient;
  onRemove: (id: string) => Promise<boolean>;
}

const RecipientRow: React.FC<RecipientRowProps> = ({ recipient, onRemove }) => {
  const hasViewed = recipient.access_count > 0;
  const [isRemoving, setIsRemoving] = useState(false);
  
  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove(recipient.id);
    setIsRemoving(false);
  };
  
  return (
    <div className="flex items-center gap-2 py-1 group">
      <Circle 
        className={`h-2 w-2 flex-shrink-0 ${hasViewed ? 'fill-green-500 text-green-500' : 'fill-muted-foreground/30 text-muted-foreground/30'}`} 
      />
      <span className="text-sm flex-1 truncate">
        {recipient.recipient_email || recipient.recipient_name}
      </span>
      {hasViewed && recipient.last_accessed_at && (
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(recipient.last_accessed_at), { addSuffix: false })}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleRemove}
        disabled={isRemoving}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
