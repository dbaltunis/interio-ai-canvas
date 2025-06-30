
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { useWindowCoveringOptions } from "@/hooks/useWindowCoveringOptions";
import { CheckCircle2, Circle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const [searchQuery, setSearchQuery] = useState("");
  
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
      setSearchQuery("");
    }
  };

  const filteredWindowCoverings = windowCoverings?.filter(wc => 
    wc.active && 
    wc.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Select Window Covering</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading window coverings...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">Select Window Covering</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">Choose a window covering and configure its options</p>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Window Coverings List */}
            <div className="space-y-4 flex flex-col">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Available Window Coverings</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search window coverings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {filteredWindowCoverings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No window coverings found</p>
                  </div>
                ) : (
                  filteredWindowCoverings.map(windowCovering => (
                    <Card 
                      key={windowCovering.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedWindowCovering?.id === windowCovering.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => handleWindowCoveringSelect(windowCovering)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {selectedWindowCovering?.id === windowCovering.id ? (
                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400" />
                              )}
                              <h4 className="font-medium text-gray-900">{windowCovering.name}</h4>
                            </div>
                            {windowCovering.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{windowCovering.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">
                                {windowCovering.fabrication_pricing_method?.replace('-', ' ') || 'Standard pricing'}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {windowCovering.margin_percentage}% margin
                              </Badge>
                              {windowCovering.optionsCount > 0 && (
                                <Badge variant="outline" className="text-xs text-blue-600">
                                  {windowCovering.optionsCount} options
                                </Badge>
                              )}
                            </div>
                          </div>
                          {windowCovering.unit_price && (
                            <div className="ml-3 text-right">
                              <span className="font-semibold text-gray-900">
                                ${windowCovering.unit_price}
                              </span>
                              <p className="text-xs text-gray-500">base price</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Options Selection */}
            <div className="space-y-4 flex flex-col border-l pl-6">
              <h3 className="text-lg font-medium">Options & Variants</h3>
              
              {!selectedWindowCovering ? (
                <div className="flex-1 flex items-center justify-center text-center py-12">
                  <div className="max-w-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Circle className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">Select a window covering to view available options</p>
                  </div>
                </div>
              ) : availableOptions.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center py-12">
                  <div className="max-w-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="text-gray-600">No additional options available for this window covering</p>
                    <p className="text-sm text-gray-500 mt-1">You can proceed to add it to your project</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {availableOptions.map(option => (
                    <Card 
                      key={option.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedOptions.includes(option.id)
                          ? 'ring-2 ring-green-500 bg-green-50 border-green-200'
                          : option.is_required
                          ? 'border-orange-300 bg-orange-50'
                          : 'hover:bg-gray-50 border-gray-200'
                      } ${option.is_required ? 'opacity-75' : ''}`}
                      onClick={() => !option.is_required && handleOptionToggle(option.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {!option.is_required && (
                              selectedOptions.includes(option.id) ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                              )
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{option.name}</h4>
                              {option.description && (
                                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
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
                          </div>
                          <div className="text-right ml-3">
                            <span className="font-semibold text-gray-900">${option.base_cost}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t mt-6">
          <div className="text-sm text-gray-600">
            {selectedWindowCovering && (
              <span>
                Selected: <strong>{selectedWindowCovering.name}</strong>
                {selectedOptions.length > 0 && (
                  <span> with {selectedOptions.length} option{selectedOptions.length !== 1 ? 's' : ''}</span>
                )}
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedWindowCovering}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add to Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
