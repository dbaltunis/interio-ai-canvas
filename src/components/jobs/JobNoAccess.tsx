import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

interface JobNoAccessProps {
  onBack: () => void;
}

export const JobNoAccess = ({ onBack }: JobNoAccessProps) => {
  return (
    <div className="min-h-screen bg-background w-full flex items-center justify-center">
      <Card className="w-96">
        <CardContent className="p-6 text-center space-y-4">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-medium">Access Denied</h3>
            <p className="text-muted-foreground text-sm mt-1">
              You don't have permission to view this job. Please contact your administrator if you need access.
            </p>
          </div>
          <Button onClick={onBack} variant="outline" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};