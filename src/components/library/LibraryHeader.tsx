
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Search, Filter, Upload, Download } from "lucide-react";

interface LibraryHeaderProps {
  onAddNew: (type: "vendor" | "fabric" | "hardware" | "collection") => void;
  onShowFilter: () => void;
  onImport: () => void;
  onExport: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const LibraryHeader = ({ 
  onAddNew, 
  onShowFilter, 
  onImport, 
  onExport,
  searchTerm,
  onSearchChange 
}: LibraryHeaderProps) => {
  return (
    <div className="space-y-4">
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
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            className="bg-green-600 hover:bg-green-700 text-white border-green-600"
            onClick={onImport}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            onClick={onExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
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

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search products, vendors, collections..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};
