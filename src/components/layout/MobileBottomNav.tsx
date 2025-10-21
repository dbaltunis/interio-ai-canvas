import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Package, 
  Calendar,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { CreateActionDialog } from "./CreateActionDialog";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "projects", label: "Jobs", icon: FolderOpen },
  { id: "clients", label: "CRM", icon: Users },
  { id: "inventory", label: "Library", icon: Package },
  { id: "calendar", label: "Calendar", icon: Calendar },
];

export const MobileBottomNav = ({ activeTab, onTabChange }: MobileBottomNavProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-50 glass-morphism-strong border-t border-border/50 pb-safe">
        <div className="relative grid grid-cols-5 h-16">
          {/* First two items */}
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "h-full rounded-none flex flex-col items-center justify-center gap-1 transition-all duration-200",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={cn(
                  "transition-all duration-200",
                  isActive ? "h-5 w-5" : "h-4 w-4"
                )} />
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isActive ? "opacity-100" : "opacity-70"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-t-full" />
                )}
              </Button>
            );
          })}
          
          {/* Center Create Button */}
          <div className="relative flex items-center justify-center">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="absolute -top-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-6 w-6 text-primary-foreground" />
            </Button>
          </div>
          
          {/* Last three items */}
          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "h-full rounded-none flex flex-col items-center justify-center gap-1 transition-all duration-200",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={cn(
                  "transition-all duration-200",
                  isActive ? "h-5 w-5" : "h-4 w-4"
                )} />
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isActive ? "opacity-100" : "opacity-70"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-t-full" />
                )}
              </Button>
            );
          })}
        </div>
      </nav>
      
      <CreateActionDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onTabChange={onTabChange}
      />
    </>
  );
};
