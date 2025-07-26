import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Apple, Calendar, Building2, Globe, Info } from "lucide-react";

export interface CalendarProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  serverUrl: string;
  description: string;
  setupInstructions: string[];
  requiresAppPassword: boolean;
  popular?: boolean;
}

const providers: CalendarProvider[] = [
  {
    id: "google",
    name: "Google Calendar",
    icon: <Mail className="w-6 h-6" />,
    serverUrl: "https://apidata.googleusercontent.com/caldav/v2",
    description: "Sync with your Gmail calendar",
    setupInstructions: [
      "Go to Google Account settings",
      "Enable 2-factor authentication",
      "Generate an App Password for 'Mail'",
      "Use your Gmail address as username",
      "Use the App Password (not your regular password)"
    ],
    requiresAppPassword: true,
    popular: true
  },
  {
    id: "icloud",
    name: "Apple iCloud",
    icon: <Apple className="w-6 h-6" />,
    serverUrl: "https://caldav.icloud.com",
    description: "Sync with your iCloud calendar",
    setupInstructions: [
      "Go to Apple ID settings",
      "Enable 2-factor authentication",
      "Generate an App-Specific Password",
      "Use your Apple ID email as username",
      "Use the App-Specific Password"
    ],
    requiresAppPassword: true,
    popular: true
  },
  {
    id: "outlook",
    name: "Outlook.com",
    icon: <Building2 className="w-6 h-6" />,
    serverUrl: "https://outlook.live.com/owa/calendar",
    description: "Sync with your Outlook.com calendar",
    setupInstructions: [
      "Go to Microsoft Account security",
      "Enable 2-factor authentication", 
      "Generate an App Password",
      "Use your Outlook email as username",
      "Use the App Password"
    ],
    requiresAppPassword: true,
    popular: true
  },
  {
    id: "yahoo",
    name: "Yahoo Calendar",
    icon: <Globe className="w-6 h-6" />,
    serverUrl: "https://caldav.calendar.yahoo.com",
    description: "Sync with your Yahoo calendar",
    setupInstructions: [
      "Go to Yahoo Account Security",
      "Enable 2-factor authentication",
      "Generate an App Password for 'Calendar'",
      "Use your Yahoo email as username", 
      "Use the App Password"
    ],
    requiresAppPassword: true
  },
  {
    id: "fastmail",
    name: "Fastmail",
    icon: <Mail className="w-6 h-6" />,
    serverUrl: "https://caldav.fastmail.com",
    description: "Sync with your Fastmail calendar",
    setupInstructions: [
      "Go to Fastmail Settings",
      "Navigate to Password & Security",
      "Create an App Password for CalDAV",
      "Use your Fastmail email as username",
      "Use the App Password"
    ],
    requiresAppPassword: true
  },
  {
    id: "custom",
    name: "Other CalDAV Server",
    icon: <Calendar className="w-6 h-6" />,
    serverUrl: "",
    description: "Connect to any CalDAV-compatible server",
    setupInstructions: [
      "Contact your email provider for CalDAV server URL",
      "Check if an app password is required",
      "Use your email address as username",
      "Enter the server URL provided by your provider"
    ],
    requiresAppPassword: false
  }
];

interface CalendarProviderPresetsProps {
  onSelectProvider: (provider: CalendarProvider) => void;
}

export const CalendarProviderPresets = ({ onSelectProvider }: CalendarProviderPresetsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Your Calendar Provider</h3>
        <p className="text-sm text-muted-foreground">
          Select your email provider to get pre-configured settings and setup instructions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <Card 
            key={provider.id}
            className="relative cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelectProvider(provider)}
          >
            {provider.popular && (
              <Badge className="absolute -top-2 -right-2 z-10" variant="default">
                Popular
              </Badge>
            )}
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-base">
                <div className="text-primary">
                  {provider.icon}
                </div>
                {provider.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">
                {provider.description}
              </p>
              
              {provider.requiresAppPassword && (
                <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                  <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Requires App Password for security
                  </p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                onClick={() => onSelectProvider(provider)}
              >
                Setup {provider.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};