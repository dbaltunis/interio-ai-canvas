
import { WorkroomDocuments } from "@/components/workroom/WorkroomDocuments";

interface WorkroomTabProps {
  projectId: string;
}

export const WorkroomTab = ({ projectId }: WorkroomTabProps) => {
  return (
    <main className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Workroom</h2>
      </header>
      <WorkroomDocuments projectId={projectId} />
    </main>
  );
};
