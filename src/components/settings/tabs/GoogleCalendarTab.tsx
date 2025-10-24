import { SimpleCalendarSetup } from "@/components/calendar/SimpleCalendarSetup";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Info } from "lucide-react";

export const GoogleCalendarTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect your calendar in seconds - works with Google, Apple iCloud, Outlook, and more.
        </p>
      </div>

      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Quick & Simple Setup</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Select your calendar provider (Google, Apple, Outlook, etc.)</li>
            <li>Enter your email address</li>
            <li>Enter your password or app-specific password</li>
            <li>That's it! Your calendar will sync automatically</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Need an app-specific password?</AlertTitle>
        <AlertDescription>
          For Google and Apple accounts, you need to generate an app-specific password for security:
          <ul className="list-disc list-inside space-y-1 mt-2 text-xs">
            <li><strong>Google:</strong> Visit myaccount.google.com/apppasswords</li>
            <li><strong>Apple:</strong> Visit appleid.apple.com, go to Sign-In and Security → App-Specific Passwords</li>
          </ul>
        </AlertDescription>
      </Alert>

      <SimpleCalendarSetup />
    </div>
  );
};
