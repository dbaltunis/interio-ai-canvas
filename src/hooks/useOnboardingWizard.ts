import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

export interface OnboardingData {
  company_info: {
    company_name?: string;
    abn?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    logo_url?: string;
  };
  regional_settings: {
    measurement_units?: 'metric' | 'imperial';
    currency?: string;
    date_format?: string;
    timezone?: string;
  };
  document_sequences: {
    draft_prefix?: string;
    draft_start?: number;
    quote_prefix?: string;
    quote_start?: number;
    order_prefix?: string;
    order_start?: number;
    invoice_prefix?: string;
    invoice_start?: number;
    job_prefix?: string;
    job_start?: number;
  };
  status_automations: {
    statuses?: Array<{ id: string; name: string; color: string; isDefault?: boolean }>;
    automations?: Record<string, string[]>;
    deduction_status?: string;
    reversal_status?: string;
  };
  inventory_data: {
    fabrics_csv?: string;
    hardware_csv?: string;
    services_csv?: string;
    imported_count?: number;
  };
  pricing_grids: {
    grids?: Array<{
      name: string;
      product_type: string;
      csv_data: string;
    }>;
  };
  window_coverings: {
    curtains?: boolean;
    roman_blinds?: boolean;
    roller_blinds?: boolean;
    venetian_blinds?: boolean;
    cellular_blinds?: boolean;
    vertical_blinds?: boolean;
    shutters?: boolean;
    awnings?: boolean;
    pricing_methods?: Record<string, string>;
  };
  manufacturing_settings: {
    header_cm?: number;
    bottom_hem_cm?: number;
    side_hems_cm?: number;
    returns?: number;
    seams?: number;
    waste_percentage?: number;
  };
  stock_management: {
    track_inventory?: boolean;
    low_stock_threshold?: number;
    custom_statuses?: Array<{ name: string; color: string }>;
  };
  email_templates: {
    quote_sent?: { subject: string; body: string };
    invoice?: { subject: string; body: string };
    reminder?: { subject: string; body: string };
  };
  quotation_settings: {
    validity_days?: number;
    terms_conditions?: string;
    quote_style?: string;
  };
  integrations_config: {
    sendgrid_enabled?: boolean;
    sendgrid_api_key?: string;
    erp_enabled?: boolean;
    erp_details?: string;
    suppliers?: string[];
  };
  users_permissions: {
    users?: Array<{
      name: string;
      email: string;
      role: string;
    }>;
  };
}

export interface WizardState {
  currentStep: number;
  data: OnboardingData;
  isLoading: boolean;
  isSaving: boolean;
  wizardCompleted: boolean;
  completionStatus: Record<string, boolean>;
}

const STEPS = [
  'company_info',
  'regional_settings',
  'document_sequences',
  'status_automations',
  'inventory_data',
  'pricing_grids',
  'window_coverings',
  'manufacturing_settings',
  'stock_management',
  'email_templates',
  'quotation_settings',
  'integrations_config',
  'users_permissions',
  'review',
] as const;

const defaultData: OnboardingData = {
  company_info: {},
  regional_settings: { measurement_units: 'metric', currency: 'USD', date_format: 'DD/MM/YYYY' },
  document_sequences: { draft_prefix: 'DRF-', quote_prefix: 'QT-', order_prefix: 'ORD-', invoice_prefix: 'INV-', job_prefix: 'JOB-' },
  status_automations: { statuses: [], automations: {}, deduction_status: 'in_progress', reversal_status: 'cancelled' },
  inventory_data: {},
  pricing_grids: { grids: [] },
  window_coverings: {},
  manufacturing_settings: { header_cm: 10, bottom_hem_cm: 15, side_hems_cm: 3, waste_percentage: 10 },
  stock_management: { track_inventory: true, low_stock_threshold: 5 },
  email_templates: {},
  quotation_settings: { validity_days: 30 },
  integrations_config: {},
  users_permissions: { users: [] },
};

export const useOnboardingWizard = () => {
  const { user } = useAuth();
  const [state, setState] = useState<WizardState>({
    currentStep: 0,
    data: defaultData,
    isLoading: true,
    isSaving: false,
    wizardCompleted: false,
    completionStatus: {},
  });

  // Load existing data on mount
  useEffect(() => {
    if (!user?.id) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading onboarding data:', error);
          return;
        }

        if (data) {
          const dbData = data as any;
          const loadedData: OnboardingData = {
            company_info: (dbData.company_info as OnboardingData['company_info']) || defaultData.company_info,
            regional_settings: (dbData.regional_settings as OnboardingData['regional_settings']) || defaultData.regional_settings,
            document_sequences: (dbData.document_sequences as OnboardingData['document_sequences']) || defaultData.document_sequences,
            status_automations: (dbData.status_automations as OnboardingData['status_automations']) || defaultData.status_automations,
            inventory_data: (dbData.inventory_data as OnboardingData['inventory_data']) || defaultData.inventory_data,
            pricing_grids: (dbData.pricing_grids as OnboardingData['pricing_grids']) || defaultData.pricing_grids,
            window_coverings: (dbData.window_coverings as OnboardingData['window_coverings']) || defaultData.window_coverings,
            manufacturing_settings: (dbData.manufacturing_settings as OnboardingData['manufacturing_settings']) || defaultData.manufacturing_settings,
            stock_management: (dbData.stock_management as OnboardingData['stock_management']) || defaultData.stock_management,
            email_templates: (dbData.email_templates as OnboardingData['email_templates']) || defaultData.email_templates,
            quotation_settings: (dbData.quotation_settings as OnboardingData['quotation_settings']) || defaultData.quotation_settings,
            integrations_config: (dbData.integrations_config as OnboardingData['integrations_config']) || defaultData.integrations_config,
            users_permissions: (dbData.users_permissions as OnboardingData['users_permissions']) || defaultData.users_permissions,
          };

          setState(prev => ({
            ...prev,
            data: loadedData,
            wizardCompleted: data.wizard_completed || false,
            completionStatus: calculateCompletionStatus(loadedData),
          }));
        }
      } catch (err) {
        console.error('Error loading onboarding data:', err);
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadData();
  }, [user?.id]);

  // Calculate completion status for each section
  const calculateCompletionStatus = (data: OnboardingData): Record<string, boolean> => {
    return {
      company_info: Boolean(data.company_info?.company_name && data.company_info?.email),
      regional_settings: Boolean(data.regional_settings?.currency && data.regional_settings?.measurement_units),
      document_sequences: Boolean(data.document_sequences?.quote_prefix),
      inventory_data: Boolean(data.inventory_data?.imported_count && data.inventory_data.imported_count > 0),
      pricing_grids: Boolean(data.pricing_grids?.grids && data.pricing_grids.grids.length > 0),
      window_coverings: Boolean(
        data.window_coverings?.curtains || 
        data.window_coverings?.roller_blinds ||
        data.window_coverings?.roman_blinds
      ),
      manufacturing_settings: Boolean(data.manufacturing_settings?.header_cm),
      stock_management: data.stock_management?.track_inventory !== undefined,
      email_templates: Boolean(data.email_templates?.quote_sent?.subject),
      quotation_settings: Boolean(data.quotation_settings?.validity_days),
      integrations_config: true, // Optional section
      users_permissions: true, // Optional section
    };
  };

  // Save section data to database
  const saveSection = useCallback(async (section: keyof OnboardingData, sectionData: any) => {
    if (!user?.id) return;

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          [section]: sectionData,
          updated_at: new Date().toISOString(),
        } as any, { onConflict: 'user_id' });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        data: { ...prev.data, [section]: sectionData },
        completionStatus: calculateCompletionStatus({ ...prev.data, [section]: sectionData }),
      }));
    } catch (err) {
      console.error('Error saving section:', err);
      toast.error('Failed to save progress');
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [user?.id]);

  // Debounced save for auto-save functionality
  const debouncedSave = useDebouncedCallback(
    (section: keyof OnboardingData, sectionData: any) => saveSection(section, sectionData),
    800
  );

  // Update section data (triggers auto-save)
  const updateSection = useCallback((section: keyof OnboardingData, sectionData: any) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, [section]: sectionData },
    }));
    debouncedSave(section, sectionData);
  }, [debouncedSave]);

  // Navigation
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < STEPS.length) {
      setState(prev => ({ ...prev, currentStep: step }));
    }
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, STEPS.length - 1),
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  }, []);

  // Mark wizard as complete
  const completeWizard = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          wizard_completed: true,
          wizard_completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      setState(prev => ({ ...prev, wizardCompleted: true }));
      toast.success('Onboarding completed!');
    } catch (err) {
      console.error('Error completing wizard:', err);
      toast.error('Failed to complete onboarding');
    }
  }, [user?.id]);

  return {
    ...state,
    steps: STEPS,
    currentStepName: STEPS[state.currentStep],
    updateSection,
    saveSection,
    goToStep,
    nextStep,
    prevStep,
    completeWizard,
    totalSteps: STEPS.length,
    progress: Math.round(((state.currentStep + 1) / STEPS.length) * 100),
  };
};
