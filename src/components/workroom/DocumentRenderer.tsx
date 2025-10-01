import React from "react";
import { WorkshopData } from "@/hooks/useWorkshopData";
import { WorkshopInformation } from "./templates/WorkshopInformation";
import { CombinedWorkshopInfo } from "./templates/CombinedWorkshopInfo";
import { LivePreview } from "../settings/templates/visual-editor/LivePreview";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DocumentRendererProps {
  template: string;
  data?: WorkshopData;
  blocks?: any[];
  projectId?: string;
}

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({ template, data, blocks, projectId }) => {
  // Fetch business settings
  const { data: businessSettings, isLoading: loadingBusinessSettings } = useBusinessSettings();
  
  // Fetch project with client data
  const { data: projectWithClient, isLoading: loadingProject } = useQuery({
    queryKey: ['project-with-client', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('id', projectId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching project with client:', error);
        return null;
      }
      
      return project;
    },
    enabled: !!projectId
  });

  console.log('DocumentRenderer - businessSettings:', businessSettings);
  console.log('DocumentRenderer - projectWithClient:', projectWithClient);
  console.log('DocumentRenderer - blocks:', blocks);
  // If we have blocks (from enhanced templates), render using LivePreview
  if (blocks && blocks.length > 0) {
    // Show loading state while fetching data
    if (loadingBusinessSettings || loadingProject) {
      return <div className="p-6">Loading document data...</div>;
    }

    // Construct real project data with business settings and client
    const client = projectWithClient?.client || null;
    const project = projectWithClient || (data ? {
      id: projectId || 'workshop-project',
      name: data.header?.projectName || 'Workshop Project',
      job_number: data.header?.orderNumber || 'WS-001',
      created_at: data.header?.createdDate || new Date().toISOString(),
      client_id: client?.id || null
    } : {
      id: projectId || 'workshop-project',
      client_id: null
    });

    // Transform workshop items to treatment format with actual data
    const treatments = data?.rooms?.flatMap(room => 
      room.items?.map(item => ({
        id: item.id,
        room_name: room.roomName,
        treatment_type: item.treatmentType || item.name,
        treatment_name: item.name,
        location: item.location || room.roomName,
        quantity: item.quantity || 1,
        measurements: item.measurements,
        notes: item.notes,
        total_cost: 0,
        total_price: 0
      })) || []
    ) || [];

    const projectData = {
      project: {
        ...project,
        client: client
      },
      client: client,
      businessSettings: businessSettings || {},
      treatments,
      items: treatments.map((t: any) => ({
        id: t.id,
        description: `${t.treatment_name} - ${t.room_name}`,
        quantity: t.quantity,
        unit_price: 0,
        total: 0,
        room: t.room_name
      })),
      rooms: data?.rooms || [],
      surfaces: [],
      windowSummaries: [],
      workshopItems: treatments,
      subtotal: 0,
      taxRate: (businessSettings?.pricing_settings as any)?.tax_rate || 0.1,
      taxAmount: 0,
      total: 0,
      markupPercentage: 0,
      currency: (businessSettings?.measurement_units as any)?.currency || 'USD'
    };

    console.log('DocumentRenderer - final projectData:', projectData);

    return (
      <div className="bg-white">
        <LivePreview 
          blocks={blocks} 
          projectData={projectData}
          isEditable={false}
        />
      </div>
    );
  }

  // Fallback to original templates
  if (!data) return null;

  switch (template) {
    case "workshop-info":
      return <CombinedWorkshopInfo data={data} />;
    default:
      return <WorkshopInformation data={data} />;
  }
};
