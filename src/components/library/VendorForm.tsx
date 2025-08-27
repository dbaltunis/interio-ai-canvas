
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface VendorFormProps {
  onClose: () => void;
}

export const VendorForm = ({ onClose }: VendorFormProps) => {
  const [vendorData, setVendorData] = useState({
    name: "",
    type: "",
    country: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    taxId: "",
    paymentTerms: "",
    leadTime: "",
    minimumOrder: "",
    notes: "",
    specialties: "",
    certifications: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Vendor data:", vendorData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vendorName">Vendor/Supplier Name *</Label>
          <Input
            id="vendorName"
            value={vendorData.name}
            onChange={(e) => setVendorData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label>Vendor Type</Label>
          <Select value={vendorData.type} onValueChange={(value) => setVendorData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select vendor type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fabric-supplier">Fabric Supplier</SelectItem>
              <SelectItem value="fabric-manufacturer">Fabric Manufacturer</SelectItem>
              <SelectItem value="hardware-supplier">Hardware Supplier</SelectItem>
              <SelectItem value="track-systems">Track Systems</SelectItem>
              <SelectItem value="motorized-systems">Motorized Systems</SelectItem>
              <SelectItem value="trim-supplier">Trim & Accessories</SelectItem>
              <SelectItem value="wallpaper-supplier">Wallpaper Supplier</SelectItem>
              <SelectItem value="upholstery-supplier">Upholstery Supplier</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            value={vendorData.contactPerson}
            onChange={(e) => setVendorData(prev => ({ ...prev, contactPerson: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={vendorData.country}
            onChange={(e) => setVendorData(prev => ({ ...prev, country: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={vendorData.email}
            onChange={(e) => setVendorData(prev => ({ ...prev, email: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={vendorData.phone}
            onChange={(e) => setVendorData(prev => ({ ...prev, phone: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={vendorData.website}
          onChange={(e) => setVendorData(prev => ({ ...prev, website: e.target.value }))}
          className="mt-1"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={vendorData.address}
          onChange={(e) => setVendorData(prev => ({ ...prev, address: e.target.value }))}
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="taxId">Tax ID / VAT Number</Label>
          <Input
            id="taxId"
            value={vendorData.taxId}
            onChange={(e) => setVendorData(prev => ({ ...prev, taxId: e.target.value }))}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="paymentTerms">Payment Terms</Label>
          <Select value={vendorData.paymentTerms} onValueChange={(value) => setVendorData(prev => ({ ...prev, paymentTerms: value }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select payment terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="net-15">Net 15</SelectItem>
              <SelectItem value="net-30">Net 30</SelectItem>
              <SelectItem value="net-60">Net 60</SelectItem>
              <SelectItem value="cod">Cash on Delivery</SelectItem>
              <SelectItem value="prepaid">Prepaid</SelectItem>
              <SelectItem value="credit-card">Credit Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="leadTime">Lead Time (days)</Label>
          <Input
            id="leadTime"
            type="number"
            value={vendorData.leadTime}
            onChange={(e) => setVendorData(prev => ({ ...prev, leadTime: e.target.value }))}
            className="mt-1"
            placeholder="e.g., 14"
          />
        </div>

        <div>
          <Label htmlFor="minimumOrder">Minimum Order Value</Label>
          <Input
            id="minimumOrder"
            type="number"
            step="0.01"
            value={vendorData.minimumOrder}
            onChange={(e) => setVendorData(prev => ({ ...prev, minimumOrder: e.target.value }))}
            className="mt-1"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="specialties">Specialties</Label>
        <Input
          id="specialties"
          value={vendorData.specialties}
          onChange={(e) => setVendorData(prev => ({ ...prev, specialties: e.target.value }))}
          className="mt-1"
          placeholder="e.g., Luxury fabrics, Fire-retardant materials, Custom prints"
        />
      </div>

      <div>
        <Label htmlFor="certifications">Certifications</Label>
        <Input
          id="certifications"
          value={vendorData.certifications}
          onChange={(e) => setVendorData(prev => ({ ...prev, certifications: e.target.value }))}
          className="mt-1"
          placeholder="e.g., OEKO-TEX, Greenguard, ISO 9001"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={vendorData.notes}
          onChange={(e) => setVendorData(prev => ({ ...prev, notes: e.target.value }))}
          className="mt-1"
          rows={3}
          placeholder="Additional notes about this vendor..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="default">
          Save Vendor
        </Button>
      </div>
    </form>
  );
};
