
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CollectionFormProps {
  onClose: () => void;
}

export const CollectionForm = ({ onClose }: CollectionFormProps) => {
  const [collectionData, setCollectionData] = useState({
    name: "",
    description: "",
    brand: "",
    year: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Collection data:", collectionData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="collectionName">Collection name</Label>
          <Input
            id="collectionName"
            value={collectionData.name}
            onChange={(e) => setCollectionData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="collectionDescription">Description</Label>
          <textarea
            id="collectionDescription"
            value={collectionData.description}
            onChange={(e) => setCollectionData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 w-full p-2 border rounded-md resize-none h-24"
          />
        </div>

        <div>
          <Label>Select Brand</Label>
          <Select value={collectionData.brand} onValueChange={(value) => setCollectionData(prev => ({ ...prev, brand: value }))}>
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
          <Label htmlFor="collectionYear">Year</Label>
          <Input
            id="collectionYear"
            type="number"
            value={collectionData.year}
            onChange={(e) => setCollectionData(prev => ({ ...prev, year: e.target.value }))}
            className="mt-1"
            placeholder="2024"
          />
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
