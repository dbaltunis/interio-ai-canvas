import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Square, Plus, Edit, Trash2 } from "lucide-react";
import { useSurfaces, useCreateSurface, useUpdateSurface, useDeleteSurface } from "@/hooks/useSurfaces";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WindowManagementSectionProps {
  projectId: string;
  rooms: any[];
}

export const WindowManagementSection = ({ projectId, rooms }: WindowManagementSectionProps) => {
  const { data: surfaces, isLoading } = useSurfaces(projectId);
  const createSurface = useCreateSurface();
  const updateSurface = useUpdateSurface();
  const deleteSurface = useDeleteSurface();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSurface, setEditingSurface] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    surface_type: "window",
    room_id: "",
    width: 60,
    height: 48
  });

  const handleCreateSurface = async () => {
    if (!formData.room_id || !formData.name) return;
    
    try {
      await createSurface.mutateAsync({
        ...formData,
        project_id: projectId,
        surface_width: formData.width,
        surface_height: formData.height
      });
      setShowAddDialog(false);
      setFormData({ name: "", surface_type: "window", room_id: "", width: 60, height: 48 });
    } catch (error) {
      console.error("Failed to create surface:", error);
    }
  };

  const handleUpdateSurface = async () => {
    if (!editingSurface || !formData.name) return;
    
    try {
      await updateSurface.mutateAsync({
        id: editingSurface.id,
        name: formData.name,
        width: formData.width,
        height: formData.height,
        surface_width: formData.width,
        surface_height: formData.height
      });
      setEditingSurface(null);
      setFormData({ name: "", surface_type: "window", room_id: "", width: 60, height: 48 });
    } catch (error) {
      console.error("Failed to update surface:", error);
    }
  };

  const handleDeleteSurface = async (surfaceId: string) => {
    if (!confirm("Delete this surface? This action cannot be undone.")) return;
    
    try {
      await deleteSurface.mutateAsync(surfaceId);
    } catch (error) {
      console.error("Failed to delete surface:", error);
    }
  };

  const startEdit = (surface: any) => {
    setEditingSurface(surface);
    setFormData({
      name: surface.name,
      surface_type: surface.surface_type,
      room_id: surface.room_id,
      width: surface.width || 60,
      height: surface.height || 48
    });
  };

  const getRoomName = (roomId: string) => {
    return rooms.find(r => r.id === roomId)?.name || "Unknown Room";
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading surfaces...</div>;
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Window & Surface Management
          </CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Surface
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Surface</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="room">Room</Label>
                  <Select value={formData.room_id} onValueChange={(value) => setFormData({...formData, room_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Window 1, Main Wall"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.surface_type} onValueChange={(value) => setFormData({...formData, surface_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="window">Window</SelectItem>
                      <SelectItem value="wall">Wall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">Width (inches)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={formData.width}
                      onChange={(e) => setFormData({...formData, width: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (inches)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateSurface} disabled={!formData.room_id || !formData.name}>
                    Create Surface
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!surfaces || surfaces.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No surfaces created yet</p>
            <p className="text-sm">Add windows and walls to start configuring treatments</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {surfaces.map((surface) => (
              <Card key={surface.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {surface.surface_type === 'window' ? (
                        <Home className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4 text-secondary" />
                      )}
                      <div>
                        <h4 className="font-medium">{surface.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {getRoomName(surface.room_id)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {surface.width || 60}" × {surface.height || 48}"
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(surface)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSurface(surface.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingSurface} onOpenChange={() => setEditingSurface(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Surface</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-width">Width (inches)</Label>
                  <Input
                    id="edit-width"
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({...formData, width: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-height">Height (inches)</Label>
                  <Input
                    id="edit-height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateSurface} disabled={!formData.name}>
                  Update Surface
                </Button>
                <Button variant="outline" onClick={() => setEditingSurface(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};