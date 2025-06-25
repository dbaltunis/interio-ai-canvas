
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
  Users,
  FileText,
  Package,
  Hammer,
  Calendar,
  Calculator,
  Library,
  Settings,
  Menu,
  Plus,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Jobs", href: "/jobs", icon: FolderOpen },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Quotes", href: "/quotes", icon: FileText },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Workshop", href: "/workshop", icon: Hammer },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Calculator", href: "/calculator", icon: Calculator },
  { name: "Library", href: "/library", icon: Library },
  { name: "Settings", href: "/settings", icon: Settings },
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
              isActive
                ? "bg-brand-primary text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
            {item.name === "Workshop" && (
              <Badge variant="secondary" className="ml-auto">
                3
              </Badge>
            )}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="border-b bg-white">
      <div className="flex h-16 items-center px-4">
        <BrandHeader />
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          <NavItems />
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {/* Quick Action Button */}
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

          {/* Mobile Navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="md:hidden"
                size="icon"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex flex-col space-y-4 py-4">
                <div className="px-3 py-2">
                  <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
                  <div className="space-y-1">
                    <NavItems mobile />
                  </div>
                </div>
                <div className="px-3">
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
      </div>
    </div>
  );
};
