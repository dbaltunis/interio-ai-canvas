
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateVendor, useUpdateVendor } from "@/hooks/useVendors";

interface VendorFormProps {
  vendor?: any;
  onClose: () => void;
}

export const VendorForm = ({ vendor, onClose }: VendorFormProps) => {
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  
  const [vendorData, setVendorData] = useState({
    name: "",
    company_type: "supplier",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "US",
    website: "",
    payment_terms: "Net 30",
    lead_time_days: 7,
    minimum_order_amount: 0,
    active: true
  });

  useEffect(() => {
    if (vendor) {
      setVendorData(vendor);
    }
  }, [vendor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (vendor) {
      updateVendor.mutate({ id: vendor.id, ...vendorData }, {
        onSuccess: () => onClose()
      });
    } else {
      createVendor.mutate(vendorData, {
        onSuccess: () => onClose()
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Vendor Name *</Label>
          <Input
            id="name"
            value={vendorData.name}
            onChange={(e) => setVendorData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label>Company Type</Label>
          <Select 
            value={vendorData.company_type} 
            onValueChange={(value) => setVendorData(prev => ({ ...prev, company_type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supplier">Supplier</SelectItem>
              <SelectItem value="manufacturer">Manufacturer</SelectItem>
              <SelectItem value="distributor">Distributor</SelectItem>
              <SelectItem value="wholesaler">Wholesaler</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            value={vendorData.contact_person}
            onChange={(e) => setVendorData(prev => ({ ...prev, contact_person: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={vendorData.email}
            onChange={(e) => setVendorData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={vendorData.phone}
            onChange={(e) => setVendorData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={vendorData.website}
            onChange={(e) => setVendorData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={vendorData.address}
          onChange={(e) => setVendorData(prev => ({ ...prev, address: e.target.value }))}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={vendorData.city}
            onChange={(e) => setVendorData(prev => ({ ...prev, city: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={vendorData.state}
            onChange={(e) => setVendorData(prev => ({ ...prev, state: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="zip_code">Zip Code</Label>
          <Input
            id="zip_code"
            value={vendorData.zip_code}
            onChange={(e) => setVendorData(prev => ({ ...prev, zip_code: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Payment Terms</Label>
          <Select 
            value={vendorData.payment_terms} 
            onValueChange={(value) => setVendorData(prev => ({ ...prev, payment_terms: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Net 15">Net 15</SelectItem>
              <SelectItem value="Net 30">Net 30</SelectItem>
              <SelectItem value="Net 60">Net 60</SelectItem>
              <SelectItem value="COD">Cash on Delivery</SelectItem>
              <SelectItem value="Prepaid">Prepaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="lead_time_days">Lead Time (days)</Label>
          <Input
            id="lead_time_days"
            type="number"
            value={vendorData.lead_time_days}
            onChange={(e) => setVendorData(prev => ({ ...prev, lead_time_days: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="minimum_order_amount">Minimum Order Amount</Label>
        <Input
          id="minimum_order_amount"
          type="number"
          step="0.01"
          value={vendorData.minimum_order_amount}
          onChange={(e) => setVendorData(prev => ({ ...prev, minimum_order_amount: parseFloat(e.target.value) || 0 }))}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={vendorData.active}
          onCheckedChange={(checked) => setVendorData(prev => ({ ...prev, active: checked }))}
        />
        <Label htmlFor="active">Active vendor</Label>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {vendor ? "Update" : "Create"} Vendor
        </Button>
      </div>
    </form>
  );
};
