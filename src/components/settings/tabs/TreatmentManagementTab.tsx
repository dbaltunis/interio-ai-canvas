
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Plus, Upload } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface Treatment {
  id: string;
  name: string;
  category: 'fabric' | 'hard';
  base_price: number;
  description?: string;
  image_url?: string;
  active: boolean;
  custom_options?: Array<{
    name: string;
    price_modifier: number;
    type: 'add' | 'multiply';
  }>;
}

export const TreatmentManagementTab = () => {
  const { units } = useMeasurementUnits();
  const [treatments, setTreatments] = useState<Treatment[]>([
    { id: "curtains", name: "Curtains", category: "fabric", base_price: 45, active: true },
    { id: "drapes", name: "Drapes", category: "fabric", base_price: 65, active: true },
    { id: "blinds", name: "Blinds", category: "hard", base_price: 35, active: true },
    { id: "shutters", name: "Shutters", category: "hard", base_price: 120, active: true },
    { id: "valances", name: "Valances", category: "fabric", base_price: 25, active: true },
    { id: "roman_shades", name: "Roman Shades", category: "fabric", base_price: 55, active: true },
    { id: "roller_shades", name: "Roller Shades", category: "hard", base_price: 40, active: true },
    { id: "cellular_shades", name: "Cellular Shades", category: "hard", base_price: 50, active: true }
  ]);

  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    return `${currencySymbols[units.currency] || units.currency}${amount.toFixed(2)}`;
  };

  const handleSaveTreatment = (treatment: Treatment) => {
    if (editingTreatment) {
      setTreatments(prev => prev.map(t => t.id === treatment.id ? treatment : t));
    } else {
      setTreatments(prev => [...prev, { ...treatment, id: `custom-${Date.now()}` }]);
    }
    setEditingTreatment(null);
    setShowAddDialog(false);
  };

  const handleDeleteTreatment = (id: string) => {
    setTreatments(prev => prev.filter(t => t.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setTreatments(prev => prev.map(t => 
      t.id === id ? { ...t, active: !t.active } : t
    ));
  };

  const TreatmentForm = ({ treatment, onSave, onCancel }: {
    treatment?: Treatment;
    onSave: (treatment: Treatment) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<Treatment>(
      treatment || {
        id: '',
        name: '',
        category: 'fabric',
        base_price: 0,
        description: '',
        image_url: '',
        active: true,
        custom_options: []
      }
    );

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Treatment Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Premium Curtains"
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value: 'fabric' | 'hard') => 
                setFormData(prev => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fabric">Soft Treatments (Fabric)</SelectItem>
                <SelectItem value="hard">Hard Treatments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="base_price">Base Price ({units.currency})</Label>
          <Input
            id="base_price"
            type="number"
            step="0.01"
            value={formData.base_price}
            onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe this treatment option..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="image_url">Image URL</Label>
          <div className="flex gap-2">
            <Input
              id="image_url"
              value={formData.image_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
            <Button variant="outline" size="icon">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
          />
          <Label htmlFor="active">Active (visible to users)</Label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)}>
            {treatment ? 'Update' : 'Create'} Treatment
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Treatment Management</h3>
          <p className="text-sm text-brand-neutral">Manage your window treatment options and pricing</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Treatment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Treatment</DialogTitle>
            </DialogHeader>
            <TreatmentForm
              onSave={handleSaveTreatment}
              onCancel={() => setShowAddDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {['fabric', 'hard'].map(category => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-base">
                {category === 'fabric' ? 'Soft Treatments (Fabric)' : 'Hard Treatments'}
              </CardTitle>
              <CardDescription>
                {category === 'fabric' 
                  ? 'Curtains, drapes, valances, and fabric-based window treatments'
                  : 'Blinds, shutters, and rigid window treatments'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {treatments
                  .filter(t => t.category === category)
                  .map(treatment => (
                    <div key={treatment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {treatment.image_url && (
                          <img 
                            src={treatment.image_url} 
                            alt={treatment.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{treatment.name}</span>
                            {!treatment.active && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Base price: {formatCurrency(treatment.base_price)}
                          </div>
                          {treatment.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {treatment.description}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={treatment.active}
                          onCheckedChange={() => handleToggleActive(treatment.id)}
                        />
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingTreatment(treatment)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Treatment</DialogTitle>
                            </DialogHeader>
                            <TreatmentForm
                              treatment={editingTreatment || undefined}
                              onSave={handleSaveTreatment}
                              onCancel={() => setEditingTreatment(null)}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTreatment(treatment.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
