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
import { Input } from '@/components/ui/input';
import { 
  Share2, Link2, Lock, Check, Eye, EyeOff
} from 'lucide-react';
import { useWorkOrderSharing, getAvailableTreatments } from '@/hooks/useWorkOrderSharing';
import { useWorkOrderRecipients } from '@/hooks/useWorkOrderRecipients';
import { copyToClipboard } from '@/lib/clipboard';
import { RecipientsList } from './RecipientsList';
import { 
  ShareSettingsSection, 
  WORKSHOP_PRESETS,
  type DocumentType, 
  type ContentFilter,
  type TreatmentFilter 
} from './ShareSettingsSection';

interface ShareWorkOrderButtonProps {
  projectId: string | undefined;
}

export const ShareWorkOrderButton: React.FC<ShareWorkOrderButtonProps> = ({ projectId }) => {
  const { 
    isSharing, 
    shareData, 
    generateToken, 
    setWorkOrderPIN, 
    removeWorkOrderPIN,
    revokeAccess,
    getShareData,
    updateShareSettings,
  } = useWorkOrderSharing(projectId);

  const {
    recipients,
    isLoading: recipientsLoading,
    addRecipient,
    removeRecipient,
  } = useWorkOrderRecipients(projectId);

  // Share settings state
  const [documentType, setDocumentType] = useState<DocumentType>('work_order');
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');
  const [treatmentFilter, setTreatmentFilter] = useState<TreatmentFilter>('all');
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [availableTreatments, setAvailableTreatments] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Dialog states
  const [showPINDialog, setShowPINDialog] = useState(false);
  const [showViewPINDialog, setShowViewPINDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [showPINValue, setShowPINValue] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load share data and available treatments
  useEffect(() => {
    if (projectId) {
      getShareData();
      loadAvailableTreatments();
    }
  }, [projectId, getShareData]);

  const loadAvailableTreatments = async () => {
    if (!projectId) return;
    const treatments = await getAvailableTreatments(projectId);
    setAvailableTreatments(treatments);
  };

  const handleDocumentTypeChange = async (type: DocumentType) => {
    setDocumentType(type);
    setActivePreset(null);
    await updateShareSettings({ documentType: type });
  };

  const handleContentFilterChange = async (filter: ContentFilter) => {
    setContentFilter(filter);
    setActivePreset(null);
    await updateShareSettings({ contentFilter: filter });
  };

  const handleTreatmentFilterChange = async (filter: TreatmentFilter, selected: string[]) => {
    setTreatmentFilter(filter);
    setSelectedTreatments(selected);
    setActivePreset(null);
    
    // Build treatment types array for saving
    let treatmentTypes: string[] = [];
    if (filter === 'all') {
      treatmentTypes = []; // Empty means all
    } else if (filter === 'custom') {
      treatmentTypes = selected;
    } else {
      treatmentTypes = [filter];
    }
    
    await updateShareSettings({ treatmentTypes });
  };

  const handlePresetApply = async (presetKey: string) => {
    const preset = WORKSHOP_PRESETS[presetKey as keyof typeof WORKSHOP_PRESETS];
    if (!preset) return;

    setActivePreset(presetKey);
    setDocumentType(preset.documentType);
    setContentFilter(preset.contentFilter);
    setTreatmentFilter(preset.treatmentFilter);
    setSelectedTreatments(preset.selectedTreatments);

    // Save all settings
    await updateShareSettings({
      documentType: preset.documentType,
      contentFilter: preset.contentFilter,
      treatmentTypes: preset.treatmentFilter === 'all' ? [] : preset.selectedTreatments,
    });
  };

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

  const handleAddRecipient = async (recipient: {
    name: string;
    email?: string;
    phone?: string;
    permission?: string;
  }): Promise<boolean> => {
    return addRecipient({
      name: recipient.name,
      email: recipient.email,
      phone: recipient.phone,
      notes: recipient.permission ? `Permission: ${recipient.permission}` : undefined,
    });
  };

  const isShared = !!shareData;
  const hasPIN = !!shareData?.pin;
  const activeRecipientsCount = recipients.filter(r => r.is_active).length;

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
            {activeRecipientsCount > 0 && (
              <span className="ml-1 bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.5 rounded text-xs">
                {activeRecipientsCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
          {/* Share Settings - Presets, Treatment Filter, Document Type, Content Filter */}
          <ShareSettingsSection
            documentType={documentType}
            contentFilter={contentFilter}
            treatmentFilter={treatmentFilter}
            selectedTreatments={selectedTreatments}
            availableTreatments={availableTreatments}
            activePreset={activePreset}
            onDocumentTypeChange={handleDocumentTypeChange}
            onContentFilterChange={handleContentFilterChange}
            onTreatmentFilterChange={handleTreatmentFilterChange}
            onPresetApply={handlePresetApply}
          />

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
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Recipients List */}
          <RecipientsList
            recipients={recipients}
            isLoading={recipientsLoading}
            onAddRecipient={handleAddRecipient}
            onRemoveRecipient={removeRecipient}
          />

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
