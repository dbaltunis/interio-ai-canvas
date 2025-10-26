import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Plus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HardwareFormProps {
  onClose: () => void;
}

interface PricingGridRow {
  length: string;
  price: string;
}

interface Variant {
  id: string;
  type: 'finial' | 'bracket' | 'color' | 'finish' | 'other';
  name: string;
  sku?: string;
  priceModifier?: string; // Additional cost
}

export const HardwareForm = ({ onClose }: HardwareFormProps) => {
  const { toast } = useToast();
  const [hardwareData, setHardwareData] = useState({
    name: "",
    code: "",
    category: "",
    vendor: "",
    price: "",
    unit: "each",
    inStock: "",
    reorderPoint: "",
    location: "",
    material: "",
    finish: "",
    dimensions: "",
    weight: "",
    maxLoad: "",
    installation: "",
    warranty: "",
    description: "",
    image: null as File | null,
    specifications: ""
  });

  const [pricingGrid, setPricingGrid] = useState<PricingGridRow[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [newVariant, setNewVariant] = useState({
    type: 'finial' as Variant['type'],
    name: '',
    sku: '',
    priceModifier: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Hardware data:", {
      ...hardwareData,
      pricingGrid,
      variants
    });
    toast({
      title: "Hardware Saved",
      description: `${hardwareData.name} has been added with ${pricingGrid.length} pricing tiers and ${variants.length} variants.`
    });
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHardwareData(prev => ({ ...prev, image: file }));
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    setCsvFile(file);
    
    // Parse CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').map(row => row.split(','));
      
      // Skip header row if present
      const dataRows = rows[0][0].toLowerCase().includes('length') ? rows.slice(1) : rows;
      
      const parsedGrid: PricingGridRow[] = dataRows
        .filter(row => row.length >= 2 && row[0].trim() && row[1].trim())
        .map(row => ({
          length: row[0].trim(),
          price: row[1].trim()
        }));

      setPricingGrid(parsedGrid);
      toast({
        title: "CSV Uploaded",
        description: `Successfully imported ${parsedGrid.length} pricing tiers`
      });
    };
    
    reader.readAsText(file);
  };

  const downloadCSVTemplate = () => {
    const template = 'Length (cm),Price ($)\n100,25.00\n150,35.00\n200,45.00\n250,55.00\n300,65.00';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricing_grid_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const addVariant = () => {
    if (!newVariant.name.trim()) {
      toast({
        title: "Invalid Variant",
        description: "Please enter a variant name",
        variant: "destructive"
      });
      return;
    }

    const variant: Variant = {
      id: Date.now().toString(),
      ...newVariant
    };

    setVariants([...variants, variant]);
    setNewVariant({
      type: 'finial',
      name: '',
      sku: '',
      priceModifier: ''
    });

    toast({
      title: "Variant Added",
      description: `${variant.name} has been added`
    });
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const removePricingRow = (index: number) => {
    setPricingGrid(pricingGrid.filter((_, i) => i !== index));
  };

  const addManualPricingRow = () => {
    setPricingGrid([...pricingGrid, { length: '', price: '' }]);
  };

  const updatePricingRow = (index: number, field: 'length' | 'price', value: string) => {
    const updated = [...pricingGrid];
    updated[index][field] = value;
    setPricingGrid(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hardwareName">Hardware Name *</Label>
          <Input
            id="hardwareName"
            value={hardwareData.name}
            onChange={(e) => setHardwareData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="hardwareCode">Product Code</Label>
          <Input
            id="hardwareCode"
            value={hardwareData.code}
            onChange={(e) => setHardwareData(prev => ({ ...prev, code: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select value={hardwareData.category} onValueChange={(value) => setHardwareData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="curtain-tracks">Curtain Tracks</SelectItem>
              <SelectItem value="curtain-poles">Curtain Poles / Rods</SelectItem>
              <SelectItem value="motorized-systems">Motorized Systems</SelectItem>
              <SelectItem value="brackets">Brackets & Fixings</SelectItem>
              <SelectItem value="tie-backs">Tie-backs & Hold-backs</SelectItem>
              <SelectItem value="blind-components">Blind Components</SelectItem>
              <SelectItem value="valance-boards">Valance Boards</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Vendor/Supplier</Label>
          <Select value={hardwareData.vendor} onValueChange={(value) => setHardwareData(prev => ({ ...prev, vendor: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hunter-douglas">Hunter Douglas</SelectItem>
              <SelectItem value="silent-gliss">Silent Gliss</SelectItem>
              <SelectItem value="somfy">Somfy</SelectItem>
              <SelectItem value="lutron">Lutron</SelectItem>
              <SelectItem value="bradley">Bradley Collection</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price">Base Price</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={hardwareData.price}
              onChange={(e) => setHardwareData(prev => ({ ...prev, price: e.target.value }))}
              className="pl-8"
            />
          </div>
        </div>

        <div>
          <Label>Unit</Label>
          <Select value={hardwareData.unit} onValueChange={(value) => setHardwareData(prev => ({ ...prev, unit: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="each">Each</SelectItem>
              <SelectItem value="meter">Meter</SelectItem>
              <SelectItem value="foot">Foot</SelectItem>
              <SelectItem value="yard">Yard</SelectItem>
              <SelectItem value="set">Set</SelectItem>
              <SelectItem value="pair">Pair</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="inStock">Current Stock</Label>
          <Input
            id="inStock"
            type="number"
            value={hardwareData.inStock}
            onChange={(e) => setHardwareData(prev => ({ ...prev, inStock: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>

      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Pricing Grid (Length-based)
          </CardTitle>
          <CardDescription>
            Upload a CSV file with length and price columns for track/rod pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
                id="csvUpload"
              />
              <label htmlFor="csvUpload">
                <Button type="button" variant="outline" className="w-full" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {csvFile ? csvFile.name : 'Upload CSV'}
                  </span>
                </Button>
              </label>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              onClick={downloadCSVTemplate}
              title="Download template"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={addManualPricingRow}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Row
            </Button>
          </div>

          {pricingGrid.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground mb-2">
                <div className="col-span-5">Length</div>
                <div className="col-span-6">Price</div>
                <div className="col-span-1"></div>
              </div>
              {pricingGrid.map((row, index) => (
                <div key={index} className="grid grid-cols-12 gap-2">
                  <Input
                    value={row.length}
                    onChange={(e) => updatePricingRow(index, 'length', e.target.value)}
                    placeholder="e.g., 100cm"
                    className="col-span-5"
                  />
                  <div className="col-span-6 relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      value={row.price}
                      onChange={(e) => updatePricingRow(index, 'price', e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePricingRow(index)}
                    className="col-span-1 h-10 w-10 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Variant Options</CardTitle>
          <CardDescription>
            Add finials, brackets, colors, and other variants for this hardware
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-12 gap-2">
            <Select 
              value={newVariant.type} 
              onValueChange={(value) => setNewVariant(prev => ({ ...prev, type: value as Variant['type'] }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="finial">Finial</SelectItem>
                <SelectItem value="bracket">Bracket</SelectItem>
                <SelectItem value="color">Color</SelectItem>
                <SelectItem value="finish">Finish</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={newVariant.name}
              onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Variant name"
              className="col-span-4"
            />
            <Input
              value={newVariant.sku}
              onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
              placeholder="SKU (optional)"
              className="col-span-3"
            />
            <div className="col-span-1 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                value={newVariant.priceModifier}
                onChange={(e) => setNewVariant(prev => ({ ...prev, priceModifier: e.target.value }))}
                placeholder="0"
                className="pl-6"
              />
            </div>
            <Button
              type="button"
              onClick={addVariant}
              size="sm"
              className="col-span-1"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {variants.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {variants.map((variant) => (
                <div key={variant.id} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
                  <Badge variant="outline" className="capitalize">
                    {variant.type}
                  </Badge>
                  <span className="font-medium flex-1">{variant.name}</span>
                  {variant.sku && (
                    <span className="text-xs text-muted-foreground">{variant.sku}</span>
                  )}
                  {variant.priceModifier && (
                    <span className="text-sm font-semibold text-primary">
                      +${variant.priceModifier}
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(variant.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reorderPoint">Reorder Point</Label>
          <Input
            id="reorderPoint"
            type="number"
            value={hardwareData.reorderPoint}
            onChange={(e) => setHardwareData(prev => ({ ...prev, reorderPoint: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="location">Storage Location</Label>
          <Input
            id="location"
            value={hardwareData.location}
            onChange={(e) => setHardwareData(prev => ({ ...prev, location: e.target.value }))}
            className="mt-1"
            placeholder="e.g., Hardware Storage H-03"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="material">Material</Label>
          <Input
            id="material"
            value={hardwareData.material}
            onChange={(e) => setHardwareData(prev => ({ ...prev, material: e.target.value }))}
            className="mt-1"
            placeholder="e.g., Aluminum, Steel, Brass"
          />
        </div>

        <div>
          <Label htmlFor="finish">Finish</Label>
          <Input
            id="finish"
            value={hardwareData.finish}
            onChange={(e) => setHardwareData(prev => ({ ...prev, finish: e.target.value }))}
            className="mt-1"
            placeholder="e.g., Chrome, Bronze, White"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dimensions">Dimensions</Label>
          <Input
            id="dimensions"
            value={hardwareData.dimensions}
            onChange={(e) => setHardwareData(prev => ({ ...prev, dimensions: e.target.value }))}
            className="mt-1"
            placeholder="e.g., 200cm x 5cm x 3cm"
          />
        </div>

        <div>
          <Label htmlFor="maxLoad">Max Load Capacity</Label>
          <Input
            id="maxLoad"
            value={hardwareData.maxLoad}
            onChange={(e) => setHardwareData(prev => ({ ...prev, maxLoad: e.target.value }))}
            className="mt-1"
            placeholder="e.g., 50kg"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="installation">Installation Method</Label>
        <Select value={hardwareData.installation} onValueChange={(value) => setHardwareData(prev => ({ ...prev, installation: value }))}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select installation method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wall-mount">Wall Mount</SelectItem>
            <SelectItem value="ceiling-mount">Ceiling Mount</SelectItem>
            <SelectItem value="face-fix">Face Fix</SelectItem>
            <SelectItem value="top-fix">Top Fix</SelectItem>
            <SelectItem value="recess-mount">Recess Mount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="warranty">Warranty Period</Label>
        <Input
          id="warranty"
          value={hardwareData.warranty}
          onChange={(e) => setHardwareData(prev => ({ ...prev, warranty: e.target.value }))}
          className="mt-1"
          placeholder="e.g., 5 years, Lifetime"
        />
      </div>

      <div>
        <Label>Product Image</Label>
        <Card className="mt-2">
          <CardContent className="p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
              />
              <label htmlFor="imageUpload" className="cursor-pointer">
                <div className="text-gray-500">
                  <span className="bg-gray-200 px-3 py-1 rounded text-sm">
                    {hardwareData.image ? hardwareData.image.name : 'no file selected'}
                  </span>
                  <span className="ml-2">upload an image</span>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={hardwareData.description}
          onChange={(e) => setHardwareData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1"
          rows={3}
          placeholder="Detailed description of the hardware item..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="default">
          Save Hardware
        </Button>
      </div>
    </form>
  );
};
