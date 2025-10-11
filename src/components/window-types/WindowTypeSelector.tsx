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
          
          // Sort to ensure standard comes first, then bay
          const sortedTypes = simpleTypes.sort((a, b) => {
            if (a.visual_key === 'standard') return -1;
            if (b.visual_key === 'standard') return 1;
            return 0;
          });
          
          console.log('✅ WindowTypeSelector: Processed window types:', sortedTypes);
          setWindowTypes(sortedTypes);
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
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-medium mb-1">Select Window Type</h3>
        <p className="text-sm text-muted-foreground">
          Choose window type for accurate measurements
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {windowTypes.map((windowType) => (
          <Card
            key={windowType.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${
              selectedWindowType?.id === windowType.id 
                ? 'border-primary bg-primary/5 shadow-sm' 
                : 'border-border hover:border-primary/30'
            } ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={() => !readOnly && onWindowTypeChange(windowType)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center space-y-3">
                {/* Enhanced visual preview with larger size and visible graphics */}
                <div className="h-20 w-full flex items-center justify-center bg-gray-50 border-2 border-gray-200 rounded-md overflow-hidden">
                  {windowType.visual_key === 'standard' ? (
                    // Standard Window Visual
                    <div className="w-16 h-12 border-2 border-gray-600 bg-blue-100 relative">
                      <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5 p-0.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="bg-blue-200 border border-gray-500"></div>
                        ))}
                      </div>
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-600 transform -translate-y-1/2"></div>
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-600 transform -translate-x-1/2"></div>
                    </div>
                  ) : windowType.visual_key === 'bay' ? (
                    // Bay Window Visual
                    <div className="relative w-20 h-12">
                      <div className="absolute left-0 top-0 w-6 h-12 border-2 border-gray-600 bg-blue-100 transform -rotate-12 origin-bottom-right">
                        <div className="grid grid-rows-3 h-full gap-0.5 p-0.5">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-blue-200 border border-gray-500"></div>
                          ))}
                        </div>
                      </div>
                      <div className="absolute left-5 top-0 w-10 h-12 border-2 border-gray-600 bg-blue-100">
                        <div className="grid grid-cols-2 grid-rows-3 h-full gap-0.5 p-0.5">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-blue-200 border border-gray-500"></div>
                          ))}
                        </div>
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-600 transform -translate-x-1/2"></div>
                      </div>
                      <div className="absolute right-0 top-0 w-6 h-12 border-2 border-gray-600 bg-blue-100 transform rotate-12 origin-bottom-left">
                        <div className="grid grid-rows-3 h-full gap-0.5 p-0.5">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-blue-200 border border-gray-500"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : windowType.visual_key === 'room_wall' ? (
                    // Room Wall Visual for Wallpaper
                    <div className="w-18 h-14 relative">
                      {/* Wall background with texture pattern */}
                      <div className="w-full h-full bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-gray-600 relative overflow-hidden">
                        {/* Wallpaper pattern - decorative lines */}
                        <div className="absolute inset-0">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              className="absolute h-full w-px bg-amber-300/40"
                              style={{ left: `${(i + 1) * 14.28}%` }}
                            />
                          ))}
                          {/* Decorative pattern */}
                          <div className="absolute inset-1 grid grid-cols-3 gap-1">
                            {Array.from({ length: 9 }).map((_, i) => (
                              <div key={i} className="flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-400/30" />
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Baseboard */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-800 border-t border-gray-700" />
                      </div>
                    </div>
                  ) : (
                    // Fallback for other window types
                    <div className="text-gray-400 text-xs">No preview</div>
                  )}
                </div>
                
                <div className="text-center w-full">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h4 className="text-sm font-semibold truncate">{windowType.name}</h4>
                    {selectedWindowType?.id === windowType.id && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs h-5 px-2">
                    {windowType.key}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {windowTypes.length === 0 && !loading && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">No window types available</p>
        </div>
      )}
    </div>
  );
};