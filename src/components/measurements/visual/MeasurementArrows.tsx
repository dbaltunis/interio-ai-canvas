
interface MeasurementArrowsProps {
  measurements: Record<string, any>;
  hardwareType: string;
  visibleMeasurements: string[];
}

export const MeasurementArrows = ({ 
  measurements, 
  hardwareType, 
  visibleMeasurements 
}: MeasurementArrowsProps) => {
  const hasValue = (value: any) => value && value !== "" && value !== "0" && parseFloat(value) > 0;
  const displayValue = (value: any) => hasValue(value) ? `${value}"` : "";

  const measurementConfigs = [
    {
      key: 'rail_width',
      condition: hasValue(measurements.rail_width),
      component: (
        <div className={`absolute ${hardwareType === "track" ? "top-0" : "top-12"} left-12 right-12 flex items-center`}>
          <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-blue-600"></div>
          <div className="flex-1 border-t-2 border-blue-600 relative">
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
              Rail Width: {displayValue(measurements.rail_width)}
            </span>
          </div>
          <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-blue-600"></div>
        </div>
      )
    },
    {
      key: 'measurement_a',
      condition: hasValue(measurements.measurement_a),
      component: (
        <div className="absolute top-24 left-16 right-16 flex items-center">
          <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-green-600"></div>
          <div className="flex-1 border-t-2 border-green-600 relative">
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
              A: {displayValue(measurements.measurement_a)}
            </span>
          </div>
          <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-green-600"></div>
        </div>
      )
    },
    {
      key: 'drop',
      condition: hasValue(measurements.drop),
      component: (
        <div className={`absolute ${hardwareType === "track" ? "top-6" : "top-18"} right-4 flex flex-col items-center`}>
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-purple-600"></div>
          <div className="h-60 border-l-2 border-purple-600 relative">
            <span className="absolute -right-20 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
              Drop: {displayValue(measurements.drop)}
            </span>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-purple-600"></div>
        </div>
      )
    },
    {
      key: 'measurement_b',
      condition: hasValue(measurements.measurement_b),
      component: (
        <div className="absolute top-28 left-8 bottom-20 flex flex-col items-center">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-orange-600"></div>
          <div className="flex-1 border-l-2 border-orange-600 relative">
            <span className="absolute -left-16 top-1/2 transform -translate-y-1/2 bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
              B: {displayValue(measurements.measurement_b)}
            </span>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-orange-600"></div>
        </div>
      )
    },
    {
      key: 'measurement_c',
      condition: hardwareType === "rod" && hasValue(measurements.measurement_c),
      component: (
        <div className="absolute top-2 left-20 flex flex-col items-center">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-red-600"></div>
          <div className="h-12 border-l-2 border-red-600 relative">
            <span className="absolute -left-20 top-1/2 transform -translate-y-1/2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
              C: {displayValue(measurements.measurement_c)}
            </span>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-red-600"></div>
        </div>
      )
    },
    {
      key: 'measurement_d',
      condition: hasValue(measurements.measurement_d),
      component: (
        <div className="absolute bottom-20 right-16 flex flex-col items-center">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-indigo-600"></div>
          <div className="h-16 border-l-2 border-indigo-600 relative">
            <span className="absolute -right-20 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
              D: {displayValue(measurements.measurement_d)}
            </span>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-indigo-600"></div>
        </div>
      )
    },
    {
      key: 'measurement_e',
      condition: hasValue(measurements.measurement_e),
      component: (
        <div className={`absolute ${hardwareType === "track" ? "top-6" : "top-18"} left-2 bottom-4 flex flex-col items-center`}>
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-pink-600"></div>
          <div className="flex-1 border-l-2 border-pink-600 relative">
            <span className="absolute -left-24 top-1/2 transform -translate-y-1/2 bg-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
              E: {displayValue(measurements.measurement_e)}
            </span>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-pink-600"></div>
        </div>
      )
    },
    {
      key: 'measurement_f',
      condition: hasValue(measurements.measurement_f),
      component: (
        <div className="absolute bottom-0 left-8 right-8 flex items-center">
          <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-teal-600"></div>
          <div className="flex-1 border-t-2 border-teal-600 relative">
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
              F: {displayValue(measurements.measurement_f)}
            </span>
          </div>
          <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-teal-600"></div>
        </div>
      )
    }
  ];

  return (
    <>
      {measurementConfigs.map((config) => 
        visibleMeasurements.includes(config.key) && config.condition ? (
          <div key={config.key}>
            {config.component}
          </div>
        ) : null
      )}
    </>
  );
};
