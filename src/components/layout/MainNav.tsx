
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "./UserProfile";
import { BrandHeader } from "./BrandHeader";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import {
  LayoutDashboard,
  FolderOpen,
  Calendar,
  Library,
  Menu,
  Plus,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Jobs", href: "/jobs", icon: FolderOpen },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Library", href: "/library", icon: Library },
];

export const MainNav = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => mobile && setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              mobile ? "w-full" : "",
              isActive
                ? "bg-brand-primary text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
            {item.name === "Jobs" && (
              <Badge variant="secondary" className="ml-auto">
                4
              </Badge>
            )}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="flex h-16 items-center px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <BrandHeader />
          
          {/* Mobile Navigation Trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="lg:hidden"
                size="icon"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b">
                  <BrandHeader />
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-1">
                    <NavItems mobile />
                  </div>
                </div>
                <div className="p-4 border-t">
                  <Button
                    asChild
                    className="w-full bg-brand-primary hover:bg-brand-secondary"
                    onClick={() => setOpen(false)}
                  >
                    <Link to="/jobs/new">
                      <Plus className="h-4 w-4 mr-2" />
                      New Quote
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden lg:flex items-center space-x-2 ml-6">
          <NavItems />
        </nav>

        <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
          {/* Quick Action Button - Hidden on small screens */}
          <Button
            asChild
            size="sm"
            className="hidden sm:flex bg-brand-primary hover:bg-brand-secondary"
          >
            <Link to="/jobs/new">
              <Plus className="h-4 w-4 mr-2" />
              New Quote
            </Link>
          </Button>

          {/* Notifications */}
          <NotificationCenter />

          {/* User Profile */}
          <UserProfile />
        </div>
      </div>
    </div>
  );
};
