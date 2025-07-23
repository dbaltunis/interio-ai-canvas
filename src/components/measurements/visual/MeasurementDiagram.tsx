
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
    <Card className="p-6 bg-gradient-to-b from-blue-50 to-gray-50 border-2 border-gray-200 shadow-inner">
      <div className="relative w-full h-[500px] overflow-hidden">
        {/* Ceiling Line - Moved higher to avoid cutoff */}
        <div className="absolute top-2 left-8 right-8 border-t-2 border-gray-800">
          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold bg-white px-2 rounded">
            Ceiling
          </span>
        </div>

        {/* Hardware */}
        <Hardware 
          hardwareType={hardwareType}
          measurements={measurements}
          visibleMeasurements={visibleMeasurements}
        />

        {/* Window Frame */}
        <WindowFrame windowType={windowType} />

        {/* Curtain Panels */}
        <CurtainPanels
          curtainType={curtainType}
          curtainSide={curtainSide}
          hardwareType={hardwareType}
          poolingOption={poolingOption}
          poolingAmount={poolingAmount}
        />

        {/* Measurement Arrows */}
        <MeasurementArrows
          measurements={measurements}
          hardwareType={hardwareType}
          visibleMeasurements={visibleMeasurements}
        />

        {/* Floor Line */}
        <div className="absolute bottom-4 left-8 right-8 border-t-4 border-gray-800">
          <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold bg-white px-2 rounded">
            Floor
          </span>
        </div>
      </div>
    </Card>
  );
};
