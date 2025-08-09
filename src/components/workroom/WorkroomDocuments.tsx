import React, { useState } from "react";
import { WorkroomToolbar } from "./WorkroomToolbar";
import { DocumentRenderer } from "./DocumentRenderer";
import { useWorkshopData } from "@/hooks/useWorkshopData";
import "@/styles/print.css";

interface WorkroomDocumentsProps {
  projectId?: string;
}

export const WorkroomDocuments: React.FC<WorkroomDocumentsProps> = ({ projectId }) => {
  const { data, isLoading, error } = useWorkshopData(projectId);
  const [template, setTemplate] = useState<string>("workshop-info");
  const [groupByRoom, setGroupByRoom] = useState<boolean>(true);

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
        <DocumentRenderer template={template} data={data} />
      </section>
    </main>
  );
};
