import { Checkbox } from "@/components/ui/checkbox";
import { ROLE_PERMISSIONS, PERMISSION_DETAILS } from "@/constants/permissions";

interface RolePermissionPreviewProps {
  role: string;
}

export const RolePermissionPreview = ({ role }: RolePermissionPreviewProps) => {
  const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];

  return (
    <div className="space-y-3">
      <h4 className="font-medium">Permissions for {role}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {rolePermissions.map((permission) => (
          <div key={permission} className="flex items-center space-x-2 p-2 border rounded bg-muted/20">
            <Checkbox checked={true} disabled />
            <span className="text-sm">{PERMISSION_DETAILS[permission as keyof typeof PERMISSION_DETAILS]?.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};