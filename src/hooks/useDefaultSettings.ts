
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Default settings configuration
export const defaultBusinessSettings = {
  company_name: "Your Company Name",
  default_tax_rate: 10.00,
  default_markup: 40.00,
  labor_rate: 85.00,
  quote_validity_days: 30,
  installation_lead_days: 14,
  opening_time: "09:00",
  closing_time: "17:00",
  auto_generate_work_orders: true,
  auto_calculate_fabric: true,
  email_quote_notifications: false,
  low_stock_alerts: true,
};

export const defaultProductCategories = [
  { name: "Curtains", description: "Window curtains and drapes", markup_percentage: 45.00 },
  { name: "Blinds", description: "Horizontal and vertical blinds", markup_percentage: 40.00 },
  { name: "Shutters", description: "Interior plantation shutters", markup_percentage: 50.00 },
  { name: "Hardware", description: "Curtain rods, tracks, and accessories", markup_percentage: 35.00 },
  { name: "Fabrics", description: "Curtain and upholstery fabrics", markup_percentage: 60.00 },
  { name: "Motors", description: "Automated curtain and blind motors", markup_percentage: 30.00 },
];

export const defaultTreatmentTypes = [
  { name: "Standard Curtains", category: "Curtains", description: "Basic curtain installation with standard hardware", estimated_hours: 2.5, complexity: "Low", labor_rate: 85.00 },
  { name: "Motorized Curtains", category: "Curtains", description: "Automated curtain system with motor installation", estimated_hours: 4.0, complexity: "High", labor_rate: 95.00 },
  { name: "Horizontal Blinds", category: "Blinds", description: "Standard horizontal blind installation", estimated_hours: 1.5, complexity: "Low", labor_rate: 75.00 },
  { name: "Vertical Blinds", category: "Blinds", description: "Vertical blind system installation", estimated_hours: 2.0, complexity: "Medium", labor_rate: 80.00 },
  { name: "Plantation Shutters", category: "Shutters", description: "Custom fitted plantation shutters", estimated_hours: 6.0, complexity: "High", labor_rate: 100.00 },
  { name: "Roman Blinds", category: "Blinds", description: "Fabric roman blind installation", estimated_hours: 2.5, complexity: "Medium", labor_rate: 85.00 },
  { name: "Roller Blinds", category: "Blinds", description: "Standard roller blind installation", estimated_hours: 1.0, complexity: "Low", labor_rate: 70.00 },
];

export const defaultPricingRules = [
  { name: "Bulk Discount 5+ Windows", category: "Curtains", rule_type: "percentage", value: 10.00, conditions: { min_quantity: 5 }, priority: 10, active: true },
  { name: "Premium Fabric Surcharge", category: "Fabrics", rule_type: "percentage", value: 25.00, conditions: { fabric_grade: "premium" }, priority: 5, active: true },
  { name: "Motorization Premium", category: "Motors", rule_type: "fixed_amount", value: 150.00, conditions: { has_motor: true }, priority: 8, active: true },
  { name: "Large Window Surcharge", category: "All", rule_type: "percentage", value: 15.00, conditions: { width_over: 300 }, priority: 7, active: true },
  { name: "Installation Complexity", category: "Installation", rule_type: "percentage", value: 20.00, conditions: { complexity: "high" }, priority: 6, active: true },
];

export const defaultVendors = [
  { name: "Fabric Warehouse", contact_person: "John Smith", email: "orders@fabricwarehouse.com", phone: "(555) 123-4567", address: "123 Textile St, Fabric City, FC 12345", website: "www.fabricwarehouse.com", payment_terms: "Net 30", lead_time_days: 7, product_categories: ["Fabrics"], rating: 4.5 },
  { name: "Hardware Solutions", contact_person: "Jane Doe", email: "sales@hardwaresolutions.com", phone: "(555) 234-5678", address: "456 Hardware Ave, Tool Town, TT 23456", website: "www.hardwaresolutions.com", payment_terms: "Net 30", lead_time_days: 5, product_categories: ["Hardware"], rating: 4.2 },
  { name: "Blind Depot", contact_person: "Mike Johnson", email: "support@blinddepot.com", phone: "(555) 345-6789", address: "789 Blind Blvd, Shade City, SC 34567", website: "www.blinddepot.com", payment_terms: "Net 15", lead_time_days: 10, product_categories: ["Blinds"], rating: 4.0 },
  { name: "Motor Tech", contact_person: "Sarah Wilson", email: "info@motortech.com", phone: "(555) 456-7890", address: "321 Motor Way, Auto City, AC 45678", website: "www.motortech.com", payment_terms: "Net 30", lead_time_days: 14, product_categories: ["Motors"], rating: 4.8 },
];

export const defaultEmailTemplates = [
  {
    name: "Quote Follow-up",
    subject: "Your Window Treatment Quote - {{quote_number}}",
    content: `Dear {{client_name}},

Thank you for your interest in our window treatment services. Please find attached your quote #{{quote_number}}.

Quote Details:
- Total Amount: ${{total_amount}}
- Valid Until: {{valid_until}}

We look forward to working with you on this project.

Best regards,
{{company_name}}`,
    template_type: "quote_followup",
    variables: ["client_name", "quote_number", "total_amount", "valid_until", "company_name"],
    active: true,
  },
  {
    name: "Installation Reminder",
    subject: "Installation Scheduled - {{project_name}}",
    content: `Dear {{client_name}},

This is a reminder that your window treatment installation is scheduled for {{installation_date}} at {{installation_time}}.

Project: {{project_name}}
Address: {{project_address}}

Our team will arrive with all necessary materials and equipment.

Please contact us if you need to reschedule.

Best regards,
{{company_name}}`,
    template_type: "installation_reminder",
    variables: ["client_name", "project_name", "installation_date", "installation_time", "project_address", "company_name"],
    active: true,
  },
];

export const useInitializeUserDefaults = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      console.log("Initializing default settings for user:", user.id);

      // Check if user already has business settings
      const { data: existingSettings } = await supabase
        .from("business_settings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingSettings) {
        console.log("User already has settings initialized");
        return { message: "Settings already initialized" };
      }

      // Initialize business settings
      const { error: settingsError } = await supabase
        .from("business_settings")
        .insert({ ...defaultBusinessSettings, user_id: user.id });

      if (settingsError) throw settingsError;

      // Initialize product categories
      const categoriesWithUserId = defaultProductCategories.map(cat => ({ ...cat, user_id: user.id }));
      const { error: categoriesError } = await supabase
        .from("product_categories")
        .insert(categoriesWithUserId);

      if (categoriesError) throw categoriesError;

      // Initialize treatment types
      const treatmentsWithUserId = defaultTreatmentTypes.map(treatment => ({ ...treatment, user_id: user.id }));
      const { error: treatmentsError } = await supabase
        .from("treatment_types")
        .insert(treatmentsWithUserId);

      if (treatmentsError) throw treatmentsError;

      // Initialize pricing rules
      const rulesWithUserId = defaultPricingRules.map(rule => ({ ...rule, user_id: user.id }));
      const { error: rulesError } = await supabase
        .from("pricing_rules")
        .insert(rulesWithUserId);

      if (rulesError) throw rulesError;

      // Initialize vendors
      const vendorsWithUserId = defaultVendors.map(vendor => ({ ...vendor, user_id: user.id }));
      const { error: vendorsError } = await supabase
        .from("vendors")
        .insert(vendorsWithUserId);

      if (vendorsError) throw vendorsError;

      // Initialize email templates
      const templatesWithUserId = defaultEmailTemplates.map(template => ({ ...template, user_id: user.id }));
      const { error: templatesError } = await supabase
        .from("email_templates")
        .insert(templatesWithUserId);

      if (templatesError) throw templatesError;

      console.log("Successfully initialized default settings");
      return { message: "Default settings initialized successfully" };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Default settings have been initialized for your account",
      });
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      queryClient.invalidateQueries({ queryKey: ["treatment-types"] });
      queryClient.invalidateQueries({ queryKey: ["pricing-rules"] });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
    onError: (error: any) => {
      console.error("Failed to initialize default settings:", error);
      toast({
        title: "Error",
        description: "Failed to initialize default settings: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCheckUserInitialization = () => {
  return useQuery({
    queryKey: ["user-initialization-status"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { initialized: false, user: null };

      const { data: settings } = await supabase
        .from("business_settings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      return {
        initialized: !!settings,
        user,
      };
    },
  });
};
