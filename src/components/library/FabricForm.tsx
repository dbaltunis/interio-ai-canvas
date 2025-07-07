import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface FabricFormProps {
  onClose: () => void;
}

export const FabricForm = ({ onClose }: FabricFormProps) => {
  const { units, getFabricUnitLabel } = useMeasurementUnits();
  
  const [fabricData, setFabricData] = useState({
    name: "",
    code: "",
    vendor: "",
    category: "",
    collection: "",
    pattern: "",
    price: "",
    unit: units.fabric as string,
    inStock: "",
    reorderPoint: "",
    location: "",
    composition: "",
    width: "",
    patternRepeat: "",
    careInstructions: "",
    flameRetardant: false,
    colorways: "",
    leadTime: "",
    minimumOrder: "",
    image: null as File | null,
    description: "",
    weight: "",
    durability: "",
    lightFastness: ""
  });

  const formatCurrency = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    return currencySymbols[units.currency] || units.currency;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Fabric data:", fabricData);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFabricData(prev => ({ ...prev, image: file }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fabricName">Fabric Name *</Label>
          <Input
            id="fabricName"
            value={fabricData.name}
            onChange={(e) => setFabricData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="fabricCode">Fabric Code</Label>
          <Input
            id="fabricCode"
            value={fabricData.code}
            onChange={(e) => setFabricData(prev => ({ ...prev, code: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select value={fabricData.category} onValueChange={(value) => setFabricData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upholstery">Upholstery Fabrics</SelectItem>
              <SelectItem value="drapery">Drapery Fabrics</SelectItem>
              <SelectItem value="sheers">Sheer Fabrics</SelectItem>
              <SelectItem value="blackout">Blackout Fabrics</SelectItem>
              <SelectItem value="outdoor">Outdoor Fabrics</SelectItem>
              <SelectItem value="commercial">Commercial Fabrics</SelectItem>
              <SelectItem value="luxury">Luxury Fabrics</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Pattern Type</Label>
          <Select value={fabricData.pattern} onValueChange={(value) => setFabricData(prev => ({ ...prev, pattern: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select pattern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="striped">Striped</SelectItem>
              <SelectItem value="floral">Floral</SelectItem>
              <SelectItem value="geometric">Geometric</SelectItem>
              <SelectItem value="paisley">Paisley</SelectItem>
              <SelectItem value="damask">Damask</SelectItem>
              <SelectItem value="toile">Toile</SelectItem>
              <SelectItem value="abstract">Abstract</SelectItem>
              <SelectItem value="textured">Textured</SelectItem>
              <SelectItem value="plaid">Plaid/Check</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Vendor/Supplier</Label>
          <Select value={fabricData.vendor} onValueChange={(value) => setFabricData(prev => ({ ...prev, vendor: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fibre-naturelle">Fibre Naturelle</SelectItem>
              <SelectItem value="kd-design">KD Design</SelectItem>
              <SelectItem value="james-hare">James Hare</SelectItem>
              <SelectItem value="sahco">Sahco</SelectItem>
              <SelectItem value="designers-guild">Designers Guild</SelectItem>
              <SelectItem value="clarke-clarke">Clarke & Clarke</SelectItem>
              <SelectItem value="sanderson">Sanderson</SelectItem>
              <SelectItem value="ralph-lauren">Ralph Lauren Home</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="collection">Collection</Label>
          <Input
            id="collection"
            value={fabricData.collection}
            onChange={(e) => setFabricData(prev => ({ ...prev, collection: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price">Price per Unit</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {formatCurrency(0).replace('0.00', '')}
            </span>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={fabricData.price}
              onChange={(e) => setFabricData(prev => ({ ...prev, price: e.target.value }))}
              className="pl-8"
            />
          </div>
        </div>

        <div>
          <Label>Unit</Label>
          <Select value={fabricData.unit} onValueChange={(value) => setFabricData(prev => ({ ...prev, unit: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={units.fabric}>{getFabricUnitLabel()}</SelectItem>
              <SelectItem value="m">Meter</SelectItem>
              <SelectItem value="yards">Yards</SelectItem>
              <SelectItem value="roll">Roll</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="inStock">Current Stock ({getFabricUnitLabel()})</Label>
          <Input
            id="inStock"
            type="number"
            step="0.1"
            value={fabricData.inStock}
            onChange={(e) => setFabricData(prev => ({ ...prev, inStock: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reorderPoint">Reorder Point</Label>
          <Input
            id="reorderPoint"
            type="number"
            step="0.1"
            value={fabricData.reorderPoint}
            onChange={(e) => setFabricData(prev => ({ ...prev, reorderPoint: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="location">Storage Location</Label>
          <Input
            id="location"
            value={fabricData.location}
            onChange={(e) => setFabricData(prev => ({ ...prev, location: e.target.value }))}
            className="mt-1"
            placeholder="e.g., Warehouse A-12"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="composition">Composition</Label>
          <Input
            id="composition"
            value={fabricData.composition}
            onChange={(e) => setFabricData(prev => ({ ...prev, composition: e.target.value }))}
            className="mt-1"
            placeholder="e.g., 100% Linen"
          />
        </div>

        <div>
          <Label htmlFor="width">Fabric Width</Label>
          <Input
            id="width"
            value={fabricData.width}
            onChange={(e) => setFabricData(prev => ({ ...prev, width: e.target.value }))}
            className="mt-1"
            placeholder="e.g., 137cm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patternRepeat">Pattern Repeat</Label>
          <Input
            id="patternRepeat"
            value={fabricData.patternRepeat}
            onChange={(e) => setFabricData(prev => ({ ...prev, patternRepeat: e.target.value }))}
            className="mt-1"
            placeholder="e.g., 64cm"
          />
        </div>

        <div>
          <Label htmlFor="weight">Weight (GSM)</Label>
          <Input
            id="weight"
            value={fabricData.weight}
            onChange={(e) => setFabricData(prev => ({ ...prev, weight: e.target.value }))}
            className="mt-1"
            placeholder="e.g., 350 GSM"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="colorways">Available Colorways</Label>
        <Input
          id="colorways"
          value={fabricData.colorways}
          onChange={(e) => setFabricData(prev => ({ ...prev, colorways: e.target.value }))}
          className="mt-1"
          placeholder="e.g., Red, Blue, Green, Natural"
        />
      </div>

      <div>
        <Label>Fabric Image</Label>
        <Card className="mt-2">
          <CardContent className="p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="fabricImageUpload"
              />
              <label htmlFor="fabricImageUpload" className="cursor-pointer">
                <div className="text-gray-500">
                  <span className="bg-gray-200 px-3 py-1 rounded text-sm">
                    {fabricData.image ? fabricData.image.name : "no file selected"}
                  </span>
                  <span className="ml-2">upload fabric image</span>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Label htmlFor="careInstructions">Care Instructions</Label>
        <Textarea
          id="careInstructions"
          value={fabricData.careInstructions}
          onChange={(e) => setFabricData(prev => ({ ...prev, careInstructions: e.target.value }))}
          className="mt-1"
          rows={3}
          placeholder="Care and maintenance instructions..."
        />
      </div>

      <div>
        <Label htmlFor="description">Description & Notes</Label>
        <Textarea
          id="description"
          value={fabricData.description}
          onChange={(e) => setFabricData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1"
          rows={3}
          placeholder="Additional details about this fabric..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-slate-600 hover:bg-slate-700">
          Save Fabric
        </Button>
      </div>
    </form>
  );
};
