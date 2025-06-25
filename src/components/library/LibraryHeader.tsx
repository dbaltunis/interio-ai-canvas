
import { Button } from "@/components/ui/button";
import { Filter, Upload, Plus } from "lucide-react";

interface LibraryHeaderProps {
  onFilterClick: () => void;
  onCSVUploadClick: () => void;
  onAddFabricClick: () => void;
}

export const LibraryHeader = ({ 
  onFilterClick, 
  onCSVUploadClick, 
  onAddFabricClick 
}: LibraryHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">Fabric Library</h1>
        <p className="text-brand-neutral">Manage your fabric catalog, brands, and collections</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onFilterClick}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button variant="outline" onClick={onCSVUploadClick}>
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        <Button className="bg-brand-primary hover:bg-brand-accent" onClick={onAddFabricClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Fabric
        </Button>
      </div>
    </div>
  );
};
