import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMeasurementWizardStore } from '@/stores/measurementWizardStore';

export const TemplateStep: React.FC = () => {
  const { selectedTemplate, selectedWindowType, setTemplate, setWindowType } = useMeasurementWizardStore();
  const [templates, setTemplates] = useState<any[]>([]);
  const [windowTypes, setWindowTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const orgId = session?.user?.user_metadata?.org_id;
        
        if (!orgId) return;

        const [templatesRes, windowTypesRes] = await Promise.all([
          supabase
            .from('product_templates')
            .select('*')
            .eq('org_id', orgId)
            .eq('is_active', true),
          supabase
            .from('window_types')
            .select('*')
            .eq('org_id', orgId)
        ]);

        if (templatesRes.data) setTemplates(templatesRes.data);
        if (windowTypesRes.data) setWindowTypes(windowTypesRes.data);
      } catch (error) {
        console.error('Error fetching templates and window types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Product Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  {selectedTemplate?.id === template.id && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{template.treatment_key}</Badge>
                  <Badge variant={template.default_mode === 'quick' ? 'default' : 'outline'}>
                    {template.default_mode}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Visual key: {template.visual_key}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedTemplate && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Choose Window Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {windowTypes.map((windowType) => (
              <Card
                key={windowType.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedWindowType?.id === windowType.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setWindowType(windowType)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{windowType.name}</CardTitle>
                    {selectedWindowType?.id === windowType.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <Badge variant="secondary">{windowType.key}</Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Visual: {windowType.visual_key}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!selectedTemplate && (
        <div className="text-center py-8 text-muted-foreground">
          Select a product template to continue
        </div>
      )}
    </div>
  );
};