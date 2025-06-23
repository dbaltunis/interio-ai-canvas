
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { ProjectSelector } from "./ProjectSelector";
import { RoomManager } from "./RoomManager";
import { WindowManager } from "./WindowManager";
import { WindowDetails } from "./WindowDetails";

export const JobEditor = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);

  const handleRoomSelect = (roomId: string) => {
    setActiveRoomId(roomId);
    setSelectedWindowId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Job Editor</h2>
          <p className="text-muted-foreground">
            Design and plan window treatment projects room by room
          </p>
        </div>
        <Button disabled={!selectedProjectId}>
          <Save className="mr-2 h-4 w-4" />
          Save Project
        </Button>
      </div>

      <ProjectSelector 
        selectedProjectId={selectedProjectId}
        onProjectSelect={setSelectedProjectId}
      />

      {selectedProjectId && (
        <div className="grid gap-6 md:grid-cols-3">
          <RoomManager
            projectId={selectedProjectId}
            activeRoomId={activeRoomId}
            onRoomSelect={handleRoomSelect}
          />

          <WindowManager
            projectId={selectedProjectId}
            activeRoomId={activeRoomId}
            selectedWindowId={selectedWindowId}
            onWindowSelect={setSelectedWindowId}
          />

          <WindowDetails
            selectedWindowId={selectedWindowId}
          />
        </div>
      )}
    </div>
  );
};
