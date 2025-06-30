
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { useWindowCoveringOptions, type WindowCoveringOption } from "@/hooks/useWindowCoveringOptions";
import { useWindowCoveringCategories } from "@/hooks/useWindowCoveringCategories";
import type { WindowCovering } from "@/hooks/useWindowCoverings";

interface WindowCoveringOptionsManagerProps {
  windowCovering: WindowCovering;
  onBack: () => void;
}

export const WindowCoveringOptionsManager = ({ windowCovering, onBack }: WindowCoveringOptionsManagerProps) => {
  const { options, isLoading: optionsLoading, createOption, updateOption, deleteOption } = useWindowCoveringOptions(windowCovering.id);
  const { categories, isLoading: categoriesLoading } = useWindowCoveringCategories();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    option_type: '',
    name: '',
    description: '',
    cost_type: 'per-unit' as const,
    base_cost: 0,
    is_required: false,
    is_default: false,
    sort_order: 0
  });

  const handleSave = async () => {
    try {
      const optionData = {
        ...formData,
        window_covering_id: windowCovering.id,
        sort_order: options.length
      };

      if (editingId) {
        await updateOption(editingId, optionData);
      } else {
        await createOption(optionData);
      }
      
      resetForm();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEdit = (option: WindowCoveringOption) => {
    setFormData({
      option_type: option.option_type,
      name: option.name,
      description: option.description || '',
      cost_type: option.cost_type as any,
      base_cost: option.base_cost,
      is_required: option.is_required,
      is_default: option.is_default,
      sort_order: option.sort_order
    });
    setEditingId(option.id);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteOption(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const resetForm = () => {
    setFormData({
      option_type: '',
      name: '',
      description: '',
      cost_type: 'per-unit',
      base_cost: 0,
      is_required: false,
      is_default: false,
      sort_order: 0
    });
    setIsCreating(false);
    setEditingId(null);
  };

  if (optionsLoading || categoriesLoading) {
    return <div className="text-center py-8">Loading options...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Window Coverings
        </Button>
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">
            Manage Options: {windowCovering.name}
          </h3>
          <p className="text-sm text-brand-neutral">
            Add and configure options for this window covering
          </p>
        </div>
      </div>

      {/* Add Option Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Option' : 'Add New Option'}</CardTitle>
            <CardDescription>
              Configure an option for this window covering
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="option_type">Option Type</Label>
                <Select value={formData.option_type} onValueChange={(value) => setFormData(prev => ({ ...prev, option_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option type" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name.toLowerCase()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Option Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Blackout Lining"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost_type">Cost Type</Label>
                <Select value={formData.cost_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, cost_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per-unit">Per Unit</SelectItem>
                    <SelectItem value="per-meter">Per Meter</SelectItem>
                    <SelectItem value="per-sqm">Per Square Meter</SelectItem>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="base_cost">Base Cost (£)</Label>
                <Input
                  id="base_cost"
                  type="number"
                  step="0.01"
                  value={formData.base_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_cost: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_required"
                  checked={formData.is_required}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_required: !!checked }))}
                />
                <Label htmlFor="is_required">Required Option</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: !!checked }))}
                />
                <Label htmlFor="is_default">Default Selection</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-brand-primary hover:bg-brand-accent">
                {editingId ? 'Update Option' : 'Add Option'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Option Button */}
      {!isCreating && (
        <Button onClick={() => setIsCreating(true)} className="bg-brand-primary hover:bg-brand-accent">
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </Button>
      )}

      {/* Options List */}
      <div className="grid gap-4">
        {options.map((option) => (
          <Card key={option.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-brand-primary">{option.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {option.option_type}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-4 text-sm text-brand-neutral mb-2">
                    <span>Cost: £{option.base_cost} {option.cost_type}</span>
                    <span>Sort: {option.sort_order}</span>
                  </div>

                  {option.description && (
                    <p className="text-sm text-brand-neutral bg-gray-50 p-2 rounded mb-2">
                      {option.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {option.is_required && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                    {option.is_default && (
                      <Badge variant="default" className="text-xs">Default</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(option)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(option.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {options.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-brand-neutral">No options configured yet.</p>
              <Button 
                onClick={() => setIsCreating(true)}
                className="mt-4 bg-brand-primary hover:bg-brand-accent"
              >
                Add Your First Option
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
