/**
 * Utility functions for migrating between different measurement formats
 * and ensuring backward compatibility
 */

export interface LegacyMeasurement {
  measurements: Record<string, any>;
  measurement_type?: string;
  window_covering_id?: string;
  room_id?: string;
}

export interface DynamicMeasurement {
  measurements: Record<string, any>;
  window_type: any;
  template: any;
  treatment_type: string;
  selected_items: {
    fabric?: any;
    hardware?: any;
    material?: any;
  };
  fabric_calculation?: any;
}

/**
 * Convert legacy measurement format to dynamic format
 */
export const convertLegacyToDynamic = (legacy: LegacyMeasurement): Partial<DynamicMeasurement> => {
  console.log('🔄 Converting legacy measurement to dynamic format:', legacy);

  const dynamic: Partial<DynamicMeasurement> = {
    measurements: legacy.measurements || {},
    treatment_type: 'curtains' // Default to curtains
  };

  // Map measurement type to window type
  if (legacy.measurement_type) {
    switch (legacy.measurement_type) {
      case 'standard_window':
        dynamic.window_type = { key: 'standard', name: 'Standard Window' };
        break;
      case 'bay':
        dynamic.window_type = { key: 'bay', name: 'Bay Window' };
        break;
      case 'french_doors':
        dynamic.window_type = { key: 'french_doors', name: 'French Doors' };
        break;
      default:
        dynamic.window_type = { key: 'standard', name: 'Standard Window' };
    }
  }

  // Map window covering to treatment type
  if (legacy.window_covering_id) {
    if (legacy.window_covering_id.includes('blind')) {
      dynamic.treatment_type = 'blinds';
    } else if (legacy.window_covering_id.includes('shutter')) {
      dynamic.treatment_type = 'shutters';
    } else {
      dynamic.treatment_type = 'curtains';
    }
  }

  console.log('🔄 Converted dynamic measurement:', dynamic);
  return dynamic;
};

/**
 * Convert dynamic measurement format to legacy format
 */
export const convertDynamicToLegacy = (dynamic: DynamicMeasurement): LegacyMeasurement => {
  console.log('🔄 Converting dynamic measurement to legacy format:', dynamic);

  const legacy: LegacyMeasurement = {
    measurements: dynamic.measurements || {}
  };

  // Map window type to measurement type
  if (dynamic.window_type?.key) {
    legacy.measurement_type = dynamic.window_type.key;
  }

  // Map treatment type to window covering
  switch (dynamic.treatment_type) {
    case 'blinds':
      legacy.window_covering_id = 'venetian_blinds';
      break;
    case 'shutters':
      legacy.window_covering_id = 'plantation_shutters';
      break;
    case 'curtains':
    default:
      legacy.window_covering_id = 'curtains';
  }

  console.log('🔄 Converted legacy measurement:', legacy);
  return legacy;
};

/**
 * Merge legacy and dynamic measurement data, prioritizing dynamic
 */
export const mergeMeasurementData = (
  legacy: LegacyMeasurement | null, 
  dynamic: Partial<DynamicMeasurement> | null
): Partial<DynamicMeasurement> => {
  console.log('🔄 Merging measurement data:', { legacy, dynamic });

  let merged: Partial<DynamicMeasurement> = {};

  // Start with converted legacy data if available
  if (legacy) {
    merged = convertLegacyToDynamic(legacy);
  }

  // Override with dynamic data if available
  if (dynamic) {
    merged = {
      ...merged,
      ...dynamic,
      measurements: {
        ...merged.measurements,
        ...dynamic.measurements
      }
    };
  }

  console.log('🔄 Merged measurement data:', merged);
  return merged;
};

/**
 * Validate measurement data integrity
 */
export const validateMeasurement = (measurement: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!measurement) {
    errors.push('No measurement data provided');
    return { valid: false, errors };
  }

  if (!measurement.measurements || Object.keys(measurement.measurements).length === 0) {
    errors.push('No measurement values found');
  }

  // Check for required fields based on window type
  const windowType = measurement.window_type?.key || measurement.measurement_type;
  if (windowType === 'bay') {
    if (!measurement.measurements.center_width) {
      errors.push('Bay windows require center width measurement');
    }
    if (!measurement.measurements.side_width) {
      errors.push('Bay windows require side width measurement');
    }
  } else {
    if (!measurement.measurements.width && !measurement.measurements.rail_width) {
      errors.push('Standard measurements require width');
    }
    if (!measurement.measurements.height && !measurement.measurements.drop) {
      errors.push('Standard measurements require height');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};