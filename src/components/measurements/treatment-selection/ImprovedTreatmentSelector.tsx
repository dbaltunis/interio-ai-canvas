import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Layers, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TreatmentTypeGrid } from "./TreatmentTypeGrid";
import { useCurtainTemplates, type CurtainTemplate } from "@/hooks/useCurtainTemplates";

interface ImprovedTreatmentSelectorProps {
  selectedCoveringId?: string;
  onCoveringSelect: (covering: CurtainTemplate | null) => void;
  disabled?: boolean;
  windowType?: any; // Add window type to filter treatments
}

export const ImprovedTreatmentSelector = ({
  selectedCoveringId,
  onCoveringSelect,
  disabled,
  windowType
}: ImprovedTreatmentSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: curtainTemplates = [], isLoading } = useCurtainTemplates();
  
  console.log("🔍 ImprovedTreatmentSelector - curtainTemplates:", curtainTemplates);
  console.log("🔍 ImprovedTreatmentSelector - isLoading:", isLoading);
  console.log("🔍 ImprovedTreatmentSelector - windowType:", windowType);
  
  // Filter treatments based on window type if available
  const filteredTemplates = curtainTemplates.filter(template => {
    if (!windowType) return true; // Show all if no window type selected
    
    // Define compatibility mapping between window types and treatment types
    const windowTypeTreatmentMap: Record<string, string[]> = {
      'standard': ['Curtains', 'Roman Blinds', 'Roller Blinds', 'Vertical Blinds'],
      'bay': ['Curtains', 'Roman Blinds', 'Track Curtains'],
      'bow': ['Curtains', 'Track Curtains'],
      'casement': ['Curtains', 'Roman Blinds', 'Roller Blinds'],
      'sash': ['Curtains', 'Roman Blinds', 'Plantation Shutters'],
      'sliding': ['Vertical Blinds', 'Panel Blinds', 'Curtains'],
      'french': ['Curtains', 'Roman Blinds', 'Plantation Shutters'],
      'bi_fold': ['Vertical Blinds', 'Panel Blinds'],
      'awning': ['Roller Blinds', 'Roman Blinds'],
      'hopper': ['Roller Blinds', 'Roman Blinds']
    };
    
    const compatibleTreatments = windowTypeTreatmentMap[windowType.key] || [];
    return compatibleTreatments.some(treatment => 
      template.curtain_type.toLowerCase().includes(treatment.toLowerCase()) ||
      template.name.toLowerCase().includes(treatment.toLowerCase())
    );
  });
  
  console.log("🔍 ImprovedTreatmentSelector - filteredTemplates:", filteredTemplates);
  
  
  const selectedCovering = filteredTemplates.find(c => c.id === selectedCoveringId);

  const handleTreatmentSelect = (treatment: CurtainTemplate) => {
    onCoveringSelect(treatment);
  };

  const handleClearSelection = () => {
    onCoveringSelect(null);
  };

  if (disabled) {
    return (
      <Card className="opacity-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Treatment Selection (Disabled)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Treatment selection is currently disabled.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Select Treatment Type
            {windowType && (
              <Badge variant="outline" className="text-xs ml-2">
                Optimized for {windowType.name}
              </Badge>
            )}
          </CardTitle>
          {selectedCovering && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {selectedCovering && (
          <div className="flex items-center gap-2 mt-2 p-3 bg-primary/5 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-sm">{selectedCovering.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {selectedCovering.curtain_type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedCovering.fullness_ratio}x fullness
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {windowType && (
          <div className="text-xs text-muted-foreground mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            💡 <strong>Smart Filter:</strong> Showing treatments optimized for {windowType.name} windows
          </div>
        )}
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search treatment types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading treatment options...</div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {windowType ? `No treatments found for ${windowType.name}` : "No treatments available"}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {windowType 
                ? `The selected window type may not have compatible treatment options yet.`
                : "Create curtain templates in Settings → Window Coverings Management to get started"
              }
            </p>
          </div>
        )}

        {/* Treatment Grid */}
        {!isLoading && filteredTemplates.length > 0 && (
          <ScrollArea className="h-[400px] pr-2">
            <TreatmentTypeGrid
              treatments={filteredTemplates}
              selectedId={selectedCoveringId}
              onSelect={handleTreatmentSelect}
              searchQuery={searchQuery}
            />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};