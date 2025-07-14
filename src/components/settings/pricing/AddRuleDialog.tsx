
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { PricingRule } from "@/hooks/usePricingRules";

interface AddRuleDialogProps {
  onAdd: (rule: Omit<PricingRule, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
  isLoading?: boolean;
}

const WINDOW_COVERING_CATEGORIES = [
  'Curtains & Drapes',
  'Roman Blinds',
  'Roller Blinds',
  'Venetian Blinds',
  'Vertical Blinds',
  'Panel Glides',
  'Shutters',
  'Hardware',
  'Fabrics',
  'Installation',
  'General'
];

export const AddRuleDialog = ({ onAdd, isLoading }: AddRuleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    rule_type: 'percentage' as 'percentage' | 'fixed_amount',
    value: 0,
    priority: 0,
    conditions: {},
    active: true,
    conditionsText: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let conditions = {};
    if (formData.conditionsText.trim()) {
      try {
        conditions = JSON.parse(formData.conditionsText);
      } catch (error) {
        // If JSON parsing fails, store as simple object
        conditions = { description: formData.conditionsText };
      }
    }

    onAdd({
      name: formData.name,
      category: formData.category,
      rule_type: formData.rule_type,
      value: formData.value,
      priority: formData.priority,
      conditions,
      active: formData.active
    });

    // Reset form
    setFormData({
      name: '',
      category: '',
      rule_type: 'percentage',
      value: 0,
      priority: 0,
      conditions: {},
      active: true,
      conditionsText: ''
    });
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand-primary hover:bg-brand-accent">
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Pricing Rule</DialogTitle>
          <DialogDescription>
            Create a custom pricing rule for specific window covering categories
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ruleName">Rule Name</Label>
            <Input
              id="ruleName"
              placeholder="e.g., Premium Fabric Surcharge"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {WINDOW_COVERING_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ruleType">Type</Label>
              <Select
                value={formData.rule_type}
                onValueChange={(value: 'percentage' | 'fixed_amount') => 
                  setFormData(prev => ({ ...prev, rule_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="priority">Priority (higher = applied first)</Label>
            <Input
              id="priority"
              type="number"
              placeholder="0"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <Label htmlFor="conditions">Conditions (optional)</Label>
            <Textarea
              id="conditions"
              placeholder='e.g., {"min_width": 200, "fabric_type": "premium"}'
              value={formData.conditionsText}
              onChange={(e) => setFormData(prev => ({ ...prev, conditionsText: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-brand-primary hover:bg-brand-accent">
              {isLoading ? 'Adding...' : 'Add Rule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
