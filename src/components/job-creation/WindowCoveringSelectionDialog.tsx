
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Search, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";

interface WindowCoveringSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (windowCovering: any, selectedOptions: string[], treatmentType?: string) => void;
  surfaceId: string;
  defaultTreatmentType?: string;
}

export const WindowCoveringSelectionDialog = ({
  open,
  onOpenChange,
  onSelect,
  surfaceId,
  defaultTreatmentType = "Curtains"
}: WindowCoveringSelectionDialogProps) => {
  const { windowCoverings, isLoading } = useWindowCoverings();
  const [selectedWindowCovering, setSelectedWindowCovering] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleWindowCoveringSelect = (windowCovering: any) => {
    setSelectedWindowCovering(windowCovering);
  };

  const handleConfirm = () => {
    if (selectedWindowCovering) {
      onSelect(selectedWindowCovering, [], selectedWindowCovering.name || defaultTreatmentType);
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
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
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
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">Select Window Covering</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">Choose a window covering to add to this surface</p>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="space-y-4 flex flex-col h-full">
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
                  <p className="text-sm mt-2">You can still create a basic treatment without selecting a window covering</p>
                  <Button 
                    onClick={() => {
                      onSelect(null, [], defaultTreatmentType);
                      onOpenChange(false);
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    Create Basic {defaultTreatmentType}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Option to create basic treatment without window covering */}
                  <Card 
                    className="cursor-pointer transition-all duration-200 hover:shadow-md border-dashed border-2 hover:bg-gray-50"
                    onClick={() => {
                      onSelect(null, [], defaultTreatmentType);
                      onOpenChange(false);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed">
                          <Package className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Create Basic {defaultTreatmentType}</h4>
                          <p className="text-sm text-gray-600">Create a simple treatment without advanced options</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {filteredWindowCoverings.map(windowCovering => (
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
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                  {windowCovering.image_url ? (
                                    <img 
                                      src={windowCovering.image_url} 
                                      alt={windowCovering.name}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                  ) : (
                                    <Package className="h-6 w-6 text-gray-500" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{windowCovering.name}</h4>
                                  {windowCovering.description && (
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{windowCovering.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 ml-7">
                              <Badge variant="outline" className="text-xs">
                                {windowCovering.fabrication_pricing_method?.replace('-', ' ') || 'Standard pricing'}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {windowCovering.margin_percentage}% margin
                              </Badge>
                              {windowCovering.optionsCount > 0 && (
                                <Badge variant="outline" className="text-xs text-green-600">
                                  {windowCovering.optionsCount} variants available
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
                  ))}
                </>
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
              Open Calculator
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
