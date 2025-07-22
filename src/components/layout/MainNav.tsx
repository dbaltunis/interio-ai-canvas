
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FolderOpen, 
  Package, 
  Wrench,
  Calendar,
  Settings,
  Calculator,
  BookOpen,
  PlusCircle
} from "lucide-react";

interface MainNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Homepage", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "job-editor", label: "Job Editor", icon: PlusCircle },
  { id: "quotes", label: "Quote Builder", icon: FileText },
  { id: "workshop", label: "Work Orders", icon: Wrench },
  { id: "inventory", label: "Product Library", icon: Package },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "clients", label: "CRM", icon: Users },
  { id: "calculator", label: "Calculator", icon: Calculator },
  { id: "settings", label: "Settings", icon: Settings },
];

export const MainNav = ({ activeTab, onTabChange }: MainNavProps) => {
  return (
    <nav className="w-64 bg-white border-r border-brand-secondary/20 min-h-screen hidden lg:block">
      <div className="p-6">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start transition-colors",
                  activeTab === item.id 
                    ? "bg-brand-primary text-white hover:bg-brand-primary/90" 
                    : "text-brand-neutral hover:text-brand-primary hover:bg-brand-primary/10"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
