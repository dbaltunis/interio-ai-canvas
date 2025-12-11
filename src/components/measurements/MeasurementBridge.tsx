import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { DynamicWindowWorksheet, DynamicWindowWorksheetRef } from './DynamicWindowWorksheet';
import { EnhancedMeasurementWorksheet } from './EnhancedMeasurementWorksheet';

interface MeasurementBridgeProps {
  mode?: 'dynamic' | 'enhanced';
  clientId?: string;
  projectId?: string;
  surfaceId?: string;
  surfaceData?: any;
  currentRoomId?: string;
  visualKey?: string;
  existingMeasurement?: any;
  existingTreatments?: any[];
  onSave?: () => void;
  onClose?: () => void;
  onSaveTreatment?: (treatmentData: any) => void;
  readOnly?: boolean;
}

export interface MeasurementBridgeRef {
  autoSave: () => Promise<void>;
  hasUnsavedChanges: () => boolean;
  getDraftData: () => any;
  saveDraftNow: () => void;
  clearDraft: () => void;
}

/**
 * Bridge component that allows switching between different measurement interfaces
 * while maintaining compatibility with existing code
 */
export const MeasurementBridge = forwardRef<MeasurementBridgeRef, MeasurementBridgeProps>(({
  mode = 'dynamic',
  clientId,
  projectId,
  surfaceId,
  surfaceData,
  currentRoomId,
  visualKey,
  existingMeasurement,
  existingTreatments = [],
  onSave,
  onClose,
  onSaveTreatment,
  readOnly = false
}, ref) => {
  
  // Create refs for both possible worksheet components
  const dynamicWorksheetRef = useRef<DynamicWindowWorksheetRef>(null);
  const enhancedWorksheetRef = useRef<{ autoSave: () => Promise<void> }>(null);
  
  // Forward the ref to the appropriate component
  useImperativeHandle(ref, () => ({
    autoSave: async () => {
      console.log(`🔄 MeasurementBridge: Auto-save triggered for ${mode} mode`);
      
      try {
        if (mode === 'enhanced' && enhancedWorksheetRef.current) {
          await enhancedWorksheetRef.current.autoSave();
        } else if (mode === 'dynamic' && dynamicWorksheetRef.current) {
          await dynamicWorksheetRef.current.autoSave();
        } else {
          console.warn(`MeasurementBridge: No ${mode} worksheet ref available for auto-save`);
        }
        console.log(`✅ MeasurementBridge: Auto-save completed for ${mode} mode`);
      } catch (error) {
        console.error(`❌ MeasurementBridge: Auto-save failed for ${mode} mode:`, error);
        throw error;
      }
    },
    hasUnsavedChanges: () => {
      if (mode === 'dynamic' && dynamicWorksheetRef.current) {
        return dynamicWorksheetRef.current.hasUnsavedChanges();
      }
      return false;
    },
    getDraftData: () => {
      if (mode === 'dynamic' && dynamicWorksheetRef.current) {
        return dynamicWorksheetRef.current.getDraftData();
      }
      return null;
    },
    saveDraftNow: () => {
      if (mode === 'dynamic' && dynamicWorksheetRef.current) {
        dynamicWorksheetRef.current.saveDraftNow();
      }
    },
    clearDraft: () => {
      if (mode === 'dynamic' && dynamicWorksheetRef.current) {
        dynamicWorksheetRef.current.clearDraft();
      }
    }
  }));

  console.log(`🔄 MeasurementBridge: Rendering in ${mode} mode for surface ${surfaceId}`);

  if (mode === 'enhanced') {
    return (
      <EnhancedMeasurementWorksheet
        ref={enhancedWorksheetRef}
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
      />
    );
  }

  return (
    <DynamicWindowWorksheet
      ref={dynamicWorksheetRef}
      clientId={clientId}
      projectId={projectId}
      surfaceId={surfaceId}
      surfaceData={surfaceData}
      visualKey={visualKey}
      existingMeasurement={existingMeasurement}
      existingTreatments={existingTreatments}
      onSave={onSave}
      onClose={onClose}
      onSaveTreatment={onSaveTreatment}
      readOnly={readOnly}
    />
  );
});

MeasurementBridge.displayName = 'MeasurementBridge';