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

  useEffect(() => {
    if (template !== "workshop-info" && template !== "packing-slip" && template !== "box-label" && template !== "wraps") {
      loadTemplateBlocks(template);
    } else {
      setTemplateBlocks(undefined);
    }
  }, [template]);

  const loadTemplateBlocks = async (templateId: string) => {
    try {
      const { data: templateData, error } = await supabase
        .from('quote_templates')
        .select('blocks')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      setTemplateBlocks(Array.isArray(templateData?.blocks) ? templateData.blocks : []);
    } catch (error) {
      console.error('Error loading template blocks:', error);
      setTemplateBlocks(undefined);
    }
  };

  const onPrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="p-6">Loading workshop data…</div>;
  }

  if (error) {
    return <div className="p-6 text-destructive">Failed to load data.</div>;
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

      <section>
        <DocumentRenderer 
          template={template} 
          data={data}
          blocks={templateBlocks}
        />
      </section>
    </main>
  );
};
