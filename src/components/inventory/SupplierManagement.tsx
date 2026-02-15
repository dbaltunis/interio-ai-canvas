
import { useState } from "react";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useAllVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from "@/hooks/useVendors";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Edit, Trash2, Mail, Phone, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const emptyForm = {
  name: "",
  contact_person: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  payment_terms: "",
  lead_time_days: "",
  notes: "",
  active: true,
};

export const SupplierManagement = () => {
  const { data: vendors = [], isLoading } = useAllVendors();
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();
  const confirm = useConfirmDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    const payload = {
      name: formData.name.trim(),
      contact_person: formData.contact_person || null,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      website: formData.website || null,
      payment_terms: formData.payment_terms || null,
      lead_time_days: formData.lead_time_days ? parseInt(formData.lead_time_days) : null,
      active: formData.active,
    };

    if (editingId) {
      await updateVendor.mutateAsync({ id: editingId, ...payload });
    } else {
      await createVendor.mutateAsync(payload);
    }

    closeDialog();
  };

  const handleEdit = (vendor: any) => {
    setEditingId(vendor.id);
    setFormData({
      name: vendor.name || "",
      contact_person: vendor.contact_person || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      address: vendor.address || "",
      website: vendor.website || "",
      payment_terms: vendor.payment_terms || "",
      lead_time_days: vendor.lead_time_days?.toString() || "",
      notes: "",
      active: vendor.active !== false,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Supplier",
      description: "Are you sure you want to delete this supplier? This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;
    await deleteVendor.mutateAsync(id);
  };

  const handleToggleActive = async (vendor: any) => {
    await updateVendor.mutateAsync({ id: vendor.id, active: !vendor.active });
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading suppliers...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Your Suppliers</h4>
          <p className="text-sm text-muted-foreground">
            Manage supplier contact details for ordering. These appear in batch order creation.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      {vendors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium">No suppliers yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first supplier to start creating orders.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {vendors.map((vendor: any) => (
            <Card key={vendor.id} className={vendor.active === false ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Switch
                      checked={vendor.active !== false}
                      onCheckedChange={() => handleToggleActive(vendor)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-medium truncate">{vendor.name}</h5>
                        {vendor.payment_terms && (
                          <Badge variant="secondary" className="text-xs">
                            {vendor.payment_terms}
                          </Badge>
                        )}
                        {vendor.lead_time_days && (
                          <Badge variant="outline" className="text-xs">
                            {vendor.lead_time_days}d lead time
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                        {vendor.contact_person && (
                          <span>{vendor.contact_person}</span>
                        )}
                        {vendor.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {vendor.email}
                          </span>
                        )}
                        {vendor.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {vendor.phone}
                          </span>
                        )}
                        {vendor.website && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {vendor.website}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(vendor)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(vendor.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setDialogOpen(true); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., TWC, Norman, CW Systems"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="orders@supplier.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+61 3 9000 0000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://supplier.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Terms</Label>
                <Input
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  placeholder="e.g., Net 30, COD, Account"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lead Time (days)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.lead_time_days}
                  onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
                  placeholder="e.g., 14"
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Industrial Ave"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name.trim() || createVendor.isPending || updateVendor.isPending}>
                {createVendor.isPending || updateVendor.isPending ? "Saving..." : editingId ? "Update Supplier" : "Add Supplier"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
