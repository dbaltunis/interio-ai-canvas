import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, FileText, Palette } from "lucide-react";
import { cn } from '@/lib/utils';
import { useBusinessSettings, useUpdateBusinessSettings } from "@/hooks/useBusinessSettings";
import { toast } from "sonner";

interface TemplateStyleOption {
  id: string;
  name: string;
  description: string;
  preview: React.ReactNode;
  features: string[];
}

const templateStyles: TemplateStyleOption[] = [
  {
    id: 'default',
    name: 'Default Template',
    description: 'Classic professional quote layout with block-based customization',
    preview: (
      <div className="w-full h-32 bg-muted rounded border border-border flex flex-col p-3 gap-2">
        <div className="h-4 w-16 bg-primary/20 rounded" />
        <div className="h-2 w-full bg-muted-foreground/10 rounded" />
        <div className="h-2 w-3/4 bg-muted-foreground/10 rounded" />
        <div className="flex-1 flex gap-2 mt-2">
          <div className="flex-1 bg-muted-foreground/10 rounded" />
          <div className="w-16 bg-muted-foreground/10 rounded" />
        </div>
        <div className="h-3 w-20 bg-primary/30 rounded self-end" />
      </div>
    ),
    features: ['Block-based editor', 'Flexible layouts', 'Custom blocks'],
  },
  {
    id: 'homekaara',
    name: 'Professional Curtains Quote',
    description: 'Elegant design with product images, room grouping, and detailed cost breakdowns. Best for curtain and blind quotes.',
    preview: (
      <div className="w-full h-32 rounded border overflow-hidden" style={{ backgroundColor: '#FAF9F7' }}>
        {/* Header */}
        <div className="flex justify-between p-2" style={{ backgroundColor: '#E8E4DF' }}>
          <div className="flex flex-col gap-1">
            <div className="h-2 w-12 bg-stone-400/50 rounded" />
            <div className="h-1.5 w-16 bg-stone-300/50 rounded" />
          </div>
          <div className="flex flex-col gap-1 items-end">
            <div className="h-2 w-14 bg-stone-500/60 rounded font-bold" />
            <div className="h-1 w-10 bg-stone-300/50 rounded" />
          </div>
        </div>
        {/* Accent line */}
        <div className="h-0.5 w-3 ml-2 mt-1 rounded-full bg-amber-700" />
        {/* Content */}
        <div className="p-2 flex gap-2">
          <div className="w-6 h-8 bg-stone-200 rounded" />
          <div className="flex-1 flex flex-col gap-1">
            <div className="h-1.5 w-full bg-stone-200 rounded" />
            <div className="h-1 w-3/4 bg-stone-100 rounded" />
          </div>
          <div className="w-8 h-3 bg-stone-300/60 rounded" />
        </div>
        {/* Button */}
        <div className="px-2">
          <div className="h-3 w-16 rounded ml-auto" style={{ backgroundColor: '#9C8B7A' }} />
        </div>
      </div>
    ),
    features: ['Product images', 'Room grouping', 'Editable fields', 'Payment summary'],
  },
];

export const QuoteTemplateStyleSelector: React.FC = () => {
  const { data: businessSettings, isLoading } = useBusinessSettings();
  const updateSettings = useUpdateBusinessSettings();
  
  const currentStyle = (businessSettings as any)?.quote_template || 'default';

  const handleSelectStyle = async (styleId: string) => {
    if (styleId === currentStyle) return;
    
    if (!businessSettings?.id) {
      toast.error('Business settings not found. Please try again.');
      return;
    }
    
    try {
      await updateSettings.mutateAsync({
        id: businessSettings.id,
        quote_template: styleId,
      } as any);
      
      toast.success(`Quote template changed to "${templateStyles.find(s => s.id === styleId)?.name}"`);
    } catch (error) {
      console.error('Failed to update template style:', error);
      toast.error('Failed to update template style');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-32 bg-muted rounded mb-3" />
              <div className="h-4 bg-muted rounded w-24 mb-2" />
              <div className="h-3 bg-muted rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-5 w-5 text-muted-foreground" />
        <div>
          <h4 className="text-sm font-medium">Quote Template Style</h4>
          <p className="text-xs text-muted-foreground">
            Choose a template style for all your quotes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templateStyles.map((style) => {
          const isSelected = currentStyle === style.id;
          
          return (
            <Card 
              key={style.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md relative overflow-hidden",
                isSelected && "ring-2 ring-primary border-primary"
              )}
              onClick={() => handleSelectStyle(style.id)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-primary text-primary-foreground">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-4">
                {/* Preview */}
                <div className="mb-4">
                  {style.preview}
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium text-sm">{style.name}</h3>
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {style.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {style.features.map((feature, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="text-xs font-normal"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Select Button */}
                {!isSelected && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    disabled={updateSettings.isPending}
                  >
                    {updateSettings.isPending ? 'Updating...' : 'Select Template'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuoteTemplateStyleSelector;
