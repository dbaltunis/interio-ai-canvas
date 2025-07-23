
interface HardwareProps {
  hardwareType: string;
  measurements: Record<string, any>;
  visibleMeasurements: string[];
}

export const Hardware = ({ hardwareType, measurements, visibleMeasurements }: HardwareProps) => {
  const showRailWidth = visibleMeasurements.includes('rail_width') && measurements.rail_width;
  
  return (
    <div className={`absolute ${hardwareType === "track" ? "top-12" : "top-16"} left-16 right-16 flex items-center z-20`}>
      {hardwareType === "track" ? (
        <div className="w-full h-1.5 bg-gray-500 relative rounded-sm shadow-sm">
          <div className="absolute -left-2 -top-1 w-2 h-3.5 bg-gray-600 rounded-sm"></div>
          <div className="absolute -right-2 -top-1 w-2 h-3.5 bg-gray-600 rounded-sm"></div>
          {!showRailWidth && (
            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold bg-gray-500 text-white px-2 py-1 rounded">
              Track
            </span>
          )}
        </div>
      ) : (
        <div className="w-full h-3 bg-gray-600 rounded-full relative shadow-md">
          <div className="absolute -left-3 -top-1 w-5 h-5 bg-gray-700 rounded-full shadow-sm"></div>
          <div className="absolute -right-3 -top-1 w-5 h-5 bg-gray-700 rounded-full shadow-sm"></div>
          {!showRailWidth && (
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold bg-gray-600 text-white px-2 py-1 rounded">
              Rod
            </span>
          )}
        </div>
      )}
    </div>
  );
};
