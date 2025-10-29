import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEyeletRings, useCreateEyeletRing, useUpdateEyeletRing, useDeleteEyeletRing, EyeletRing } from "@/hooks/useEyeletRings";
import { RingDialog } from "@/components/inventory/RingDialog";

export const RingLibrary = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRing, setEditingRing] = useState<EyeletRing | undefined>();

  const { data: rings = [], isLoading } = useEyeletRings();
  const createRing = useCreateEyeletRing();
  const updateRing = useUpdateEyeletRing();
  const deleteRing = useDeleteEyeletRing();

  const handleEdit = (ring: EyeletRing) => {
    setEditingRing(ring);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this ring?")) {
      deleteRing.mutate(id);
    }
  };

  const handleSave = (ring: Partial<EyeletRing>) => {
    if (editingRing) {
      updateRing.mutate({ ...ring, id: editingRing.id });
    } else {
      createRing.mutate(ring as any);
    }
    setEditingRing(undefined);
  };

  const handleAddNew = () => {
    setEditingRing(undefined);
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading rings...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Eyelet Ring Library</h2>
          <p className="text-muted-foreground">Manage your eyelet rings and grommets</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Ring
        </Button>
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rings.map((ring) => (
          <Card key={ring.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {ring.image_url ? (
                <img
                  src={ring.image_url}
                  alt={ring.name}
                  className="w-full h-32 object-cover rounded mb-3"
                />
              ) : (
                <div className="w-full h-32 bg-muted rounded mb-3 flex items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-full border-4"
                    style={{
                      borderColor: ring.color === 'silver' ? '#C0C0C0' :
                                   ring.color === 'gold' ? '#FFD700' :
                                   ring.color === 'bronze' ? '#CD7F32' :
                                   ring.color === 'black' ? '#000000' :
                                   ring.color === 'white' ? '#FFFFFF' : '#C0C0C0'
                    }}
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{ring.name}</h3>
                  {ring.is_default && (
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  )}
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Diameter: {ring.diameter}mm</p>
                  <p>Material: {ring.material}</p>
                  <p>Finish: {ring.finish}</p>
                  {ring.supplier && <p>Supplier: {ring.supplier}</p>}
                </div>

                {ring.selling_price > 0 && (
                  <p className="text-sm font-medium">
                    ${ring.selling_price.toFixed(2)} / unit
                  </p>
                )}

                {!ring.is_default && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEdit(ring)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(ring.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {rings.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p>No eyelet rings found. Add your first ring to get started.</p>
          </div>
        )}
      </div>

      <RingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ring={editingRing}
        onSave={handleSave}
      />
    </div>
  );
};
