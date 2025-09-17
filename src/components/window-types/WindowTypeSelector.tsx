import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DynamicWindowRenderer } from "./DynamicWindowRenderer";

interface SimpleWindowType {
  id: string;
  name: string;
  key: string;
  visual_key: string;
}

interface WindowTypeSelectorProps {
  selectedWindowType?: SimpleWindowType | null;
  onWindowTypeChange: (windowType: SimpleWindowType) => void;
  readOnly?: boolean;
}

export const WindowTypeSelector = ({
  selectedWindowType,
  onWindowTypeChange,
  readOnly = false
}: WindowTypeSelectorProps) => {
  const [windowTypes, setWindowTypes] = useState<SimpleWindowType[]>([]);
  const [loading, setLoading] = useState(true);

  // Set default selection to standard window after loading
  useEffect(() => {
    if (windowTypes.length > 0 && !selectedWindowType) {
      const standardWindow = windowTypes.find(wt => wt.visual_key === 'standard') || windowTypes[0];
      onWindowTypeChange(standardWindow);
    }
  }, [windowTypes, selectedWindowType, onWindowTypeChange]);

  useEffect(() => {
    const fetchWindowTypes = async () => {
      try {
        console.log('🔍 WindowTypeSelector: Fetching window types...');
        
        const { data, error } = await supabase
          .from('window_types')
          .select('id, name, key, visual_key')
          .order('name', { ascending: true });

        if (error) {
          console.error('🚨 WindowTypeSelector: Error fetching window types:', error);
          console.error('🚨 WindowTypeSelector: Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          setWindowTypes([]);
          return;
        }

        console.log('✅ WindowTypeSelector: Raw data received:', data);

        if (data && data.length > 0) {
          const simpleTypes: SimpleWindowType[] = data.map(item => ({
            id: item.id,
            name: item.name,
            key: item.key,
            visual_key: item.visual_key
          }));
          console.log('✅ WindowTypeSelector: Processed window types:', simpleTypes);
          setWindowTypes(simpleTypes);
        } else {
          console.log('⚠️ WindowTypeSelector: No window types found in data');
          setWindowTypes([]);
        }
      } catch (error) {
        console.error('🚨 WindowTypeSelector: Unexpected error in fetchWindowTypes:', error);
        setWindowTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWindowTypes();
  }, []);

  // Sample measurements for preview
  const getPreviewMeasurements = (windowType: string) => {
    const baseMeasurements = {
      window_width: 120,
      window_height: 100,
      rail_width: 140,
      drop: 110
    };

    // Adjust measurements based on window type for more realistic previews
    switch (windowType) {
      case 'bay':
        return { ...baseMeasurements, window_width: 160, rail_width: 180 };
      case 'french_doors':
      case 'sliding_doors':
      case 'terrace_doors':
        return { ...baseMeasurements, window_height: 180, drop: 200 };
      case 'large_window':
        return { ...baseMeasurements, window_width: 200, rail_width: 220 };
      case 'skylight':
        return { ...baseMeasurements, window_width: 100, window_height: 60 };
      default:
        return baseMeasurements;
    }
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
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-base">{windowType.name}</CardTitle>
                {selectedWindowType?.id === windowType.id && (
                  <Badge variant="default" className="text-xs">Selected</Badge>
                )}
              </div>
              
              {/* Live window preview */}
              <div className="h-24 mb-2">
                <DynamicWindowRenderer
                  windowType={windowType.visual_key}
                  measurements={getPreviewMeasurements(windowType.visual_key)}
                  className="h-full w-full"
                  enhanced={true}
                />
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Window configuration for {windowType.key}
              </p>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {windowType.key}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {windowTypes.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No window types available</p>
          <p className="text-sm">Please configure window types in settings</p>
        </div>
      )}
    </div>
  );
};