import React, { useState, useEffect } from "react";
import { WorkroomToolbar } from "./WorkroomToolbar";
import { DocumentRenderer } from "./DocumentRenderer";
import { useWorkshopData } from "@/hooks/useWorkshopData";
import { supabase } from "@/integrations/supabase/client";
import "@/styles/print.css";

interface WorkroomDocumentsProps {
  projectId?: string;
}

export const WorkroomDocuments: React.FC<WorkroomDocumentsProps> = ({ projectId }) => {
  const { data, isLoading, error } = useWorkshopData(projectId);
  const [template, setTemplate] = useState<string>("workshop-info");
  const [groupByRoom, setGroupByRoom] = useState<boolean>(true);
  const [templateBlocks, setTemplateBlocks] = useState<any[] | undefined>();
  const [templateError, setTemplateError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('📄 [WORKROOM DOCS] Data state:', {
      projectId,
      hasData: !!data,
      isLoading,
      error: error?.message,
      dataStructure: data ? {
        hasHeader: !!data.header,
        roomsCount: data.rooms?.length || 0,
        itemsCount: data.projectTotals?.itemsCount || 0
      } : null
    });
  }, [projectId, data, isLoading, error]);

  useEffect(() => {
    if (template !== "workshop-info" && template !== "packing-slip" && template !== "box-label" && template !== "wraps") {
      loadTemplateBlocks(template);
    } else {
      setTemplateBlocks(undefined);
    }
  }, [template]);

  const loadTemplateBlocks = async (templateId: string) => {
    setTemplateError(null);
    try {
      console.log('📋 [WORKROOM] Loading template blocks for:', templateId);
      const { data: templateData, error } = await supabase
        .from('quote_templates')
        .select('blocks')
        .eq('id', templateId)
        .maybeSingle();

      if (error) {
        console.error('❌ [WORKROOM] Template load error:', error);
        throw error;
      }
      
      const blocks = Array.isArray(templateData?.blocks) ? templateData.blocks : [];
      console.log('✅ [WORKROOM] Template blocks loaded:', blocks.length);
      setTemplateBlocks(blocks);
    } catch (error) {
      console.error('❌ [WORKROOM] Failed to load template:', error);
      setTemplateError(error instanceof Error ? error.message : 'Failed to load template');
      setTemplateBlocks(undefined);
    }
  };

  const onPrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading workroom data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-destructive/50 bg-destructive/10 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-destructive">Failed to Load Data</h3>
        <p className="text-sm text-muted-foreground">{error.message || 'An error occurred'}</p>
        <p className="text-xs text-muted-foreground">Check console for more details.</p>
      </div>
    );
  }

  // Empty state when no data
  if (!data || !data.rooms || data.rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-6 border-2 border-dashed border-muted-foreground/30 rounded-lg">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">No Workroom Data Available</h3>
          <div className="text-sm text-muted-foreground max-w-md space-y-2">
            <p>To generate workroom documents, you need to:</p>
            <ol className="list-decimal list-inside text-left space-y-1 mt-4">
              <li>Add rooms in the <strong>Rooms & Treatments</strong> tab</li>
              <li>Create surfaces/windows for each room</li>
              <li>Add measurements and treatment details</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="space-y-4">
      <WorkroomToolbar
        selectedTemplate={template}
        onTemplateChange={setTemplate}
        groupByRoom={groupByRoom}
        onToggleGroupBy={() => setGroupByRoom((v) => !v)}
        onPrint={onPrint}
      />

      {templateError && (
        <div className="p-4 border border-warning/50 bg-warning/10 rounded-lg">
          <p className="text-sm text-warning-foreground">
            <strong>Template Error:</strong> {templateError}
          </p>
        </div>
      )}

      <section>
        <DocumentRenderer 
          template={template} 
          data={data}
          blocks={templateBlocks}
          projectId={projectId}
        />
      </section>
    </main>
  );
};
