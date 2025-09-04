import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WindowType {
  id: string;
  name: string;
  description?: string;
  key: string;
  visual_key: string;
  configurations?: any;
  measurement_fields?: any[];
  created_at?: string;
  org_id?: string;
  updated_at?: string;
}

interface WindowTypeSelectorProps {
  selectedWindowType?: WindowType;
  onWindowTypeChange: (windowType: WindowType) => void;
  readOnly?: boolean;
}

export const WindowTypeSelector = ({
  selectedWindowType,
  onWindowTypeChange,
  readOnly = false
}: WindowTypeSelectorProps) => {
  const [windowTypes, setWindowTypes] = useState<WindowType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWindowTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('window_types')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;

        const mappedData: WindowType[] = (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          key: item.key,
          visual_key: item.visual_key,
          configurations: item.configurations || {},
          measurement_fields: item.measurement_fields || [],
          created_at: item.created_at,
          org_id: item.org_id,
          updated_at: item.updated_at
        }));
        
        setWindowTypes(mappedData);
      } catch (error) {
        console.error('Error fetching window types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWindowTypes();
  }, []);

  const getWindowIcon = (visualKey: string) => {
    const iconMap: Record<string, string> = {
      'standard': '🪟',
      'bay': '🏠',
      'french_doors': '🚪',
      'sliding_doors': '↔️',
      'large_window': '🖼️',
      'corner_window': '📐',
      'terrace_doors': '🌅',
      'arched_window': '⛪',
      'skylight': '☀️'
    };
    return iconMap[visualKey] || '🪟';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading window types...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Select the window type to customize measurements and visualization
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {windowTypes.map((windowType) => (
          <Card
            key={windowType.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedWindowType?.id === windowType.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            } ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={() => !readOnly && onWindowTypeChange(windowType)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="text-2xl">{getWindowIcon(windowType.visual_key)}</div>
                {selectedWindowType?.id === windowType.id && (
                  <Badge variant="default" className="text-xs">Selected</Badge>
                )}
              </div>
              <CardTitle className="text-base">{windowType.name}</CardTitle>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {windowType.description || 'Standard window configuration'}
              </p>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {windowType.key}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {windowType.measurement_fields?.length || 0} fields
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {windowTypes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No window types available</p>
          <p className="text-sm">Please configure window types in settings</p>
        </div>
      )}
    </div>
  );
};