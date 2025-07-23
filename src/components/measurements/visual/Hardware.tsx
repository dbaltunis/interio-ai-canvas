
interface HardwareProps {
  hardwareType: string;
  measurements: Record<string, any>;
  visibleMeasurements: string[];
}

export const Hardware = ({ hardwareType, measurements, visibleMeasurements }: HardwareProps) => {
  const showRailWidth = visibleMeasurements.includes('rail_width') && measurements.rail_width;
  
  return (
    <div className={`absolute ${hardwareType === "track" ? "top-4" : "top-16"} left-12 right-12 flex items-center`}>
      {hardwareType === "track" ? (
        <div className="w-full h-2 bg-gray-500 relative rounded-sm shadow-sm">
          <div className="absolute -left-2 -top-1 w-2 h-4 bg-gray-600 rounded-sm"></div>
          <div className="absolute -right-2 -top-1 w-2 h-4 bg-gray-600 rounded-sm"></div>
          {!showRailWidth && (
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold bg-gray-500 text-white px-2 py-1 rounded">
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
