
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { useWindowCoveringOptions } from "@/hooks/useWindowCoveringOptions";
import { CheckCircle2, Circle, Search, Package } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  
  const { options: availableOptions } = useWindowCoveringOptions(selectedWindowCovering?.id || '');

  const handleWindowCoveringSelect = (windowCovering: any) => {
    setSelectedWindowCovering(windowCovering);
  };

  const handleConfirm = () => {
    if (selectedWindowCovering) {
      // Include all available options by default
      const allOptionIds = availableOptions.map(option => option.id);
      onSelect(selectedWindowCovering, allOptionIds);
      onOpenChange(false);
      setSelectedWindowCovering(null);
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
          <p className="text-sm text-gray-600 mt-1">Choose a window covering with all variants included</p>
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
                                <Badge variant="outline" className="text-xs text-green-600">
                                  {windowCovering.optionsCount} variants included
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

            {/* Treatment Preview & Options */}
            <div className="space-y-4 flex flex-col border-l pl-6">
              <h3 className="text-lg font-medium">Treatment Preview</h3>
              
              {!selectedWindowCovering ? (
                <div className="flex-1 flex items-center justify-center text-center py-12">
                  <div className="max-w-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">Select a window covering to preview</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-4">
                  {/* Treatment Display Card */}
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border">
                          {selectedWindowCovering.image_url ? (
                            <img 
                              src={selectedWindowCovering.image_url} 
                              alt={selectedWindowCovering.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg text-green-800">{selectedWindowCovering.name}</CardTitle>
                          <p className="text-sm text-green-600">Ready to add with all variants</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Included Variants */}
                  {availableOptions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                        Included Variants ({availableOptions.length})
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {availableOptions.map(option => (
                          <Card key={option.id} className="border border-green-200 bg-green-25">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 text-sm">{option.name}</h5>
                                    {option.description && (
                                      <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {option.option_type}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {option.cost_type}
                                      </Badge>
                                      {option.is_required && (
                                        <Badge variant="secondary" className="text-xs">
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
                                  <span className="font-semibold text-sm text-gray-900">${option.base_cost}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {availableOptions.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-sm">No additional variants available</p>
                      <p className="text-xs text-gray-500 mt-1">This treatment is ready to add as-is</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t mt-6">
          <div className="text-sm text-gray-600">
            {selectedWindowCovering && (
              <span className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                <strong>{selectedWindowCovering.name}</strong> selected
                {availableOptions.length > 0 && (
                  <span className="ml-1">with {availableOptions.length} variant{availableOptions.length !== 1 ? 's' : ''}</span>
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
              className="bg-green-600 hover:bg-green-700"
            >
              Add Treatment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
