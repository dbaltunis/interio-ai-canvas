import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/hooks/use-toast";

export const useSampleData = () => {
  const { user } = useAuth();
  const [isSeedingData, setIsSeedingData] = useState(false);
  const [hasSampleData, setHasSampleData] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkSampleData = async () => {
      const { data } = await supabase
        .from("app_user_flags")
        .select("enabled")
        .eq("user_id", user.id)
        .eq("flag", "sample_data_seeded")
        .single();

      if (data) {
        setHasSampleData(data.enabled);
      }
    };

    checkSampleData();
  }, [user]);

  const seedSampleData = async () => {
    if (!user || isSeedingData) return;

    setIsSeedingData(true);

    try {
      // Sample client
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .insert({
          user_id: user.id,
          name: "Sample Client - Residence",
          email: "sample@example.com",
          phone: "+1234567890",
          address: "123 Main Street",
          city: "Sydney",
          state: "NSW",
          zip_code: "2000",
          country: "Australia",
          funnel_stage: "qualified",
          client_type: "B2C",
          notes: "This is a sample client to help you get started. Feel free to edit or delete.",
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Sample project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          client_id: client.id,
          name: "Sample Project - Living Room Curtains",
          job_number: "SAMPLE-001",
          status: "in_progress",
          project_type: "curtains",
          notes: "Sample project demonstrating curtain installation for a living room.",
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Sample curtain template
      await supabase.from("curtain_templates").insert({
        user_id: user.id,
        name: "Sample Pencil Pleat Curtains",
        description: "Standard pencil pleat curtains with 2.0x fullness",
        heading_name: "Pencil Pleat",
        curtain_type: "single",
        fullness_ratio: 2.0,
        pricing_type: "per_metre",
        unit_price: 45.0,
        fabric_width_type: "wide",
        fabric_direction: "standard",
        active: true,
      });

      // Sample client for B2B
      await supabase.from("clients").insert({
        user_id: user.id,
        name: "Sample Corporate Client",
        company_name: "ABC Corporation",
        contact_person: "John Smith",
        email: "john@abccorp.com",
        phone: "+1234567891",
        client_type: "B2B",
        funnel_stage: "lead",
        notes: "Sample B2B client for commercial projects.",
      });

      // Mark sample data as seeded
      await supabase.from("app_user_flags").upsert({
        user_id: user.id,
        flag: "sample_data_seeded",
        enabled: true,
      });

      setHasSampleData(true);
      toast({
        title: "Sample Data Created",
        description: "We've added sample clients and projects to help you get started.",
      });
    } catch (error) {
      console.error("Error seeding sample data:", error);
      toast({
        title: "Error",
        description: "Failed to create sample data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSeedingData(false);
    }
  };

  return {
    seedSampleData,
    isSeedingData,
    hasSampleData,
  };
};
