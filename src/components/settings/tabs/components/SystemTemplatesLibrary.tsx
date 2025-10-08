import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSystemTemplates, useCloneSystemTemplate } from "@/hooks/useSystemTemplates";
import { Copy, DollarSign, Info } from "lucide-react";
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

export const SystemTemplatesLibrary = () => {
  const { data: templates, isLoading } = useSystemTemplates();
  const cloneTemplate = useCloneSystemTemplate();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [showCloneDialog, setShowCloneDialog] = useState(false);

  const handleCloneClick = (template: any) => {
    setSelectedTemplate(template);
    setCustomPrice(template.unit_price || 0);
    setShowCloneDialog(true);
  };

  const handleConfirmClone = () => {
    if (selectedTemplate) {
      cloneTemplate.mutate({
        systemTemplateId: selectedTemplate.id,
        customPricing: customPrice,
      });
      setShowCloneDialog(false);
      setSelectedTemplate(null);
    }
  };

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
                  <Card key={template.id} className="relative">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      {template.description && (
                        <CardDescription className="text-xs line-clamp-2">
                          {template.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Base Price:</span>
                        <span className="font-semibold">${template.unit_price?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {template.pricing_type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.manufacturing_type}
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => handleCloneClick(template)}
                        className="w-full"
                        size="sm"
                        variant="outline"
                      >
                        <Copy className="h-3 w-3 mr-2" />
                        Clone & Customize
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Template: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Set your custom pricing for this template. You can modify all settings after cloning.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="custom-price">Your Price ({selectedTemplate?.pricing_type})</Label>
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
                System default: ${selectedTemplate?.unit_price?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloneDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmClone} disabled={cloneTemplate.isPending}>
              {cloneTemplate.isPending ? 'Cloning...' : 'Clone Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
