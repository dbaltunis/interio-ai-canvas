import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Workflow, Plus, Trash2, GripVertical } from 'lucide-react';
import type { OnboardingData } from '@/hooks/useOnboardingWizard';

interface StepProps {
  data: OnboardingData;
  updateSection: (section: keyof OnboardingData, data: any) => void;
  isSaving: boolean;
}

const DEFAULT_STATUSES = [
  { id: 'draft', name: 'Draft', color: '#6b7280', isDefault: true },
  { id: 'pending', name: 'Pending', color: '#f59e0b', isDefault: true },
  { id: 'quote_sent', name: 'Quote Sent', color: '#3b82f6', isDefault: true },
  { id: 'accepted', name: 'Accepted', color: '#22c55e', isDefault: true },
  { id: 'in_progress', name: 'In Progress', color: '#8b5cf6', isDefault: true },
  { id: 'completed', name: 'Completed', color: '#10b981', isDefault: true },
  { id: 'cancelled', name: 'Cancelled', color: '#ef4444', isDefault: true },
];

const AUTOMATION_OPTIONS = [
  { id: 'send_email', label: 'Send Email' },
  { id: 'deduct_inventory', label: 'Deduct Inventory' },
  { id: 'create_invoice', label: 'Create Invoice' },
  { id: 'notify_team', label: 'Notify Team' },
];

export const StatusAutomationsStep = ({ data, updateSection }: StepProps) => {
  const settings = data.status_automations || { 
    statuses: DEFAULT_STATUSES,
    automations: {},
    deduction_status: 'in_progress',
    reversal_status: 'cancelled'
  };

  const statuses = settings.statuses || DEFAULT_STATUSES;
  const automations = settings.automations || {};

  const handleStatusChange = (index: number, field: string, value: string) => {
    const updated = [...statuses];
    updated[index] = { ...updated[index], [field]: value };
    updateSection('status_automations', { ...settings, statuses: updated });
  };

  const addStatus = () => {
    const newStatus = { 
      id: `custom_${Date.now()}`, 
      name: '', 
      color: '#6b7280',
      isDefault: false 
    };
    updateSection('status_automations', { 
      ...settings, 
      statuses: [...statuses, newStatus] 
    });
  };

  const removeStatus = (index: number) => {
    if (statuses[index].isDefault) return;
    const updated = statuses.filter((_, i) => i !== index);
    updateSection('status_automations', { ...settings, statuses: updated });
  };

  const toggleAutomation = (statusId: string, automationId: string) => {
    const statusAutomations = automations[statusId] || [];
    const updated = statusAutomations.includes(automationId)
      ? statusAutomations.filter((a: string) => a !== automationId)
      : [...statusAutomations, automationId];
    
    updateSection('status_automations', {
      ...settings,
      automations: { ...automations, [statusId]: updated }
    });
  };

  const handleDeductionStatus = (value: string) => {
    updateSection('status_automations', { ...settings, deduction_status: value });
  };

  const handleReversalStatus = (value: string) => {
    updateSection('status_automations', { ...settings, reversal_status: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          Status & Automations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Statuses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Job Statuses</Label>
            <Button variant="outline" size="sm" onClick={addStatus}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {statuses.map((status: any, index: number) => (
              <div key={status.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <input
                  type="color"
                  value={status.color}
                  onChange={(e) => handleStatusChange(index, 'color', e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer border-0"
                />
                <Input
                  value={status.name}
                  onChange={(e) => handleStatusChange(index, 'name', e.target.value)}
                  placeholder="Status name"
                  className="flex-1"
                  disabled={status.isDefault}
                />
                {!status.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStatus(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Deduction Settings */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <Label className="font-medium">Inventory Deduction</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Deduct inventory when status is:</Label>
              <select
                value={settings.deduction_status || 'in_progress'}
                onChange={(e) => handleDeductionStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                {statuses.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Reverse deduction when:</Label>
              <select
                value={settings.reversal_status || 'cancelled'}
                onChange={(e) => handleReversalStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                {statuses.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status Automations */}
        <div className="space-y-4">
          <Label className="font-medium">Status Automations</Label>
          <div className="space-y-3">
            {statuses.slice(0, 6).map((status: any) => (
              <div key={status.id} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="font-medium text-sm">{status.name}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {AUTOMATION_OPTIONS.map((auto) => (
                    <div key={auto.id} className="flex items-center gap-2">
                      <Switch
                        checked={(automations[status.id] || []).includes(auto.id)}
                        onCheckedChange={() => toggleAutomation(status.id, auto.id)}
                        className="scale-90"
                      />
                      <Label className="text-xs text-muted-foreground">{auto.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
