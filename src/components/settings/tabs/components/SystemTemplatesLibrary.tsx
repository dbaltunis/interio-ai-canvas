import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSystemTemplates, useCloneSystemTemplate } from "@/hooks/useSystemTemplates";
import { Copy, DollarSign, Info, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Hook to get option count for a template's category
const useTemplateOptionCount = (treatmentCategory: string) => {
  return useQuery({
    queryKey: ['template-option-count', treatmentCategory],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('treatment_options')
        .select('*', { count: 'exact', head: true })
        .eq('treatment_category', treatmentCategory)
        .is('template_id', null); // Category-based options only
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!treatmentCategory,
  });
};

const TemplateCard = ({ template, onTemplateCloned }: { template: any; onTemplateCloned?: (templateId: string) => void }) => {
  const { data: optionCount } = useTemplateOptionCount(template.treatment_category);
  const cloneTemplate = useCloneSystemTemplate();
  const [showDialog, setShowDialog] = useState(false);
  const [customPrice, setCustomPrice] = useState<number>(template.unit_price || 0);

  const handleClone = async () => {
    try {
      const clonedTemplate = await cloneTemplate.mutateAsync({
        systemTemplateId: template.id,
        customPricing: customPrice,
      });
      setShowDialog(false);
      
      // Notify parent component with the new template ID
      if (onTemplateCloned && clonedTemplate?.id) {
        onTemplateCloned(clonedTemplate.id);
      }
    } catch (error) {
      console.error("Error cloning template:", error);
    }
  };

  return (
    <>
      <Card className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-base">{template.name}</CardTitle>
              {template.description && (
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {template.description}
                </CardDescription>
              )}
            </div>
            {optionCount !== undefined && optionCount > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                <Settings className="h-3 w-3" />
                {optionCount}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs">Base Price:</span>
              <span className="font-semibold text-lg">${template.unit_price?.toFixed(2) || '0.00'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Options:</span>
              <span className="font-semibold text-lg">{optionCount || 0}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <Badge variant="outline" className="text-xs capitalize">
              {template.pricing_type?.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {template.manufacturing_type}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {template.treatment_category?.replace('_', ' ')}
            </Badge>
          </div>
          <Button 
            onClick={() => setShowDialog(true)}
            className="w-full"
            size="sm"
            variant="outline"
          >
            <Copy className="h-3 w-3 mr-2" />
            Clone & Customize
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Template: {template.name}</DialogTitle>
            <DialogDescription>
              Set your custom pricing for this template. All preset options will be included.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="custom-price">Your Price ({template.pricing_type})</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="custom-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(parseFloat(e.target.value))}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                System default: ${template.unit_price?.toFixed(2) || '0.00'}
              </p>
            </div>
            {optionCount !== undefined && optionCount > 0 && (
              <p className="text-sm text-muted-foreground">
                ✓ {optionCount} preset options will be included
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleClone} disabled={cloneTemplate.isPending}>
              {cloneTemplate.isPending ? 'Cloning...' : 'Clone Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface SystemTemplatesLibraryProps {
  onTemplateCloned?: (templateId: string) => void;
}

export const SystemTemplatesLibrary = ({ onTemplateCloned }: SystemTemplatesLibraryProps) => {
  const { data: templates, isLoading } = useSystemTemplates();

  const getCategoryBadgeColor = (category: string | null) => {
    const colors: Record<string, string> = {
      'roller_blinds': 'bg-blue-500',
      'roman_blinds': 'bg-purple-500',
      'venetian_blinds': 'bg-green-500',
      'vertical_blinds': 'bg-yellow-500',
      'panel_glide': 'bg-orange-500',
      'shutters': 'bg-red-500',
      'cellular_shades': 'bg-pink-500',
      'curtains': 'bg-indigo-500',
    };
    return colors[category || ''] || 'bg-gray-500';
  };

  const getCategoryLabel = (category: string | null) => {
    const labels: Record<string, string> = {
      'roller_blinds': 'Roller Blinds',
      'roman_blinds': 'Roman Blinds',
      'venetian_blinds': 'Venetian Blinds',
      'vertical_blinds': 'Vertical Blinds',
      'panel_glide': 'Panel Glide',
      'shutters': 'Shutters',
      'cellular_shades': 'Cellular Shades',
      'curtains': 'Curtains',
    };
    return labels[category || ''] || category || 'Unknown';
  };

  const groupedTemplates = templates?.reduce((acc, template) => {
    const category = template.treatment_category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  if (isLoading) {
    return <div className="text-center py-8">Loading system templates...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            System Default Templates
          </CardTitle>
          <CardDescription>
            Browse and clone pre-configured templates for common blind and shutter types. 
            Clone any template and customize pricing to match your business needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedTemplates || {}).map(([category, categoryTemplates]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={`${getCategoryBadgeColor(category)} text-white`}>
                  {getCategoryLabel(category)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({categoryTemplates?.length || 0} templates)
                </span>
              </div>
              
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {categoryTemplates?.map((template) => (
                  <TemplateCard key={template.id} template={template} onTemplateCloned={onTemplateCloned} />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
};
