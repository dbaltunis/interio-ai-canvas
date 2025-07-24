
import { Card } from "@/components/ui/card";
import { WindowFrame } from "./WindowFrame";
import { CurtainPanels } from "./CurtainPanels";
import { MeasurementArrows } from "./MeasurementArrows";
import { Hardware } from "./Hardware";

interface MeasurementDiagramProps {
  measurements: Record<string, any>;
  windowType: string;
  visibleMeasurements: string[];
}

export const MeasurementDiagram = ({ 
  measurements, 
  windowType, 
  visibleMeasurements 
}: MeasurementDiagramProps) => {
  const curtainType = measurements.curtain_type || "pair";
  const curtainSide = measurements.curtain_side || "left";
  const hardwareType = measurements.hardware_type || "rod";
  const poolingOption = measurements.pooling_option || "above_floor";
  const poolingAmount = measurements.pooling_amount || "";

  return (
    <Card className="p-4 bg-gradient-to-b from-blue-50 to-gray-50 border-2 border-gray-200 shadow-inner">
      <div className="relative w-full h-[700px] overflow-visible">
        {/* Ceiling Line - Proper padding to prevent cutoff */}
        <div className="absolute top-16 left-12 right-12 border-t-2 border-gray-800 z-0">
          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold bg-white px-2 py-1 rounded border border-gray-300 shadow-sm">
            Ceiling
          </span>
        </div>

        {/* Hardware - Positioned relative to ceiling */}
        <Hardware 
          hardwareType={hardwareType}
          measurements={measurements}
          visibleMeasurements={visibleMeasurements}
        />

        {/* Window Frame - Proper positioning */}
        <WindowFrame windowType={windowType} />

        {/* Curtain Panels */}
        <CurtainPanels
          curtainType={curtainType}
          curtainSide={curtainSide}
          hardwareType={hardwareType}
          poolingOption={poolingOption}
          poolingAmount={poolingAmount}
        />

        {/* Measurement Arrows - Now properly positioned */}
        <MeasurementArrows
          measurements={measurements}
          hardwareType={hardwareType}
          visibleMeasurements={visibleMeasurements}
        />

        {/* Floor Line */}
        <div className="absolute bottom-16 left-12 right-12 border-t-4 border-gray-800 z-0">
          <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold bg-white px-2 py-1 rounded border border-gray-300 shadow-sm">
            Floor
          </span>
        </div>
      </div>
    </Card>
  );
};
