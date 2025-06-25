
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Building, Package } from "lucide-react";
import { FabricsGrid } from "./FabricsGrid";
import { BrandsGrid } from "./BrandsGrid";
import { CollectionsGrid } from "./CollectionsGrid";

interface Fabric {
  id: string; // Changed from number to string
  name: string;
  code: string;
  brand: string;
  collection: string;
  type: string;
  color: string;
  pattern: string;
  width: number;
  price: number;
  image: string;
}

interface Brand {
  id: string; // Changed from number to string
  name: string;
  collections: number;
  fabrics: number;
}

interface Collection {
  id: number;
  name: string;
  brand: string;
  fabrics: number;
}

interface LibraryTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  fabrics: Fabric[];
  brands: Brand[];
  collections: Collection[];
  onAddBrand: () => void;
  onAddCollection: () => void;
}

export const LibraryTabs = ({ 
  activeTab, 
  onTabChange, 
  fabrics, 
  brands, 
  collections,
  onAddBrand,
  onAddCollection
}: LibraryTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="fabrics" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Fabrics
        </TabsTrigger>
        <TabsTrigger value="brands" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Brands
        </TabsTrigger>
        <TabsTrigger value="collections" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Collections
        </TabsTrigger>
      </TabsList>

      <TabsContent value="fabrics" className="space-y-4">
        <FabricsGrid fabrics={fabrics} />
      </TabsContent>

      <TabsContent value="brands" className="space-y-4">
        <BrandsGrid brands={brands} onAddBrand={onAddBrand} />
      </TabsContent>

      <TabsContent value="collections" className="space-y-4">
        <CollectionsGrid collections={collections} onAddCollection={onAddCollection} />
      </TabsContent>
    </Tabs>
  );
};
