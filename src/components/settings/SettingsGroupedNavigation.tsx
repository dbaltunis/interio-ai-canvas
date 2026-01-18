import { LucideIcon, User, CreditCard, Building2, Ruler, Package, Calculator, Users, FileText, Globe, MessageCircle, Bell, Zap, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NavItem {
  value: string;
  label: string;
  icon: LucideIcon;
  canView: boolean;
  disabled?: boolean;
  tooltip?: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
  direct?: boolean; // If true, single item = direct click navigation
}

interface SettingsGroupedNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  permissions: {
    canViewProfile: boolean;
    canViewBilling: boolean;
    canManageBusinessSettings: boolean;
    canViewSettingsForTabs: boolean;
    canViewWindowTreatmentsForTabs: boolean;
    canManageMarkup: boolean;
    canViewTeamMembers: boolean;
    canManageTeam: boolean;
    canViewNotifications: boolean;
    canManageIntegrations: boolean;
    permissionsLoading: boolean;
    roleLoading: boolean;
    explicitPermissionsLoaded: boolean;
  };
}

export const SettingsGroupedNavigation = ({
  activeTab,
  onTabChange,
  permissions,
}: SettingsGroupedNavigationProps) => {
  const {
    canViewProfile,
    canViewBilling,
    canManageBusinessSettings,
    canViewSettingsForTabs,
    canViewWindowTreatmentsForTabs,
    canManageMarkup,
    canViewTeamMembers,
    canManageTeam,
    canViewNotifications,
    canManageIntegrations,
    permissionsLoading,
    roleLoading,
    explicitPermissionsLoaded,
  } = permissions;

  const isDisabled = (canView: boolean) => 
    !canView && !permissionsLoading && !roleLoading && explicitPermissionsLoaded;

  const navigationGroups: NavGroup[] = [
    {
      id: 'account',
      label: 'Account',
      icon: User,
      items: [
        { 
          value: 'personal', 
          label: 'Personal', 
          icon: User, 
          canView: canViewProfile,
          disabled: isDisabled(canViewProfile),
          tooltip: isDisabled(canViewProfile) ? "You don't have permission to view profile" : undefined
        },
        { 
          value: 'billing', 
          label: 'Billing', 
          icon: CreditCard, 
          canView: canViewBilling,
          disabled: !canViewBilling,
        },
      ].filter(item => item.canView || item.disabled), // Show disabled items too
    },
    {
      id: 'business',
      label: 'Business',
      icon: Building2,
      items: [
        { 
          value: 'business', 
          label: 'Company', 
          icon: Building2, 
          canView: canManageBusinessSettings,
          disabled: isDisabled(canManageBusinessSettings),
          tooltip: isDisabled(canManageBusinessSettings) ? "You don't have permission to manage business settings" : undefined
        },
        { 
          value: 'units', 
          label: 'Units & Currency', 
          icon: Ruler, 
          canView: canViewSettingsForTabs,
          disabled: !canViewSettingsForTabs,
        },
        { 
          value: 'users', 
          label: 'Team', 
          icon: Users, 
          canView: canViewTeamMembers || canManageTeam,
          disabled: isDisabled(canViewTeamMembers),
          tooltip: isDisabled(canViewTeamMembers) ? "You don't have permission to view team members" : undefined
        },
      ].filter(item => item.canView || item.disabled),
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      items: [
        { 
          value: 'window-coverings', 
          label: 'Products & Templates', 
          icon: Package, 
          canView: canViewWindowTreatmentsForTabs,
          disabled: isDisabled(canViewWindowTreatmentsForTabs),
          tooltip: isDisabled(canViewWindowTreatmentsForTabs) ? "You don't have permission to view products & templates" : undefined
        },
        { 
          value: 'pricing', 
          label: 'Pricing & Tax', 
          icon: Calculator, 
          canView: canManageMarkup,
          disabled: !canManageMarkup,
        },
      ].filter(item => item.canView || item.disabled),
    },
    {
      id: 'system',
      label: 'System',
      icon: Globe,
      items: [
        { 
          value: 'system', 
          label: 'System Settings', 
          icon: Globe, 
          canView: canViewSettingsForTabs,
          disabled: !canViewSettingsForTabs,
        },
        { 
          value: 'documents', 
          label: 'Documents', 
          icon: FileText, 
          canView: canViewSettingsForTabs,
          disabled: !canViewSettingsForTabs,
        },
        { 
          value: 'communications', 
          label: 'Communications', 
          icon: MessageCircle, 
          canView: canViewSettingsForTabs,
          disabled: !canViewSettingsForTabs,
        },
        { 
          value: 'notifications', 
          label: 'Notifications', 
          icon: Bell, 
          canView: canViewNotifications,
          disabled: !canViewNotifications,
        },
      ].filter(item => item.canView || item.disabled),
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: Zap,
      items: [
        { 
          value: 'integrations', 
          label: 'Integrations', 
          icon: Zap, 
          canView: canManageIntegrations,
          disabled: isDisabled(canManageIntegrations),
          tooltip: isDisabled(canManageIntegrations) ? "You don't have permission to manage integrations" : undefined
        },
      ],
      direct: true, // Single item = direct navigation
    },
  ];

  // Filter out groups with no visible items
  const visibleGroups = navigationGroups.filter(group => group.items.length > 0);

  // Check if any item in a group is active
  const isGroupActive = (group: NavGroup) => 
    group.items.some(item => item.value === activeTab);

  // Get the active item label for a group
  const getActiveItemLabel = (group: NavGroup) => {
    const activeItem = group.items.find(item => item.value === activeTab);
    return activeItem?.label;
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border pb-2">
      {visibleGroups.map((group) => {
        const groupActive = isGroupActive(group);
        const GroupIcon = group.icon;

        // Direct navigation for single-item groups (like Integrations)
        if (group.direct && group.items.length === 1) {
          const item = group.items[0];
          const ItemIcon = item.icon;
          return (
            <Button
              key={group.id}
              variant="ghost"
              size="sm"
              disabled={item.disabled}
              title={item.tooltip}
              onClick={() => !item.disabled && onTabChange(item.value)}
              className={cn(
                "h-9 px-3 gap-1.5 text-sm font-medium transition-all",
                groupActive 
                  ? "bg-primary/10 text-primary border-b-2 border-primary rounded-b-none" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <ItemIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{group.label}</span>
            </Button>
          );
        }

        // Dropdown for multi-item groups
        return (
          <DropdownMenu key={group.id}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 px-3 gap-1.5 text-sm font-medium transition-all",
                  groupActive 
                    ? "bg-primary/10 text-primary border-b-2 border-primary rounded-b-none" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <GroupIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{group.label}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {group.items.map((item) => {
                const ItemIcon = item.icon;
                const isActive = item.value === activeTab;
                return (
                  <DropdownMenuItem
                    key={item.value}
                    disabled={item.disabled}
                    onClick={() => !item.disabled && onTabChange(item.value)}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      isActive && "bg-primary/10 text-primary font-medium"
                    )}
                    title={item.tooltip}
                  >
                    <ItemIcon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </div>
  );
};
