import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { Separator } from '@/components/ui/separator';
import { 
  Share2, Link2, Lock, X, Check, Copy, 
  ExternalLink, LockOpen, Eye, EyeOff, Circle,
  FileText, Wrench, Ruler
} from 'lucide-react';
import { useWorkOrderSharing } from '@/hooks/useWorkOrderSharing';
import { useWorkOrderRecipients, ShareRecipient } from '@/hooks/useWorkOrderRecipients';
import { copyToClipboard } from '@/lib/clipboard';
import { formatDistanceToNow } from 'date-fns';

interface ShareWorkOrderButtonProps {
  projectId: string | undefined;
}

type DocumentType = 'work_order' | 'installation' | 'fitting';
type ContentFilter = 'all' | 'field_ready' | 'specs_only';

const DOCUMENT_OPTIONS = [
  { value: 'work_order', label: 'Work Order', icon: FileText },
  { value: 'installation', label: 'Installation', icon: Wrench },
  { value: 'fitting', label: 'Fitting', icon: Ruler },
] as const;

const CONTENT_OPTIONS = [
  { 
    value: 'all', 
    label: 'All content', 
    description: 'Full details with pricing'
  },
  { 
    value: 'field_ready', 
    label: 'Field-ready', 
    description: 'Address, phone, specs'
  },
  { 
    value: 'specs_only', 
    label: 'Specs only', 
    description: 'Measurements & treatments'
  },
] as const;

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
  const [contentFilter, setContentFilter] = useState<ContentFilter>('field_ready');
  const [showPINDialog, setShowPINDialog] = useState(false);
  const [showViewPINDialog, setShowViewPINDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [showPINValue, setShowPINValue] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  const selectedDocOption = DOCUMENT_OPTIONS.find(o => o.value === documentType);
  const selectedContentOption = CONTENT_OPTIONS.find(o => o.value === contentFilter);

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
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
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Share</span>
              {hasPIN && (
                <Badge variant="secondary" className="text-xs gap-1 h-5">
                  <Lock className="h-3 w-3" />
                  PIN
                </Badge>
              )}
            </div>
          </div>
          
          {/* Settings */}
          <div className="p-4 space-y-4">
            {/* Document Type */}
            <div className="grid grid-cols-3 gap-1.5">
              {DOCUMENT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = documentType === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleDocumentTypeChange(option.value as DocumentType)}
                    className={`
                      flex flex-col items-center gap-1.5 p-2.5 rounded-lg border text-xs font-medium transition-all
                      ${isSelected 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50 text-muted-foreground'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Include</Label>
              <Select value={contentFilter} onValueChange={(v) => handleContentFilterChange(v as ContentFilter)}>
                <SelectTrigger className="h-9">
                  <SelectValue>
                    <div className="flex flex-col items-start">
                      <span className="text-sm">{selectedContentOption?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-9"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="h-9"
                onClick={handlePreview}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* People with Access */}
          <div className="p-4 space-y-3">
            <Label className="text-xs text-muted-foreground">People with access</Label>
            
            {/* Recipients List */}
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {recipients.filter(r => r.is_active).map((recipient) => (
                <RecipientRow 
                  key={recipient.id} 
                  recipient={recipient} 
                  onRemove={removeRecipient}
                />
              ))}
              
              {activeCount === 0 && (
                <p className="text-xs text-muted-foreground py-1">
                  Anyone with the link can access
                </p>
              )}
            </div>
            
            {/* Add Email */}
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
                className="h-8 px-3"
              >
                Add
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Footer Actions */}
          <div className="p-2 flex gap-1">
            {hasPIN ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 justify-start h-8 text-xs"
                onClick={() => {
                  setIsOpen(false);
                  setShowViewPINDialog(true);
                }}
              >
                <Eye className="h-3.5 w-3.5 mr-2" />
                View PIN
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 justify-start h-8 text-xs"
                onClick={() => {
                  setIsOpen(false);
                  setShowPINDialog(true);
                }}
              >
                <Lock className="h-3.5 w-3.5 mr-2" />
                Add PIN
              </Button>
            )}
            
            {isShared && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 justify-start h-8 text-xs text-destructive hover:text-destructive"
                onClick={() => {
                  revokeAccess();
                  setIsOpen(false);
                }}
              >
                <X className="h-3.5 w-3.5 mr-2" />
                Revoke
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

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
