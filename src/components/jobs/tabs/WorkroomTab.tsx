
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Download } from "lucide-react";

interface WorkroomTabProps {
  projectId: string;
}

export const WorkroomTab = ({ projectId }: WorkroomTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Workroom Instructions</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Instructions
          </Button>
          <Button size="sm">
            <Wrench className="h-4 w-4 mr-2" />
            Generate Instructions
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manufacturing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-lg font-medium mb-2">No workroom instructions yet</h3>
            <p className="text-gray-500 mb-4">
              Manufacturing instructions will be automatically generated based on your treatments and specifications.
            </p>
            <Button disabled>
              <Wrench className="h-4 w-4 mr-2" />
              Generate Instructions (Add treatments first)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
