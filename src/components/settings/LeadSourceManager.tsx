import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { useAllLeadSources, useCreateLeadSource, useUpdateLeadSource, useDeleteLeadSource } from "@/hooks/useLeadSources";
import dynamicIconImports from 'lucide-react/dynamicIconImports';

const ICON_OPTIONS = [
  'globe', 'users', 'share-2', 'megaphone', 'briefcase', 'phone', 
  'mail', 'tag', 'star', 'heart', 'trending-up', 'target'
];

const COLOR_OPTIONS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', 
  '#06b6d4', '#6366f1', '#6b7280', '#ef4444', '#84cc16'
];

export const LeadSourceManager = () => {
  const { data: sources, isLoading } = useAllLeadSources();
  const createSource = useCreateLeadSource();
  const updateSource = useUpdateLeadSource();
  const deleteSource = useDeleteLeadSource();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: COLOR_OPTIONS[0],
    icon: ICON_OPTIONS[0],
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSource) {
      await updateSource.mutateAsync({
        id: editingSource.id,
        ...formData,
      });
    } else {
      const maxOrder = sources?.reduce((max, s) => Math.max(max, s.sort_order), 0) || 0;
      await createSource.mutateAsync({
        ...formData,
        sort_order: maxOrder + 1,
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: COLOR_OPTIONS[0],
      icon: ICON_OPTIONS[0],
      is_active: true,
    });
    setEditingSource(null);
  };

  const handleEdit = (source: any) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      description: source.description || "",
      color: source.color,
      icon: source.icon,
      is_active: source.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this lead source?")) {
      await deleteSource.mutateAsync(id);
    }
  };

  const handleToggleActive = async (source: any) => {
    await updateSource.mutateAsync({
      id: source.id,
      is_active: !source.is_active,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#111827' }}>Lead Sources</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage custom lead sources for tracking where your clients come from
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] z-50">
            <DialogHeader>
              <DialogTitle>
                {editingSource ? "Edit Lead Source" : "Add Lead Source"}
              </DialogTitle>
                <DialogDescription>
                  Create a custom lead source to track client origins
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., LinkedIn"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this lead source"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-md border-2 ${
                            formData.color === color ? "border-foreground" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <div className="flex flex-wrap gap-2">
                      {ICON_OPTIONS.slice(0, 6).map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          className={`w-8 h-8 rounded-md border flex items-center justify-center ${
                            formData.icon === icon ? "border-primary bg-primary/10" : "border-border"
                          }`}
                          onClick={() => setFormData({ ...formData, icon })}
                        >
                          <span className="text-sm">{icon.charAt(0)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSource ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-gray-200" style={{ backgroundColor: 'white' }}>
        <Table>
          <TableHeader>
            <TableRow style={{ borderColor: '#e5e7eb' }}>
              <TableHead className="w-12"></TableHead>
              <TableHead style={{ color: '#111827' }}>Name</TableHead>
              <TableHead style={{ color: '#111827' }}>Description</TableHead>
              <TableHead style={{ color: '#111827' }}>Status</TableHead>
              <TableHead className="text-right" style={{ color: '#111827' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources?.map((source) => (
              <TableRow key={source.id} style={{ borderColor: '#e5e7eb' }}>
                <TableCell>
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </TableCell>
                <TableCell style={{ color: '#111827' }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="font-medium">{source.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm" style={{ color: '#6b7280' }}>
                  {source.description || "—"}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={source.is_active}
                    onCheckedChange={() => handleToggleActive(source)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(source)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(source.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!sources?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8" style={{ color: '#6b7280' }}>
                  No lead sources found. Add your first source to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};