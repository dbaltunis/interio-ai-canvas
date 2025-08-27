
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface BrandFormProps {
  onClose: () => void;
}

export const BrandForm = ({ onClose }: BrandFormProps) => {
  const [brandData, setBrandData] = useState({
    name: "",
    country: "",
    website: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    brandType: "",
    specialties: "",
    priceRange: "",
    qualityLevel: "",
    leadTime: "",
    minimumOrder: "",
    paymentTerms: "",
    tradeProfessional: false,
    logo: null as File | null,
    description: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Brand data:", brandData);
    onClose();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBrandData(prev => ({ ...prev, logo: file }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="brandName">Brand Name *</Label>
          <Input
            id="brandName"
            value={brandData.name}
            onChange={(e) => setBrandData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="country">Country of Origin</Label>
          <Input
            id="country"
            value={brandData.country}
            onChange={(e) => setBrandData(prev => ({ ...prev, country: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Brand Type</Label>
          <Select value={brandData.brandType} onValueChange={(value) => setBrandData(prev => ({ ...prev, brandType: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select brand type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="luxury">Luxury</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="mid-range">Mid-Range</SelectItem>
              <SelectItem value="budget">Budget</SelectItem>
              <SelectItem value="trade-only">Trade Only</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Quality Level</Label>
          <Select value={brandData.qualityLevel} onValueChange={(value) => setBrandData(prev => ({ ...prev, qualityLevel: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select quality level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exceptional">Exceptional</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={brandData.website}
          onChange={(e) => setBrandData(prev => ({ ...prev, website: e.target.value }))}
          className="mt-1"
          placeholder="https://example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            value={brandData.contactPerson}
            onChange={(e) => setBrandData(prev => ({ ...prev, contactPerson: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={brandData.email}
            onChange={(e) => setBrandData(prev => ({ ...prev, email: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={brandData.phone}
            onChange={(e) => setBrandData(prev => ({ ...prev, phone: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="leadTime">Lead Time (days)</Label>
          <Input
            id="leadTime"
            type="number"
            value={brandData.leadTime}
            onChange={(e) => setBrandData(prev => ({ ...prev, leadTime: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={brandData.address}
          onChange={(e) => setBrandData(prev => ({ ...prev, address: e.target.value }))}
          className="mt-1"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="specialties">Specialties</Label>
        <Input
          id="specialties"
          value={brandData.specialties}
          onChange={(e) => setBrandData(prev => ({ ...prev, specialties: e.target.value }))}
          className="mt-1"
          placeholder="e.g., Luxury silks, Natural fibers, Fire-retardant fabrics"
        />
      </div>

      <div>
        <Label>Brand Logo</Label>
        <Card className="mt-2">
          <CardContent className="p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logoUpload"
              />
              <label htmlFor="logoUpload" className="cursor-pointer">
                <div className="text-gray-500">
                  <span className="bg-gray-200 px-3 py-1 rounded text-sm">
                    {brandData.logo ? brandData.logo.name : "no file selected"}
                  </span>
                  <span className="ml-2">upload logo</span>
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
          value={brandData.description}
          onChange={(e) => setBrandData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1"
          rows={3}
          placeholder="Brand history, philosophy, and key characteristics..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-slate-600 hover:bg-slate-700">
          Save Brand
        </Button>
      </div>
    </form>
  );
};
