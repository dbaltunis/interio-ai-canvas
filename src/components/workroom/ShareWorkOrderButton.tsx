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
import { Share2, Link2, QrCode, Lock, X, ChevronDown, Check, Copy, ExternalLink } from 'lucide-react';
import { useWorkOrderSharing } from '@/hooks/useWorkOrderSharing';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';

interface ShareWorkOrderButtonProps {
  projectId: string | undefined;
}

export const ShareWorkOrderButton: React.FC<ShareWorkOrderButtonProps> = ({ projectId }) => {
  const { 
    isSharing, 
    shareData, 
    copyShareLink, 
    generateToken, 
    setWorkOrderPIN, 
    revokeAccess,
    getShareData 
  } = useWorkOrderSharing(projectId);

  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showPINDialog, setShowPINDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  // Check for existing share data on mount
  useEffect(() => {
    if (projectId) {
      getShareData();
    }
  }, [projectId, getShareData]);

  const handleCopyLink = async () => {
    const success = await copyShareLink();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        setShowPINDialog(false);
        setPin('');
      }
    }
  };

  const handleRevokeAccess = async () => {
    await revokeAccess();
  };

  const isShared = !!shareData;

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
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background z-50">
          <DropdownMenuLabel>Share Work Order</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                <span>Copy Link</span>
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
              <DropdownMenuItem onClick={() => setShowPINDialog(true)} className="gap-2">
                <Lock className="h-4 w-4" />
                <span>Set PIN Protection</span>
              </DropdownMenuItem>
              
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
                    onClick={() => {
                      navigator.clipboard.writeText(qrUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
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

      {/* PIN Dialog */}
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
    </>
  );
};
