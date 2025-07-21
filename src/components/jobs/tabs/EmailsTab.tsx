
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Plus } from "lucide-react";

interface EmailsTabProps {
  projectId: string;
}

export const EmailsTab = ({ projectId }: EmailsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Project Emails</h2>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Compose Email
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Communication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-lg font-medium mb-2">No emails sent yet</h3>
            <p className="text-gray-500 mb-4">
              All email communication related to this project will appear here.
            </p>
            <Button>
              <Mail className="h-4 w-4 mr-2" />
              Send First Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
