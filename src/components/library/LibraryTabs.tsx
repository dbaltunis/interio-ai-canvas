
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FolderTree, List, LayoutGrid } from "lucide-react";

interface LibraryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  viewMode: "card" | "list";
  onViewModeChange: (mode: "card" | "list") => void;
}

export const LibraryTabs = ({ activeTab, onTabChange, viewMode, onViewModeChange }: LibraryTabsProps) => {
  return (
    <div className="flex items-center justify-between">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-fit grid-cols-5">
          <TabsTrigger value="categories">
            <FolderTree className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="vendors">
            Vendors (4)
          </TabsTrigger>
          <TabsTrigger value="fabrics">
            Fabrics (3)
          </TabsTrigger>
          <TabsTrigger value="hardware">
            Hardware (2)
          </TabsTrigger>
          <TabsTrigger value="collections">
            Collections (8)
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
            className="bg-slate-600 hover:bg-slate-700 text-white"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Card
          </Button>
        </div>
      )}
    </div>
  );
};
