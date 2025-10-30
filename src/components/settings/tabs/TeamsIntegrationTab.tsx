import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const TeamsIntegrationTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Microsoft Teams Integration</h1>
        <p className="text-muted-foreground mt-2">
          Automatically generate Microsoft Teams meeting links for your appointments.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                💼 Microsoft Teams
                <Badge variant="secondary">Coming Soon</Badge>
              </CardTitle>
              <CardDescription>
                Connect your Microsoft account to automatically create Teams meetings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Microsoft Teams integration is coming soon. When available, you'll be able to:
              <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
                <li>Automatically generate Teams meeting links</li>
                <li>Include dial-in numbers for audio conference</li>
                <li>Set meeting options (lobby, recording, etc.)</li>
                <li>Join meetings directly from the app</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="pt-4">
            <Button disabled>
              Connect Microsoft Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
