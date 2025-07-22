
import React, { useState } from 'react';
import { BrandHeader } from './BrandHeader';
import { UserProfile } from './UserProfile';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FolderOpen, 
  Package, 
  Calendar,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "projects", label: "Jobs", icon: FolderOpen },
  { id: "clients", label: "CRM", icon: Users },
  { id: "quotes", label: "Emails", icon: FileText },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "inventory", label: "Library", icon: Package },
];

export const ResponsiveHeader = ({ activeTab, onTabChange }: ResponsiveHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-white border-b border-brand-secondary/20 shadow-sm sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left side - Logo */}
            <div className="flex items-center">
              <BrandHeader size="sm" showTagline={true} />
            </div>
            
            {/* Center - Navigation (hidden on mobile) */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      activeTab === item.id
                        ? "bg-brand-primary text-white hover:bg-brand-primary/90"
                        : "text-brand-neutral hover:text-brand-primary hover:bg-brand-primary/10"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
            
            {/* Right side - User Profile */}
            <div className="flex items-center space-x-4">
              <UserProfile />
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-brand-neutral hover:text-brand-primary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-brand-secondary/20">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full justify-start px-3 py-2 text-sm font-medium rounded-md",
                      activeTab === item.id
                        ? "bg-brand-primary text-white"
                        : "text-brand-neutral hover:text-brand-primary hover:bg-brand-primary/10"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
