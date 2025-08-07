import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUsers } from "@/hooks/useUsers";
import { useUserInvitations } from "@/hooks/useUserInvitations";
import { Users, UserPlus, Clock, CheckCircle } from "lucide-react";

export const TeamOverview = () => {
  const { data: users = [] } = useUsers();
  const { data: invitations = [] } = useUserInvitations();

  const roleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending').length;

  return null;
};