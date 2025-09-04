import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Ruler } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMeasurementWizardStore } from '@/stores/measurementWizardStore';

export const MeasureStep: React.FC = () => {
  const { 
    selectedTemplate, 
    selectedWindowType, 
    measurements, 
    updateMeasurement, 
    mode 
  } = useMeasurementWizardStore();
  
  const [measurementFields, setMeasurementFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeasurementFields = async () => {
      if (!selectedTemplate) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const orgId = session?.user?.user_metadata?.org_id;
        
        if (!orgId) return;

        // Get template measurement fields
        const { data: templateFields } = await supabase
          .from('template_measurements')
          .select(`
            field_id,
            required,
            show_if,
            measurement_fields (
              id,
              key,
              label,
              unit
            )
          `)
          .eq('template_id', selectedTemplate.id);

        // Get window type measurement fields if selected
        let windowFields: any[] = [];
        if (selectedWindowType) {
          const { data } = await supabase
            .from('window_type_measurements')
            .select(`
              field_id,
              required,
              measurement_fields (
                id,
                key,
                label,
                unit
              )
            `)
            .eq('window_type_id', selectedWindowType.id);
          
          windowFields = data || [];
        }

        // Combine and deduplicate fields
        const allFields = [
          ...(templateFields || []),
          ...windowFields
        ];

        const uniqueFields = allFields.reduce((acc, field) => {
          const existing = acc.find(f => f.measurement_fields.id === field.measurement_fields.id);
          if (!existing) {
            acc.push(field);
          } else if (field.required) {
            // If this instance is required, mark as required
            existing.required = true;
          }
          return acc;
        }, [] as any[]);

        setMeasurementFields(uniqueFields);
      } catch (error) {
        console.error('Error fetching measurement fields:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurementFields();
  }, [selectedTemplate, selectedWindowType]);

  // Convert measurements between units
  const convertToMm = (value: string): number => {
    if (!value) return 0;
    
    // Handle inches (e.g., "92" or '92"')
    if (value.includes('"') || value.includes("'")) {
      const inches = parseFloat(value.replace(/['"]/g, ''));
      return Math.round(inches * 25.4); // Convert inches to mm
    }
    
    // Handle cm (e.g., "92cm")
    if (value.includes('cm')) {
      const cm = parseFloat(value.replace('cm', ''));
      return Math.round(cm * 10); // Convert cm to mm
    }
    
    // Default to mm
    return parseInt(value) || 0;
  };

  const handleMeasurementChange = (key: string, value: string) => {
    const mmValue = convertToMm(value);
    updateMeasurement(key, mmValue);
  };

  // Filter fields based on mode
  const filteredFields = measurementFields.filter(field => {
    const fieldData = field.measurement_fields;
    
    if (mode === 'quick') {
      // In quick mode, only show essential fields
      return ['rail_width', 'drop'].includes(fieldData.key);
    }
    
    // In pro mode, show all fields
    return true;
  });

  const essentialFields = filteredFields.filter(field => 
    ['rail_width', 'drop'].includes(field.measurement_fields.key)
  );
  
  const additionalFields = filteredFields.filter(field => 
    !['rail_width', 'drop'].includes(field.measurement_fields.key)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Measurements</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter measurements in mm, cm, or inches (e.g., 1200, 120cm, 47").
        </p>
        
        <div className="flex items-center gap-2 mb-6">
          <Badge variant={mode === 'quick' ? 'default' : 'secondary'}>
            {mode === 'quick' ? 'Quick Mode - Essential Only' : 'Pro Mode - All Fields'}
          </Badge>
        </div>
      </div>

      {/* Essential Measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Essential Measurements
          </CardTitle>
          <CardDescription>
            These measurements are required for all window treatments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {essentialFields.map((field) => {
              const fieldData = field.measurement_fields;
              const currentValue = measurements[fieldData.key] || '';
              
              return (
                <div key={fieldData.id} className="space-y-2">
                  <Label htmlFor={fieldData.key} className="flex items-center gap-2">
                    {fieldData.label}
                    {field.required && <span className="text-destructive">*</span>}
                    <Badge variant="outline" className="text-xs">
                      {fieldData.unit}
                    </Badge>
                  </Label>
                  <Input
                    id={fieldData.key}
                    placeholder={`Enter ${fieldData.label.toLowerCase()}`}
                    value={currentValue}
                    onChange={(e) => handleMeasurementChange(fieldData.key, e.target.value)}
                  />
                  {measurements[fieldData.key] && (
                    <p className="text-xs text-muted-foreground">
                      = {measurements[fieldData.key]}mm
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Measurements (Pro Mode) */}
      {mode === 'pro' && additionalFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Measurements</CardTitle>
            <CardDescription>
              Detailed measurements for precise fitting and installation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {additionalFields.map((field) => {
                const fieldData = field.measurement_fields;
                const currentValue = measurements[fieldData.key] || '';
                
                return (
                  <div key={fieldData.id} className="space-y-2">
                    <Label htmlFor={fieldData.key} className="flex items-center gap-2">
                      {fieldData.label}
                      {field.required && <span className="text-destructive">*</span>}
                      <Badge variant="outline" className="text-xs">
                        {fieldData.unit}
                      </Badge>
                    </Label>
                    <Input
                      id={fieldData.key}
                      placeholder={`Enter ${fieldData.label.toLowerCase()}`}
                      value={currentValue}
                      onChange={(e) => handleMeasurementChange(fieldData.key, e.target.value)}
                    />
                    {measurements[fieldData.key] && (
                      <p className="text-xs text-muted-foreground">
                        = {measurements[fieldData.key]}mm
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredFields.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No measurement fields configured for this template.
        </div>
      )}
    </div>
  );
};