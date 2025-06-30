import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Image as ImageIcon, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Heading {
  id: string;
  name: string;
  image?: string;
  fullnessRatio: {
    percentage: number;
    times: number;
  };
  extraFabric?: number;
  notes?: string;
  costType: 'grid' | 'per-unit';
  pricingGrid?: Array<{ quantity: number; price: number }>;
  unitPrice?: number;
  unitType: 'metric' | 'imperial';
}

export const HeadingManagement = () => {
  const { toast } = useToast();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fullnessToggle, setFullnessToggle] = useState<'percentage' | 'times'>('percentage');
  
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    fullnessPercentage: 100,
    fullnessTimes: 2,
    extraFabric: 0,
    notes: '',
    costType: 'per-unit' as const,
    unitPrice: 0,
    unitType: 'metric' as const,
    pricingGrid: [{ quantity: 1, price: 0 }]
  });

  const resetForm = () => {
    setFormData({
      name: '',
      image: '',
      fullnessPercentage: 100,
      fullnessTimes: 2,
      extraFabric: 0,
      notes: '',
      costType: 'per-unit',
      unitPrice: 0,
      unitType: 'metric',
      pricingGrid: [{ quantity: 1, price: 0 }]
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Heading name is required",
        variant: "destructive"
      });
      return;
    }

    const newHeading: Heading = {
      id: editingId || Date.now().toString(),
      name: formData.name,
      image: formData.image || undefined,
      fullnessRatio: {
        percentage: formData.fullnessPercentage,
        times: formData.fullnessTimes
      },
      extraFabric: formData.extraFabric || undefined,
      notes: formData.notes || undefined,
      costType: formData.costType,
      unitPrice: formData.costType === 'per-unit' ? formData.unitPrice : undefined,
      pricingGrid: formData.costType === 'grid' ? formData.pricingGrid : undefined,
      unitType: formData.unitType
    };

    if (editingId) {
      setHeadings(prev => prev.map(h => h.id === editingId ? newHeading : h));
      toast({
        title: "Success",
        description: "Heading updated successfully"
      });
    } else {
      setHeadings(prev => [...prev, newHeading]);
      toast({
        title: "Success",
        description: "Heading created successfully"
      });
    }

    resetForm();
  };

  const handleEdit = (heading: Heading) => {
    setFormData({
      name: heading.name,
      image: heading.image || '',
      fullnessPercentage: heading.fullnessRatio.percentage,
      fullnessTimes: heading.fullnessRatio.times,
      extraFabric: heading.extraFabric || 0,
      notes: heading.notes || '',
      costType: heading.costType,
      unitPrice: heading.unitPrice || 0,
      unitType: heading.unitType,
      pricingGrid: heading.pricingGrid || [{ quantity: 1, price: 0 }]
    });
    setEditingId(heading.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    setHeadings(prev => prev.filter(h => h.id !== id));
    toast({
      title: "Success",
      description: "Heading deleted successfully"
    });
  };

  const addPricingRow = () => {
    setFormData(prev => ({
      ...prev,
      pricingGrid: [...prev.pricingGrid, { quantity: 1, price: 0 }]
    }));
  };

  const updatePricingRow = (index: number, field: 'quantity' | 'price', value: number) => {
    setFormData(prev => ({
      ...prev,
      pricingGrid: prev.pricingGrid.map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    }));
  };

  const removePricingRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pricingGrid: prev.pricingGrid.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Curtain/Drapery Headings</h3>
          <p className="text-sm text-brand-neutral">Manage heading styles for curtains and draperies</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-brand-primary hover:bg-brand-accent"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Heading
        </Button>
      </div>

      {/* Existing Headings List */}
      <div className="grid gap-4">
        {headings.map((heading) => (
          <Card key={heading.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    {heading.image && (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-brand-primary">{heading.name}</h4>
                      <div className="flex gap-4 text-sm text-brand-neutral">
                        <span>Fullness: {heading.fullnessRatio.percentage}% ({heading.fullnessRatio.times}x)</span>
                        {heading.extraFabric && <span>Extra: {heading.extraFabric}%</span>}
                        <Badge variant="outline" className="text-xs">
                          {heading.unitType} | {heading.costType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {heading.notes && (
                    <p className="text-sm text-brand-neutral bg-gray-50 p-2 rounded">
                      {heading.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(heading)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(heading.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Heading' : 'Create New Heading'}</CardTitle>
            <CardDescription>Configure the heading specifications and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="headingName">Heading Name *</Label>
                <Input
                  id="headingName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Pinch Pleat, Eyelet, Tab Top"
                />
              </div>
              <div>
                <Label htmlFor="headingImage">Image URL (Optional)</Label>
                <Input
                  id="headingImage"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Fullness Ratio</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFullnessToggle(prev => prev === 'percentage' ? 'times' : 'percentage')}
                >
                  {fullnessToggle === 'percentage' ? (
                    <>
                      <ToggleLeft className="h-4 w-4 mr-2" />
                      Percentage
                    </>
                  ) : (
                    <>
                      <ToggleRight className="h-4 w-4 mr-2" />
                      Times
                    </>
                  )}
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Percentage</Label>
                  <Input
                    type="number"
                    value={formData.fullnessPercentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullnessPercentage: Number(e.target.value) }))}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label>Times (Multiplier)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.fullnessTimes}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullnessTimes: Number(e.target.value) }))}
                    placeholder="2.0"
                  />
                </div>
                <div>
                  <Label>Extra Fabric % (Optional)</Label>
                  <Input
                    type="number"
                    value={formData.extraFabric}
                    onChange={(e) => setFormData(prev => ({ ...prev, extraFabric: Number(e.target.value) }))}
                    placeholder="10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="headingNotes">Notes (Optional)</Label>
              <Textarea
                id="headingNotes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes to display when this heading is selected..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cost Type</Label>
                <Select
                  value={formData.costType}
                  onValueChange={(value: 'grid' | 'per-unit') => setFormData(prev => ({ ...prev, costType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per-unit">Per Unit</SelectItem>
                    <SelectItem value="grid">Pricing Grid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unit Type</Label>
                <Select
                  value={formData.unitType}
                  onValueChange={(value: 'metric' | 'imperial') => setFormData(prev => ({ ...prev, unitType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric</SelectItem>
                    <SelectItem value="imperial">Imperial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.costType === 'per-unit' ? (
              <div>
                <Label>Unit Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Pricing Grid</Label>
                  <Button variant="outline" size="sm" onClick={addPricingRow}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Row
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.pricingGrid.map((row, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={row.quantity}
                          onChange={(e) => updatePricingRow(index, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          value={row.price}
                          onChange={(e) => updatePricingRow(index, 'price', Number(e.target.value))}
                        />
                      </div>
                      {formData.pricingGrid.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removePricingRow(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="bg-brand-primary hover:bg-brand-accent">
                {editingId ? 'Update Heading' : 'Create Heading'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
