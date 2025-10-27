import { useState, useEffect } from "react";
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
  visualKey?: string; // 'room_wall' or other window types
}
export const ImprovedTreatmentSelector = ({
  selectedCoveringId,
  onCoveringSelect,
  disabled,
  visualKey
}: ImprovedTreatmentSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const {
    data: curtainTemplates = [],
    isLoading,
    isError,
    error
  } = useCurtainTemplates();

  // Log loading and error states
  useEffect(() => {
    if (isError) {
      console.error("❌ Error loading treatments:", error);
    }
    if (isLoading) {
      console.log("⏳ Loading treatments...");
    }
  }, [isLoading, isError, error]);

  // Filter treatments based on window type
  const filteredTemplates = curtainTemplates.filter(template => {
    if (visualKey === 'room_wall') {
      // For room wall: show only wallpapers and wall coverings
      return template.curtain_type === 'wallpaper';
    } else {
      // For standard windows: show all window treatments (exclude wallpaper)
      return template.curtain_type !== 'wallpaper';
    }
  });

  // Debug: Log loaded templates
  console.log("📋 Loaded treatment templates:", filteredTemplates);
  console.log("📋 Total templates count:", filteredTemplates.length);
  console.log("📋 Visual key:", visualKey);
  const selectedCovering = filteredTemplates.find(c => c.id === selectedCoveringId);
  const handleTreatmentSelect = (treatment: CurtainTemplate) => {
    onCoveringSelect(treatment);
  };
  const handleClearSelection = () => {
    onCoveringSelect(null);
  };
  return <div className={`space-y-3 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">
          {visualKey === 'room_wall' ? 'Select Wall Covering & Template' : 'Select Treatment & Template'}
        </h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowSearch(!showSearch)}
          className="h-8 px-2"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {showSearch && <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search treatments..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          className="pl-10 h-9"
          autoFocus
        />
      </div>}

      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading treatments...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2 text-destructive">
              <p className="text-sm">Failed to load treatments</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No treatments available</p>
          </div>
        ) : (
          <div className="pr-3">
            <TreatmentTypeGrid treatments={filteredTemplates} selectedId={selectedCoveringId} onSelect={handleTreatmentSelect} searchQuery={searchQuery} />
          </div>
        )}
      </ScrollArea>
    </div>;
};