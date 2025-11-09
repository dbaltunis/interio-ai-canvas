import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StoreTemplateSelector } from "./StoreTemplateSelector";
import { useCreateStore } from "@/hooks/useCreateStore";
import { StoreTemplate } from "@/types/online-store";
import { Loader2, Store } from "lucide-react";

interface StoreCreationFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (storeId: string) => void;
}

export const StoreCreationFlow = ({ open, onOpenChange, onComplete }: StoreCreationFlowProps) => {
  const [step, setStep] = useState<'name' | 'template'>('name');
  const [storeName, setStoreName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<StoreTemplate | null>(null);

  const createStore = useCreateStore();

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (storeName.trim()) {
      setStep('template');
    }
  };

  const handleTemplateSelect = (template: StoreTemplate) => {
    setSelectedTemplate(template);
    createStore.mutate(
      {
        storeName: storeName.trim(),
        templateId: template.id,
        template,
      },
      {
        onSuccess: (store) => {
          onComplete(store.id);
          onOpenChange(false);
          // Reset for next time
          setStep('name');
          setStoreName('');
          setSelectedTemplate(null);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Launch Your Online Store
          </DialogTitle>
          <DialogDescription>
            {step === 'name'
              ? 'Give your store a name to get started'
              : 'Choose a template that matches your style'}
          </DialogDescription>
        </DialogHeader>

        {step === 'name' && (
          <form onSubmit={handleNameSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name</Label>
              <Input
                id="store-name"
                placeholder="e.g., Elegant Window Solutions"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                This will be the name of your online store. You can change it later.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!storeName.trim()}>
                Continue
              </Button>
            </div>
          </form>
        )}

        {step === 'template' && (
          <div className="py-4">
            {createStore.isPending ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Creating your store...</p>
              </div>
            ) : (
              <StoreTemplateSelector onSelectTemplate={handleTemplateSelect} />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
