import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuickInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    id: string;
    name: string;
    email?: string;
  };
}

export const QuickInvoiceDialog = ({ open, onOpenChange, client }: QuickInvoiceDialogProps) => {
  const [quoteNumber, setQuoteNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!amount.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in amount and description",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate quote number if not provided
      const finalQuoteNumber = quoteNumber.trim() || `Q-${Date.now()}`;
      
      const { error } = await supabase.from('quotes').insert({
        quote_number: finalQuoteNumber,
        client_id: client.id,
        user_id: user.id,
        total_amount: parseFloat(amount),
        subtotal: parseFloat(amount),
        notes: description,
        status: 'draft',
      });

      if (error) throw error;

      toast({
        title: "Quote created!",
        description: `Quote ${finalQuoteNumber} created for ${client.name}`,
      });

      // Reset form and close dialog
      setQuoteNumber('');
      setAmount('');
      setDescription('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating quote:', error);
      toast({
        title: "Error",
        description: "Failed to create quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Quote for {client.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="quote-number">Quote Number (optional)</Label>
            <Input
              id="quote-number"
              placeholder="Auto-generated if empty"
              value={quoteNumber}
              onChange={(e) => setQuoteNumber(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of the quote..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !amount.trim() || !description.trim()}
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Quote
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};