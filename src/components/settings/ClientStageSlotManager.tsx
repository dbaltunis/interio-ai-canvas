import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Pencil, Save, X, Users, Star } from "lucide-react";
import { useAllClientStages, useCreateClientStage, useUpdateClientStage, useDeleteClientStage } from "@/hooks/useClientStages";

const SLOT_COUNT = 10;

const COLOR_OPTIONS = [
  { value: "gray", label: "Gray", bg: "bg-gray-100", text: "text-gray-700" },
  { value: "blue", label: "Blue", bg: "bg-blue-100", text: "text-blue-700" },
  { value: "green", label: "Green", bg: "bg-green-100", text: "text-green-700" },
  { value: "yellow", label: "Yellow", bg: "bg-yellow-100", text: "text-yellow-700" },
  { value: "orange", label: "Orange", bg: "bg-orange-100", text: "text-orange-700" },
  { value: "red", label: "Red", bg: "bg-red-100", text: "text-red-700" },
  { value: "purple", label: "Purple", bg: "bg-purple-100", text: "text-purple-700" },
  { value: "primary", label: "Primary", bg: "bg-primary/10", text: "text-primary" },
];

const getColorClasses = (color: string) => {
  const colorOption = COLOR_OPTIONS.find(c => c.value === color);
  return colorOption ? `${colorOption.bg} ${colorOption.text}` : "bg-gray-100 text-gray-700";
};

interface SlotFormData {
  name: string;
  label: string;
  color: string;
  description: string;
  is_default: boolean;
}

export const ClientStageSlotManager = () => {
  const { data: stages = [], isLoading } = useAllClientStages();
  const createStage = useCreateClientStage();
  const updateStage = useUpdateClientStage();
  const deleteStage = useDeleteClientStage();

  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [formData, setFormData] = useState<SlotFormData>({
    name: "",
    label: "",
    color: "gray",
    description: "",
    is_default: false,
  });

  const getStageForSlot = (slotNumber: number) => {
    return stages.find(s => s.slot_number === slotNumber && s.is_active !== false);
  };

  const handleEdit = (slotNumber: number) => {
    const existing = getStageForSlot(slotNumber);
    if (existing) {
      setFormData({
        name: existing.name,
        label: existing.label,
        color: existing.color,
        description: existing.description || "",
        is_default: existing.is_default,
      });
    } else {
      setFormData({
        name: "",
        label: "",
        color: "gray",
        description: "",
        is_default: false,
      });
    }
    setEditingSlot(slotNumber);
  };

  const handleCancel = () => {
    setEditingSlot(null);
    setFormData({ name: "", label: "", color: "gray", description: "", is_default: false });
  };

  const handleSave = async (slotNumber: number) => {
    if (!formData.name.trim() || !formData.label.trim()) return;

    const existing = getStageForSlot(slotNumber);
    
    // If setting this as default, we need to unset other defaults first
    if (formData.is_default && !existing?.is_default) {
      const currentDefault = stages.find(s => s.is_default && s.id !== existing?.id);
      if (currentDefault) {
        await updateStage.mutateAsync({ id: currentDefault.id, is_default: false });
      }
    }

    if (existing) {
      await updateStage.mutateAsync({
        id: existing.id,
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        label: formData.label,
        color: formData.color,
        description: formData.description || null,
        is_default: formData.is_default,
      });
    } else {
      await createStage.mutateAsync({
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        label: formData.label,
        color: formData.color,
        description: formData.description || undefined,
        slot_number: slotNumber,
        is_active: true,
        is_default: formData.is_default,
      });
    }

    handleCancel();
  };

  const handleDelete = async (slotNumber: number) => {
    const existing = getStageForSlot(slotNumber);
    if (existing) {
      await deleteStage.mutateAsync(existing.id);
    }
    handleCancel();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Client Funnel Stages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading stages...</div>
        </CardContent>
      </Card>
    );
  }

  const activeCount = stages.filter(s => s.is_active !== false).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Client Funnel Stages
        </CardTitle>
        <CardDescription>
          Manage up to {SLOT_COUNT} custom funnel stages for your clients. {activeCount} of {SLOT_COUNT} slots configured.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: SLOT_COUNT }, (_, i) => i + 1).map((slotNumber) => {
            const stage = getStageForSlot(slotNumber);
            const isEditing = editingSlot === slotNumber;

            if (isEditing) {
              return (
                <div key={slotNumber} className="p-4 border rounded-lg bg-muted/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Slot {slotNumber}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSave(slotNumber)}
                        disabled={!formData.name.trim() || !formData.label.trim()}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Internal Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., qualified_lead"
                      />
                      <p className="text-xs text-muted-foreground">Used internally (lowercase, no spaces)</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Display Label</Label>
                      <Input
                        value={formData.label}
                        onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="e.g., Qualified Lead"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Select
                        value={formData.color}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COLOR_OPTIONS.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="h-10 flex items-center">
                        <Badge className={`${getColorClasses(formData.color)} border-0`}>
                          {formData.label || "Preview"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this stage"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_default}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                      />
                      <Label className="text-sm">Default stage for new clients</Label>
                    </div>
                    {stage && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(slotNumber)}
                      >
                        Delete Stage
                      </Button>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={slotNumber}
                className={`p-3 border rounded-lg flex items-center justify-between ${
                  stage ? "bg-card" : "bg-muted/30 border-dashed"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-8">#{slotNumber}</span>
                  {stage ? (
                    <div className="flex items-center gap-2">
                      <Badge className={`${getColorClasses(stage.color)} border-0`}>
                        {stage.label}
                      </Badge>
                      {stage.is_default && (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      )}
                      {stage.description && (
                        <span className="text-sm text-muted-foreground">{stage.description}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Empty slot</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(slotNumber)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
