import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Copy, Share2, ExternalLink, Code, Check, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AvailableSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  slot: {
    id: string;
    schedulerName: string;
    schedulerSlug?: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
  } | null;
}

export const AvailableSlotDialog = ({ isOpen, onClose, slot }: AvailableSlotDialogProps) => {
  const { toast } = useToast();
  const [shareMode, setShareMode] = useState<'link' | 'embed'>('link');
  const [copied, setCopied] = useState(false);

  if (!slot) return null;

  // Generate booking link (for demo purposes)
  const bookingLink = `${window.location.origin}/book/${slot.schedulerSlug || 'demo'}?date=${slot.date}&time=${slot.startTime}`;
  
  // Generate embed code for websites
  const embedCode = `<iframe src="${bookingLink}" width="100%" height="600" frameborder="0"></iframe>`;

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Booking link copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Book an appointment: ${slot.schedulerName}`,
          text: `Schedule an appointment for ${slot.schedulerName} on ${format(new Date(slot.date), 'PPPP')} at ${slot.startTime}`,
          url: bookingLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying link
      handleCopyToClipboard(bookingLink);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share your booking page
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Appointment Details */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">Bookable Appointment Schedule</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span><strong>Service:</strong> {slot.schedulerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span><strong>Duration:</strong> {slot.duration} min appointments</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <span><strong>Timezone:</strong> {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
              </div>
            </div>
          </div>

          {/* Share Mode Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">What would you like to share?</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={shareMode === 'link' ? 'default' : 'outline'}
                onClick={() => setShareMode('link')}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Link
              </Button>
              <Button
                variant={shareMode === 'embed' ? 'default' : 'outline'}
                onClick={() => setShareMode('embed')}
                className="flex items-center gap-2"
              >
                <Code className="h-4 w-4" />
                Website embed
              </Button>
            </div>
          </div>

          {shareMode === 'link' ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Booking page link</Label>
                <div className="flex gap-2">
                  <Input
                    value={bookingLink}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleCopyToClipboard(bookingLink)}
                    className="flex items-center gap-1"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p><strong>Share this page with others by sending them this link.</strong></p>
                <p className="mt-1">Anyone with the link can book an appointment.</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleShare}
                  className="flex-1 flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(bookingLink, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Preview
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Website embed code</Label>
                <div className="space-y-2">
                  <textarea
                    value={embedCode}
                    readOnly
                    className="w-full h-24 p-3 text-xs font-mono border rounded-md resize-none bg-muted/50"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleCopyToClipboard(embedCode)}
                    className="flex items-center gap-1"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy Code'}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p><strong>Add this iframe to your website.</strong></p>
                <p className="mt-1">Customers can book appointments directly from your site.</p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};