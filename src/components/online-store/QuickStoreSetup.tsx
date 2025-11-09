import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StoreTemplate } from "@/types/online-store";
import { useCreateQuickStore } from "@/hooks/useCreateQuickStore";
import { Loader2, Store, Check, Globe, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuickStoreSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (storeId: string) => void;
}

export const QuickStoreSetup = ({ open, onOpenChange, onComplete }: QuickStoreSetupProps) => {
  const [step, setStep] = useState<'template' | 'details' | 'creating'>('template');
  const [storeName, setStoreName] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
  
  const createStore = useCreateQuickStore();

  const templates = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean, contemporary design',
      preview: '🎨',
      features: ['Hero Banner', 'Product Grid', 'Contact Form', 'Appointments'],
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Elegant, traditional style',
      preview: '✨',
      features: ['Featured Products', 'Testimonials', 'Gallery', 'Appointments'],
    },
    {
      id: 'bold',
      name: 'Bold',
      description: 'Eye-catching, vibrant',
      preview: '🚀',
      features: ['Video Hero', 'Product Showcase', 'FAQ', 'Appointments'],
    },
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setStep('details');
  };

  const handleLaunchStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    setStep('creating');
    
    createStore.mutate(
      {
        storeName: storeName.trim(),
        templateId: selectedTemplate,
        customDomain: customDomain.trim() || undefined,
      },
      {
        onSuccess: (store) => {
          onComplete(store.id);
          onOpenChange(false);
          // Reset
          setStep('template');
          setStoreName('');
          setCustomDomain('');
          setSelectedTemplate('modern');
        },
        onError: () => {
          setStep('details'); // Go back on error
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Store className="h-6 w-6 text-primary" />
            Launch Your Online Store in 3 Steps
          </DialogTitle>
          <DialogDescription>
            Get your store online in under 2 minutes
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 py-4 border-y">
          <div className={`flex items-center gap-2 ${step === 'template' || step === 'details' || step === 'creating' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'template' || step === 'details' || step === 'creating' ? 'border-primary bg-primary/10' : 'border-muted'}`}>
              {step === 'details' || step === 'creating' ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <span className="font-medium">Choose Style</span>
          </div>
          <div className="w-12 h-px bg-border" />
          <div className={`flex items-center gap-2 ${step === 'details' || step === 'creating' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'details' || step === 'creating' ? 'border-primary bg-primary/10' : 'border-muted'}`}>
              {step === 'creating' ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <span className="font-medium">Store Details</span>
          </div>
          <div className="w-12 h-px bg-border" />
          <div className={`flex items-center gap-2 ${step === 'creating' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'creating' ? 'border-primary bg-primary/10' : 'border-muted'}`}>
              3
            </div>
            <span className="font-medium">Go Live!</span>
          </div>
        </div>

        {/* Step 1: Template Selection */}
        {step === 'template' && (
          <div className="space-y-6 py-4">
            <div className="grid md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="text-center space-y-3">
                    <div className="text-5xl">{template.preview}</div>
                    <div>
                      <h3 className="font-bold text-lg">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <div className="space-y-1 pt-2 border-t">
                      {template.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="h-3 w-3 text-green-600" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full"
                      variant={selectedTemplate === template.id ? 'default' : 'outline'}
                    >
                      {selectedTemplate === template.id ? 'Selected' : 'Select'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Store Details */}
        {step === 'details' && (
          <form onSubmit={handleLaunchStore} className="space-y-6 py-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    Your store will be auto-configured with:
                  </p>
                  <ul className="text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
                    <li>Your business logo and branding</li>
                    <li>All active products automatically listed</li>
                    <li>Appointment booking system</li>
                    <li>SEO-optimized pages</li>
                    <li>Payment integration (Stripe)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name *</Label>
              <Input
                id="store-name"
                placeholder="e.g., Elegant Window Solutions"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                autoFocus
                required
              />
              <p className="text-xs text-muted-foreground">
                This appears as your store title and in SEO
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="custom-domain">Custom Domain (Optional)</Label>
                <Badge variant="secondary" className="text-xs">Add Later</Badge>
              </div>
              <Input
                id="custom-domain"
                placeholder="www.yourstore.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                type="url"
              />
              <p className="text-xs text-muted-foreground">
                Your store will be available at yourstore.lovable.app (or your custom domain)
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    Store will be published instantly!
                  </p>
                  <p className="text-green-800 dark:text-green-200">
                    Your store goes live immediately. Start taking orders and bookings right away.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('template')}
              >
                Back
              </Button>
              <Button type="submit" disabled={!storeName.trim()} size="lg">
                <Store className="h-4 w-4 mr-2" />
                Launch Store Now
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Creating */}
        {step === 'creating' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Creating Your Store...</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>✓ Setting up template</p>
                <p>✓ Adding your products</p>
                <p>✓ Configuring appointments</p>
                <p>✓ Publishing store</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
