import { GoogleCalendarSetup } from "@/components/calendar/GoogleCalendarSetup";
import { SimpleCalendarSetup } from "@/components/calendar/SimpleCalendarSetup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const GoogleCalendarTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect your calendar to sync appointments automatically.
        </p>
      </div>

      <Tabs defaultValue="google" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="google">Google Calendar (OAuth)</TabsTrigger>
          <TabsTrigger value="simple">Simple Setup (CalDAV)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="google" className="mt-6">
          <GoogleCalendarSetup />
        </TabsContent>
        
        <TabsContent value="simple" className="mt-6">
          <SimpleCalendarSetup />
        </TabsContent>
      </Tabs>
    </div>
  );
};
