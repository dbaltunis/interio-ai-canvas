import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, X } from "lucide-react";
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
  
  // Debug: Log loaded templates
  console.log("📋 Loaded treatment templates:", curtainTemplates);
  console.log("📋 Total templates count:", curtainTemplates.length);
  console.log("📋 Roller blind templates:", curtainTemplates.filter(t => t.curtain_type === 'roller_blind'));
  
  const selectedCovering = curtainTemplates.find(c => c.id === selectedCoveringId);

  const handleTreatmentSelect = (treatment: CurtainTemplate) => {
    onCoveringSelect(treatment);
  };

  const handleClearSelection = () => {
    onCoveringSelect(null);
  };

  return (
    <div className={`space-y-3 ${disabled ? "opacity-50" : ""}`}>
      <div>
        <h3 className="text-base font-medium mb-1">Select Treatment & Template</h3>
        <p className="text-sm text-muted-foreground">
          Choose a treatment type below
        </p>
      </div>

      {selectedCovering && (
        <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex-1 flex items-center gap-1.5 px-2 py-1 bg-background rounded border">
            <span className="text-xs font-medium">Selected:</span>
            <span className="text-xs">{selectedCovering.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="h-4 w-4 p-0 ml-1 hover:bg-destructive/10"
            >
              <X className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search treatments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-9"
        />
      </div>

      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm">Loading treatments...</span>
          </div>
        ) : (
          <div className="pr-3">
            <TreatmentTypeGrid
              treatments={curtainTemplates}
              selectedId={selectedCoveringId}
              onSelect={handleTreatmentSelect}
              searchQuery={searchQuery}
            />
          </div>
        )}
      </ScrollArea>
    </div>
  );
};