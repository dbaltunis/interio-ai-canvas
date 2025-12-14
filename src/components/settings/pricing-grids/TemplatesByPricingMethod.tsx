/**
 * Templates by Pricing Method
 * Shows how templates are configured for pricing
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutTemplate, 
  Grid3X3, 
  Ruler, 
  Square,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useMarkupSettings } from '@/hooks/useMarkupSettings';
import { cn } from '@/lib/utils';

interface MethodSummary {
  method: string;
  displayName: string;
  icon: React.ReactNode;
  count: number;
  effectiveMarkup: number;
  markupSource: string;
}

export const TemplatesByPricingMethod = () => {
  const { user } = useAuth();
  const { data: markupSettings } = useMarkupSettings();
  
  const defaultMarkup = markupSettings?.default_markup_percentage || 0;
  const categoryMarkups = markupSettings?.category_markups || {};

  const { data: templates = [] } = useQuery({
    queryKey: ['templates-pricing-overview', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('curtain_templates')
        .select('id, name, system_type, pricing_type')
        .eq('user_id', user.id)
        .eq('active', true);
      
      if (error) throw error;
      return (data || []) as { id: string; name: string; system_type: string | null; pricing_type: string | null }[];
    },
    enabled: !!user?.id
  });

  const methodSummaries = useMemo<MethodSummary[]>(() => {
    // Count templates by pricing type
    const methodMap: Record<string, { count: number, systemTypes: Set<string> }> = {};
    
    templates.forEach(template => {
      const method = template.pricing_type || 'per_running_meter';
      if (!methodMap[method]) {
        methodMap[method] = { count: 0, systemTypes: new Set() };
      }
      methodMap[method].count++;
      if (template.system_type) {
        methodMap[method].systemTypes.add(template.system_type);
      }
    });

    const getMethodIcon = (method: string) => {
      switch (method) {
        case 'pricing_grid': return <Grid3X3 className="h-4 w-4" />;
        case 'per_running_meter': return <Ruler className="h-4 w-4" />;
        case 'per_sqm': return <Square className="h-4 w-4" />;
        case 'fixed': return <DollarSign className="h-4 w-4" />;
        default: return <LayoutTemplate className="h-4 w-4" />;
      }
    };

    const getMethodDisplayName = (method: string) => {
      const names: Record<string, string> = {
        pricing_grid: 'Pricing Grid',
        per_running_meter: 'Per Running Meter',
        per_sqm: 'Per Square Meter',
        fixed: 'Fixed Price',
        per_drop: 'Per Drop',
        per_width: 'Per Width'
      };
      return names[method] || method;
    };

    const getEffectiveMarkup = (method: string, systemTypes: Set<string>): { markup: number; source: string } => {
      // For grid-based, markup comes from grid itself
      if (method === 'pricing_grid') {
        return { markup: 0, source: 'Per-grid settings' };
      }
      
      // Determine category from system types
      const types = Array.from(systemTypes);
      const isCurtain = types.some(t => t?.toLowerCase().includes('curtain') || t?.toLowerCase().includes('roman'));
      const isBlind = types.some(t => t?.toLowerCase().includes('blind') || t?.toLowerCase().includes('roller') || t?.toLowerCase().includes('venetian'));
      const isShutter = types.some(t => t?.toLowerCase().includes('shutter'));
      
      const curtainsMarkup = (categoryMarkups as Record<string, number>)?.curtains || 0;
      const blindsMarkup = (categoryMarkups as Record<string, number>)?.blinds || 0;
      const shuttersMarkup = (categoryMarkups as Record<string, number>)?.shutters || 0;
      
      if (isCurtain && curtainsMarkup > 0) {
        return { markup: curtainsMarkup, source: 'Curtains category' };
      }
      if (isBlind && blindsMarkup > 0) {
        return { markup: blindsMarkup, source: 'Blinds category' };
      }
      if (isShutter && shuttersMarkup > 0) {
        return { markup: shuttersMarkup, source: 'Shutters category' };
      }
      
      if (defaultMarkup > 0) {
        return { markup: defaultMarkup, source: 'Default' };
      }
      
      return { markup: 0, source: 'None (at cost)' };
    };

    return Object.entries(methodMap)
      .map(([method, data]) => {
        const { markup, source } = getEffectiveMarkup(method, data.systemTypes);
        return {
          method,
          displayName: getMethodDisplayName(method),
          icon: getMethodIcon(method),
          count: data.count,
          effectiveMarkup: markup,
          markupSource: source
        };
      })
      .filter(s => s.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [templates, categoryMarkups, defaultMarkup]);

  if (templates.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-primary" />
            Templates by Pricing Method
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {templates.length} templates
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {methodSummaries.map((summary) => (
            <div 
              key={summary.method}
              className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-background">
                  {summary.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{summary.displayName}</p>
                  <p className="text-xs text-muted-foreground">{summary.count} template{summary.count !== 1 ? 's' : ''}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                {summary.method === 'pricing_grid' ? (
                  <Badge variant="outline" className="text-xs">
                    Per grid
                  </Badge>
                ) : (
                  <Badge 
                    variant={summary.effectiveMarkup > 0 ? "default" : "outline"}
                    className={cn(
                      "text-xs",
                      summary.effectiveMarkup > 0 ? "bg-emerald-500" : ""
                    )}
                  >
                    +{summary.effectiveMarkup}%
                  </Badge>
                )}
              </div>
              
              <p className="text-[10px] text-muted-foreground mt-1 truncate">
                → {summary.markupSource}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
