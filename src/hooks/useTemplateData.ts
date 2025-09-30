import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessSettings } from "./useBusinessSettings";

interface TemplateData {
  project?: any;
  client?: any;
  businessSettings?: any;
  treatments: any[];
  items: any[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  terms?: string;
  notes?: string;
  validUntil?: string;
}

export const useTemplateData = (projectId?: string, useRealData: boolean = false) => {
  const { data: businessSettings } = useBusinessSettings();

  return useQuery<TemplateData>({
    queryKey: ['template-data', projectId, useRealData],
    queryFn: async () => {
      // If we want real data and have a project ID, fetch it
      if (useRealData && projectId) {
        try {
          // Fetch project with client
          const { data: project, error: projectError } = await supabase
            .from('projects')
            .select(`
              *,
              client:clients(*)
            `)
            .eq('id', projectId)
            .maybeSingle();

          if (projectError) {
            console.error('Project fetch error:', projectError);
            throw projectError;
          }

          if (!project) {
            throw new Error('Project not found');
          }

          // Fetch workshop items separately
          const { data: workshopItems } = await supabase
            .from('workshop_items')
            .select('*')
            .eq('project_id', projectId);

          const treatments = workshopItems || [];
          
          // Transform workshop items to template items format
          const items = treatments.map((item: any, index: number) => ({
            id: item.id,
            description: `${item.treatment_type || 'Window Treatment'} - ${item.location || 'Room'} (${item.quantity || 1} units)`,
            quantity: item.quantity || 1,
            unit_price: item.total_cost || 0,
            total: (item.total_cost || 0) * (item.quantity || 1),
            room: item.location || item.room_name || 'Room',
            category: item.category || 'window-treatment',
            treatment_name: item.treatment_type || 'Window Treatment',
            fabric_type: item.fabric_details?.name || '',
            color: item.fabric_details?.color || '',
            width: item.measurements?.rail_width || '',
            drop: item.measurements?.drop_height || ''
          }));

          // Calculate totals
          const subtotal = items.reduce((sum, item) => sum + item.total, 0);
          const pricingSettings = businessSettings?.pricing_settings as any;
          const taxRate = pricingSettings?.tax_rate || 0.10;
          const taxAmount = subtotal * taxRate;
          const total = subtotal + taxAmount;

          const measurementUnits = businessSettings?.measurement_units as any;

          return {
            project,
            client: project.client,
            businessSettings,
            treatments,
            items,
            subtotal,
            taxRate,
            taxAmount,
            total,
            currency: measurementUnits?.currency || 'USD',
            terms: 'Payment due within 30 days of invoice date.',
            notes: project.description || '',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          };
        } catch (error) {
          console.error('Error fetching real project data:', error);
          // Fall back to mock data if real data fails
        }
      }

      // Return comprehensive mock data for template preview
      return {
        project: {
          id: 'mock-project-id',
          quote_number: 'QT-2024-001',
          job_number: 'JOB-2024-001',
          name: 'Living Room & Bedroom Window Treatments',
          created_at: new Date().toISOString(),
          status: 'quoted',
          client: {
            id: 'mock-client-id',
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '(555) 987-6543',
            address: '456 Residential Street',
            city: 'Anytown',
            state: 'ST',
            zip_code: '12345',
            company_name: 'Smith Family Residence',
            country: 'United States'
          }
        },
        client: {
          id: 'mock-client-id',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '(555) 987-6543',
          address: '456 Residential Street',
          city: 'Anytown',
          state: 'ST',
          zip_code: '12345',
          company_name: 'Smith Family Residence',
          country: 'United States'
        },
        businessSettings: businessSettings || {
          company_name: 'Premium Window Treatments Co.',
          address: '123 Business Ave, Suite 100',
          city: 'Business City',
          state: 'BC',
          zip_code: '54321',
          business_phone: '(555) 123-4567',
          business_email: 'info@premiumwindowtreatments.com',
          website: 'www.premiumwindowtreatments.com',
          company_logo_url: null,
          abn: 'ABN 12 345 678 901',
          country: 'Australia'
        },
        treatments: [
          {
            id: 'treatment-1',
            room_name: 'Living Room',
            treatment_name: 'Motorized Roller Blinds',
            description: 'Premium blackout fabric with Somfy motor',
            quantity: 3,
            unit_price: 450.00,
            total: 1350.00,
            fabric_type: 'Blackout',
            color: 'Charcoal Grey',
            width: '1200mm',
            drop: '1800mm'
          },
          {
            id: 'treatment-2', 
            room_name: 'Master Bedroom',
            treatment_name: 'Roman Shades',
            description: 'Custom linen blend with chain operation',
            quantity: 2,
            unit_price: 320.00,
            total: 640.00,
            fabric_type: 'Linen Blend',
            color: 'Natural Beige',
            width: '900mm',
            drop: '1600mm'
          },
          {
            id: 'treatment-3',
            room_name: 'Kitchen',
            treatment_name: 'Venetian Blinds',
            description: '25mm aluminum slats with cord control',
            quantity: 2,
            unit_price: 180.00,
            total: 360.00,
            fabric_type: 'Aluminum',
            color: 'White',
            width: '600mm',
            drop: '1200mm'
          }
        ],
        items: [
          { 
            id: 'item-1', 
            description: 'Living Room - Motorized Roller Blinds (3 units)', 
            quantity: 3, 
            unit_price: 450.00, 
            total: 1350.00, 
            room: 'Living Room',
            treatment_name: 'Motorized Roller Blinds',
            fabric_type: 'Blackout',
            color: 'Charcoal Grey'
          },
          { 
            id: 'item-2', 
            description: 'Master Bedroom - Roman Shades (2 units)', 
            quantity: 2, 
            unit_price: 320.00, 
            total: 640.00, 
            room: 'Master Bedroom',
            treatment_name: 'Roman Shades',
            fabric_type: 'Linen Blend',
            color: 'Natural Beige'
          },
          { 
            id: 'item-3', 
            description: 'Kitchen - Venetian Blinds (2 units)', 
            quantity: 2, 
            unit_price: 180.00, 
            total: 360.00, 
            room: 'Kitchen',
            treatment_name: 'Venetian Blinds',
            fabric_type: 'Aluminum',
            color: 'White'
          }
        ],
        subtotal: 2350.00,
        taxRate: 0.10,
        taxAmount: 235.00,
        total: 2585.00,
        currency: 'AUD',
        terms: 'Payment due within 30 days. 50% deposit required upon acceptance.',
        notes: 'Installation scheduled within 2-3 weeks of order confirmation. Includes 5-year warranty on all motorized components.',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};