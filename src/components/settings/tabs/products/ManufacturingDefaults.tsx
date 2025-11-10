import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ManufacturingDefaults {
  return_left: number;
  return_right: number;
  overlap: number;
  header_allowance: number;
  bottom_hem: number;
  side_hems: number;
  seam_hems: number;
  waste_percent: number;
  supports_railroading: boolean;
  supports_pattern_matching: boolean;
  supports_custom_hems: boolean;
  measurement_unit: 'cm' | 'inches';
}

export const ManufacturingDefaults = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [defaults, setDefaults] = useState<ManufacturingDefaults>({
    return_left: 7.5,
    return_right: 7.5,
    overlap: 10,
    header_allowance: 8,
    bottom_hem: 15,
    side_hems: 7.5,
    seam_hems: 1.5,
    waste_percent: 5,
    supports_railroading: true,
    supports_pattern_matching: true,
    supports_custom_hems: true,
    measurement_unit: 'cm'
  });

  useEffect(() => {
    loadDefaults();
  }, []);

  const loadDefaults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading defaults:', error);
        return;
      }

      if (data?.pricing_settings) {
        const settings = typeof data.pricing_settings === 'string' 
          ? JSON.parse(data.pricing_settings)
          : data.pricing_settings;
        if (settings?.manufacturing_defaults) {
          setDefaults({ ...defaults, ...settings.manufacturing_defaults });
        }
      }
    } catch (error) {
      console.error('Error loading manufacturing defaults:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDefaults = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First check if record exists
      const { data: existing } = await supabase
        .from('business_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('business_settings')
          .update({
            pricing_settings: { manufacturing_defaults: defaults } as any,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('business_settings')
          .insert({
            user_id: user.id,
            pricing_settings: { manufacturing_defaults: defaults } as any,
          });
        
        if (error) throw error;
      }

      toast({
        title: "Settings Saved",
        description: "Manufacturing defaults have been updated successfully."
      });
    } catch (error) {
      console.error('Error saving defaults:', error);
      toast({
        title: "Error",
        description: "Failed to save manufacturing defaults. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof ManufacturingDefaults, value: any) => {
    setDefaults(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Loading manufacturing defaults...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manufacturing Defaults</CardTitle>
          <CardDescription>
            Configure default allowances and settings that will be applied to new templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Standard Allowances */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Standard Allowances</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="return_left">Left Return ({defaults.measurement_unit})</Label>
                <Input
                  id="return_left"
                  type="number"
                  step="0.5"
                  value={defaults.return_left}
                  onChange={(e) => handleInputChange('return_left', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="return_right">Right Return ({defaults.measurement_unit})</Label>
                <Input
                  id="return_right"
                  type="number"
                  step="0.5"
                  value={defaults.return_right}
                  onChange={(e) => handleInputChange('return_right', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="overlap">Centre Overlap ({defaults.measurement_unit})</Label>
                <Input
                  id="overlap"
                  type="number"
                  step="0.5"
                  value={defaults.overlap}
                  onChange={(e) => handleInputChange('overlap', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="header_allowance">Header Allowance ({defaults.measurement_unit})</Label>
                <Input
                  id="header_allowance"
                  type="number"
                  step="0.5"
                  value={defaults.header_allowance}
                  onChange={(e) => handleInputChange('header_allowance', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Hem Allowances */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hem Allowances</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bottom_hem">Bottom Hem ({defaults.measurement_unit})</Label>
                <Input
                  id="bottom_hem"
                  type="number"
                  step="0.5"
                  value={defaults.bottom_hem}
                  onChange={(e) => handleInputChange('bottom_hem', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="side_hems">Side Hems ({defaults.measurement_unit})</Label>
                <Input
                  id="side_hems"
                  type="number"
                  step="0.5"
                  value={defaults.side_hems}
                  onChange={(e) => handleInputChange('side_hems', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="seam_hems">Seam Hems ({defaults.measurement_unit})</Label>
                <Input
                  id="seam_hems"
                  type="number"
                  step="0.5"
                  value={defaults.seam_hems}
                  onChange={(e) => handleInputChange('seam_hems', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Waste & Miscellaneous */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Waste & Miscellaneous</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="waste_percent">Waste Percentage (%)</Label>
                <Input
                  id="waste_percent"
                  type="number"
                  step="0.5"
                  value={defaults.waste_percent}
                  onChange={(e) => handleInputChange('waste_percent', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="measurement_unit">Measurement Unit</Label>
                <select 
                  id="measurement_unit"
                  value={defaults.measurement_unit}
                  onChange={(e) => handleInputChange('measurement_unit', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="cm">Centimetres (cm)</option>
                  <option value="inches">Inches (in)</option>
                </select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Feature Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Feature Support</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="railroading">Railroading Support</Label>
                <Switch
                  id="railroading"
                  checked={defaults.supports_railroading}
                  onCheckedChange={(checked) => handleInputChange('supports_railroading', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pattern_matching">Pattern Matching</Label>
                <Switch
                  id="pattern_matching"
                  checked={defaults.supports_pattern_matching}
                  onCheckedChange={(checked) => handleInputChange('supports_pattern_matching', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="custom_hems">Custom Hem Options</Label>
                <Switch
                  id="custom_hems"
                  checked={defaults.supports_custom_hems}
                  onCheckedChange={(checked) => handleInputChange('supports_custom_hems', checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={saveDefaults} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Defaults'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};