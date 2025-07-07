
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Search, Filter } from "lucide-react";

interface LibraryHeaderProps {
  onAddNew: (type: "vendor" | "fabric" | "hardware" | "collection") => void;
  onShowFilter: () => void;
}

export const LibraryHeader = ({ onAddNew, onShowFilter }: LibraryHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <p className="text-gray-600">Manage fabrics, hardware, and vendor relationships</p>
      </div>
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button className="bg-slate-600 hover:bg-slate-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => onAddNew("vendor")}
              >
                Add Vendor/Supplier
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => onAddNew("fabric")}
              >
                Add Fabric
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => onAddNew("hardware")}
              >
                Add Hardware
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => onAddNew("collection")}
              >
                Add Collection
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Import from CSV
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button variant="outline" className="bg-slate-600 hover:bg-slate-700 text-white border-slate-600">
          <Search className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          className="bg-slate-600 hover:bg-slate-700 text-white border-slate-600"
          onClick={onShowFilter}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
