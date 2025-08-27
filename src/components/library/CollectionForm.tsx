
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface CollectionFormProps {
  onClose: () => void;
}

export const CollectionForm = ({ onClose }: CollectionFormProps) => {
  const [collectionData, setCollectionData] = useState({
    name: "",
    brand: "",
    season: "",
    year: "",
    theme: "",
    priceRange: "",
    targetMarket: "",
    fabricCount: "",
    launchDate: "",
    discontinued: false,
    image: null as File | null,
    description: "",
    notes: "",
    colorPalette: "",
    designStyle: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Collection data:", collectionData);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCollectionData(prev => ({ ...prev, image: file }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="collectionName">Collection Name *</Label>
          <Input
            id="collectionName"
            value={collectionData.name}
            onChange={(e) => setCollectionData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label>Brand</Label>
          <Select value={collectionData.brand} onValueChange={(value) => setCollectionData(prev => ({ ...prev, brand: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fibre-naturelle">Fibre Naturelle</SelectItem>
              <SelectItem value="kd-design">KD Design</SelectItem>
              <SelectItem value="james-hare">James Hare</SelectItem>
              <SelectItem value="sahco">Sahco</SelectItem>
              <SelectItem value="designers-guild">Designers Guild</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Season</Label>
          <Select value={collectionData.season} onValueChange={(value) => setCollectionData(prev => ({ ...prev, season: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spring">Spring</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
              <SelectItem value="autumn">Autumn</SelectItem>
              <SelectItem value="winter">Winter</SelectItem>
              <SelectItem value="all-year">All Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={collectionData.year}
            onChange={(e) => setCollectionData(prev => ({ ...prev, year: e.target.value }))}
            className="mt-1"
            placeholder="2024"
          />
        </div>

        <div>
          <Label htmlFor="fabricCount">Number of Fabrics</Label>
          <Input
            id="fabricCount"
            type="number"
            value={collectionData.fabricCount}
            onChange={(e) => setCollectionData(prev => ({ ...prev, fabricCount: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="theme">Theme</Label>
          <Input
            id="theme"
            value={collectionData.theme}
            onChange={(e) => setCollectionData(prev => ({ ...prev, theme: e.target.value }))}
            className="mt-1"
            placeholder="e.g., Heritage, Modern, Botanical"
          />
        </div>

        <div>
          <Label>Design Style</Label>
          <Select value={collectionData.designStyle} onValueChange={(value) => setCollectionData(prev => ({ ...prev, designStyle: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select design style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="traditional">Traditional</SelectItem>
              <SelectItem value="contemporary">Contemporary</SelectItem>
              <SelectItem value="modern">Modern</SelectItem>
              <SelectItem value="transitional">Transitional</SelectItem>
              <SelectItem value="minimalist">Minimalist</SelectItem>
              <SelectItem value="maximalist">Maximalist</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Price Range</Label>
          <Select value={collectionData.priceRange} onValueChange={(value) => setCollectionData(prev => ({ ...prev, priceRange: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select price range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="luxury">Luxury ($200+)</SelectItem>
              <SelectItem value="premium">Premium ($100-200)</SelectItem>
              <SelectItem value="mid-range">Mid-Range ($50-100)</SelectItem>
              <SelectItem value="budget">Budget (Under $50)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Target Market</Label>
          <Select value={collectionData.targetMarket} onValueChange={(value) => setCollectionData(prev => ({ ...prev, targetMarket: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select target market" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="hospitality">Hospitality</SelectItem>
              <SelectItem value="both">Residential & Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="colorPalette">Color Palette</Label>
        <Input
          id="colorPalette"
          value={collectionData.colorPalette}
          onChange={(e) => setCollectionData(prev => ({ ...prev, colorPalette: e.target.value }))}
          className="mt-1"
          placeholder="e.g., Earth tones, Pastels, Bold jewel tones"
        />
      </div>

      <div>
        <Label htmlFor="launchDate">Launch Date</Label>
        <Input
          id="launchDate"
          type="date"
          value={collectionData.launchDate}
          onChange={(e) => setCollectionData(prev => ({ ...prev, launchDate: e.target.value }))}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Collection Image</Label>
        <Card className="mt-2">
          <CardContent className="p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="collectionImageUpload"
              />
              <label htmlFor="collectionImageUpload" className="cursor-pointer">
                <div className="text-gray-500">
                  <span className="bg-gray-200 px-3 py-1 rounded text-sm">
                    {collectionData.image ? collectionData.image.name : "no file selected"}
                  </span>
                  <span className="ml-2">upload collection image</span>
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
          value={collectionData.description}
          onChange={(e) => setCollectionData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1"
          rows={3}
          placeholder="Collection inspiration, key features, and design philosophy..."
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={collectionData.notes}
          onChange={(e) => setCollectionData(prev => ({ ...prev, notes: e.target.value }))}
          className="mt-1"
          rows={3}
          placeholder="Additional notes about this collection..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-slate-600 hover:bg-slate-700">
          Save Collection
        </Button>
      </div>
    </form>
  );
};
