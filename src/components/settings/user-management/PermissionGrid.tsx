import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { PERMISSION_CATEGORIES, PERMISSION_DETAILS } from "@/constants/permissions";

interface PermissionGridProps {
  permissions: string[];
  onToggle: (permission: string, enabled: boolean) => void;
}

export const PermissionGrid = ({ permissions, onToggle }: PermissionGridProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter permissions based on search
  const filteredPermissions = useMemo(() => {
    const allPermissions = Object.entries(PERMISSION_DETAILS);
    if (!searchTerm) return allPermissions;
    
    return allPermissions.filter(([key, details]) => 
      details.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      details.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      details.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    const grouped: Record<string, Array<[string, any]>> = {};
    filteredPermissions.forEach(([key, details]) => {
      if (!grouped[details.category]) {
        grouped[details.category] = [];
      }
      grouped[details.category].push([key, details]);
    });
    return grouped;
  }, [filteredPermissions]);

  const checkPermissionDependencies = (permission: string): string[] => {
    const details = PERMISSION_DETAILS[permission as keyof typeof PERMISSION_DETAILS];
    if (!details?.required) return [];
    
    return details.required.filter(req => !permissions.includes(req));
  };

  return (
    <div className="space-y-4">
      {/* Search Permissions */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Permission Categories */}
      <div className="space-y-4">
        {Object.entries(permissionsByCategory).map(([categoryKey, categoryPermissions]) => {
          const category = PERMISSION_CATEGORIES[categoryKey as keyof typeof PERMISSION_CATEGORIES];
          if (!category || categoryPermissions.length === 0) return null;

          return (
            <div key={categoryKey} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                <h5 className="font-medium text-sm">{category.label}</h5>
                <span className="text-xs text-muted-foreground">({categoryPermissions.length})</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2 pl-5">
                {categoryPermissions.map(([permissionKey, details]) => {
                  const isEnabled = permissions.includes(permissionKey);
                  const missingDeps = checkPermissionDependencies(permissionKey);
                  const hasWarning = details.warning;
                  
                  return (
                    <div key={permissionKey} className={`flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/20 transition-colors ${isEnabled ? 'bg-muted/10' : ''}`}>
                      <Checkbox
                        checked={isEnabled}
                        onCheckedChange={(checked) => onToggle(permissionKey, !!checked)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{details.label}</span>
                          {hasWarning && (
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{details.description}</p>
                        {missingDeps.length > 0 && isEnabled && (
                          <p className="text-xs text-red-500">
                            Missing dependencies: {missingDeps.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-3" />
            </div>
          );
        })}
      </div>
    </div>
  );
};