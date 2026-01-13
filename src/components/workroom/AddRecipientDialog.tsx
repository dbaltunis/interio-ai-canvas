import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/clipboard';

interface AddRecipientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (recipient: { 
    name: string; 
    email?: string; 
    phone?: string; 
    notes?: string 
  }) => Promise<boolean>;
  shareUrl?: string;
  pin?: string | null;
}

export const AddRecipientDialog: React.FC<AddRecipientDialogProps> = ({
  open,
  onOpenChange,
  onAdd,
  shareUrl,
  pin
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    const success = await onAdd({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined
    });
    setIsSubmitting(false);
    
    if (success) {
      setShowSuccess(true);
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setShowSuccess(false);
    setCopied(false);
    onOpenChange(false);
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    const textToCopy = pin 
      ? `${shareUrl}\n\nPIN: ${pin}` 
      : shareUrl;
    
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Recipient Added
            </DialogTitle>
            <DialogDescription>
              {name} has been added to the share list. Share the link with them.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {shareUrl && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Share Link:</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="text-xs" />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleCopyLink}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                {pin && (
                  <p className="text-sm text-muted-foreground">
                    PIN: <span className="font-mono font-bold">{pin}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Recipient
          </DialogTitle>
          <DialogDescription>
            Track who you're sharing this work order with.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g., John Smith (Installer)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 234 567 890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any notes about this recipient..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Recipient'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
