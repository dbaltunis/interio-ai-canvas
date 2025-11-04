import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Link as LinkIcon, CheckCircle2, Package, Settings, Tag } from 'lucide-react';
import { WizardData } from '../PricingGridWizard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StepConnectRuleProps {
  wizardData: WizardData;
  updateWizardData: (updates: Partial<WizardData>) => void;
}

export const StepConnectRule = ({ wizardData, updateWizardData }: StepConnectRuleProps) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRule = async () => {
    if (!wizardData.productType || !wizardData.createdGridId) {
      toast.error('Please select at least a product type');
      return;
    }

    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pricing_grid_rules')
        .insert({
          user_id: user.id,
          product_type: wizardData.productType,
          system_type: wizardData.systemType || null,
          price_group: wizardData.priceGroup || null,
          grid_id: wizardData.createdGridId,
          priority: 100,
          active: true
        })
        .select()
        .single();

      if (error) throw error;

      updateWizardData({ createdRuleId: data.id });
      toast.success('Routing rule created successfully!');
    } catch (error: any) {
      console.error('Error creating rule:', error);
      toast.error(error.message || 'Failed to create routing rule');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Connect to Products</h3>
        <p className="text-muted-foreground">
          Tell us when to use this price list
        </p>
      </div>

      {wizardData.createdRuleId ? (
        <Alert className="bg-green-500/10 border-green-500/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            Routing rule created! Your price list is now connected and ready to use.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Visual Connection */}
          <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="text-center mb-4">
              <p className="text-sm font-medium">This price list will be used when:</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="font-mono bg-background px-3 py-1.5 rounded border">
                {wizardData.productType || '(Product)'}
              </span>
              <span className="text-muted-foreground">+</span>
              <span className="font-mono bg-background px-3 py-1.5 rounded border">
                {wizardData.systemType || '(System)'}
              </span>
              <span className="text-muted-foreground">+</span>
              <span className="font-mono bg-background px-3 py-1.5 rounded border">
                {wizardData.priceGroup || '(Group)'}
              </span>
            </div>
          </Card>

          <Alert>
            <AlertDescription>
              <strong>Tip:</strong> Be specific! More specific rules (product + system + group) will take priority over general rules (just product).
            </AlertDescription>
          </Alert>

          {/* Form */}
          <div className="space-y-6">
            {/* Product Type */}
            <div className="space-y-2">
              <Label htmlFor="product-type" className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Product Type <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={wizardData.productType} 
                onValueChange={(value) => updateWizardData({ productType: value })}
              >
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
              <p className="text-xs text-muted-foreground">
                Required - Which product type does this price list apply to?
              </p>
            </div>

            {/* System Type */}
            <div className="space-y-2">
              <Label htmlFor="system-type" className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                System Type <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Input
                id="system-type"
                placeholder="e.g., Cassette, Open Roll, Chain Drive"
                value={wizardData.systemType}
                onChange={(e) => updateWizardData({ systemType: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank if this price list applies to all systems
              </p>
            </div>

            {/* Price Group */}
            <div className="space-y-2">
              <Label htmlFor="price-group" className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Fabric Price Group <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Input
                id="price-group"
                placeholder="e.g., A, B, C, Premium, Budget"
                value={wizardData.priceGroup}
                onChange={(e) => updateWizardData({ priceGroup: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank if this price list applies to all fabric groups
              </p>
            </div>

            <Button 
              onClick={handleCreateRule}
              disabled={isCreating || !wizardData.productType}
              className="w-full"
              size="lg"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              {isCreating ? 'Creating...' : 'Create Connection'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
