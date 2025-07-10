
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedCalendar } from "./EnhancedCalendar";
import { CalendarInsights } from "./CalendarInsights";

export const CalendarView = () => {
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="insights">Insights</TabsTrigger>
      </TabsList>
      
      <TabsContent value="calendar">
        <EnhancedCalendar />
      </TabsContent>
      
      <TabsContent value="insights">
        <CalendarInsights />
      </TabsContent>
    </Tabs>
  );
};
