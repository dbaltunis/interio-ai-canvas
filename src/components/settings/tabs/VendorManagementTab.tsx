
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Edit, Phone, Mail, MapPin, Package, DollarSign } from "lucide-react";

export const VendorManagementTab = () => {
  const vendors = [
    {
      id: 1,
      name: "Premium Fabrics Australia",
      contact: "Sarah Johnson",
      email: "orders@premiumfabrics.com.au",
      phone: "+61 3 9876 5432",
      location: "Melbourne, VIC",
      rating: 4.8,
      productCategories: ["Fabrics", "Trims"],
      paymentTerms: "Net 30",
      leadTime: "5-7 days",
      discount: "15%"
    },
    {
      id: 2,
      name: "AutoTrack Systems",
      contact: "Michael Chen",
      email: "sales@autotrack.com.au",
      phone: "+61 2 8765 4321",
      location: "Sydney, NSW",
      rating: 4.6,
      productCategories: ["Motorised Tracks", "Hardware"],
      paymentTerms: "Net 14",
      leadTime: "10-14 days",
      discount: "20%"
    },
    {
      id: 3,
      name: "Quality Blinds Supply",
      contact: "Emma Wilson",
      email: "info@qualityblinds.com.au",
      phone: "+61 7 6543 2109",
      location: "Brisbane, QLD",
      rating: 4.9,
      productCategories: ["Blinds", "Shutters", "Hardware"],
      paymentTerms: "Net 21",
      leadTime: "3-5 days",
      discount: "12%"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Vendor Management</h3>
          <p className="text-sm text-brand-neutral">Manage your suppliers and their product catalogs</p>
        </div>
        <Button className="bg-brand-primary hover:bg-brand-accent">
          <Plus className="h-4 w-4 mr-2" />
          Add New Vendor
        </Button>
      </div>

      {/* Vendor Cards */}
      <div className="grid gap-6">
        {vendors.map((vendor) => (
          <Card key={vendor.id} className="border-brand-secondary/20">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-brand-primary">{vendor.name}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      {vendor.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-brand-neutral" />
                      {vendor.location}
                    </span>
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-brand-primary flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Contact:</span> {vendor.contact}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {vendor.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {vendor.phone}
                    </div>
                  </div>
                </div>

                {/* Product Categories */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-brand-primary flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Products
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {vendor.productCategories.map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Business Terms */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-brand-primary flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Terms
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Payment:</span> {vendor.paymentTerms}
                    </div>
                    <div>
                      <span className="font-medium">Lead Time:</span> {vendor.leadTime}
                    </div>
                    <div>
                      <span className="font-medium">Discount:</span> 
                      <Badge variant="outline" className="ml-2 text-green-700">
                        {vendor.discount}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Add Vendor Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Vendor</CardTitle>
          <CardDescription>Register a new supplier in your system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendorName">Vendor Name</Label>
              <Input id="vendorName" placeholder="Company Name Pty Ltd" />
            </div>
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input id="contactPerson" placeholder="John Smith" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendorEmail">Email</Label>
              <Input id="vendorEmail" type="email" placeholder="orders@vendor.com" />
            </div>
            <div>
              <Label htmlFor="vendorPhone">Phone</Label>
              <Input id="vendorPhone" type="tel" placeholder="+61 2 1234 5678" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input id="paymentTerms" placeholder="Net 30" />
            </div>
            <div>
              <Label htmlFor="leadTime">Lead Time</Label>
              <Input id="leadTime" placeholder="7-10 days" />
            </div>
            <div>
              <Label htmlFor="discount">Discount (%)</Label>
              <Input id="discount" type="number" step="0.1" placeholder="15.0" />
            </div>
          </div>

          <Button className="bg-brand-primary hover:bg-brand-accent">
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
