
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FolderTree, List, LayoutGrid } from "lucide-react";
import { useVendors } from "@/hooks/useVendors";
import { useCollections } from "@/hooks/useCollections";
import { useInventoryStats } from "@/hooks/useEnhancedInventory";

interface LibraryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  viewMode: "card" | "list";
  onViewModeChange: (mode: "card" | "list") => void;
}

export const LibraryTabs = ({ activeTab, onTabChange, viewMode, onViewModeChange }: LibraryTabsProps) => {
  const { data: vendors } = useVendors();
  const { data: collections } = useCollections();
  const { data: stats } = useInventoryStats();

  const vendorCount = vendors?.length || 0;
  const collectionCount = collections?.length || 0;
  const fabricCount = stats?.byCategory?.['fabric'] || 0;
  const hardwareCount = stats?.byCategory?.['hardware'] || 0;

  return (
    <div className="flex items-center justify-between">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="modern-card p-1 h-auto bg-muted/30 backdrop-blur-sm flex w-auto">
          <TabsTrigger value="categories">
            <FolderTree className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="vendors">
            Vendors ({vendorCount})
          </TabsTrigger>
          <TabsTrigger value="fabrics">
            Fabrics ({fabricCount})
          </TabsTrigger>
          <TabsTrigger value="hardware">
            Hardware ({hardwareCount})
          </TabsTrigger>
          <TabsTrigger value="collections">
            Collections ({collectionCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {activeTab !== 'categories' && (
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("card")}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Card
          </Button>
        </div>
      )}
    </div>
  );
};
