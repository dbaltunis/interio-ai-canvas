
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, FileText, Mail } from "lucide-react";

interface EmailTabsNavigationProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const EmailTabsNavigation = ({ activeTab, onTabChange }: EmailTabsNavigationProps) => {
  return (
    <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
      <TabsTrigger value="history" className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span className="hidden sm:inline">History</span>
        <span className="sm:hidden">Hist</span>
      </TabsTrigger>
      <TabsTrigger value="campaigns" className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">Campaigns</span>
        <span className="sm:hidden">Camps</span>
      </TabsTrigger>
      <TabsTrigger value="templates" className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Templates</span>
        <span className="sm:hidden">Temps</span>
      </TabsTrigger>
      <TabsTrigger value="compose" className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        <span className="hidden sm:inline">Compose</span>
        <span className="sm:hidden">Email</span>
      </TabsTrigger>
    </TabsList>
  );
};
