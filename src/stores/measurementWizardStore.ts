import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface MeasurementState {
  // Step data
  selectedTemplate?: any;
  selectedWindowType?: any;
  selectedHardware: any[];
  panelSetup: 'pair' | 'single_left' | 'single_right';
  measurements: Record<string, number>;
  selectedFabric?: any;
  selectedLining?: any;
  selectedInterlining?: any;
  selectedHeading?: string;
  selectedFinish?: string;
  extras: any[];
  notes: string;
  
  // Calculated data
  bom?: any[];
  priceBreakdown?: any;
  priceTotal?: number;
  
  // Metadata
  currentStep: number;
  mode: 'quick' | 'pro';
  jobId?: string;
  windowId?: string;
  
  // UI state
  isCalculating: boolean;
  error?: string;
}

interface MeasurementActions {
  // Step navigation
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Data updates
  setTemplate: (template: any) => void;
  setWindowType: (windowType: any) => void;
  setHardware: (hardware: any[]) => void;
  setPanelSetup: (setup: 'pair' | 'single_left' | 'single_right') => void;
  updateMeasurement: (key: string, value: number) => void;
  setFabric: (fabric: any) => void;
  setLining: (lining: any) => void;
  setInterlining: (interlining: any) => void;
  setHeading: (heading: string) => void;
  setFinish: (finish: string) => void;
  setExtras: (extras: any[]) => void;
  setNotes: (notes: string) => void;
  
  // Mode toggle
  toggleMode: () => void;
  
  // Calculations
  calculatePricing: () => Promise<void>;
  
  // Persistence
  saveToJob: () => Promise<void>;
  loadFromJob: (jobId: string, windowId: string) => Promise<void>;
  
  // Autosave
  autosave: () => Promise<void>;
  
  // Reset
  reset: () => void;
}

const initialState: MeasurementState = {
  selectedHardware: [],
  panelSetup: 'pair',
  measurements: {},
  extras: [],
  notes: '',
  currentStep: 1,
  mode: 'quick',
  isCalculating: false,
};

export const useMeasurementWizardStore = create<MeasurementState & MeasurementActions>((set, get) => ({
  ...initialState,
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 8) {
      set({ currentStep: currentStep + 1 });
    }
  },
  
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },
  
  setTemplate: (template) => {
    set({ 
      selectedTemplate: template,
      mode: template?.default_mode || 'quick'
    });
    get().autosave();
  },
  
  setWindowType: (windowType) => set({ selectedWindowType: windowType }),
  
  setHardware: (hardware) => {
    set({ selectedHardware: hardware });
    get().autosave();
  },
  
  setPanelSetup: (setup) => set({ panelSetup: setup }),
  
  updateMeasurement: (key, value) => {
    const { measurements } = get();
    set({ 
      measurements: { ...measurements, [key]: value }
    });
    get().autosave();
  },
  
  setFabric: (fabric) => {
    set({ selectedFabric: fabric });
    get().autosave();
  },
  
  setLining: (lining) => set({ selectedLining: lining }),
  
  setInterlining: (interlining) => set({ selectedInterlining: interlining }),
  
  setHeading: (heading) => set({ selectedHeading: heading }),
  
  setFinish: (finish) => set({ selectedFinish: finish }),
  
  setExtras: (extras) => set({ extras }),
  
  setNotes: (notes) => set({ notes }),
  
  toggleMode: () => {
    const { mode } = get();
    set({ mode: mode === 'quick' ? 'pro' : 'quick' });
  },
  
  calculatePricing: async () => {
    const state = get();
    
    if (!state.selectedTemplate) {
      set({ error: 'No template selected' });
      return;
    }
    
    set({ isCalculating: true, error: undefined });
    
    try {
      // Get org_id from user session or JWT
      const { data: { session } } = await supabase.auth.getSession();
      const orgId = session?.user?.user_metadata?.org_id;
      
      if (!orgId) {
        throw new Error('Organization ID not found');
      }
      
      // Prepare state for calculation
      const calculationState = {
        rail_width_mm: state.measurements.rail_width || 1000,
        drop_mm: state.measurements.drop || 2000,
        ceiling_to_floor_mm: state.measurements.ceiling_to_floor,
        wall_to_wall_mm: state.measurements.wall_to_wall,
        recess_depth_mm: state.measurements.recess_depth,
        panel_setup: state.panelSetup,
        selected_fabric: state.selectedFabric,
        selected_lining: state.selectedLining,
        selected_interlining: state.selectedInterlining,
        selected_heading: state.selectedHeading,
        selected_finish: state.selectedFinish,
        selected_hardware: state.selectedHardware,
        extras: state.extras,
        ...state.measurements
      };
      
      const { data, error } = await supabase.functions.invoke('calc_bom_and_price', {
        body: {
          org_id: orgId,
          template_id: state.selectedTemplate.id,
          window_type_id: state.selectedWindowType?.id,
          state: calculationState
        }
      });
      
      if (error) throw error;
      
      set({
        bom: data.bom,
        priceBreakdown: data.price_breakdown,
        priceTotal: data.price_total,
        isCalculating: false
      });
      
    } catch (error) {
      console.error('Error calculating pricing:', error);
      set({ 
        error: error.message || 'Failed to calculate pricing',
        isCalculating: false 
      });
    }
  },
  
  saveToJob: async () => {
    const state = get();
    
    if (!state.jobId) {
      console.warn('No job ID set for saving');
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const orgId = session?.user?.user_metadata?.org_id;
      
      if (!orgId) {
        throw new Error('Organization ID not found');
      }
      
      const windowData = {
        org_id: orgId,
        job_id: state.jobId,
        template_id: state.selectedTemplate?.id,
        window_type_id: state.selectedWindowType?.id,
        state: {
          selectedTemplate: state.selectedTemplate,
          selectedWindowType: state.selectedWindowType,
          selectedHardware: state.selectedHardware,
          panelSetup: state.panelSetup,
          measurements: state.measurements,
          selectedFabric: state.selectedFabric,
          selectedLining: state.selectedLining,
          selectedInterlining: state.selectedInterlining,
          selectedHeading: state.selectedHeading,
          selectedFinish: state.selectedFinish,
          extras: state.extras,
          notes: state.notes,
          mode: state.mode
        },
        bom: state.bom,
        price_breakdown: state.priceBreakdown,
        price_total: state.priceTotal
      };
      
      if (state.windowId) {
        // Update existing window
        await supabase
          .from('job_windows')
          .update(windowData)
          .eq('id', state.windowId);
      } else {
        // Create new window
        const { data, error } = await supabase
          .from('job_windows')
          .insert(windowData)
          .select()
          .single();
          
        if (error) throw error;
        set({ windowId: data.id });
      }
      
    } catch (error) {
      console.error('Error saving to job:', error);
      set({ error: error.message || 'Failed to save to job' });
    }
  },
  
  loadFromJob: async (jobId: string, windowId: string) => {
    try {
      const { data, error } = await supabase
        .from('job_windows')
        .select('*')
        .eq('id', windowId)
        .single();
        
      if (error) throw error;
      
      if (data && data.state) {
        const state = data.state as any;
        set({
          jobId,
          windowId,
          selectedTemplate: state.selectedTemplate,
          selectedWindowType: state.selectedWindowType,
          selectedHardware: Array.isArray(state.selectedHardware) ? state.selectedHardware : [],
          panelSetup: state.panelSetup || 'pair',
          measurements: state.measurements || {},
          selectedFabric: state.selectedFabric,
          selectedLining: state.selectedLining,
          selectedInterlining: state.selectedInterlining,
          selectedHeading: state.selectedHeading,
          selectedFinish: state.selectedFinish,
          extras: Array.isArray(state.extras) ? state.extras : [],
          notes: state.notes || '',
          mode: state.mode || 'quick',
          bom: Array.isArray(data.bom) ? data.bom : [],
          priceBreakdown: data.price_breakdown,
          priceTotal: data.price_total
        });
      }
      
    } catch (error) {
      console.error('Error loading from job:', error);
      set({ error: error.message || 'Failed to load from job' });
    }
  },
  
  autosave: async () => {
    const state = get();
    if (!state.selectedTemplate) return;

    try {
      // Save to job_windows (temporary job)
      const { data: { session } } = await supabase.auth.getSession();
      const orgId = session?.user?.user_metadata?.org_id;
      
      if (!orgId) return;

      const jobData = {
        org_id: orgId,
        job_id: state.jobId || 'temp-autosave',
        template_id: state.selectedTemplate.id,
        window_type_id: state.selectedWindowType?.id || state.selectedTemplate.id,
        state: {
          selectedTemplate: state.selectedTemplate,
          selectedHardware: state.selectedHardware,
          selectedFabric: state.selectedFabric,
          measurements: state.measurements,
          priceBreakdown: state.priceBreakdown,
          bom: state.bom
        }
      };

      const { data, error } = await supabase
        .from('job_windows')
        .upsert(jobData, {
          onConflict: 'org_id,template_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger BOM and pricing calculation
      const calcResponse = await supabase.functions.invoke('calc_bom_and_price', {
        body: {
          org_id: orgId,
          template_id: state.selectedTemplate.id,
          window_type_id: state.selectedWindowType?.id || state.selectedTemplate.id,
          state: {
            rail_width_mm: state.measurements.rail_width || 1000,
            drop_mm: state.measurements.drop || 2000,
            panel_setup: state.panelSetup,
            selected_fabric: state.selectedFabric,
            selected_hardware: state.selectedHardware,
            ...state.measurements
          }
        }
      });

      if (calcResponse.data) {
        set({
          priceBreakdown: calcResponse.data.price_breakdown,
          bom: calcResponse.data.bom,
          priceTotal: calcResponse.data.price_total
        });
      }
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  },

  reset: () => {
    set({
      ...initialState,
      currentStep: 1
    });
  }
}));