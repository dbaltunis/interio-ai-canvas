import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download, Share, MoreVertical, Plus, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function InstallAppPrompt() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('pwa-install-dismissed') === 'true';
  });
  const [showInstructions, setShowInstructions] = useState(false);
  const isMobile = useIsMobile();
  
  // Detect iOS vs Android
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);
  
  // Check if already installed (standalone mode)
  const [isInstalled, setIsInstalled] = useState(false);
  
  useEffect(() => {
    // Check for standalone mode (PWA already installed)
    const checkInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
    setIsInstalled(checkInstalled);
  }, []);
  
  // Don't show on desktop, if dismissed, or if already installed
  if (!isMobile || dismissed || isInstalled) return null;
  
  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setDismissed(true);
    setShowInstructions(false);
  };
  
  const handleRemindLater = () => {
    setShowInstructions(false);
  };

  return (
    <>
      {/* Floating install button */}
      <div className="fixed bottom-24 right-4 z-40 animate-fade-in">
        <Button
          onClick={() => setShowInstructions(true)}
          size="sm"
          className="shadow-lg hover:shadow-xl transition-all duration-300 gap-2 rounded-full px-4"
        >
          <Download className="h-4 w-4" />
          Install App
        </Button>
      </div>
      
      {/* Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Install InterioApp
            </DialogTitle>
            <DialogDescription>
              Add InterioApp to your home screen for quick access and a native app experience.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {isIOS ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    1
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Tap the Share button</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Look for <Share className="h-4 w-4 inline" /> at the bottom of Safari
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    2
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Add to Home Screen</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Scroll and tap <Plus className="h-4 w-4 inline" /> "Add to Home Screen"
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    3
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Confirm Installation</p>
                    <p className="text-sm text-muted-foreground">
                      Tap "Add" in the top right corner
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    1
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Open Browser Menu</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Tap <MoreVertical className="h-4 w-4 inline" /> in the top right corner
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    2
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Install App</p>
                    <p className="text-sm text-muted-foreground">
                      Tap "Install app" or "Add to Home Screen"
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    3
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Confirm</p>
                    <p className="text-sm text-muted-foreground">
                      Tap "Install" to add the app
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleRemindLater}
            >
              Maybe Later
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4 mr-1" />
              Don't show again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
