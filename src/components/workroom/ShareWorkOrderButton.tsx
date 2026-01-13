import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, Link2, QrCode, Lock, X, ChevronDown, Check, Copy, 
  ExternalLink, LockOpen, Eye, EyeOff, Users, UserPlus 
} from 'lucide-react';
import { useWorkOrderSharing } from '@/hooks/useWorkOrderSharing';
import { useWorkOrderRecipients } from '@/hooks/useWorkOrderRecipients';
import { QRCodeSVG } from 'qrcode.react';
import { copyToClipboard } from '@/lib/clipboard';
import { SharePreviewInfo } from './SharePreviewInfo';
import { AddRecipientDialog } from './AddRecipientDialog';
import { SharedRecipientsDialog } from './SharedRecipientsDialog';

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
    getShareData 
  } = useWorkOrderSharing(projectId);

  const {
    recipients,
    activeCount,
    isLoading: isLoadingRecipients,
    addRecipient,
    removeRecipient
  } = useWorkOrderRecipients(projectId);

  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showPINDialog, setShowPINDialog] = useState(false);
  const [showPINSuccessDialog, setShowPINSuccessDialog] = useState(false);
  const [showViewPINDialog, setShowViewPINDialog] = useState(false);
  const [showAddRecipientDialog, setShowAddRecipientDialog] = useState(false);
  const [showRecipientsDialog, setShowRecipientsDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [savedPIN, setSavedPIN] = useState<string | null>(null);
  const [showPINValue, setShowPINValue] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  // Check for existing share data on mount
  useEffect(() => {
    if (projectId) {
      getShareData();
    }
  }, [projectId, getShareData]);

  const handleCopyLink = async () => {
    // If we already have share data, copy immediately (no async before clipboard!)
    if (shareData?.url) {
      const success = await copyToClipboard(shareData.url);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      return;
    }
    
    // Otherwise, generate first then show QR dialog for manual copy
    const result = await generateToken();
    if (result) {
      setQrUrl(result.url);
      setShowQRDialog(true);
    }
  };

  const handleShowQR = async () => {
    const result = await generateToken();
    if (result) {
      setQrUrl(result.url);
      setShowQRDialog(true);
    }
  };

  const handleSetPIN = async () => {
    if (pin.length === 4) {
      const success = await setWorkOrderPIN(pin);
      if (success) {
        setSavedPIN(pin);
        setShowPINDialog(false);
        setShowPINSuccessDialog(true);
        setPin('');
        // Refresh share data to get updated PIN
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

  const handleRevokeAccess = async () => {
    await revokeAccess();
  };

  const handlePreview = () => {
    if (shareData?.url) {
      window.open(shareData.url, '_blank');
    }
  };

  const handleAddRecipient = async (recipient: {
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
  }) => {
    // Ensure token exists first
    if (!shareData) {
      await generateToken();
    }
    return addRecipient(recipient);
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
            {activeCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {activeCount}
              </Badge>
            )}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 bg-background z-50">
          <DropdownMenuLabel className="flex items-center gap-2">
            Share Work Order
            {hasPIN && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Lock className="h-3 w-3" />
                Protected
              </Badge>
            )}
          </DropdownMenuLabel>
          
          {/* Preview Info - shows what's included */}
          <div className="px-2 py-2">
            <SharePreviewInfo 
              shareUrl={shareData?.url} 
              onPreview={handlePreview}
            />
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span>Link Copied!</span>
              </>
            ) : shareData ? (
              <>
                <Link2 className="h-4 w-4" />
                <span>Copy Link</span>
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                <span>Generate & Copy Link</span>
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleShowQR} className="gap-2">
            <QrCode className="h-4 w-4" />
            <span>Show QR Code</span>
          </DropdownMenuItem>

          {isShared && (
            <>
              <DropdownMenuSeparator />
              
              {/* Recipients section */}
              <DropdownMenuItem 
                onClick={() => setShowRecipientsDialog(true)} 
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                <span>Shared With</span>
                {activeCount > 0 && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    {activeCount}
                  </Badge>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => setShowAddRecipientDialog(true)} 
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Recipient</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
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
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleRevokeAccess} 
                className="gap-2 text-destructive focus:text-destructive"
              >
                <X className="h-4 w-4" />
                <span>Revoke Access</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Work Order</DialogTitle>
            <DialogDescription>
              Scan this QR code to open the work order on a mobile device.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4 py-4">
            {qrUrl && (
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG 
                  value={qrUrl} 
                  size={200}
                  level="M"
                  includeMargin
                />
              </div>
            )}
            
            {qrUrl && (
              <div className="w-full space-y-2">
                <Label className="text-sm text-muted-foreground">Or copy link:</Label>
                <div className="flex gap-2">
                  <Input 
                    value={qrUrl} 
                    readOnly 
                    className="text-xs"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={async () => {
                      const success = await copyToClipboard(qrUrl);
                      if (success) {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowQRDialog(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (qrUrl) window.open(qrUrl, '_blank');
              }}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set PIN Dialog */}
      <Dialog open={showPINDialog} onOpenChange={setShowPINDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Set PIN Protection</DialogTitle>
            <DialogDescription>
              Add a 4-digit PIN to protect this work order from unauthorized access.
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

      {/* PIN Success Dialog - Shows PIN after setting */}
      <Dialog open={showPINSuccessDialog} onOpenChange={setShowPINSuccessDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              PIN Set Successfully
            </DialogTitle>
            <DialogDescription>
              Share this PIN with the installer so they can access the work order.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 flex flex-col items-center gap-4">
            <div className="text-4xl font-mono font-bold tracking-[0.3em] bg-muted px-6 py-3 rounded-lg">
              {savedPIN}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
              onClick={() => savedPIN && handleCopyPIN(savedPIN)}
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
          </div>

          <DialogFooter>
            <Button onClick={() => setShowPINSuccessDialog(false)}>
              Done
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

      {/* Add Recipient Dialog */}
      <AddRecipientDialog
        open={showAddRecipientDialog}
        onOpenChange={setShowAddRecipientDialog}
        onAdd={handleAddRecipient}
        shareUrl={shareData?.url}
        pin={shareData?.pin}
      />

      {/* Shared Recipients Dialog */}
      <SharedRecipientsDialog
        open={showRecipientsDialog}
        onOpenChange={setShowRecipientsDialog}
        recipients={recipients}
        onRemove={removeRecipient}
        onAddRecipient={() => {
          setShowRecipientsDialog(false);
          setShowAddRecipientDialog(true);
        }}
        isLoading={isLoadingRecipients}
      />
    </>
  );
};
