
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
        <div className={`absolute ${hardwareType === "track" ? "top-8" : "top-12"} left-16 right-16 flex items-center z-30`}>
          <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-blue-600"></div>
          <div className="flex-1 border-t-2 border-blue-600 relative">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg whitespace-nowrap">
              Rail Width: {displayValue(measurements.rail_width)}
            </div>
          </div>
          <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-blue-600"></div>
        </div>
      )
    },
    {
      key: 'measurement_a',
      condition: hasValue(measurements.measurement_a),
      component: (
        <div className="absolute top-20 left-20 right-20 flex items-center z-30">
          <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-green-600"></div>
          <div className="flex-1 border-t-2 border-green-600 relative">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg whitespace-nowrap">
              Window Width (A): {displayValue(measurements.measurement_a)}
            </div>
          </div>
          <div className="w-0 h-0 border-t-2 border-b-2 border-l-4 border-transparent border-l-green-600"></div>
        </div>
      )
    },
    {
      key: 'drop',
      condition: hasValue(measurements.drop),
      component: (
        <div className={`absolute ${hardwareType === "track" ? "top-12" : "top-16"} right-12 bottom-8 flex flex-col items-center z-30`}>
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-purple-600"></div>
          <div className="flex-1 border-l-2 border-purple-600 relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-lg">
              Drop: {displayValue(measurements.drop)}
            </div>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-purple-600"></div>
        </div>
      )
    },
    {
      key: 'measurement_b',
      condition: hasValue(measurements.measurement_b),
      component: (
        <div className="absolute top-24 left-12 bottom-56 flex flex-col items-center z-30">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-orange-600"></div>
          <div className="flex-1 border-l-2 border-orange-600 relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-lg">
              Window Height (B): {displayValue(measurements.measurement_b)}
            </div>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-orange-600"></div>
        </div>
      )
    },
    {
      key: 'measurement_c',
      condition: hardwareType === "rod" && hasValue(measurements.measurement_c),
      component: (
        <div className="absolute top-8 left-8 top-16 flex flex-col items-center z-30">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-red-600"></div>
          <div className="h-8 border-l-2 border-red-600 relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-lg">
              Rod to Ceiling (C): {displayValue(measurements.measurement_c)}
            </div>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-red-600"></div>
        </div>
      )
    },
    {
      key: 'measurement_d',
      condition: hasValue(measurements.measurement_d),
      component: (
        <div className="absolute bottom-56 right-8 bottom-8 flex flex-col items-center z-30">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-indigo-600"></div>
          <div className="flex-1 border-l-2 border-indigo-600 relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-lg">
              Window to Floor (D): {displayValue(measurements.measurement_d)}
            </div>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-indigo-600"></div>
        </div>
      )
    },
    {
      key: 'measurement_e',
      condition: hasValue(measurements.measurement_e),
      component: (
        <div className="absolute top-8 left-4 bottom-8 flex flex-col items-center z-30">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-pink-600"></div>
          <div className="flex-1 border-l-2 border-pink-600 relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-pink-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-lg">
              Total Height (E): {displayValue(measurements.measurement_e)}
            </div>
          </div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-pink-600"></div>
        </div>
      )
    },
    {
      key: 'measurement_f',
      condition: hasValue(measurements.measurement_f),
      component: (
        <div className="absolute bottom-4 left-16 right-16 flex items-center z-30">
          <div className="w-0 h-0 border-t-2 border-b-2 border-r-4 border-transparent border-r-teal-600"></div>
          <div className="flex-1 border-t-2 border-teal-600 relative">
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg whitespace-nowrap">
              Total Width (F): {displayValue(measurements.measurement_f)}
            </div>
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
