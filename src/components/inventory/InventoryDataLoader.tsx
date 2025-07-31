import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { useToast } from "@/hooks/use-toast";
import { Database, Loader2 } from "lucide-react";
import { useState } from "react";

const sampleInventoryData = [
  {
    name: "Luxury Velvet Navy",
    description: "Premium velvet curtain fabric in deep navy blue with rich texture",
    category: "curtain_fabric",
    sku: "LVN-001",
    quantity: 45,
    unit_price: 28.50,
    selling_price: 28.50,
    cost_price: 19.95,
    unit: "meters",
    reorder_point: 10,
    supplier: "Premium Textiles Ltd",
    location: "Fabric Store A",
    fabric_width: 140,
    pattern_repeat_vertical: 0,
    fabric_composition: "100% Cotton Velvet",
    color: "Navy Blue",
    active: true
  },
  {
    name: "Blackout Lining White",
    description: "High-quality blackout lining fabric for complete light control",
    category: "lining_fabric",
    sku: "BLW-002",
    quantity: 78,
    unit_price: 15.75,
    selling_price: 15.75,
    cost_price: 11.02,
    unit: "meters",
    reorder_point: 15,
    supplier: "Blackout Solutions",
    location: "Fabric Store B",
    fabric_width: 150,
    pattern_repeat_vertical: 0,
    fabric_composition: "100% Polyester",
    color: "White",
    active: true
  },
  {
    name: "Professional Track System",
    description: "Heavy-duty curtain track for commercial installations",
    category: "track",
    sku: "PTS-001",
    quantity: 12,
    unit_price: 85.00,
    selling_price: 85.00,
    cost_price: 59.50,
    unit: "pieces",
    reorder_point: 3,
    supplier: "Hardware Pro",
    location: "Hardware Store A",
    hardware_material: "Aluminum",
    hardware_finish: "White Powder Coat",
    hardware_load_capacity: 25,
    color: "White",
    active: true
  },
  {
    name: "Silent Glide Motor",
    description: "Quiet electric motor for automated curtains",
    category: "motor",
    sku: "SGM-001",
    quantity: 8,
    unit_price: 245.00,
    selling_price: 245.00,
    cost_price: 171.50,
    unit: "pieces",
    reorder_point: 2,
    supplier: "Automation Systems",
    location: "Electronics Store",
    hardware_material: "Plastic & Metal",
    hardware_finish: "Black",
    color: "Black",
    active: true
  }
];

export const InventoryDataLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const createInventoryItem = useCreateEnhancedInventoryItem();
  const { toast } = useToast();

  const loadSampleData = async () => {
    setIsLoading(true);
    try {
      for (const item of sampleInventoryData) {
        await createInventoryItem.mutateAsync(item);
      }
      toast({
        title: "Sample Data Loaded",
        description: `Successfully added ${sampleInventoryData.length} sample inventory items`,
      });
    } catch (error) {
      console.error('Error loading sample data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load sample inventory data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Load Sample Data
        </CardTitle>
        <CardDescription>
          Add sample inventory items to test the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={loadSampleData}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading Sample Data...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Load Sample Inventory Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};