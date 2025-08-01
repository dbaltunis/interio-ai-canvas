
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useVendors, useDeleteVendor } from "@/hooks/useVendors";
import { VendorForm } from "./VendorForm";
import { Edit, Trash2, Mail, Phone, MapPin, Search } from "lucide-react";

export const VendorsList = () => {
  const { data: vendors = [] } = useVendors();
  const deleteVendor = useDeleteVendor();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVendor, setEditingVendor] = useState<any>(null);

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.company_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      deleteVendor.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredVendors.map((vendor) => (
          <Card key={vendor.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{vendor.name}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    {vendor.company_type && (
                      <Badge variant="secondary">{vendor.company_type}</Badge>
                    )}
                    {vendor.city && vendor.state && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {vendor.city}, {vendor.state}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingVendor(vendor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(vendor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Contact</h4>
                  {vendor.contact_person && (
                    <p className="text-sm">{vendor.contact_person}</p>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3" />
                      {vendor.email}
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3" />
                      {vendor.phone}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Terms</h4>
                  {vendor.payment_terms && (
                    <p className="text-sm">Payment: {vendor.payment_terms}</p>
                  )}
                  {vendor.lead_time_days && (
                    <p className="text-sm">Lead time: {vendor.lead_time_days} days</p>
                  )}
                  {vendor.minimum_order_amount && (
                    <p className="text-sm">Min order: ${vendor.minimum_order_amount}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Status</h4>
                  <Badge variant={vendor.active ? "default" : "secondary"}>
                    {vendor.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredVendors.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "No vendors found matching your search." : "No vendors added yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!editingVendor} onOpenChange={() => setEditingVendor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          {editingVendor && (
            <VendorForm 
              vendor={editingVendor}
              onClose={() => setEditingVendor(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
