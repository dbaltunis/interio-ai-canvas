import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Layers, X, Check } from "lucide-react";
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
      <CardHeader className="pb-2">
        {selectedCovering ? (
          <div className="flex items-center justify-between gap-3 p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{selectedCovering.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {selectedCovering.curtain_type}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {selectedCovering.fullness_ratio}x
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
            <Layers className="h-4 w-4" />
            Choose a treatment type below
          </CardTitle>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3 pt-3">
        {!selectedCovering && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search treatments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-muted-foreground">Loading treatments...</div>
          </div>
        )}

        {!isLoading && !selectedCovering && (
          <ScrollArea className="h-[350px]">
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