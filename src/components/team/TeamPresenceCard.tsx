import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTeamPresence } from "@/hooks/useTeamPresence";
import { Users } from "lucide-react";

export const TeamPresenceCard: React.FC = () => {
  const { data, isLoading } = useTeamPresence();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
          Team Presence
        </CardTitle>
        <Badge variant="outline">{data?.length ?? 0}</Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading team…</div>
        ) : !data || data.length === 0 ? (
          <div className="text-sm text-muted-foreground">No teammates found</div>
        ) : (
          <ul className="space-y-2">
            {data.slice(0, 6).map((m) => (
              <li key={m.user_id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      m.is_online ? 'bg-green-500' : m.status === 'away' ? 'bg-yellow-500' : 'bg-muted-foreground'
                    }`}
                    aria-label={m.status}
                  />
                  <span className="text-sm font-medium">{m.display_name}</span>
                  <span className="text-xs text-muted-foreground">({m.role})</span>
                  {m.theme_preference && (
                  <span className="text-xs text-muted-foreground px-1 py-0.5 bg-muted rounded ml-1">
                    {m.theme_preference?.charAt(0).toUpperCase()}
                  </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{m.status.replace('_', ' ')}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
