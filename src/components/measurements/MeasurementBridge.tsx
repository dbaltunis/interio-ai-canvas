import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { DynamicWindowWorksheet } from './DynamicWindowWorksheet';
import { EnhancedMeasurementWorksheet } from './EnhancedMeasurementWorksheet';
import { useSharedMeasurementState } from '@/hooks/useSharedMeasurementState';

interface MeasurementBridgeProps {
  mode?: 'dynamic' | 'enhanced';
  clientId?: string;
  projectId?: string;
  surfaceId?: string;
  surfaceData?: any;
  currentRoomId?: string;
  existingMeasurement?: any;
  existingTreatments?: any[];
  onSave?: () => void;
  onClose?: () => void;
  onSaveTreatment?: (treatmentData: any) => void;
  readOnly?: boolean;
}

/**
 * Bridge component that allows switching between different measurement interfaces
 * while maintaining compatibility with existing code
 */
export const MeasurementBridge = forwardRef<
  { autoSave: () => Promise<void> },
  MeasurementBridgeProps
>(({
  mode = 'dynamic',
  clientId,
  projectId,
  surfaceId,
  surfaceData,
  currentRoomId,
  existingMeasurement,
  existingTreatments = [],
  onSave,
  onClose,
  onSaveTreatment,
  readOnly = false
}, ref) => {
  const [sharedState, sharedActions] = useSharedMeasurementState(surfaceId);

  // Load existing data into shared state when component mounts
  useEffect(() => {
    if (existingMeasurement || existingTreatments.length > 0) {
      sharedActions.loadFromExistingData(existingMeasurement, existingTreatments);
    }
  }, [existingMeasurement, existingTreatments, sharedActions]);
  
  // Forward the ref to the appropriate component
  useImperativeHandle(ref, () => ({
    autoSave: async () => {
      // This will be handled by the specific worksheet component
      console.log(`Auto-save triggered for ${mode} mode`);
    }
  }));

  console.log(`🔄 MeasurementBridge: Rendering in ${mode} mode for surface ${surfaceId}`);

  if (mode === 'enhanced') {
    return (
      <EnhancedMeasurementWorksheet
        ref={ref}
        clientId={clientId}
        projectId={projectId}
        surfaceId={surfaceId}
        currentRoomId={currentRoomId}
        surfaceData={surfaceData}
        existingMeasurement={existingMeasurement}
        existingTreatments={existingTreatments}
        onSave={onSave}
        onClose={onClose}
        onSaveTreatment={onSaveTreatment}
        readOnly={readOnly}
        sharedState={sharedState}
        sharedActions={sharedActions}
      />
    );
  }

  return (
    <DynamicWindowWorksheet
      ref={ref}
      clientId={clientId}
      projectId={projectId}
      surfaceId={surfaceId}
      surfaceData={surfaceData}
      existingMeasurement={existingMeasurement}
      existingTreatments={existingTreatments}
      onSave={onSave}
      onClose={onClose}
      onSaveTreatment={onSaveTreatment}
      readOnly={readOnly}
      sharedState={sharedState}
      sharedActions={sharedActions}
    />
  );
});

MeasurementBridge.displayName = 'MeasurementBridge';