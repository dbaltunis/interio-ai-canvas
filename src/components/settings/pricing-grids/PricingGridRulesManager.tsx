import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Route } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const PricingGridRulesManager = () => {
  const [productType, setProductType] = useState('');
  const [systemType, setSystemType] = useState('');
  const [priceGroup, setPriceGroup] = useState('');
  const [selectedGridId, setSelectedGridId] = useState('');
  const [priority, setPriority] = useState('10');

  // Fetch grids for dropdown
  const { data: grids } = useQuery({
    queryKey: ['pricing-grids-for-rules'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pricing_grids')
        .select('id, name, grid_code')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  // Fetch rules
  const { data: rules, refetch } = useQuery({
    queryKey: ['pricing-grid-rules'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pricing_grid_rules')
        .select(`
          *,
          pricing_grids (name, grid_code)
        `)
        .eq('user_id', user.id)
        .eq('active', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleCreateRule = async () => {
    if (!productType || !selectedGridId) {
      toast.error('Product type and grid are required');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('pricing_grid_rules')
        .insert({
          user_id: user.id,
          product_type: productType,
          system_type: systemType || null,
          price_group: priceGroup || null,
          grid_id: selectedGridId,
          priority: parseInt(priority) || 10,
          active: true
        });

      if (error) throw error;

      toast.success('Routing rule created successfully');
      setProductType('');
      setSystemType('');
      setPriceGroup('');
      setSelectedGridId('');
      setPriority('10');
      refetch();
    } catch (error: any) {
      console.error('Error creating rule:', error);
      toast.error(error.message || 'Failed to create rule');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const { error } = await supabase
        .from('pricing_grid_rules')
        .update({ active: false })
        .eq('id', ruleId);

      if (error) throw error;

      toast.success('Rule deleted');
      refetch();
    } catch (error: any) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Rule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Routing Rule
          </CardTitle>
          <CardDescription>
            Define which pricing grid to use based on product type, system type, and price group
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Rules are evaluated by priority (highest first). More specific rules should have higher priority.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-type">Product Type *</Label>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger id="product-type">
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roller_blinds">Roller Blinds</SelectItem>
                  <SelectItem value="roman_blinds">Roman Blinds</SelectItem>
                  <SelectItem value="venetian_blinds">Venetian Blinds</SelectItem>
                  <SelectItem value="vertical_blinds">Vertical Blinds</SelectItem>
                  <SelectItem value="panel_glide">Panel Glide</SelectItem>
                  <SelectItem value="shutters">Shutters</SelectItem>
                  <SelectItem value="cellular_shades">Cellular Shades</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="system-type">System Type (Optional)</Label>
              <Input
                id="system-type"
                placeholder="e.g., Cassette, Open Roll, Chain"
                value={systemType}
                onChange={(e) => setSystemType(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price-group">Price Group (Optional)</Label>
              <Input
                id="price-group"
                placeholder="e.g., Budget, Standard, Premium"
                value={priceGroup}
                onChange={(e) => setPriceGroup(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                placeholder="10"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grid">Pricing Grid *</Label>
            <Select value={selectedGridId} onValueChange={setSelectedGridId}>
              <SelectTrigger id="grid">
                <SelectValue placeholder="Select pricing grid" />
              </SelectTrigger>
              <SelectContent>
                {grids?.map((grid) => (
                  <SelectItem key={grid.id} value={grid.id}>
                    {grid.name} ({grid.grid_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleCreateRule} 
            disabled={!productType || !selectedGridId}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </CardContent>
      </Card>

      {/* Existing Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Routing Rules
          </CardTitle>
          <CardDescription>
            Existing pricing grid routing rules (ordered by priority)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!rules || rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No routing rules yet. Create one above.</p>
          ) : (
            <div className="space-y-2">
              {rules.map((rule: any) => (
                <div 
                  key={rule.id} 
                  className="flex items-center justify-between p-3 border border-border rounded-lg bg-card"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-card-foreground">
                      {rule.product_type.replace('_', ' ').toUpperCase()}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {rule.system_type && `System: ${rule.system_type} • `}
                      {rule.price_group && `Price Group: ${rule.price_group} • `}
                      Priority: {rule.priority}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      → {rule.pricing_grids?.name} ({rule.pricing_grids?.grid_code})
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
