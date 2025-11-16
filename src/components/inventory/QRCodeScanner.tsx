import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, X, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface QRCodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (itemId: string) => void;
}

export const QRCodeScanner = ({ open, onOpenChange, onScan }: QRCodeScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementId = 'qr-reader';

  const startScanning = async () => {
    try {
      setError('');
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      setHasPermission(true);

      // Initialize scanner
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId);
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Check if it's our inventory QR code format
          if (decodedText.startsWith('inventory:')) {
            const itemId = decodedText.replace('inventory:', '');
            onScan(itemId);
            stopScanning();
            onOpenChange(false);
          }
        },
        (errorMessage) => {
          // Ignore decode errors (happens when no QR code is visible)
        }
      );

      setScanning(true);
    } catch (err: any) {
      console.error('Scanner error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please enable camera access in your browser settings.');
        setHasPermission(false);
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Failed to start camera. Please try again.');
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        const state = await scannerRef.current.getState();
        if (state === 2) { // Scanner is running
          await scannerRef.current.stop();
        }
        setScanning(false);
      } catch (err) {
        // Silently handle - scanner might already be stopped
        setScanning(false);
      }
    }
  };

  useEffect(() => {
    if (open) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hasPermission === false && (
            <Alert>
              <AlertDescription>
                To scan QR codes, you need to grant camera permission. 
                Please check your browser settings and reload the page.
              </AlertDescription>
            </Alert>
          )}

          <div className="relative">
            <div
              id={elementId}
              className="w-full rounded-lg overflow-hidden bg-muted"
              style={{ minHeight: '400px' }}
            />
            
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-primary rounded-lg animate-pulse" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>• Position the QR code within the frame</p>
            <p>• Ensure good lighting for best results</p>
            <p>• Hold your device steady</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            {!scanning && !error && (
              <Button onClick={startScanning} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Start Scanning
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
