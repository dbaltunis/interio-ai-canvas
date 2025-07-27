import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCreateEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { useToast } from "@/hooks/use-toast";
import { Database, Package, Wrench, Palette } from "lucide-react";

const sampleInventoryData = [
  {
    name: "Luxury Velvet Navy",
    description: "Premium velvet curtain fabric in deep navy blue with rich texture",
    category: "curtain_fabric",
    sku: "LVN-001",
    quantity: 45,
    unit_price: 28.50,
    unit: "meters",
    reorder_point: 10,
    reorder_quantity: 25,
    supplier: "Premium Textiles Ltd",
    location: "Fabric Store A",
    fabric_width: 140,
    pattern_repeat_vertical: 0,
    fullness_ratio: 2.5
  },
  {
    name: "Blackout Lining White",
    description: "High-quality blackout lining fabric for complete light control",
    category: "fabric",
    sku: "BLW-002",
    quantity: 78,
    unit_price: 15.75,
    unit: "meters",
    reorder_point: 15,
    reorder_quantity: 50,
    supplier: "Blackout Solutions",
    location: "Fabric Store B",
    fabric_width: 150,
    pattern_repeat_vertical: 0,
    fullness_ratio: 2.0
  },
  {
    name: "Sheer Voile Cream",
    description: "Elegant sheer voile fabric in soft cream tone",
    category: "curtain_fabric",
    sku: "SVC-003",
    quantity: 32,
    unit_price: 18.25,
    unit: "meters",
    reorder_point: 8,
    reorder_quantity: 20,
    supplier: "Sheer Specialists",
    location: "Fabric Store A",
    fabric_width: 280,
    pattern_repeat_vertical: 12,
    fullness_ratio: 3.0
  },
  {
    name: "Chrome Track 3m",
    description: "Professional grade aluminum track system, chrome finish",
    category: "track",
    sku: "CT3M-001",
    quantity: 25,
    unit_price: 75.00,
    unit: "units",
    reorder_point: 5,
    reorder_quantity: 15,
    supplier: "Track Masters",
    location: "Hardware Bay 1",
    weight_capacity: 15,
    max_length: 300,
    hardware_type: "curtain_track",
    material_finish: "chrome",
    installation_type: "ceiling_mount"
  },
  {
    name: "Steel Rod 2.5m",
    description: "Heavy duty steel curtain rod with decorative finials",
    category: "rod",
    sku: "SR25-002",
    quantity: 18,
    unit_price: 45.50,
    unit: "units",
    reorder_point: 3,
    reorder_quantity: 10,
    supplier: "Rod Specialists",
    location: "Hardware Bay 2",
    weight_capacity: 20,
    max_length: 250,
    hardware_type: "curtain_rod",
    material_finish: "brushed_steel",
    installation_type: "wall_mount"
  },
  {
    name: "Wall Brackets Chrome",
    description: "Adjustable wall mounting brackets, chrome finish",
    category: "bracket",
    sku: "WBC-003",
    quantity: 156,
    unit_price: 12.75,
    unit: "pairs",
    reorder_point: 20,
    reorder_quantity: 50,
    supplier: "Bracket Pro",
    location: "Hardware Bay 1",
    weight_capacity: 25,
    hardware_type: "wall_bracket",
    material_finish: "chrome",
    installation_type: "wall_mount"
  },
  {
    name: "Somfy Motor RTS",
    description: "Radio controlled motor for automated curtains",
    category: "motor",
    sku: "SMR-001",
    quantity: 8,
    unit_price: 285.00,
    unit: "units",
    reorder_point: 2,
    reorder_quantity: 5,
    supplier: "Somfy Direct",
    location: "Motor Storage",
    weight_capacity: 30,
    hardware_type: "motor_rts",
    material_finish: "white",
    installation_type: "track_mount",
    pricing_grid: {
      headers: ["Motor Type", "Base Price ($)", "Installation ($)"],
      data: [
        {"Motor Type": "Standard RTS", "Base Price ($)": "285.00", "Installation ($)": "75.00"},
        {"Motor Type": "Premium RTS", "Base Price ($)": "385.00", "Installation ($)": "85.00"},
        {"Motor Type": "Hardwired", "Base Price ($)": "450.00", "Installation ($)": "150.00"},
        {"Motor Type": "Battery", "Base Price ($)": "325.00", "Installation ($)": "50.00"}
      ],
      type: "motor",
      updatedAt: new Date().toISOString()
    }
  },
  {
    name: "Remote Control 5CH",
    description: "5-channel remote control for multiple motors",
    category: "accessory",
    sku: "RC5-001",
    quantity: 12,
    unit_price: 45.00,
    unit: "units",
    reorder_point: 3,
    reorder_quantity: 8,
    supplier: "Somfy Direct",
    location: "Accessory Bin",
    hardware_type: "remote_control",
    material_finish: "white",
    compatibility_tags: ["somfy_rts", "motor_control"]
  }
];

export const InventoryDemoData = () => {
  const createMutation = useCreateEnhancedInventoryItem();
  const { toast } = useToast();

  const loadSampleData = async () => {
    try {
      let successCount = 0;
      for (const item of sampleInventoryData) {
        try {
          await createMutation.mutateAsync(item);
          successCount++;
        } catch (error) {
          console.warn(`Failed to create item ${item.name}:`, error);
        }
      }
      
      toast({
        title: "Sample Data Loaded",
        description: `Successfully loaded ${successCount} inventory items`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sample data",
        variant: "destructive",
      });
    }
  };

  const fabricCount = sampleInventoryData.filter(item => 
    item.category === "fabric" || item.category === "curtain_fabric").length;
  const hardwareCount = sampleInventoryData.filter(item => 
    ["track", "rod", "bracket", "motor", "accessory"].includes(item.category)).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Load Sample Inventory Data
        </CardTitle>
        <CardDescription>
          Get started quickly with pre-configured inventory items including fabrics, hardware, and pricing grids
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Palette className="h-8 w-8 text-blue-500" />
            <div>
              <div className="font-semibold">{fabricCount} Fabrics</div>
              <div className="text-sm text-muted-foreground">With fabric calculations</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Wrench className="h-8 w-8 text-green-500" />
            <div>
              <div className="font-semibold">{hardwareCount} Hardware</div>
              <div className="text-sm text-muted-foreground">With pricing grids</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Package className="h-8 w-8 text-purple-500" />
            <div>
              <div className="font-semibold">{sampleInventoryData.length} Total Items</div>
              <div className="text-sm text-muted-foreground">Ready to use</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">What's included:</h4>
          <div className="grid gap-2 md:grid-cols-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Fabrics</Badge>
              <span>Velvet, lining, sheer with pattern repeats</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Tracks</Badge>
              <span>Professional grade with weight capacity</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Motors</Badge>
              <span>Somfy with CSV pricing grid</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Accessories</Badge>
              <span>Remote controls and brackets</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={loadSampleData}
          disabled={createMutation.isPending}
          className="w-full"
        >
          {createMutation.isPending ? "Loading Sample Data..." : "Load Sample Inventory Data"}
        </Button>
      </CardContent>
    </Card>
  );
};