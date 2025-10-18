import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Shield, Trash2, Edit, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_data: any;
  new_data: any;
  created_at: string;
}

export const AuditLogViewer = () => {
  const [filter, setFilter] = useState({
    action: "all",
    table: "all",
    search: "",
  });

  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-logs", filter],
    queryFn: async () => {
      let query = supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (filter.action !== "all") {
        query = query.eq("action", filter.action.toUpperCase());
      }

      if (filter.table !== "all") {
        query = query.eq("table_name", filter.table);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "DELETE":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "UPDATE":
        return <Edit className="h-4 w-4 text-blue-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case "DELETE":
        return "destructive";
      case "UPDATE":
        return "default";
      default:
        return "outline";
    }
  };

  const filteredLogs = logs?.filter((log) => {
    if (!filter.search) return true;
    return (
      log.table_name.toLowerCase().includes(filter.search.toLowerCase()) ||
      log.record_id.toLowerCase().includes(filter.search.toLowerCase())
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Log
          </CardTitle>
          <Badge variant="outline">{filteredLogs?.length || 0} entries</Badge>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mt-4">
          <Input
            placeholder="Search by table or record ID..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="max-w-xs"
          />

          <Select value={filter.action} onValueChange={(value) => setFilter({ ...filter, action: value })}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="delete">Deletes</SelectItem>
              <SelectItem value="update">Updates</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filter.table} onValueChange={(value) => setFilter({ ...filter, table: value })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tables</SelectItem>
              <SelectItem value="clients">Clients</SelectItem>
              <SelectItem value="quotes">Projects</SelectItem>
              <SelectItem value="deals">Deals</SelectItem>
              <SelectItem value="user_profiles">User Profiles</SelectItem>
              <SelectItem value="user_permissions">Permissions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[600px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredLogs && filteredLogs.length > 0 ? (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <Card key={log.id} className="border-l-4" style={{
                  borderLeftColor: log.action === "DELETE" ? "#ef4444" : "#3b82f6"
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getActionIcon(log.action)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getActionBadgeVariant(log.action)}>
                              {log.action}
                            </Badge>
                            <span className="font-medium">{log.table_name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Record ID: {log.record_id}</div>
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              User ID: {log.user_id || "System"}
                            </div>
                            <div>{format(new Date(log.created_at), "PPpp")}</div>
                          </div>

                          {/* Show data changes for updates */}
                          {log.action === "UPDATE" && log.old_data && log.new_data && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-sm text-primary hover:underline">
                                View Changes
                              </summary>
                              <div className="mt-2 p-3 bg-muted rounded-md text-xs space-y-2">
                                {Object.keys(log.new_data).map((key) => {
                                  if (JSON.stringify(log.old_data[key]) !== JSON.stringify(log.new_data[key])) {
                                    return (
                                      <div key={key} className="border-l-2 border-primary pl-2">
                                        <div className="font-medium">{key}</div>
                                        <div className="text-red-600">- {JSON.stringify(log.old_data[key])}</div>
                                        <div className="text-green-600">+ {JSON.stringify(log.new_data[key])}</div>
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            </details>
                          )}

                          {/* Show deleted data */}
                          {log.action === "DELETE" && log.old_data && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-sm text-primary hover:underline">
                                View Deleted Data
                              </summary>
                              <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto">
                                {JSON.stringify(log.old_data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No audit logs found
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
