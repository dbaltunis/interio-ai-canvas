import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface TreatmentVisualizerProps {
  windowType: string;
  measurements: any;
  covering: any;
  treatmentData: any;
}

export const TreatmentVisualizer = ({
  windowType,
  measurements,
  covering,
  treatmentData
}: TreatmentVisualizerProps) => {
  const { units } = useMeasurementUnits();
  
  const width = measurements.measurement_a || measurements.rail_width || (units.length === 'cm' ? 150 : 60);
  const height = measurements.measurement_b || measurements.drop || (units.length === 'cm' ? 120 : 48);

  const renderCurtainVisualization = () => {
    const fullness = parseFloat(treatmentData.fullness_ratio || "2.0");
    const fabricWidth = width * fullness;
    const pooling = treatmentData.pooling || 0;
    const totalDrop = height + pooling;

    return (
      <div className="space-y-4">
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-blue-50 min-h-[200px]">
          {/* Window representation */}
          <div 
            className="absolute border-2 border-gray-400 bg-white/80"
            style={{
              width: `${Math.min(width * 3, 200)}px`,
              height: `${Math.min(height * 2, 150)}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Window panes */}
            <div className="absolute inset-1 border border-gray-300 bg-gradient-to-b from-sky-100 to-sky-200" />
          </div>

          {/* Curtain representation */}
          <div 
            className="absolute border-l-4 border-r-4 border-red-300 bg-gradient-to-r from-red-100 to-red-200 opacity-80"
            style={{
              width: `${Math.min(width * 3.5, 220)}px`,
              height: `${Math.min(totalDrop * 2, 180)}px`,
              left: '50%',
              top: '20px',
              transform: 'translateX(-50%)',
              borderStyle: 'solid',
              borderTopWidth: '8px',
              borderBottomWidth: pooling > 0 ? '16px' : '8px'
            }}
          >
            {/* Heading representation */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-red-400 opacity-60" />
            
            {/* Fabric folds */}
            {[...Array(Math.floor(fullness))].map((_, i) => (
              <div 
                key={i}
                className="absolute top-4 bottom-0 w-0.5 bg-red-400 opacity-40"
                style={{ left: `${(i + 1) * (100 / (fullness + 1))}%` }}
              />
            ))}
          </div>

          {/* Labels */}
          <div className="absolute bottom-2 left-2 text-xs text-gray-600">
            <Badge variant="outline">Curtains</Badge>
          </div>
          <div className="absolute bottom-2 right-2 text-xs text-gray-600">
            {treatmentData.heading_type && (
              <Badge variant="secondary">{treatmentData.heading_type.replace('_', ' ')}</Badge>
            )}
          </div>
        </div>

      </div>
    );
  };

  const renderBlindVisualization = () => {
    const slatSize = parseFloat(treatmentData.slat_size || "2");
    const numSlats = Math.floor(height / slatSize);

    return (
      <div className="space-y-4">
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-amber-50 min-h-[200px]">
          {/* Window representation */}
          <div 
            className="absolute border-2 border-gray-400 bg-white/80"
            style={{
              width: `${Math.min(width * 3, 200)}px`,
              height: `${Math.min(height * 2, 150)}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Blind slats */}
            {[...Array(Math.min(numSlats, 15))].map((_, i) => (
              <div 
                key={i}
                className="absolute left-0 right-0 bg-amber-200 border-b border-amber-300"
                style={{
                  height: `${Math.min(slatSize * 2, 10)}px`,
                  top: `${i * Math.min(slatSize * 2, 10)}px`
                }}
              />
            ))}

            {/* Control cord */}
            <div className="absolute right-2 top-0 bottom-0 w-0.5 bg-gray-400" />
          </div>

          <div className="absolute bottom-2 left-2 text-xs text-gray-600">
            <Badge variant="outline">Blinds</Badge>
          </div>
          <div className="absolute bottom-2 right-2 text-xs text-gray-600">
            {treatmentData.slat_size && (
              <Badge variant="secondary">{treatmentData.slat_size}" slats</Badge>
            )}
          </div>
        </div>

      </div>
    );
  };

  const renderRomanShadeVisualization = () => {
    const foldSpacing = parseFloat(treatmentData.fold_spacing || "8");
    const numFolds = Math.floor(height / foldSpacing);

    return (
      <div className="space-y-4">
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-green-50 min-h-[200px]">
          {/* Window representation */}
          <div 
            className="absolute border-2 border-gray-400 bg-white/80"
            style={{
              width: `${Math.min(width * 3, 200)}px`,
              height: `${Math.min(height * 2, 150)}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Roman shade fabric */}
            <div className="absolute inset-1 bg-gradient-to-b from-green-100 to-green-200">
              {/* Fold lines */}
              {[...Array(Math.min(numFolds, 8))].map((_, i) => (
                <div 
                  key={i}
                  className="absolute left-0 right-0 border-b-2 border-green-400 opacity-60"
                  style={{
                    top: `${(i + 1) * (100 / (numFolds + 1))}%`
                  }}
                />
              ))}
              
              {/* Control mechanism */}
              <div className="absolute right-2 top-0 bottom-0 w-0.5 bg-brown-400" />
            </div>
          </div>

          <div className="absolute bottom-2 left-2 text-xs text-gray-600">
            <Badge variant="outline">Roman Shade</Badge>
          </div>
          <div className="absolute bottom-2 right-2 text-xs text-gray-600">
            {treatmentData.fold_style && (
              <Badge variant="secondary">{treatmentData.fold_style.replace('_', ' ')}</Badge>
            )}
          </div>
        </div>

      </div>
    );
  };

  const renderShutterVisualization = () => {
    const louverSize = parseFloat(treatmentData.louver_size || "3.5");
    const numLouvers = Math.floor(height / louverSize);
    const panelConfig = treatmentData.panel_config || "2_panel";
    const numPanels = parseInt(panelConfig.split('_')[0]);

    return (
      <div className="space-y-4">
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-amber-50 min-h-[200px]">
          {/* Window representation */}
          <div 
            className="absolute border-2 border-gray-400 bg-white/80"
            style={{
              width: `${Math.min(width * 3, 200)}px`,
              height: `${Math.min(height * 2, 150)}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Shutter panels */}
            {[...Array(numPanels)].map((_, panelIndex) => (
              <div 
                key={panelIndex}
                className="absolute top-0 bottom-0 border-2 border-amber-400 bg-gradient-to-r from-amber-100 to-amber-200"
                style={{
                  width: `${100 / numPanels}%`,
                  left: `${panelIndex * (100 / numPanels)}%`,
                }}
              >
                {/* Louvers */}
                {[...Array(Math.min(numLouvers, 10))].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute left-1 right-1 bg-amber-300 rounded-sm"
                    style={{
                      height: `${Math.min(louverSize * 1.5, 8)}px`,
                      top: `${i * Math.min(louverSize * 1.5, 8) + 4}px`
                    }}
                  />
                ))}

                {/* Panel divider */}
                {panelIndex < numPanels - 1 && (
                  <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-amber-600" />
                )}
              </div>
            ))}
          </div>

          <div className="absolute bottom-2 left-2 text-xs text-gray-600">
            <Badge variant="outline">Shutters</Badge>
          </div>
          <div className="absolute bottom-2 right-2 text-xs text-gray-600">
            <Badge variant="secondary">{numPanels} panels</Badge>
          </div>
        </div>

      </div>
    );
  };

  const renderVisualization = () => {
    const coveringId = covering.id.toLowerCase();
    
    if (coveringId.includes('curtain') || coveringId.includes('drape')) {
      return renderCurtainVisualization();
    } else if (coveringId.includes('blind')) {
      return renderBlindVisualization();
    } else if (coveringId.includes('roman') || coveringId.includes('shade')) {
      return renderRomanShadeVisualization();
    } else if (coveringId.includes('shutter')) {
      return renderShutterVisualization();
    } else {
      // Generic visualization with full measurement display
      const scaledWidth = Math.min(Number(width) * 3, 220);
      const scaledHeight = Math.min(Number(height) * 2, 160);

      // Build a compact list of provided measurements
      const entries = Object.entries(measurements || {})
        .filter(([_, v]) => v !== null && v !== undefined && String(v).trim() !== "")
        .map(([k, v]) => ({
          key: k,
          label: k.replace(/_/g, " "),
          value: v
        }));

      return (
        <div className="panel relative rounded-lg p-6 min-h-[280px]">
          {/* Scaled window */}
          <div 
            className="absolute border-2 border-gray-400 bg-white/70"
            style={{
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -60%)'
            }}
          >
            <div className="absolute inset-1 border border-gray-300 bg-gradient-to-b from-sky-100/70 to-sky-200/70" />

            {/* Width label */}
            <div
              className="absolute left-1/2 -bottom-6 -translate-x-1/2 text-xs"
            >
              <Badge variant="secondary">
                W: {Number(width).toFixed(1)} {units.length}
              </Badge>
            </div>

            {/* Height label */}
            <div
              className="absolute -left-6 top-1/2 -translate-y-1/2 origin-center -rotate-90 text-xs"
            >
              <Badge variant="secondary">
                H: {Number(height).toFixed(1)} {units.length}
              </Badge>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-3 left-3">
            <Badge variant="outline">{covering.name}</Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="secondary">{windowType}</Badge>
          </div>

          {/* Measurements list */}
          <div className="mt-[calc(160px+2.5rem)]">
            <div className="text-sm font-medium mb-2">Measurements</div>
            {entries.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {entries.map(({ key, label, value }) => (
                  <div key={key} className="flex items-center justify-between rounded-md px-2 py-1 bg-muted/50">
                    <span className="text-muted-foreground truncate">{label}</span>
                    <span className="font-medium ml-2">
                      {/* Heuristic: append length unit to obvious length fields */}
                      {/(width|height|drop|pool|repeat|measurement|rail)/i.test(key)
                        ? `${Number(value)} ${units.length}`
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No measurements provided.</div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Treatment Preview</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{covering.name}</Badge>
            <Badge variant="secondary">{`${Number(width).toFixed(1)} × ${Number(height).toFixed(1)} ${units.length}`}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderVisualization()}
      </CardContent>
    </Card>
  );
};
