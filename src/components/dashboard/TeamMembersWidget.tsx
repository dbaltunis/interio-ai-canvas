import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock data - replace with real team data from your backend
const teamMembers = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@company.com",
    role: "Project Manager",
    avatar: null,
    status: "online",
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike@company.com",
    role: "Designer",
    avatar: null,
    status: "online",
  },
  {
    id: "3",
    name: "Emma Wilson",
    email: "emma@company.com",
    role: "Developer",
    avatar: null,
    status: "away",
  },
];

export const TeamMembersWidget = () => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {teamMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No team members yet</p>
            <Button variant="link" size="sm" className="mt-2">
              Invite your first team member
            </Button>
          </div>
        ) : (
          teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-2 sm:p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="relative">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-background">
                  {member.avatar ? (
                    <AvatarImage src={member.avatar} alt={member.name} />
                  ) : null}
                  <AvatarFallback className="text-xs sm:text-sm font-semibold bg-primary/10 text-primary">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground truncate">
                  {member.name}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {member.role}
                </p>
              </div>
              
              <div className="hidden sm:flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
        
        {teamMembers.length > 0 && (
          <Button variant="link" size="sm" className="w-full">
            View all team members ({teamMembers.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
