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
}

export const ImprovedTreatmentSelector = ({
  selectedCoveringId,
  onCoveringSelect,
  disabled
}: ImprovedTreatmentSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: curtainTemplates = [], isLoading } = useCurtainTemplates();
  
  const selectedCovering = curtainTemplates.find(c => c.id === selectedCoveringId);

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

        {/* Treatment Grid */}
        {!isLoading && (
          <ScrollArea className="h-[400px] pr-2">
            <TreatmentTypeGrid
              treatments={curtainTemplates}
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