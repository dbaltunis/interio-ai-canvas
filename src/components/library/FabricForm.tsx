
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";

interface FabricFormProps {
  onClose: () => void;
}

export const FabricForm = ({ onClose }: FabricFormProps) => {
  const [fabricData, setFabricData] = useState({
    name: "",
    code: "",
    width: "",
    patternRepeatV: "",
    patternRepeatH: "",
    weight: "",
    tags: "",
    description: "",
    image: null as File | null,
    isRollerBlind: "no",
    confidentialPrice: "",
    retailPrice: "",
    rollDirection: "vertical",
    allowDirectionChange: "no",
    trackStocks: "no",
    brand: "",
    collection: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
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
      <div className="space-y-4">
        <div>
          <Label htmlFor="fabricName">Fabric name</Label>
          <Input
            id="fabricName"
            value={fabricData.name}
            onChange={(e) => setFabricData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="fabricCode">Fabric code</Label>
          <Input
            id="fabricCode"
            value={fabricData.code}
            onChange={(e) => setFabricData(prev => ({ ...prev, code: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="fabricWidth">Fabric width (cm)</Label>
          <Input
            id="fabricWidth"
            type="number"
            value={fabricData.width}
            onChange={(e) => setFabricData(prev => ({ ...prev, width: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="patternRepeatV">Pattern repeat (V) (cm)</Label>
          <Input
            id="patternRepeatV"
            type="number"
            value={fabricData.patternRepeatV}
            onChange={(e) => setFabricData(prev => ({ ...prev, patternRepeatV: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="patternRepeatH">Pattern repeat (H) (cm)</Label>
          <Input
            id="patternRepeatH"
            type="number"
            value={fabricData.patternRepeatH}
            onChange={(e) => setFabricData(prev => ({ ...prev, patternRepeatH: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="fabricWeight">Fabric weight</Label>
          <Input
            id="fabricWeight"
            value={fabricData.weight}
            onChange={(e) => setFabricData(prev => ({ ...prev, weight: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={fabricData.tags}
            onChange={(e) => setFabricData(prev => ({ ...prev, tags: e.target.value }))}
            className="mt-1"
            placeholder="Enter tags separated by commas"
          />
        </div>

        <div>
          <Label htmlFor="description">Fabric description (0/500)</Label>
          <textarea
            id="description"
            value={fabricData.description}
            onChange={(e) => setFabricData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 w-full p-2 border rounded-md resize-none h-24"
            maxLength={500}
          />
        </div>

        <div>
          <Label>Fabric image</Label>
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
          <Label>Is this a roller blind fabric?</Label>
          <RadioGroup
            value={fabricData.isRollerBlind}
            onValueChange={(value) => setFabricData(prev => ({ ...prev, isRollerBlind: value }))}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="rollerNo" />
              <Label htmlFor="rollerNo">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="rollerYes" />
              <Label htmlFor="rollerYes">Yes</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="confidentialPrice">Confidential price excl. VAT (Optional)</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="confidentialPrice"
              type="number"
              step="0.01"
              value={fabricData.confidentialPrice}
              onChange={(e) => setFabricData(prev => ({ ...prev, confidentialPrice: e.target.value }))}
              className="pl-8"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="retailPrice">Recommended retail price including tax</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="retailPrice"
              type="number"
              step="0.01"
              value={fabricData.retailPrice}
              onChange={(e) => setFabricData(prev => ({ ...prev, retailPrice: e.target.value }))}
              className="pl-8"
            />
          </div>
        </div>

        <div>
          <Label>Roll direction</Label>
          <Select value={fabricData.rollDirection} onValueChange={(value) => setFabricData(prev => ({ ...prev, rollDirection: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vertical">Vertical</SelectItem>
              <SelectItem value="horizontal">Horizontal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Allow fabric roll direction changes?</Label>
          <RadioGroup
            value={fabricData.allowDirectionChange}
            onValueChange={(value) => setFabricData(prev => ({ ...prev, allowDirectionChange: value }))}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="directionNo" />
              <Label htmlFor="directionNo">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="directionYes" />
              <Label htmlFor="directionYes">Yes</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label>Track Fabric Stocks?</Label>
          <RadioGroup
            value={fabricData.trackStocks}
            onValueChange={(value) => setFabricData(prev => ({ ...prev, trackStocks: value }))}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="trackNo" />
              <Label htmlFor="trackNo">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="trackYes" />
              <Label htmlFor="trackYes">Yes</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label>Select a brand (Optional)</Label>
          <Select value={fabricData.brand} onValueChange={(value) => setFabricData(prev => ({ ...prev, brand: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fibre-naturelle">Fibre Naturelle</SelectItem>
              <SelectItem value="kd-design">KD Design</SelectItem>
              <SelectItem value="dekoma">DEKOMA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Select Collection (Optional)</Label>
          <Select value={fabricData.collection} onValueChange={(value) => setFabricData(prev => ({ ...prev, collection: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a collection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="collection1">Collection 1</SelectItem>
              <SelectItem value="collection2">Collection 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-slate-600 hover:bg-slate-700">
          Save
        </Button>
      </div>
    </form>
  );
};
