import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface PermissionDeniedProps {
  message?: string;
}

export const PermissionDenied = ({ 
  message = "You don't have permission to access this feature. Please contact your administrator." 
}: PermissionDeniedProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-96">
        <CardContent className="p-6 text-center space-y-4">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-medium">Access Denied</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {message}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
