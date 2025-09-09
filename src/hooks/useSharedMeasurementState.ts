import { useState, useCallback, useEffect } from 'react';

interface SharedMeasurementState {
  measurements: Record<string, any>;
  selectedTemplate: any;
  selectedTreatmentType: string;
  selectedItems: { fabric?: any; hardware?: any; material?: any };
  selectedHeading: string;
  selectedLining: string;
  layeredTreatments: any[];
  isLayeredMode: boolean;
  selectedWindowType: any;
  fabricCalculation: any;
}

interface SharedMeasurementActions {
  updateMeasurements: (measurements: Record<string, any>) => void;
  updateTemplate: (template: any) => void;
  updateTreatmentType: (type: string) => void;
  updateSelectedItems: (items: { fabric?: any; hardware?: any; material?: any }) => void;
  updateHeading: (heading: string) => void;
  updateLining: (lining: string) => void;
  updateLayeredTreatments: (treatments: any[]) => void;
  updateLayeredMode: (isLayered: boolean) => void;
  updateWindowType: (windowType: any) => void;
  updateFabricCalculation: (calculation: any) => void;
  loadFromExistingData: (measurement: any, treatments: any[]) => void;
  reset: () => void;
}

const initialState: SharedMeasurementState = {
  measurements: {},
  selectedTemplate: null,
  selectedTreatmentType: "curtains",
  selectedItems: {},
  selectedHeading: "standard",
  selectedLining: "none",
  layeredTreatments: [],
  isLayeredMode: false,
  selectedWindowType: null,
  fabricCalculation: null,
};

// Global state store for sharing between Dynamic and Enhanced modes
let globalState = { ...initialState };
let subscribers: Set<() => void> = new Set();

const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

export const useSharedMeasurementState = (surfaceId?: string): [SharedMeasurementState, SharedMeasurementActions] => {
  const [state, setState] = useState<SharedMeasurementState>(() => ({ ...globalState }));

  // Subscribe to global state changes
  useEffect(() => {
    const callback = () => {
      setState({ ...globalState });
    };
    
    subscribers.add(callback);
    
    return () => {
      subscribers.delete(callback);
    };
  }, []);

  const updateGlobalState = useCallback((updates: Partial<SharedMeasurementState>) => {
    globalState = { ...globalState, ...updates };
    notifySubscribers();
  }, []);

  const actions: SharedMeasurementActions = {
    updateMeasurements: useCallback((measurements: Record<string, any>) => {
      updateGlobalState({ measurements });
    }, [updateGlobalState]),

    updateTemplate: useCallback((template: any) => {
      updateGlobalState({ selectedTemplate: template });
    }, [updateGlobalState]),

    updateTreatmentType: useCallback((type: string) => {
      updateGlobalState({ selectedTreatmentType: type });
    }, [updateGlobalState]),

    updateSelectedItems: useCallback((items: { fabric?: any; hardware?: any; material?: any }) => {
      updateGlobalState({ selectedItems: { ...globalState.selectedItems, ...items } });
    }, [updateGlobalState]),

    updateHeading: useCallback((heading: string) => {
      updateGlobalState({ selectedHeading: heading });
    }, [updateGlobalState]),

    updateLining: useCallback((lining: string) => {
      updateGlobalState({ selectedLining: lining });
    }, [updateGlobalState]),

    updateLayeredTreatments: useCallback((treatments: any[]) => {
      updateGlobalState({ layeredTreatments: treatments });
    }, [updateGlobalState]),

    updateLayeredMode: useCallback((isLayered: boolean) => {
      updateGlobalState({ isLayeredMode: isLayered });
    }, [updateGlobalState]),

    updateWindowType: useCallback((windowType: any) => {
      updateGlobalState({ selectedWindowType: windowType });
    }, [updateGlobalState]),

    updateFabricCalculation: useCallback((calculation: any) => {
      updateGlobalState({ fabricCalculation: calculation });
    }, [updateGlobalState]),

    loadFromExistingData: useCallback((measurement: any, treatments: any[]) => {
      const updates: Partial<SharedMeasurementState> = {
        measurements: measurement?.measurements || {},
        selectedWindowType: measurement?.window_type || null,
        selectedTemplate: measurement?.template || null,
        selectedTreatmentType: measurement?.treatment_type || "curtains",
        selectedItems: measurement?.selected_items || {},
        fabricCalculation: measurement?.fabric_calculation || null,
        selectedHeading: measurement?.selected_heading || "standard",
        selectedLining: measurement?.selected_lining || "none",
        layeredTreatments: measurement?.layered_treatments || [],
        isLayeredMode: (measurement?.layered_treatments?.length || 0) > 0,
      };

      // Load from treatments if available
      if (treatments && treatments.length > 0) {
        const treatment = treatments[0];
        try {
          const details = typeof treatment.treatment_details === 'string' 
            ? JSON.parse(treatment.treatment_details) 
            : treatment.treatment_details;
            
          if (details) {
            if (details.selected_heading) updates.selectedHeading = details.selected_heading;
            if (details.selected_lining) updates.selectedLining = details.selected_lining;
            if (details.window_covering) updates.selectedTemplate = details.window_covering;
          }
        } catch (e) {
          console.warn("Failed to parse treatment details:", e);
        }
      }

      updateGlobalState(updates);
    }, [updateGlobalState]),

    reset: useCallback(() => {
      updateGlobalState({ ...initialState });
    }, [updateGlobalState])
  };

  return [state, actions];
};