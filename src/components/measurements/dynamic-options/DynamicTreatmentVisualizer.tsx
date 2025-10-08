import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import type { CurtainTemplate } from "@/hooks/useCurtainTemplates";
import { detectTreatmentType, getTreatmentConfig, getTreatmentDisplayName } from "@/utils/treatmentTypeDetection";
import { RollerBlindVisualizer } from "./RollerBlindVisualizer";

interface DynamicTreatmentVisualizerProps {
  template: CurtainTemplate;
  measurements: any;
  selectedFabric?: any;
  selectedLining?: string;
}

export const DynamicTreatmentVisualizer = ({
  template,
  measurements,
  selectedFabric,
  selectedLining
}: DynamicTreatmentVisualizerProps) => {
  const { units } = useMeasurementUnits();
  const treatmentType = detectTreatmentType(template);
  const treatmentConfig = getTreatmentConfig(treatmentType);
  
  const width = parseFloat(measurements.rail_width || measurements.measurement_a || '150');
  const height = parseFloat(measurements.drop || measurements.measurement_b || '200');

  const renderCurtainVisualization = () => {
    const isPair = template.curtain_type === 'pair';
    const fabricWidth = width * template.fullness_ratio;
    const totalDrop = height + (template.bottom_hem || 0) + (template.header_allowance || 0);

    return (
      <div className="space-y-4">
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 bg-blue-50 min-h-[250px] overflow-hidden">
          {/* Ceiling/Track */}
          <div className="absolute top-4 left-8 right-8 border-t-2 border-gray-800">
            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold">
              {template.compatible_hardware?.[0] || 'Track/Rod'}
            </span>
          </div>

          {/* Window Frame */}
          <div className="absolute top-12 left-12 right-12 bottom-16">
            <div className="w-full h-full border-2 border-gray-400 bg-white/80 relative">
              <div className="absolute inset-2 border border-gray-300 bg-gradient-to-b from-sky-100 to-sky-200" />
            </div>
          </div>

          {/* Curtain Panels */}
          {isPair ? (
            <>
              {/* Left Panel */}
              <div 
                className="absolute top-4 left-10 bg-gradient-to-r from-red-300 to-red-400 opacity-80 rounded-sm shadow-lg"
                style={{
                  width: `${Math.min(width * 0.6, 80)}px`,
                  height: `${Math.min(totalDrop * 0.8, 180)}px`
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-red-500 opacity-60" />
                {[...Array(Math.floor(template.fullness_ratio))].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute top-2 bottom-0 w-0.5 bg-red-500 opacity-40"
                    style={{ left: `${(i + 1) * (100 / (template.fullness_ratio + 1))}%` }}
                  />
                ))}
              </div>
              
              {/* Right Panel */}
              <div 
                className="absolute top-4 right-10 bg-gradient-to-r from-red-300 to-red-400 opacity-80 rounded-sm shadow-lg"
                style={{
                  width: `${Math.min(width * 0.6, 80)}px`,
                  height: `${Math.min(totalDrop * 0.8, 180)}px`
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-red-500 opacity-60" />
                {[...Array(Math.floor(template.fullness_ratio))].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute top-2 bottom-0 w-0.5 bg-red-500 opacity-40"
                    style={{ left: `${(i + 1) * (100 / (template.fullness_ratio + 1))}%` }}
                  />
                ))}
              </div>
            </>
          ) : (
            /* Single Panel */
            <div 
              className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-300 to-red-400 opacity-80 rounded-sm shadow-lg"
              style={{
                width: `${Math.min(width * 1.2, 120)}px`,
                height: `${Math.min(totalDrop * 0.8, 180)}px`
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-red-500 opacity-60" />
              {[...Array(Math.floor(template.fullness_ratio))].map((_, i) => (
                <div 
                  key={i}
                  className="absolute top-2 bottom-0 w-0.5 bg-red-500 opacity-40"
                  style={{ left: `${(i + 1) * (100 / (template.fullness_ratio + 1))}%` }}
                />
              ))}
            </div>
          )}

          {/* Floor Line */}
          <div className="absolute bottom-4 left-8 right-8 border-t-2 border-gray-800">
            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold">
              Floor
            </span>
          </div>

          {/* Labels */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline">{template.curtain_type} Curtain</Badge>
          </div>
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary">{template.heading_name}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 text-sm">
          <div className="text-center">
            <div className="font-medium">Type</div>
            <div className="text-muted-foreground">{template.curtain_type}</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Fullness</div>
            <div className="text-muted-foreground">{template.fullness_ratio}x</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Manufacturing</div>
            <div className="text-muted-foreground">{template.manufacturing_type}</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Fabric Usage</div>
            <div className="text-muted-foreground">{(fabricWidth / 100).toFixed(1)}m</div>
          </div>
        </div>
      </div>
    );
  };

  const renderRomanBlindVisualization = () => {
    return (
      <div className="space-y-4">
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 bg-green-50 min-h-[250px]">
          {/* Window Frame */}
          <div className="absolute top-8 left-12 right-12 bottom-12">
            <div className="w-full h-full border-2 border-gray-400 bg-white/80 relative">
              {/* Roman blind fabric with folds */}
              <div className="absolute inset-2 bg-gradient-to-b from-green-200 to-green-300">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute left-0 right-0 border-b-2 border-green-500 opacity-60"
                    style={{ top: `${(i + 1) * 15}%` }}
                  />
                ))}
                <div className="absolute right-2 top-0 bottom-0 w-0.5 bg-gray-600" />
              </div>
            </div>
          </div>

          <div className="absolute bottom-2 left-2">
            <Badge variant="outline">Roman Blind</Badge>
          </div>
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary">Pleated</Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">Style</div>
            <div className="text-muted-foreground">Roman</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Mounting</div>
            <div className="text-muted-foreground">Inside</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Control</div>
            <div className="text-muted-foreground">Cord</div>
          </div>
        </div>
      </div>
    );
  };

  const renderVisualization = () => {
    switch (treatmentType) {
      case 'roller_blinds':
        return (
          <RollerBlindVisualizer
            measurements={measurements}
            selectedFabric={selectedFabric}
            controlPosition={measurements.control_position}
            mountingType={measurements.mounting_type}
            transparency={measurements.fabric_transparency}
          />
        );
      
      case 'roman_blinds':
        return renderRomanBlindVisualization();
      
      case 'curtains':
      default:
        return renderCurtainVisualization();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Treatment Preview - {getTreatmentDisplayName(treatmentType)}</span>
          <div className="flex gap-2">
            <Badge variant="outline">{template.name}</Badge>
            {selectedFabric && <Badge variant="secondary">Fabric Selected</Badge>}
            {selectedLining && selectedLining !== 'none' && <Badge variant="secondary">With Lining</Badge>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderVisualization()}
      </CardContent>
    </Card>
  );
};