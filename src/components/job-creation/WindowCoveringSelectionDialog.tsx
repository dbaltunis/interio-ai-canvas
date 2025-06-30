
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { useWindowCoveringOptions } from "@/hooks/useWindowCoveringOptions";

interface WindowCoveringSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (windowCovering: any, selectedOptions: string[]) => void;
  surfaceId: string;
}

export const WindowCoveringSelectionDialog = ({
  open,
  onOpenChange,
  onSelect,
  surfaceId
}: WindowCoveringSelectionDialogProps) => {
  const { windowCoverings, isLoading } = useWindowCoverings();
  const [selectedWindowCovering, setSelectedWindowCovering] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  const { options: availableOptions } = useWindowCoveringOptions(selectedWindowCovering?.id || '');

  const handleWindowCoveringSelect = (windowCovering: any) => {
    setSelectedWindowCovering(windowCovering);
    setSelectedOptions([]);
  };

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleConfirm = () => {
    if (selectedWindowCovering) {
      onSelect(selectedWindowCovering, selectedOptions);
      onOpenChange(false);
      setSelectedWindowCovering(null);
      setSelectedOptions([]);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Window Covering</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">Loading window coverings...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Window Covering</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Window Coverings List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Available Window Coverings</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {windowCoverings
                .filter(wc => wc.active)
                .map(windowCovering => (
                  <Card 
                    key={windowCovering.id}
                    className={`cursor-pointer transition-colors ${
                      selectedWindowCovering?.id === windowCovering.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleWindowCoveringSelect(windowCovering)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{windowCovering.name}</CardTitle>
                      {windowCovering.description && (
                        <p className="text-sm text-gray-600">{windowCovering.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {windowCovering.fabrication_pricing_method?.replace('-', ' ') || 'No pricing method'}
                          </Badge>
                          <Badge variant="secondary">
                            {windowCovering.margin_percentage}% margin
                          </Badge>
                        </div>
                        {windowCovering.unit_price && (
                          <span className="text-sm font-medium">
                            ${windowCovering.unit_price}
                          </span>
                        )}
                      </div>
                      {windowCovering.optionsCount > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          {windowCovering.optionsCount} options available
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Options Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Options & Variants</h3>
            
            {!selectedWindowCovering ? (
              <div className="text-center py-12 text-gray-500">
                <p>Select a window covering to view available options</p>
              </div>
            ) : availableOptions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No options available for this window covering</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableOptions.map(option => (
                  <Card 
                    key={option.id}
                    className={`cursor-pointer transition-colors ${
                      selectedOptions.includes(option.id)
                        ? 'border-green-500 bg-green-50'
                        : option.is_required
                        ? 'border-orange-300 bg-orange-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => !option.is_required && handleOptionToggle(option.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{option.name}</h4>
                          {option.description && (
                            <p className="text-sm text-gray-600">{option.description}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {option.option_type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {option.cost_type}
                            </Badge>
                            {option.is_required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                            {option.is_default && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">${option.base_cost}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedWindowCovering}
          >
            Add to Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
