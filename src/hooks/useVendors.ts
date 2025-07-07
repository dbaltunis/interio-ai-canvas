
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useVendors = () => {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      // For now, return mock data until the vendors table is properly synced
      return [
        {
          id: "1",
          name: "Premium Textiles Co.",
          company_type: "supplier",
          contact_person: "John Smith",
          email: "john@premiumtextiles.com",
          phone: "+1-555-0123",
          address: "123 Fabric Street",
          city: "New York",
          state: "NY",
          zip_code: "10001",
          country: "US",
          website: "www.premiumtextiles.com",
          payment_terms: "NET30",
          lead_time_days: 14,
          minimum_order_amount: 500,
          active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Hardware Plus Ltd",
          company_type: "supplier",
          contact_person: "Sarah Johnson",
          email: "sarah@hardwareplus.com",
          phone: "+1-555-0456",
          address: "456 Industrial Ave",
          city: "Chicago",
          state: "IL",
          zip_code: "60601",
          country: "US",
          website: "www.hardwareplus.com",
          payment_terms: "NET15",
          lead_time_days: 7,
          minimum_order_amount: 200,
          active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Luxury Fabrics International",
          company_type: "supplier",
          contact_person: "Maria Garcia",
          email: "maria@luxuryfabrics.com",
          phone: "+1-555-0789",
          address: "789 Designer Blvd",
          city: "Los Angeles",
          state: "CA",
          zip_code: "90210",
          country: "US",
          website: "www.luxuryfabrics.com",
          payment_terms: "NET45",
          lead_time_days: 21,
          minimum_order_amount: 1000,
          active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Budget Textiles Warehouse",
          company_type: "supplier",
          contact_person: "Bob Wilson",
          email: "bob@budgettextiles.com",
          phone: "+1-555-0321",
          address: "321 Warehouse Row",
          city: "Atlanta",
          state: "GA",
          zip_code: "30301",
          country: "US",
          website: "www.budgettextiles.com",
          payment_terms: "NET30",
          lead_time_days: 10,
          minimum_order_amount: 100,
          active: true,
          created_at: new Date().toISOString(),
        }
      ];
    },
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendor: any) => {
      // Mock implementation for now
      const newVendor = {
        id: Date.now().toString(),
        ...vendor,
        created_at: new Date().toISOString(),
      };
      return newVendor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...vendor }: any) => {
      // Mock implementation for now
      return { id, ...vendor };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation for now
      console.log("Deleting vendor:", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
};
