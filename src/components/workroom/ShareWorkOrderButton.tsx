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
import { 
  Share2, Link2, Lock, X, Check, Eye, EyeOff, Circle
} from 'lucide-react';
import { useWorkOrderSharing } from '@/hooks/useWorkOrderSharing';
import { useWorkOrderRecipients, ShareRecipient } from '@/hooks/useWorkOrderRecipients';
import { copyToClipboard } from '@/lib/clipboard';
import { formatDistanceToNow } from 'date-fns';
import { showSuccessToast } from '@/components/ui/use-toast';

interface ShareWorkOrderButtonProps {
  projectId: string | undefined;
}

type DocumentType = 'work_order' | 'installation' | 'fitting';

const DOC_LABELS: Record<DocumentType, string> = {
  work_order: 'Work Order',
  installation: 'Installation',
  fitting: 'Fitting',
};

export const ShareWorkOrderButton: React.FC<ShareWorkOrderButtonProps> = ({ projectId }) => {
  const { 
    isSharing, 
    shareData, 
    generateToken, 
    setWorkOrderPIN, 
    removeWorkOrderPIN,
    revokeAccess,
    getShareData,
  } = useWorkOrderSharing(projectId);

  const {
    recipients,
    addRecipient,
    removeRecipient
  } = useWorkOrderRecipients(projectId);

  const [documentType, setDocumentType] = useState<DocumentType>('work_order');
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
      showSuccessToast('Email added for tracking', 'Now send them the link!', 'normal');
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
  const activeRecipients = recipients.filter(r => r.is_active);

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
        <PopoverContent align="end" className="w-72 p-0" sideOffset={8}>
          {/* Header with dropdown */}
          <div className="p-3 border-b border-border">
            <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
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

          {/* Main Actions */}
          <div className="p-3 flex gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-1.5" />
                  Copy Link
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePreview}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Tracking Section */}
          <div className="px-3 pb-3">
            <p className="text-[10px] text-muted-foreground mb-2">
              Track who viewed (you send the link):
            </p>
            <div className="flex gap-1.5 mb-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-7 text-xs"
                disabled={isAddingEmail}
              />
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleAddEmail}
                disabled={!newEmail.includes('@') || isAddingEmail}
                className="h-7 px-2 text-xs"
              >
                Add
              </Button>
            </div>

            {/* Recipients List */}
            {activeRecipients.length > 0 && (
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {activeRecipients.map((recipient) => (
                  <RecipientRow 
                    key={recipient.id} 
                    recipient={recipient} 
                    onRemove={removeRecipient}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs border-t border-border px-3 py-2 bg-muted/30">
            {hasPIN ? (
              <button 
                onClick={() => { setIsOpen(false); setShowViewPINDialog(true); }}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Lock className="h-3 w-3" /> Protected
              </button>
            ) : (
              <button 
                onClick={() => { setIsOpen(false); setShowPINDialog(true); }}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Lock className="h-3 w-3" /> Add PIN
              </button>
            )}
            
            {isShared && (
              <button 
                onClick={() => { revokeAccess(); setIsOpen(false); }}
                className="text-destructive hover:text-destructive/80"
              >
                Revoke Access
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Set PIN Dialog */}
      <Dialog open={showPINDialog} onOpenChange={setShowPINDialog}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Set PIN</DialogTitle>
            <DialogDescription>
              4-digit PIN to protect access
            </DialogDescription>
          </DialogHeader>
          
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="0000"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="text-center text-2xl tracking-[0.5em]"
          />

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowPINDialog(false); setPin(''); }}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSetPIN} disabled={pin.length !== 4}>
              Set PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View PIN Dialog */}
      <Dialog open={showViewPINDialog} onOpenChange={setShowViewPINDialog}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>PIN Protection</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="text-3xl font-mono font-bold tracking-[0.3em] bg-muted px-4 py-2 rounded">
              {showPINValue ? shareData?.pin : '••••'}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowPINValue(!showPINValue)}>
              {showPINValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          
          {showPINValue && shareData?.pin && (
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={() => handleCopyPIN(shareData.pin!)}
            >
              {pinCopied ? 'Copied!' : 'Copy PIN'}
            </Button>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => { setShowViewPINDialog(false); setShowPINDialog(true); }}>
              Change
            </Button>
            <Button variant="destructive" size="sm" onClick={handleRemovePIN}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Recipient row
const RecipientRow: React.FC<{
  recipient: ShareRecipient;
  onRemove: (id: string) => Promise<boolean>;
}> = ({ recipient, onRemove }) => {
  const hasViewed = recipient.access_count > 0;
  
  return (
    <div className="flex items-center gap-2 group">
      <Circle className={`h-2 w-2 ${hasViewed ? 'fill-green-500 text-green-500' : 'fill-muted text-muted'}`} />
      <span className="text-xs flex-1 truncate">
        {recipient.recipient_email || recipient.recipient_name}
      </span>
      <button
        onClick={() => onRemove(recipient.id)}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};
