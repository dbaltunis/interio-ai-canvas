
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
  PlusCircle,
  ShoppingCart
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
  { id: "ordering-hub", label: "Ordering Hub", icon: ShoppingCart },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "clients", label: "CRM", icon: Users },
  { id: "calculator", label: "Calculator", icon: Calculator },
  { id: "settings", label: "Settings", icon: Settings },
];

export const MainNav = ({ activeTab, onTabChange }: MainNavProps) => {
  return (
    <nav className="w-64 bg-background border-r border-border min-h-screen hidden lg:block">
      <div className="p-6">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start transition-all duration-200 text-sm font-medium",
                  activeTab === item.id 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
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
