
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface HardwareFormProps {
  onClose: () => void;
}

export const HardwareForm = ({ onClose }: HardwareFormProps) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Hardware data:", hardwareData);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHardwareData(prev => ({ ...prev, image: file }));
    }
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
              <SelectItem value="curtain-poles">Curtain Poles</SelectItem>
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
          <Label htmlFor="price">Price</Label>
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
                  <span className="bg-gray-200 px-3 py-1 rounded text-sm">no file selected</span>
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
