import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePermissionAuditLog } from "@/hooks/usePermissionAudit";
import { formatDistanceToNow } from "date-fns";
import { History, UserCheck, UserX } from "lucide-react";

interface PermissionAuditLogProps {
  userId?: string;
}

export const PermissionAuditLog = ({ userId }: PermissionAuditLogProps) => {
  const { data: auditLogs = [], isLoading } = usePermissionAuditLog(userId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Permission History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading audit log...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Permission History
        </CardTitle>
        <CardDescription>
          Recent permission changes for this user
        </CardDescription>
      </CardHeader>
      <CardContent>
        {auditLogs.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No permission changes recorded
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {log.action === 'granted' ? (
                    <UserCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <UserX className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {log.permission_name.replace(/_/g, ' ')}
                      </span>
                      <Badge variant={log.action === 'granted' ? 'default' : 'destructive'}>
                        {log.action}
                      </Badge>
                    </div>
                    {log.reason && (
                      <p className="text-xs text-muted-foreground mt-1">{log.reason}</p>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};