import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileX } from "lucide-react";

interface JobNotFoundProps {
  onBack: () => void;
}

export const JobNotFound = ({ onBack }: JobNotFoundProps) => {
  return (
    <div className="min-h-screen bg-background w-full flex items-center justify-center">
      <Card className="w-96">
        <CardContent className="p-6 text-center space-y-4">
          <FileX className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-medium">Job Not Found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              The requested job doesn't exist or you don't have permission to view it.
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