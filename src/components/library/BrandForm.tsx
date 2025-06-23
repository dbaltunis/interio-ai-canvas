
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BrandFormProps {
  onClose: () => void;
}

export const BrandForm = ({ onClose }: BrandFormProps) => {
  const [brandData, setBrandData] = useState({
    name: "",
    description: "",
    website: "",
    logo: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Brand data:", brandData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="brandName">Brand name</Label>
          <Input
            id="brandName"
            value={brandData.name}
            onChange={(e) => setBrandData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="brandDescription">Description</Label>
          <textarea
            id="brandDescription"
            value={brandData.description}
            onChange={(e) => setBrandData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 w-full p-2 border rounded-md resize-none h-24"
          />
        </div>

        <div>
          <Label htmlFor="brandWebsite">Website</Label>
          <Input
            id="brandWebsite"
            type="url"
            value={brandData.website}
            onChange={(e) => setBrandData(prev => ({ ...prev, website: e.target.value }))}
            className="mt-1"
            placeholder="https://example.com"
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
