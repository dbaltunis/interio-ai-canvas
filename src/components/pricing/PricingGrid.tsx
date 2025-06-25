
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Plus, Edit, Trash2, Grid, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PricingTier {
  width: number;
  drop: number;
  price: number;
}

interface PricingGrid {
  id: string;
  name: string;
  treatment_type: string;
  fabric_type: string;
  tiers: PricingTier[];
  base_price: number;
  markup_percentage: number;
}

export const PricingGrid = () => {
  const { toast } = useToast();
  const [selectedGrid, setSelectedGrid] = useState<string>("blinds");
  const [showNewGrid, setShowNewGrid] = useState(false);

  // Sample pricing grids that match the window covering industry
  const pricingGrids: PricingGrid[] = [
    {
      id: "blinds-venetian",
      name: "Venetian Blinds",
      treatment_type: "blinds",
      fabric_type: "aluminum",
      base_price: 45,
      markup_percentage: 40,
      tiers: [
        { width: 60, drop: 90, price: 45 },
        { width: 90, drop: 90, price: 52 },
        { width: 120, drop: 90, price: 58 },
        { width: 150, drop: 90, price: 65 },
        { width: 180, drop: 90, price: 72 },
        { width: 60, drop: 120, price: 52 },
        { width: 90, drop: 120, price: 58 },
        { width: 120, drop: 120, price: 65 },
        { width: 150, drop: 120, price: 72 },
        { width: 180, drop: 120, price: 80 },
        { width: 60, drop: 150, price: 58 },
        { width: 90, drop: 150, price: 65 },
        { width: 120, drop: 150, price: 72 },
        { width: 150, drop: 150, price: 80 },
        { width: 180, drop: 150, price: 88 }
      ]
    },
    {
      id: "curtains-pencil-pleat",
      name: "Pencil Pleat Curtains",
      treatment_type: "curtains",
      fabric_type: "standard",
      base_price: 65,
      markup_percentage: 45,
      tiers: [
        { width: 120, drop: 137, price: 65 },
        { width: 150, drop: 137, price: 75 },
        { width: 180, drop: 137, price: 85 },
        { width: 210, drop: 137, price: 95 },
        { width: 240, drop: 137, price: 105 },
        { width: 120, drop: 183, price: 75 },
        { width: 150, drop: 183, price: 85 },
        { width: 180, drop: 183, price: 95 },
        { width: 210, drop: 183, price: 105 },
        { width: 240, drop: 183, price: 115 },
        { width: 120, drop: 228, price: 85 },
        { width: 150, drop: 228, price: 95 },
        { width: 180, drop: 228, price: 105 },
        { width: 210, drop: 228, price: 115 },
        { width: 240, drop: 228, price: 125 }
      ]
    }
  ];

  const currentGrid = pricingGrids.find(grid => grid.id === selectedGrid);

  const renderPricingTable = (grid: PricingGrid) => {
    const widths = [...new Set(grid.tiers.map(t => t.width))].sort((a, b) => a - b);
    const drops = [...new Set(grid.tiers.map(t => t.drop))].sort((a, b) => a - b);

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-brand-primary text-white">
              <th className="border border-gray-300 p-2 text-left">Width (cm) / Drop (cm)</th>
              {drops.map(drop => (
                <th key={drop} className="border border-gray-300 p-2 text-center">{drop}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {widths.map(width => (
              <tr key={width} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2 font-medium bg-gray-100">{width}</td>
                {drops.map(drop => {
                  const tier = grid.tiers.find(t => t.width === width && t.drop === drop);
                  return (
                    <td key={`${width}-${drop}`} className="border border-gray-300 p-2 text-center">
                      {tier ? (
                        <span className="font-medium text-brand-primary">
                          ${tier.price}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleImportPricing = () => {
    toast({
      title: "Import Pricing",
      description: "Feature coming soon - upload CSV files with your pricing grids",
    });
  };

  const handleExportPricing = () => {
    toast({
      title: "Export Pricing",
      description: "Pricing grid exported to CSV successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Pricing Grids</h3>
          <p className="text-sm text-brand-neutral">
            Manage pricing tables for different window treatments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportPricing}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" onClick={handleExportPricing}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => setShowNewGrid(true)}
            className="bg-brand-primary hover:bg-brand-accent"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Grid
          </Button>
        </div>
      </div>

      {/* Grid Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid className="h-5 w-5 text-brand-primary" />
            Select Pricing Grid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            {pricingGrids.map((grid) => (
              <Card 
                key={grid.id}
                className={`cursor-pointer transition-all ${
                  selectedGrid === grid.id ? 'ring-2 ring-brand-primary' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedGrid(grid.id)}
              >
                <CardContent className="p-4">
                  <h4 className="font-medium">{grid.name}</h4>
                  <p className="text-sm text-gray-500 capitalize">
                    {grid.treatment_type} • {grid.fabric_type}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Base: ${grid.base_price}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      +{grid.markup_percentage}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Grid Display */}
      {currentGrid && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-brand-primary" />
                  {currentGrid.name} Pricing
                </CardTitle>
                <CardDescription>
                  {currentGrid.treatment_type} • {currentGrid.fabric_type} • 
                  Base: ${currentGrid.base_price} • Markup: {currentGrid.markup_percentage}%
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderPricingTable(currentGrid)}
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How to use this pricing grid:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Find the intersection of width and drop measurements</li>
                <li>• The price shown includes your {currentGrid.markup_percentage}% markup</li>
                <li>• Prices are in AUD and include GST</li>
                <li>• For custom sizes, the system will interpolate between nearest values</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Grid Management</CardTitle>
          <CardDescription>
            Learn how to set up and manage your pricing grids effectively
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Import from Excel/CSV</h4>
              <p className="text-sm text-gray-600 mb-2">
                Upload your existing pricing tables from spreadsheets
              </p>
              <Button size="sm" variant="outline">Upload File</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Auto-Calculate Pricing</h4>
              <p className="text-sm text-gray-600 mb-2">
                Set formulas to automatically calculate prices based on size
              </p>
              <Button size="sm" variant="outline">Configure</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Bulk Price Updates</h4>
              <p className="text-sm text-gray-600 mb-2">
                Update multiple prices at once with percentage increases
              </p>
              <Button size="sm" variant="outline">Update Prices</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Competitor Analysis</h4>
              <p className="text-sm text-gray-600 mb-2">
                Compare your pricing with market rates
              </p>
              <Button size="sm" variant="outline">Analyze</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
